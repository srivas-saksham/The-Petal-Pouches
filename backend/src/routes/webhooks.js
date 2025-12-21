// backend/src/routes/webhooks.js

const express = require('express');
const router = express.Router();
const DelhiveryWebhookController = require('../controllers/delhiveryWebhookController');

// ========================================
// PRODUCTION ROUTES
// ========================================

// Real webhook endpoint (Delhivery will POST here)
router.post('/delhivery', DelhiveryWebhookController.handleStatusUpdate);

// Health check
router.get('/delhivery/health', DelhiveryWebhookController.healthCheck);

// View logs
router.get('/delhivery/logs', DelhiveryWebhookController.viewLogs);

// ========================================
// DEVELOPMENT/TEST ROUTES
// ========================================

if (process.env.NODE_ENV === 'development') {
  // Test single status update
  router.post('/delhivery/test', DelhiveryWebhookController.testWebhook);
  
  // Test all status transitions
  router.post('/delhivery/test-all', DelhiveryWebhookController.testAllStatuses);
  
  // Manual sync trigger
  router.post('/delhivery/sync-now', DelhiveryWebhookController.manualSync);
}

module.exports = router;