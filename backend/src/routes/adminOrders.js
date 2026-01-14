// backend/src/routes/adminOrders.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const AdminOrderController = require('../controllers/adminOrderController');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

/**
 * Admin Orders Routes
 * Base path: /api/admin/orders
 * All routes require admin authentication
 */

router.get('/stats', AdminOrderController.getOrderStats);
router.get('/', AdminOrderController.getAllOrders);
router.get('/:id', AdminOrderController.getOrderById);
router.patch('/:id/status', AdminOrderController.updateOrderStatus);

module.exports = router;