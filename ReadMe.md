# 🌱 SmartCrop AI - Decoupled Microservices Architecture

An AI-powered agricultural diagnosis platform for plant leaf disease classification, severity scoring, and agronomy treatment advice.

## 📊 Dataset

- **OneDrive Dataset Link**: [https://1drv.ms/u/s!Ak31z_AHpw_d6HRfU-OWUFpd36ta?e=auJ1h1](https://1drv.ms/u/s!Ak31z_AHpw_d6HRfU-OWUFpd36ta?e=auJ1h1)

---

## 📁 3-Tier Architecture Overview

```
Plant-Disease-Classification/
├── 📂 ml-service/             # FastAPI + Google LiteRT ML Microservice (Render Web Service)
│   ├── app.py                # High-speed ASGI REST API (/health, /predict, /docs)
│   ├── plant_model/          # Optimized model.tflite (15.9 MB) & SavedModel
│   ├── requirements.txt      # fastapi, uvicorn, ai-edge-litert, numpy, pillow
│   ├── render.yaml           # 1-Click Render Blueprint configuration
│   ├── Procfile              # Render start command (uvicorn app:app)
│   └── Dockerfile            # Container configuration
│
├── 📂 backend/                # Node.js + Express API Gateway (Port 8080)
│   ├── src/
│   │   ├── controllers/      # Forwards image to Python ML Service & enriches response
│   │   ├── data/remedies.js  # Rich agronomy encyclopedia (organic & chemical treatments)
│   │   ├── routes/           # /api/predict, /api/health, /api/diseases
│   │   └── index.js          # Express server with CORS & logging
│   ├── package.json
│   └── .env
│
├── 📂 frontend/               # React + Vite Client Application (Port 5173)
│   ├── src/
│   │   ├── components/       # ImageUpload, DiagnosisResult, DiseasesLibrary, Header
│   │   ├── services/api.js   # Axios API client with cold-start tolerance
│   │   ├── App.jsx           # Main application state
│   │   └── index.css         # Modern glassmorphic agricultural design system
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── 📂 training/               # ML Research & Jupyter Notebooks
    └── plant_model.ipynb     # Model training, dataset augmentation, evaluation
```

---

## ⚡ Lightweight Model Optimization Across All AI/ML Architectures

| Model Category | Frameworks | Lightweight Format | Lightweight Runtime | RAM Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Computer Vision (CNN / ViT)** | TensorFlow, PyTorch, YOLO | **TFLite (`.tflite`)** / **ONNX** | `ai-edge-litert` / `onnxruntime` | **~35 - 45 MB** |
| **Graph Neural Networks (GNN)** | PyG, DGL, Spektral | **TorchScript (`.pt`)** / **ONNX** | `torchscript` / `onnxruntime` | **~40 - 70 MB** |
| **NLP & Transformers** | Hugging Face, BERT | **ONNX (`.onnx`)** | `onnxruntime` / `optimum` | **~60 - 90 MB** |
| **LLMs (LLaMA, Mistral, Phi)** | Hugging Face, PyTorch | **GGUF (`.gguf`)** | `llama-cpp-python` | **CPU/RAM Friendly** |
| **Classical ML / Tabular** | Scikit-Learn, XGBoost | **ONNX** / **Treelite (C/C++)** | `onnxruntime` / native binary | **~15 - 30 MB** |

---

### Deploying Graph Neural Networks (GNN) to Low-Memory Environments

If deploying a **Graph Neural Network** (e.g. PyG / DGL) for agricultural disease spread networks, molecular prediction, or graph classification:

1. **Avoid running `torch_geometric` on production servers**: PyG needs heavy CUDA/C++ extension wheels (`torch_scatter`, `torch_sparse`) that consume >1.2 GB disk and >800MB RAM.
2. **Export to TorchScript JIT**:
   ```python
   import torch
   scripted_gnn = torch.jit.trace(model, (dummy_node_features, dummy_edge_index))
   scripted_gnn.save("gnn_model.pt")
   ```
3. **Or Export to ONNX (< 40MB RAM in production)**:
   ```python
   torch.onnx.export(
       model,
       (dummy_node_features, dummy_edge_index),
       "gnn_model.onnx",
       input_names=["node_features", "edge_index"],
       output_names=["predictions"],
       dynamic_axes={"node_features": {0: "num_nodes"}, "edge_index": {1: "num_edges"}}
   )
   ```

*For complete code samples and instructions for every model architecture, refer to [ml-service/README.md](file:///c:/Users/raadh/OneDrive/Desktop/smartcrop%20ai/Plant-Disease-Classification/ml-service/README.md).*

---

## 🚀 Deployment Instructions

### 1. Deploy `ml-service` to Render (Web Service)

1. Push your repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Select your repository and configure:
   - **Name**: `smartcrop-ml-api`
   - **Root Directory**: `Plant-Disease-Classification/ml-service` (or `ml-service`)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Deploy! Render will give you a public URL (e.g. `https://smartcrop-ml-api.onrender.com`).
5. Open `https://smartcrop-ml-api.onrender.com/docs` to test interactive Swagger API docs directly in your browser.

---

### 2. Deploy `backend` (Node.js API Gateway)

1. Deploy to Render, Railway, or Heroku as a Node.js web service.
2. Set Environment Variables in `.env`:
   ```env
   PORT=8080
   ML_SERVICE_URL=https://smartcrop-ml-api.onrender.com
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```
3. Build & Start Commands:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

---

### 3. Deploy `frontend` (React + Vite)

1. Deploy to **Vercel**, **Netlify**, or **Render Static Site**.
2. Set Environment Variable in `.env`:
   ```env
   VITE_API_URL=https://your-node-backend.onrender.com/api
   ```
3. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

## 💻 Running Locally

### Step 1: Start Python ML Service (Port 5001)

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate      # On Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 5001 --reload
```

*Interactive Swagger UI available at `http://localhost:5001/docs`*

### Step 2: Start Node.js Backend (Port 8080)

```bash
cd ../backend
npm install
npm run dev
```

### Step 3: Start React Frontend (Port 5173)

```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌿 Supported Crops & Diseases (8 Classes)

1. **Cherry**: Powdery Mildew / Healthy
2. **Peach**: Bacterial Spot / Healthy
3. **Bell Pepper**: Bacterial Spot / Healthy
4. **Strawberry**: Leaf Scorch / Healthy
