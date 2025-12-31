// backend/src/routes/adminOrders.js
/**
 * Admin Orders Routes
 * Protected routes for admin orders management
 */

const express = require('express');
const router = express.Router();
const AdminOrderController = require('../controllers/adminOrderController');

/**
 * @route   GET /api/admin/orders/stats
 * @desc    Get order statistics
 * @access  Admin only
 * @note    Must be BEFORE /:id route
 */
router.get('/stats', AdminOrderController.getOrderStats);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with advanced search and filters
 * @access  Admin only
 * @query   page, limit, status, payment_status, payment_method, 
 *          from_date, to_date, search, sort, order, delivery_mode
 */
router.get('/', AdminOrderController.getAllOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get single order details
 * @access  Admin only
 */
router.get('/:id', AdminOrderController.getOrderById);

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Admin only
 * @body    { status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled' }
 */
router.patch('/:id/status', AdminOrderController.updateOrderStatus);

module.exports = router;