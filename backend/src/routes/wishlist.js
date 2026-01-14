// backend/src/routes/wishlist.js
// ⭐ SERVERLESS-READY + FULLY SECURED

const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlistController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * Wishlist Routes
 * Base path: /api/wishlist
 * 
 * Security:
 * - All routes require JWT authentication
 * - User can only access/modify their own wishlist
 * - No guest wishlist support (must be logged in)
 */

// ========================================
// MIDDLEWARE (Applied to all routes)
// ========================================

// Apply security headers and authentication to all routes
router.use(customerSecurityHeaders);
router.use(verifyCustomerToken);

// ========================================
// WISHLIST ROUTES (Specific before dynamic)
// ========================================

/**
 * @route   GET /api/wishlist/stats
 * @desc    Get wishlist statistics
 * @access  Private (Customer)
 * @returns { total_items, total_value, avg_price, by_category: {} }
 * @note    MUST be before /:id routes
 */
router.get('/stats', WishlistController.getWishlistStats);

/**
 * @route   POST /api/wishlist/move-all-to-cart
 * @desc    Move all wishlist items to cart (bulk operation)
 * @access  Private (Customer)
 * @returns { success, items_moved: number, out_of_stock: [] }
 * @note    MUST be before /:id routes
 */
router.post('/move-all-to-cart', WishlistController.moveAllToCart);

/**
 * @route   GET /api/wishlist/check/:product_id
 * @desc    Check if product is in user's wishlist
 * @access  Private (Customer)
 * @params  product_id - Product UUID
 * @returns { in_wishlist: boolean, wishlist_item_id?: uuid }
 * @note    MUST be before generic /:id routes
 */
router.get('/check/:product_id', WishlistController.checkInWishlist);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's complete wishlist with product details
 * @access  Private (Customer)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @query   sort - Sort by (date, title, price)
 * @query   category_id - Filter by category UUID
 * @returns { items: [], total: number, page: number, limit: number }
 */
router.get('/', WishlistController.getWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private (Customer)
 * @body    product_id - Product UUID (required)
 * @returns { success, wishlist_item_id: uuid }
 * @note    Prevents duplicate entries
 */
router.post('/', WishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private (Customer)
 * @returns { success, items_removed: number }
 */
router.delete('/', WishlistController.clearWishlist);

/**
 * @route   POST /api/wishlist/:id/move-to-cart
 * @desc    Move single item from wishlist to cart
 * @access  Private (Customer - own wishlist only)
 * @params  id - Wishlist item UUID
 * @body    variant_id - Product variant UUID (optional)
 * @body    quantity - Quantity to add (default: 1)
 * @returns { success, cart_item_id: uuid }
 * @note    Removes item from wishlist after moving
 */
router.post('/:id/move-to-cart', WishlistController.moveToCart);

/**
 * @route   DELETE /api/wishlist/:id
 * @desc    Remove single item from wishlist
 * @access  Private (Customer - own wishlist only)
 * @params  id - Wishlist item UUID
 * @returns { success, message }
 */
router.delete('/:id', WishlistController.removeFromWishlist);

module.exports = router;