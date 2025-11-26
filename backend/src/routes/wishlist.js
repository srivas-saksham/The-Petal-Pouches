// backend/src/routes/wishlist.js

const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlistController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * Wishlist Routes - All routes require authentication
 * Base path: /api/wishlist
 */

// Apply security headers and authentication to all routes
router.use(customerSecurityHeaders);
router.use(verifyCustomerToken);

// ==================== WISHLIST MANAGEMENT ====================

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist with product details
 * @access  Private
 * @query   page, limit, sort (date/title/price), category_id
 */
router.get('/', WishlistController.getWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 * @body    { product_id }
 */
router.post('/', WishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', WishlistController.clearWishlist);

// ==================== WISHLIST STATISTICS ====================

/**
 * @route   GET /api/wishlist/stats
 * @desc    Get wishlist statistics (total items, value, avg price)
 * @access  Private
 */
router.get('/stats', WishlistController.getWishlistStats);

// ==================== CART OPERATIONS ====================

/**
 * @route   POST /api/wishlist/move-all-to-cart
 * @desc    Move all wishlist items to cart (bulk operation)
 * @access  Private
 */
router.post('/move-all-to-cart', WishlistController.moveAllToCart);

/**
 * @route   POST /api/wishlist/:id/move-to-cart
 * @desc    Move single item from wishlist to cart
 * @access  Private
 * @body    { variant_id?, quantity? }
 */
router.post('/:id/move-to-cart', WishlistController.moveToCart);

// ==================== CHECK PRODUCT ====================

/**
 * @route   GET /api/wishlist/check/:product_id
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:product_id', WishlistController.checkInWishlist);

// ==================== ITEM OPERATIONS ====================

/**
 * @route   DELETE /api/wishlist/:id
 * @desc    Remove single item from wishlist
 * @access  Private
 */
router.delete('/:id', WishlistController.removeFromWishlist);

module.exports = router;