// backend/src/routes/orders.js
// ⭐ SERVERLESS-READY + FULLY SECURED

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
 * 
 * Security:
 * - All routes require JWT authentication
 * - User can only access their own orders
 * - Authorization verified in controller
 */

// ========================================
// MIDDLEWARE (Applied to all routes)
// ========================================

// Apply security headers
router.use(customerSecurityHeaders);

// Apply authentication to all routes
router.use(verifyCustomerToken);

// ========================================
// ORDER MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics for logged-in user
 * @access  Private (Customer)
 * @returns { total_orders, total_spent, pending_orders, completed_orders }
 * @note    MUST be before /:id route to prevent route conflict
 */
router.get('/stats', OrderController.getOrderStats);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for logged-in user (paginated)
 * @access  Private (Customer)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   status - Filter by order status (pending, confirmed, shipped, delivered, cancelled)
 * @query   payment_status - Filter by payment status (pending, paid, failed)
 * @query   from_date - Filter orders from date (ISO 8601)
 * @query   to_date - Filter orders until date (ISO 8601)
 * @returns { orders: [], total: number, page: number, limit: number }
 */
router.get('/', OrderController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details with items
 * @access  Private (Customer - own orders only)
 * @params  id - Order UUID
 * @returns Order object with items, address, payment, and shipment info
 */
router.get('/:id', OrderController.getOrderById);

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get real-time shipment tracking information
 * @access  Private (Customer - own orders only)
 * @params  id - Order UUID
 * @returns { tracking_number, status, current_location, estimated_delivery, history: [] }
 */
router.get('/:id/tracking', OrderController.getOrderTracking);

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart
 * @access  Private (Customer)
 * @body    address_id - UUID (required)
 * @body    payment_method - String (required - 'razorpay')
 * @body    notes - String (optional)
 * @body    gift_wrap - Boolean (optional)
 * @body    gift_message - String (optional)
 * @body    coupon_code - String (optional)
 * @returns { order_id, razorpay_order_id, amount, currency }
 */
router.post('/', OrderController.createOrder);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel an order (if eligible)
 * @access  Private (Customer - own orders only)
 * @params  id - Order UUID
 * @body    reason - String (optional)
 * @note    Only pending/confirmed orders can be cancelled
 * @returns { success, message }
 */
router.post('/:id/cancel', OrderController.cancelOrder);

/**
 * @route   POST /api/orders/:id/reorder
 * @desc    Add all items from previous order to cart
 * @access  Private (Customer - own orders only)
 * @params  id - Order UUID
 * @returns { success, message, items_added: number }
 */
router.post('/:id/reorder', OrderController.reorderItems);

module.exports = router;