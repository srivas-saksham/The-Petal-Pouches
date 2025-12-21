// backend/src/jobs/syncShipments.js
/**
 * Shipment Sync Cron Job
 * Fallback mechanism if webhooks fail
 * Runs every 15 minutes to sync active shipments
 */

const cron = require('node-cron');
const ShipmentModel = require('../models/shipmentModel');

// Run every 15 minutes: */15 * * * *
// For testing every minute: * * * * *
const CRON_SCHEDULE = '*/15 * * * *';

function startShipmentSyncJob() {
  // Change from 15 minutes to 1 minute for testing
  const cronSchedule = process.env.NODE_ENV === 'development' 
    ? '*/1 * * * *'  // Every 1 minute (testing)
    : '*/15 * * * *'; // Every 15 minutes (production)
  
  const job = cron.schedule(cronSchedule, async () => {
    console.log(`🔄 [Cron] Starting scheduled sync at ${new Date().toISOString()}`);
    await ShipmentModel.bulkSyncActiveShipments();
  });

  console.log(`✅ Shipment sync job scheduled (every ${process.env.NODE_ENV === 'development' ? '1' : '15'} minutes)`);
  return job;
}

module.exports = { startShipmentSyncJob };