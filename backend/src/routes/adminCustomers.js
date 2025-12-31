// backend/src/routes/adminCustomers.js
/**
 * Admin Customer Routes
 * Handles all customer management endpoints for admin panel
 */

const express = require('express');
const router = express.Router();
const AdminCustomerController = require('../controllers/adminCustomerController');

/**
 * GET /api/admin/customers/stats
 * Get overall customer statistics (total, active, inactive, new this month)
 */
router.get('/stats', AdminCustomerController.getCustomerStats);

/**
 * GET /api/admin/customers
 * Get all customers with pagination, search, and filtering
 * Query params: status, search, sort, order, page, limit
 */
router.get('/', AdminCustomerController.getAllCustomers);

/**
 * GET /api/admin/customers/:id
 * Get single customer details with complete order history and analytics
 */
router.get('/:id', AdminCustomerController.getCustomerById);

/**
 * PUT /api/admin/customers/:id/status
 * Toggle customer active/inactive status
 */
router.put('/:id/status', AdminCustomerController.toggleCustomerStatus);

module.exports = router;