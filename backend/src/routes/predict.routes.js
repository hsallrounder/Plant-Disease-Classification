const express = require('express');
const multer = require('multer');
const { handlePrediction, checkStatus, getDiseasesCatalog } = require('../controllers/predict.controller');

const router = express.Router();

// Configure multer memory storage (stores file in memory buffer, avoiding disk clutter)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, etc.) are allowed!'), false);
    }
  }
});

// Routes
router.post('/predict', upload.single('image'), handlePrediction);
router.get('/health', checkStatus);
router.get('/diseases', getDiseasesCatalog);

module.exports = router;
