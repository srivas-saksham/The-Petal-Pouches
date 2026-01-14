// backend/src/routes/adminCustomers.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const AdminCustomerController = require('../controllers/adminCustomerController');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

/**
 * Admin Customer Routes
 * Base path: /api/admin/customers
 * All routes require admin authentication
 */

router.get('/stats', AdminCustomerController.getCustomerStats);
router.get('/', AdminCustomerController.getAllCustomers);
router.get('/:id', AdminCustomerController.getCustomerById);
router.put('/:id/status', AdminCustomerController.toggleCustomerStatus);

module.exports = router;