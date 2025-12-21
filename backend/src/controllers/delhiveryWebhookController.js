// backend/src/controllers/delhiveryWebhookController.js

const supabase = require('../config/supabaseClient');
const ShipmentModel = require('../models/shipmentModel');
const { mapDelhiveryStatus } = require('../utils/statusMapper');
const crypto = require('crypto');

const DelhiveryWebhookController = {

  /**
   * ✅ SECURE: Verify webhook authenticity
   * Delhivery sends signature in x-delhivery-signature header
   */
  verifyWebhookSignature(req) {
    const webhookSecret = process.env.DELHIVERY_WEBHOOK_SECRET;
    
    // Skip verification in development if secret not set
    if (!webhookSecret) {
      console.warn('⚠️ DELHIVERY_WEBHOOK_SECRET not set - skipping verification');
      return true;
    }

    const signature = req.headers['x-delhivery-signature'];
    if (!signature) {
      console.error('❌ Missing webhook signature header');
      return false;
    }

    try {
      const payload = JSON.stringify(req.body);
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      const isValid = signature === computedSignature;
      
      if (!isValid) {
        console.error('❌ Signature mismatch:', { received: signature, computed: computedSignature });
      }

      return isValid;
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  },

  /**
   * Main webhook handler for Delhivery status updates
   * POST /api/webhooks/delhivery
   */
  async handleStatusUpdate(req, res) {
    try {
      console.log('📥 [Webhook] Received from Delhivery:', JSON.stringify(req.body, null, 2));

      // ✅ SECURITY: Verify webhook signature
      if (!this.verifyWebhookSignature(req)) {
        console.error('❌ [Webhook] Invalid signature - rejecting request');
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid webhook signature' 
        });
      }

      // Extract webhook payload
      const { 
        waybill, 
        status, 
        status_datetime, 
        location, 
        expected_delivery_date,
        remarks 
      } = req.body;

      // Validate required fields
      if (!waybill || !status) {
        console.error('❌ [Webhook] Missing required fields:', { waybill, status });
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: waybill and status are required' 
        });
      }

      // ✅ QUICK RESPONSE: Respond immediately to Delhivery (prevent retries)
      res.json({ 
        success: true, 
        message: 'Webhook received, processing asynchronously' 
      });

      // ✅ ASYNC PROCESSING: Continue processing after response sent
      setImmediate(async () => {
        try {
          // Find shipment by AWB
          const { data: shipment, error: fetchError } = await supabase
            .from('Shipments')
            .select('id, status, order_id, tracking_history')
            .eq('awb', waybill)
            .single();

          if (fetchError || !shipment) {
            console.warn(`⚠️ [Webhook] Shipment not found for AWB: ${waybill}`);
            return;
          }

          console.log(`📦 [Webhook] Found shipment: ${shipment.id} (Order: ${shipment.order_id})`);

          // Map Delhivery status to internal status
          const mappedStatus = mapDelhiveryStatus(status);
          console.log(`🔄 [Webhook] Status mapping: "${status}" → "${mappedStatus}"`);

          // Check if status actually changed
          if (shipment.status === mappedStatus) {
            console.log(`ℹ️ [Webhook] Status unchanged for ${waybill}, skipping update`);
            return;
          }

          // Build new tracking event
          const trackingHistory = shipment.tracking_history || [];
          const newEvent = {
            status,
            mapped_status: mappedStatus,
            timestamp: status_datetime || new Date().toISOString(),
            location: location || null,
            remarks: remarks || null
          };

          // Avoid duplicate events
          const isDuplicate = trackingHistory.some(event => 
            event.status === status && 
            event.timestamp === newEvent.timestamp
          );

          if (!isDuplicate) {
            trackingHistory.push(newEvent);
            console.log(`📝 [Webhook] Added tracking event:`, newEvent);
          } else {
            console.log(`ℹ️ [Webhook] Duplicate event detected, skipping`);
          }

          // Update shipment with new tracking info
          await ShipmentModel.updateTrackingStatus(shipment.id, {
            current_status: mappedStatus,
            tracking_history: trackingHistory,
            expected_delivery_date: expected_delivery_date || null,
            last_sync_at: new Date().toISOString()
          });

          console.log(`✅ [Webhook] Successfully updated ${waybill}: ${status} → ${mappedStatus}`);

        } catch (asyncError) {
          console.error('❌ [Webhook] Async processing error:', asyncError);
          // Don't throw - webhook already responded to Delhivery
        }
      });

    } catch (error) {
      console.error('❌ [Webhook] Critical error:', error);
      
      // If we haven't responded yet, send error
      if (!res.headersSent) {
        return res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  },

  /**
   * Health check endpoint
   * GET /api/webhooks/delhivery/health
   */
  async healthCheck(req, res) {
    try {
      const { data: recentShipments } = await supabase
        .from('Shipments')
        .select('id, awb, status, last_sync_at')
        .not('awb', 'is', null)
        .order('last_sync_at', { ascending: false })
        .limit(5);

      return res.json({ 
        success: true, 
        message: 'Webhook endpoint is active and healthy',
        timestamp: new Date().toISOString(),
        recent_syncs: recentShipments ? recentShipments.length : 0,
        last_sync: recentShipments?.[0]?.last_sync_at || null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  },

  // ========================================
  // 🧪 TEST ENDPOINTS (Development Only)
  // ========================================

  /**
   * Test webhook with a real shipment from database
   * POST /api/webhooks/delhivery/test
   * Body: { "status": "Picked Up" }
   */
  async testWebhook(req, res) {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false,
        error: 'Test endpoint only available in development mode' 
      });
    }

    try {
      // Get the most recent shipment with AWB
      const { data: shipment, error } = await supabase
        .from('Shipments')
        .select('awb, order_id, status')
        .not('awb', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !shipment) {
        return res.status(404).json({ 
          success: false,
          error: 'No shipments with AWB found. Create and approve a shipment first.',
          hint: 'Go to /admin/shipments and approve a pending shipment'
        });
      }

      // Build test payload
      const testStatus = req.body.status || 'Picked Up';
      const testPayload = {
        waybill: shipment.awb,
        status: testStatus,
        status_datetime: new Date().toISOString(),
        location: 'Test Location - Mumbai Hub',
        remarks: 'Test webhook simulation',
        expected_delivery_date: new Date(Date.now() + 2*24*60*60*1000)
          .toISOString()
          .split('T')[0]
      };

      console.log('\n🧪 =============================================');
      console.log('   WEBHOOK TEST SIMULATION');
      console.log('=============================================');
      console.log('Shipment AWB:', shipment.awb);
      console.log('Order ID:', shipment.order_id);
      console.log('Current Status:', shipment.status);
      console.log('Test Status:', testStatus);
      console.log('Mapped Status:', mapDelhiveryStatus(testStatus));
      console.log('Payload:', JSON.stringify(testPayload, null, 2));
      console.log('=============================================\n');

      // Call actual webhook handler
      const mockReq = {
        body: testPayload,
        headers: {} // Skip signature verification in test
      };
      
      let webhookResponse = null;
      const mockRes = {
        headersSent: false,
        json: (data) => {
          webhookResponse = data;
          console.log('✅ Webhook Response:', data);
          return mockRes;
        },
        status: (code) => ({
          json: (data) => {
            webhookResponse = { status: code, ...data };
            return mockRes;
          }
        })
      };

      await DelhiveryWebhookController.handleStatusUpdate(mockReq, mockRes);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return res.json({
        success: true,
        message: 'Test webhook executed successfully',
        test_payload: testPayload,
        mapped_status: mapDelhiveryStatus(testStatus),
        webhook_response: webhookResponse,
        instructions: 'Check admin dashboard at http://localhost:5173/admin/shipments'
      });

    } catch (error) {
      console.error('❌ Test webhook error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  },

  /**
   * Test all status transitions sequentially
   * POST /api/webhooks/delhivery/test-all
   */
  async testAllStatuses(req, res) {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false,
        error: 'Test endpoint only available in development mode' 
      });
    }

    try {
      const statuses = [
        'Manifested',
        'Pickup Scheduled',
        'Picked Up',
        'In Transit',
        'Pending',
        'Dispatched',
        'Out for Delivery',
        'Delivered'
      ];

      const results = [];

      console.log('\n🧪 =============================================');
      console.log('   TESTING ALL STATUS TRANSITIONS');
      console.log('=============================================\n');

      for (const status of statuses) {
        console.log(`\n🧪 Testing status: ${status}`);
        
        try {
          const response = await fetch('http://localhost:5000/api/webhooks/delhivery/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });

          const data = await response.json();
          
          results.push({
            status,
            delhivery_status: status,
            internal_status: mapDelhiveryStatus(status),
            success: data.success,
            response: data.message
          });

          console.log(`✅ ${status} → ${mapDelhiveryStatus(status)}`);
        } catch (err) {
          results.push({
            status,
            success: false,
            error: err.message
          });
          console.error(`❌ ${status} failed:`, err.message);
        }

        // Wait 2 seconds between each test to see changes
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('\n🧪 =============================================');
      console.log('   ALL TESTS COMPLETED');
      console.log('=============================================\n');

      return res.json({
        success: true,
        message: 'All status tests completed',
        total: statuses.length,
        results
      });

    } catch (error) {
      console.error('❌ Test all statuses error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  /**
   * Manually trigger cron sync job
   * POST /api/webhooks/delhivery/sync-now
   */
  async manualSync(req, res) {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false,
        error: 'Test endpoint only available in development mode' 
      });
    }

    try {
      console.log('🔄 Manual sync triggered via API...');
      const result = await ShipmentModel.bulkSyncActiveShipments();
      
      return res.json({
        success: true,
        message: 'Manual sync completed',
        synced: result.success.length,
        failed: result.failed.length,
        details: result
      });
    } catch (error) {
      console.error('❌ Manual sync error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * View recent webhook activity logs
   * GET /api/webhooks/delhivery/logs
   */
  async viewLogs(req, res) {
    try {
      const { data: shipments } = await supabase
        .from('Shipments')
        .select('awb, status, tracking_history, last_sync_at, updated_at')
        .not('awb', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(20);

      return res.json({
        success: true,
        message: 'Recent webhook activity',
        total: shipments?.length || 0,
        shipments: (shipments || []).map(s => ({
          awb: s.awb,
          current_status: s.status,
          last_update: s.updated_at,
          last_sync: s.last_sync_at,
          events_count: s.tracking_history?.length || 0,
          recent_events: (s.tracking_history || []).slice(-3)
        }))
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

module.exports = DelhiveryWebhookController;