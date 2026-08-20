require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const predictRoutes = require('./routes/predict.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware - Flexible CORS for Sandbox Pro and local dev
const clientOrigin = process.env.CLIENT_URL;
let corsOrigin = '*';
if (clientOrigin && clientOrigin !== '*') {
  corsOrigin = clientOrigin.includes(',')
    ? clientOrigin.split(',').map((url) => url.trim())
    : clientOrigin;
}

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root info route
app.get('/', (req, res) => {
  res.json({
    name: 'SmartCrop AI Backend API Gateway',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      predict: 'POST /api/predict',
      diseasesCatalog: 'GET /api/diseases'
    }
  });
});

// API Routes
app.use('/api', predictRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🌿 SmartCrop AI Backend API running on port ${PORT}`);
  console.log(`📡 ML Service Target: ${process.env.ML_SERVICE_URL || 'http://localhost:5001'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
