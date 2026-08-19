import os
import io
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import uvicorn

# Load .env variables if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smartcrop-api")

# Configuration from Environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(BASE_DIR, "plant_model"))
TFLITE_PATH = os.environ.get("TFLITE_PATH", os.path.join(MODEL_DIR, "model.tflite"))
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

# Model engine abstraction
class InferenceEngine:
    def __init__(self):
        self.engine_type = None
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        self.tf_model = None
        self.tf_infer_fn = None
        self.input_key = None
        self.output_key = None

    def load(self):
        """Load model using the most lightweight available runtime."""
        # 1. Try TFLite model first (ultra-lightweight, ~30-40MB RAM usage)
        if os.path.exists(TFLITE_PATH):
            logger.info(f"Attempting to load TFLite model from: {TFLITE_PATH}")
            # Try Google LiteRT (ai_edge_litert)
            try:
                from ai_edge_litert.interpreter import Interpreter
                self.interpreter = Interpreter(model_path=TFLITE_PATH)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.engine_type = "LiteRT (ai-edge-litert)"
                logger.info(f"Model loaded successfully using {self.engine_type}!")
                return
            except Exception as e:
                logger.warning(f"ai_edge_litert load failed: {e}")

            # Try tflite_runtime
            try:
                from tflite_runtime.interpreter import Interpreter
                self.interpreter = Interpreter(model_path=TFLITE_PATH)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.engine_type = "tflite_runtime"
                logger.info(f"Model loaded successfully using {self.engine_type}!")
                return
            except Exception as e:
                logger.warning(f"tflite_runtime load failed: {e}")

            # Try tensorflow.lite
            try:
                import tensorflow as tf
                self.interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.engine_type = "tf.lite.Interpreter"
                logger.info(f"Model loaded successfully using {self.engine_type}!")
                return
            except Exception as e:
                logger.warning(f"tf.lite load failed: {e}")

        # 2. Fallback to SavedModel if full TensorFlow is available and TFLite not present/working
        if os.path.exists(MODEL_DIR):
            logger.info(f"Falling back to TensorFlow SavedModel from: {MODEL_DIR}")
            try:
                import tensorflow as tf
                self.tf_model = tf.saved_model.load(MODEL_DIR)
                self.tf_infer_fn = self.tf_model.signatures.get("serving_default")
                if self.tf_infer_fn:
                    input_sig = self.tf_infer_fn.structured_input_signature[1]
                    self.input_key = list(input_sig.keys())[0] if input_sig else None
                    self.output_key = list(self.tf_infer_fn.structured_outputs.keys())[0] if self.tf_infer_fn.structured_outputs else None
                self.engine_type = "TensorFlow SavedModel"
                logger.info("TensorFlow SavedModel loaded successfully!")
                return
            except Exception as e:
                logger.error(f"Failed to load TensorFlow SavedModel: {e}")
                raise e

        raise RuntimeError(f"No model found at {TFLITE_PATH} or {MODEL_DIR}")

    def is_loaded(self) -> bool:
        return self.engine_type is not None

    def predict(self, img_array: np.ndarray) -> np.ndarray:
        """Run prediction given image array of shape (1, 256, 256, 3) float32."""
        if not self.is_loaded():
            self.load()

        if self.interpreter is not None:
            in_idx = self.input_details[0]["index"]
            out_idx = self.output_details[0]["index"]
            self.interpreter.set_tensor(in_idx, img_array)
            self.interpreter.invoke()
            output = self.interpreter.get_tensor(out_idx)
            return output[0]

        elif self.tf_infer_fn is not None:
            import tensorflow as tf
            tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)
            if self.input_key:
                raw_output = self.tf_infer_fn(**{self.input_key: tensor})
            else:
                raw_output = self.tf_infer_fn(tensor)

            if self.output_key and isinstance(raw_output, dict):
                return raw_output[self.output_key].numpy()[0]
            elif isinstance(raw_output, dict):
                return list(raw_output.values())[0].numpy()[0]
            return raw_output.numpy()[0]

        elif self.tf_model is not None:
            import tensorflow as tf
            tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)
            return self.tf_model(tensor).numpy()[0]

        raise RuntimeError("No loaded inference engine available.")

# Initialize global engine instance
engine = InferenceEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up model at startup
    try:
        engine.load()
    except Exception as e:
        logger.warning(f"Startup model load deferred: {e}")
    yield

app = FastAPI(
    title="SmartCrop AI - Plant Disease Prediction API",
    description="High-performance ASGI Plant Disease Classifier microservice optimized for low-memory deployment.",
    version="2.1.0",
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

def preprocess_image(image_bytes: bytes, target_size=(256, 256)) -> np.ndarray:
    """Preprocess image in-memory into float32 numpy array with shape (1, 256, 256, 3)."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 256, 256, 3)
    return img_array

@app.get("/")
async def root():
    return {
        "service": "SmartCrop AI - Plant Disease Prediction API",
        "engine": f"FastAPI + Uvicorn ({engine.engine_type or 'unloaded'})",
        "status": "online",
        "model_loaded": engine.is_loaded(),
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
        "engine": engine.engine_type or "uninitialized",
        "model_loaded": engine.is_loaded()
    }

@app.post("/predict")
async def predict(image: UploadFile = File(None), file: UploadFile = File(None)):
    """Run plant leaf disease classification inference on uploaded image."""
    try:
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

        img_array = preprocess_image(image_bytes)
        probs = engine.predict(img_array)

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
    reload_flag = os.environ.get("RELOAD", "false").lower() in ("true", "1", "yes")
    uvicorn.run("app:app", host=HOST, port=PORT, reload=reload_flag)
