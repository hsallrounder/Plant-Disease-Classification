# SmartCrop AI React Frontend

Modern React + Vite frontend application for Plant Disease Detection.

## Features
- **Drag & Drop Scanner**: Instant leaf image upload and live preview.
- **AI Diagnosis Report**: Confidence scores, pathogen identification, and severity level.
- **Actionable Treatment Plans**: Detailed breakdowns for Organic remedies, Chemical fungicides, Symptoms, and Prevention strategies.
- **Probability Breakdown**: Class confidence visualizer across all 8 supported classes.
- **Render Cold-Start Detection**: Live status badge and alerts for Render free-tier cold starts.

## Running Locally
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173`. Proxies `/api` requests to `http://localhost:5000`.

## Production Deployment (Vercel / Netlify / Render)
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Set environment variable on Vercel/Netlify:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
