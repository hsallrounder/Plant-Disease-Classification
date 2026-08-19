const axios = require('axios');
const FormData = require('form-data');
const { REMEDIES_DATABASE, getRemedyDetails } = require('../data/remedies');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Controller to handle plant disease prediction
 */
async function handlePrediction(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please send an image under the "image" key.'
      });
    }

    // Build multipart/form-data with in-memory buffer
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
    });

    // Forward image to Python ML Service on Render (60s timeout for cold start tolerance)
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 60000 // 60 seconds tolerance for Render free-tier cold start
    });

    if (!mlResponse.data || !mlResponse.data.success) {
      return res.status(502).json({
        success: false,
        error: mlResponse.data?.error || 'ML Service prediction failed.'
      });
    }

    const { class: predictedClass, confidence, all_probabilities } = mlResponse.data.prediction;

    // Enrich raw ML output with agronomy remedies & advice
    const remedyInfo = getRemedyDetails(predictedClass);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      prediction: {
        rawClass: predictedClass,
        crop: remedyInfo.crop,
        condition: remedyInfo.condition,
        isHealthy: remedyInfo.isHealthy,
        confidence: confidence,
        severity: remedyInfo.severity,
        pathogen: remedyInfo.pathogen,
        description: remedyInfo.description,
        symptoms: remedyInfo.symptoms,
        treatments: {
          organic: remedyInfo.organicTreatments,
          chemical: remedyInfo.chemicalTreatments,
          prevention: remedyInfo.prevention
        },
        allProbabilities: all_probabilities || []
      }
    });

  } catch (error) {
    console.error('Error during prediction proxying:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: `Could not connect to Python ML Service at ${ML_SERVICE_URL}. Ensure the service is running.`
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Prediction timed out. The Render ML Service might be waking up from cold sleep. Please retry in 10 seconds.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Internal server error'
    });
  }
}

/**
 * Controller to check status of both Node backend and Python ML Service
 */
async function checkStatus(req, res) {
  let mlServiceStatus = 'unreachable';
  let mlServiceDetails = null;

  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 10000 });
    if (mlHealth.data && mlHealth.data.status === 'healthy') {
      mlServiceStatus = 'online';
      mlServiceDetails = mlHealth.data;
    }
  } catch (err) {
    mlServiceStatus = 'cold_sleeping_or_offline';
  }

  return res.status(200).json({
    status: 'online',
    service: 'SmartCrop AI Node.js Backend API',
    environment: process.env.NODE_ENV || 'development',
    mlServiceUrl: ML_SERVICE_URL,
    mlServiceStatus: mlServiceStatus,
    mlServiceDetails: mlServiceDetails,
    timestamp: new Date().toISOString()
  });
}

/**
 * Controller to list all cataloged diseases and treatments
 */
function getDiseasesCatalog(req, res) {
  return res.status(200).json({
    success: true,
    totalClasses: Object.keys(REMEDIES_DATABASE).length,
    catalog: REMEDIES_DATABASE
  });
}

module.exports = {
  handlePrediction,
  checkStatus,
  getDiseasesCatalog
};
