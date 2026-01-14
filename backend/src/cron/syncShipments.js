// backend/src/cron/syncShipments.js
/**
 * Vercel Cron Endpoint for Shipment Sync
 * Called every 15 minutes by Vercel Cron
 * Protected by CRON_SECRET to prevent unauthorized access
 */

const ShipmentModel = require('../models/shipmentModel');

module.exports = async (req, res) => {
  // ✅ SECURITY: Verify cron secret
  const authHeader = req.headers['authorization'];
  const cronSecret = req.headers['x-vercel-cron-secret'];
  
  // Accept both Vercel's header and our custom secret
  const providedSecret = cronSecret || (authHeader && authHeader.replace('Bearer ', ''));
  
  if (providedSecret !== process.env.CRON_SECRET) {
    console.warn('⚠️ Unauthorized cron access attempt');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized cron request'
    });
  }

  // ✅ SECURITY: Only allow POST and GET methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log(`🔄 [Vercel Cron] Starting scheduled sync at ${new Date().toISOString()}`);
    
    const startTime = Date.now();
    const result = await ShipmentModel.bulkSyncActiveShipments();
    const duration = Date.now() - startTime;
    
    console.log(`✅ [Vercel Cron] Sync completed in ${duration}ms`);
    
    return res.status(200).json({
      success: true,
      message: 'Shipment sync completed',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      result
    });
  } catch (error) {
    console.error('❌ [Vercel Cron] Sync failed:', error.message);
    
    // Still return 200 to prevent Vercel from retrying
    // (we'll handle retries in the next scheduled run)
    return res.status(200).json({
      success: false,
      message: 'Shipment sync failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      timestamp: new Date().toISOString()
    });
  }
};