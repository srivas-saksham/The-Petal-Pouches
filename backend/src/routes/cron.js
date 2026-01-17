// CREATE: backend/src/routes/cron.js
const express = require('express');
const router = express.Router();
const syncShipments = require('../cron/syncShipments');

router.post('/sync-shipments', syncShipments);

module.exports = router;

// ADD TO index.js (line ~150):
app.use('/api/cron', require('./routes/cron'));