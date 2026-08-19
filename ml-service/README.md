# SmartCrop ML Microservice API

Standalone Python Flask Web Service for Plant Disease Classification using TensorFlow/Keras. Ready to be deployed as a Web Service on **Render**.

## Features
- **Stateless & In-Memory Preprocessing**: Fast RGB normalization and 256x256 resizing via Pillow without saving temp files to disk.
- **Render Free Tier Optimized**: Uses `tensorflow-cpu` and single-worker 4-thread Gunicorn configuration to operate well within the 512 MB RAM limit.
- **Health Check Probes**: `/health` endpoint for Render zero-downtime health checking and waking up dormant free instances.
- **CORS Enabled**: Accepts cross-origin requests from both Node.js backend and React frontend.

## Supported Classes (8)
- `Cherry___Powdery_mildew`
- `Cherry___healthy`
- `Peach___Bacterial_spot`
- `Peach___healthy`
- `Pepper__bell___Bacterial_spot`
- `Pepper__bell___healthy`
- `Strawberry___Leaf_scorch`
- `Strawberry___healthy`

## API Endpoints

### 1. `GET /health`
Returns API and model status:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. `POST /predict`
Send `multipart/form-data` with key `image` or `file`.

**Response:**
```json
{
  "success": true,
  "prediction": {
    "class": "Pepper__bell___Bacterial_spot",
    "confidence": 99.45,
    "all_probabilities": [
      { "class": "Pepper__bell___Bacterial_spot", "probability": 99.45 },
      { "class": "Pepper__bell___healthy", "probability": 0.55 },
      ...
    ]
  }
}
```

## Running Locally

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   python app.py
   ```
   Or with Gunicorn (on Linux/WSL):
   ```bash
   gunicorn --config gunicorn_config.py app:app
   ```

## Deploying to Render

1. Push your repository to GitHub.
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Web Service**.
4. Connect your GitHub repository.
5. Set the settings:
   - **Name**: `smartcrop-ml-api`
   - **Root Directory**: `ml-service` (or `Plant-Disease-Classification/ml-service` if in subdirectory)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn_config.py app:app`
   - **Health Check Path**: `/health`
6. Click **Create Web Service**.
