# SmartCrop Node.js & Express API Gateway

API Gateway and business logic microservice for SmartCrop AI.

## Features
- **In-Memory File Proxying**: Streams uploaded plant images directly to the Python ML Service without saving temporary files to disk.
- **Disease & Agronomy Enrichment**: Enriches raw model classifications with causes, symptoms, organic remedies, chemical treatments, and prevention guidelines.
- **Render Cold-Start Resilience**: 60-second request timeout and status checking for Render free tier sleep/wake states.
- **Disease Encyclopedia**: Endpoint `GET /api/diseases` exposing all 8 cataloged crop conditions.

## Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express Server | `5000` |
| `ML_SERVICE_URL` | URL of the Python ML Service (e.g. Render Web Service URL) | `http://localhost:5001` |
| `CLIENT_URL` | Allowed origin for CORS from React frontend | `http://localhost:5173` |

## Endpoints
- `GET /`: API overview & routes.
- `GET /api/health`: Dual health check (checks both Node server and Python ML Service).
- `POST /api/predict`: Multipart form-data upload (`image` key). Returns enriched diagnosis.
- `GET /api/diseases`: Full database of supported plant diseases & remedies.

## Running Locally
```bash
npm install
npm run dev   # Runs with nodemon on port 5000
```
