// backend/src/routes/reviews.js

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { 
  verifyCustomerToken, 
  optionalAuth,
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * Review Routes
 * Base path: /api/reviews
 */

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/reviews/product/:product_id
 * @desc    Get reviews for a product (public)
 * @access  Public
 * @query   page, limit, rating_filter (1-5), sort (recent/helpful/rating_high/rating_low)
 */
router.get('/product/:product_id', ReviewController.getProductReviews);

// ==================== PROTECTED ROUTES ====================

// All routes below require authentication
router.use(verifyCustomerToken);

/**
 * @route   POST /api/reviews
 * @desc    Create a product review
 * @access  Private (must have purchased product)
 * @body    { product_id, rating, comment?, order_id? }
 */
router.post('/', ReviewController.createReview);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get all reviews by logged-in user
 * @access  Private
 * @query   page, limit
 */
router.get('/my-reviews', ReviewController.getMyReviews);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (own reviews only)
 * @body    { rating?, comment? }
 */
router.put('/:id', ReviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (own reviews only)
 */
router.delete('/:id', ReviewController.deleteReview);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.post('/:id/helpful', ReviewController.markHelpful);

module.exports = router;