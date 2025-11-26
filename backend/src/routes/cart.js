// backend/src/routes/cart.js

const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { optionalAuth, customerSecurityHeaders } = require('../middleware/userAuth');

/**
 * Cart Routes
 * Base path: /api/cart
 * Supports both authenticated users and guest sessions
 */

// Apply security headers
router.use(customerSecurityHeaders);

// Apply optional authentication (works for both authenticated and guest users)
router.use(optionalAuth);

// ==================== CART OPERATIONS ====================

/**
 * @route   GET /api/cart
 * @desc    Get user's cart with items and totals
 * @access  Public (requires user_id or x-session-id header)
 */
router.get('/', CartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public (requires user_id or x-session-id header)
 * @body    { product_variant_id, quantity?, bundle_origin?, bundle_id? }
 * @header  x-session-id (for guest users)
 */
router.post('/items', CartController.addToCart);

/**
 * @route   PATCH /api/cart/items/:id
 * @desc    Update cart item quantity
 * @access  Public (requires user_id or x-session-id header)
 * @params  id (cart_item_id)
 * @body    { quantity }
 */
router.patch('/items/:id', CartController.updateCartItem);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Remove item from cart
 * @access  Public (requires user_id or x-session-id header)
 * @params  id (cart_item_id)
 */
router.delete('/items/:id', CartController.removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear all items from cart
 * @access  Public (requires user_id or x-session-id header)
 */
router.delete('/', CartController.clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart into user cart (on login)
 * @access  Private (Customer)
 * @body    { session_id }
 */
const { verifyCustomerToken } = require('../middleware/userAuth');
router.post('/merge', verifyCustomerToken, CartController.mergeCarts);

module.exports = router;