// backend/routes/listings.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllListings, getListingById, getMyListings,
  createListing, updateListing, deleteListing
} = require('../controllers/listingsController');
const { authenticate } = require('../middleware/auth');

const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('coal_type').trim().notEmpty().withMessage('Coal type is required'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('price_per_ton').isFloat({ min: 0.01 }).withMessage('Price per ton must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

// Public routes
router.get('/', getAllListings);
router.get('/my/listings', authenticate, getMyListings);
router.get('/:id', getListingById);

// Protected routes
router.post('/', authenticate, listingValidation, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);

module.exports = router;
