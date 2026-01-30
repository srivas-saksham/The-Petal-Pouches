const express = require('express');
const router = express.Router();
const syncShipments = require('../cron/syncShipments');

// POST /api/cron/sync-shipments
router.post('/sync-shipments', syncShipments);

// Optional: GET for manual testing
router.get('/sync-shipments', syncShipments);

module.exports = router;