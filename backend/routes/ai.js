// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const { predictPrice, getMarketInsights, getAIStatus } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/predict', authenticate, predictPrice);
router.get('/market-insights', getMarketInsights);
router.get('/status', getAIStatus);

module.exports = router;
