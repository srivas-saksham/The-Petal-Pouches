// backend/src/routes/webhooks.js

const express = require('express');
const router = express.Router();
const DelhiveryWebhookController = require('../controllers/delhiveryWebhookController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ========================================
// PRODUCTION ROUTES
// ========================================

/**
 * @route   POST /api/webhooks/delhivery
 * @desc    Handle Delhivery shipment status updates
 * @access  Public (called by Delhivery servers)
 * @note    Signature verification happens in controller
 */
router.post('/delhivery', DelhiveryWebhookController.handleStatusUpdate);

/**
 * @route   GET /api/webhooks/delhivery/health
 * @desc    Health check for monitoring
 * @access  Public (for uptime monitoring services)
 */
router.get('/delhivery/health', DelhiveryWebhookController.healthCheck);

/**
 * @route   GET /api/webhooks/delhivery/logs
 * @desc    View recent webhook activity
 * @access  Private (Admin only)
 * @security ✅ Protected - exposes tracking data
 */
router.get('/delhivery/logs', verifyAdminToken, DelhiveryWebhookController.viewLogs);

// ========================================
// DEVELOPMENT/TEST ROUTES
// ========================================

if (process.env.NODE_ENV === 'development') {
  /**
   * @route   POST /api/webhooks/delhivery/test
   * @desc    Test webhook with real shipment
   * @access  Private (Development only)
   */
  router.post('/delhivery/test', DelhiveryWebhookController.testWebhook);
  
  /**
   * @route   POST /api/webhooks/delhivery/test-all
   * @desc    Test all status transitions sequentially
   * @access  Private (Development only)
   */
  router.post('/delhivery/test-all', DelhiveryWebhookController.testAllStatuses);
  
  /**
   * @route   POST /api/webhooks/delhivery/sync-now
   * @desc    Manually trigger cron sync job
   * @access  Private (Admin only - even in dev)
   * @security ✅ Protected - triggers expensive operations
   */
  router.post('/delhivery/sync-now', verifyAdminToken, DelhiveryWebhookController.manualSync);
}

module.exports = router;