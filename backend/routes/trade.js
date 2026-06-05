// backend/routes/trade.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendTradeRequest, getMyTradeRequests, updateTradeStatus, getAllTradeRequests } = require('../controllers/tradeController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/', authenticate, [
  body('listing_id').isInt().withMessage('Valid listing ID required'),
  body('quantity_requested').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
], sendTradeRequest);

router.get('/my', authenticate, getMyTradeRequests);
router.put('/:id/status', authenticate, updateTradeStatus);
router.get('/', authenticate, isAdmin, getAllTradeRequests);

module.exports = router;

// backend/routes/ai.js (inline as separate export)
