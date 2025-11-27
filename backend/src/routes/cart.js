// backend/src/routes/cart.js - DEBUG VERSION

const express = require('express');
const router = express.Router();

console.log('🔧 Cart routes file loaded');

// Try to load the controller
let CartController;
try {
  CartController = require('../controllers/cartController');
  console.log('✅ CartController loaded successfully');
} catch (err) {
  console.error('❌ Failed to load CartController:', err.message);
  CartController = null;
}

/**
 * Cart Routes - FIXED
 * Base path: /api/cart
 */

// ==================== MIDDLEWARE ====================

/**
 * Simple middleware to extract user info from headers
 * Supports both authenticated users and guest sessions
 */
router.use((req, res, next) => {
  // Extract from headers
  const userId = req.get('x-user-id');
  const sessionId = req.get('x-session-id');

  // Add to request object
  req.user = { id: userId };
  req.sessionId = sessionId;

  console.log(`[Cart Route] User: ${userId}, Session: ${sessionId}`);

  next();
});

// ==================== DEBUG ENDPOINT ====================
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Cart routes are working!',
    controllerLoaded: CartController !== null,
    endpoints: [
      'GET /api/cart',
      'POST /api/cart/items',
      'PATCH /api/cart/items/:id',
      'DELETE /api/cart/items/:id',
      'DELETE /api/cart',
      'POST /api/cart/merge'
    ]
  });
});

// ==================== CART ENDPOINTS ====================

/**
 * @route   GET /api/cart
 */
router.get('/', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.getCart(req, res, next);
});

/**
 * @route   POST /api/cart/items
 */
router.post('/items', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.addToCart(req, res, next);
});

/**
 * @route   PATCH /api/cart/items/:id
 */
router.patch('/items/:id', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.updateCartItem(req, res, next);
});

/**
 * @route   DELETE /api/cart/items/:id
 */
router.delete('/items/:id', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.removeCartItem(req, res, next);
});

/**
 * @route   DELETE /api/cart
 */
router.delete('/', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.clearCart(req, res, next);
});

/**
 * @route   POST /api/cart/merge
 */
router.post('/merge', (req, res, next) => {
  if (!CartController) {
    return res.status(500).json({
      success: false,
      message: 'CartController not loaded'
    });
  }
  CartController.mergeCarts(req, res, next);
});

console.log('✅ All cart route handlers registered');

module.exports = router;