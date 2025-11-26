// backend/src/routes/orders.js

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * Order Routes
 * Base path: /api/orders
 * All routes require authentication
 */

// Apply security headers
router.use(customerSecurityHeaders);

// Apply authentication to all routes
router.use(verifyCustomerToken);

// ==================== ORDER MANAGEMENT ====================

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart
 * @access  Private (Customer)
 * @body    { address_id, payment_method, notes?, gift_wrap?, gift_message?, coupon_code? }
 */
router.post('/', OrderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for logged-in user
 * @access  Private (Customer)
 * @query   page, limit, status, payment_status, from_date, to_date
 */
router.get('/', OrderController.getOrders);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics for user
 * @access  Private (Customer)
 * @note    Must be BEFORE /:id route to prevent conflict
 */
router.get('/stats', OrderController.getOrderStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (Customer)
 */
router.get('/:id', OrderController.getOrderById);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private (Customer)
 * @body    { reason? }
 */
router.post('/:id/cancel', OrderController.cancelOrder);

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get order tracking information
 * @access  Private (Customer)
 */
router.get('/:id/tracking', OrderController.getOrderTracking);

/**
 * @route   POST /api/orders/:id/reorder
 * @desc    Reorder - Add all items from previous order to cart
 * @access  Private (Customer)
 */
router.post('/:id/reorder', OrderController.reorderItems);

module.exports = router;