import os
import io
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import tensorflow as tf
import uvicorn

# Load .env variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smartcrop-api")

# Configuration from Environment
MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "plant_model"))
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5001))
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")

CLASS_NAMES = [
    "Cherry___Powdery_mildew",
    "Cherry___healthy",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy"
]

# Global model references
model = None
infer_fn = None
input_key = None
output_key = None

def load_ml_model():
    """Load SavedModel signature universally across TensorFlow/Keras versions."""
    global model, infer_fn, input_key, output_key
    if model is None:
        logger.info(f"Loading TensorFlow SavedModel from: {MODEL_DIR}")
        try:
            model = tf.saved_model.load(MODEL_DIR)
            infer_fn = model.signatures.get("serving_default")

            if infer_fn:
                input_signature = infer_fn.structured_input_signature[1]
                input_key = list(input_signature.keys())[0] if input_signature else None
                output_key = list(infer_fn.structured_outputs.keys())[0] if infer_fn.structured_outputs else None
                logger.info(f"Loaded signature 'serving_default' [input='{input_key}', output='{output_key}']")
            else:
                logger.warning("No 'serving_default' signature found; fallback to direct callable.")

            logger.info("TensorFlow SavedModel loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise e

# Pre-warm model on startup
try:
    load_ml_model()
except Exception as e:
    logger.warning(f"Initial model loading deferred: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure model is ready
    if model is None:
        try:
            load_ml_model()
        except Exception as e:
            logger.warning(f"Lifespan model loading error: {str(e)}")
    yield

app = FastAPI(
    title="SmartCrop AI - Plant Disease Prediction API",
    description="High-performance ASGI Plant Disease Classifier microservice powered by FastAPI and TensorFlow.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = ["*"] if CORS_ORIGIN == "*" else [origin.strip() for origin in CORS_ORIGIN.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image_bytes: bytes, target_size=(256, 256)):
    """Preprocess image in-memory without saving to disk."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 256, 256, 3)
    return tf.convert_to_tensor(img_array, dtype=tf.float32)

@app.get("/")
async def root():
    return {
        "service": "SmartCrop AI - Plant Disease Prediction API",
        "engine": "FastAPI + Uvicorn (ASGI)",
        "status": "online",
        "model_loaded": model is not None,
        "supported_classes": CLASS_NAMES,
        "documentation": "/docs",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict"
        }
    }

@app.get("/health")
async def health():
    """Health probe endpoint for Render monitoring and cold-start waking."""
    return {
        "status": "healthy",
        "engine": "uvicorn",
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict(image: UploadFile = File(None), file: UploadFile = File(None)):
    """Run plant leaf disease classification inference on uploaded image."""
    try:
        # Check model loaded
        if model is None or (infer_fn is None and not callable(model)):
            load_ml_model()

        target_file = image or file
        if target_file is None:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "No image file provided. Send file under 'image' or 'file' key."}
            )

        image_bytes = await target_file.read()
        if not image_bytes:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Uploaded image file is empty."}
            )

        img_tensor = preprocess_image(image_bytes)

        # Run inference via serving signature
        if infer_fn is not None:
            if input_key:
                raw_output = infer_fn(**{input_key: img_tensor})
            else:
                raw_output = infer_fn(img_tensor)

            if output_key and isinstance(raw_output, dict):
                probs = raw_output[output_key].numpy()[0]
            elif isinstance(raw_output, dict):
                probs = list(raw_output.values())[0].numpy()[0]
            else:
                probs = raw_output.numpy()[0]
        else:
            raw_output = model(img_tensor)
            probs = raw_output.numpy()[0]

        top_idx = int(np.argmax(probs))
        predicted_class = CLASS_NAMES[top_idx]
        confidence = float(round(100 * float(probs[top_idx]), 2))

        # Build sorted class probabilities list
        all_probabilities = [
            {"class": CLASS_NAMES[i], "probability": float(round(100 * float(probs[i]), 2))}
            for i in range(len(CLASS_NAMES))
        ]
        all_probabilities.sort(key=lambda x: x["probability"], reverse=True)

        return {
            "success": True,
            "prediction": {
                "class": predicted_class,
                "confidence": confidence,
                "all_probabilities": all_probabilities
            }
        }

    except Exception as e:
        logger.exception("Prediction failed")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    reload_flag = os.environ.get("RELOAD", "true").lower() in ("true", "1", "yes")
    uvicorn.run("app:app", host=HOST, port=PORT, reload=reload_flag)
