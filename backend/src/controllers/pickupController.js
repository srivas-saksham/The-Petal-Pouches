// backend/src/controllers/pickupController.js
/**
 * Pickup Controller - Centralized Pickup Management
 * Handles bulk pickup scheduling for multiple shipments
 */

const ShipmentModel = require('../models/shipmentModel');
const delhiveryService = require('../services/delhiveryService');

const PickupController = {

  /**
   * Get eligible shipments for pickup
   * GET /api/admin/pickups/eligible
   */
  async getEligibleShipments(req, res) {
    try {
      const supabase = require('../config/supabaseClient');
      
      const { data, error } = await supabase
        .from('Shipments')
        .select(`
          id, awb, status, weight_grams,
          pickup_location, destination_city,
          Orders!inner(id, Users!inner(name))
        `)
        .eq('status', 'placed')
        .not('awb', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      });
    } catch (error) {
      console.error('❌ Get eligible shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch eligible shipments',
        error: error.message
      });
    }
  },

  /**
     * Create bulk pickup request
     * ✅ CORRECTED: One pickup per location, not per AWB
     */
    async createBulkPickup(req, res) {
    try {
        const { shipment_ids, pickup_date, pickup_location } = req.body;

        if (!Array.isArray(shipment_ids) || shipment_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'shipment_ids array is required'
        });
        }

        console.log(`📦 Preparing bulk pickup for ${shipment_ids.length} shipments`);

        const supabase = require('../config/supabaseClient');

        // Fetch shipments
        const { data: shipments, error: fetchError } = await supabase
        .from('Shipments')
        .select('id, awb, status, pickup_location')
        .in('id', shipment_ids)
        .eq('status', 'placed');

        if (fetchError) throw fetchError;

        if (shipments.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No eligible shipments found'
        });
        }

        const awbs = shipments.map(s => s.awb).filter(Boolean);
        const packageCount = awbs.length;

        if (packageCount === 0) {
        return res.status(400).json({
            success: false,
            message: 'No AWBs found. Shipments must be placed first.'
        });
        }

        // ✅ CORRECTED: Check if pickup already exists for today
        const today = new Date().toISOString().split('T')[0];
        const targetDate = pickup_date || today;

        const { data: existingPickup } = await supabase
        .from('DailyPickups')
        .select('*')
        .eq('pickup_location', pickup_location)
        .eq('pickup_date', targetDate)
        .eq('status', 'active')
        .single();

        let pickupRequestId;

        if (existingPickup) {
        // ✅ Update existing pickup count
        console.log(`✅ Using existing pickup request: ${existingPickup.delhivery_pickup_id}`);
        pickupRequestId = existingPickup.delhivery_pickup_id;

        await supabase
            .from('DailyPickups')
            .update({
            expected_package_count: existingPickup.expected_package_count + packageCount
            })
            .eq('id', existingPickup.id);

        } else {
        // ✅ Create new pickup request (location-based, no AWBs)
        const pickupResult = await delhiveryService.schedulePickup({
            pickupDate: targetDate,
            pickupTime: '10:00:00',
            packageCount: packageCount,
            pickupLocation: pickup_location
        });

        if (!pickupResult.success) {
            throw new Error(pickupResult.error);
        }

        console.log('✅ Delhivery pickup created:', pickupResult.pickup_id);
        pickupRequestId = pickupResult.pickup_id;

        // Store in DailyPickups
        await supabase.from('DailyPickups').insert({
            pickup_location: pickup_location,
            pickup_date: targetDate,
            pickup_time: '10:00:00',
            delhivery_pickup_id: pickupResult.pickup_id,
            expected_package_count: packageCount,
            status: 'active'
        });
        }

        // ✅ Update all shipments with pickup reference
        const { error: updateError } = await supabase
        .from('Shipments')
        .update({
            status: 'pending_pickup',
            pickup_scheduled_date: targetDate,
            pickup_confirmed_with_courier: true,
            delhivery_pickup_id: pickupRequestId,
            updated_at: new Date().toISOString()
        })
        .in('id', shipment_ids);

        if (updateError) throw updateError;

        res.json({
        success: true,
        message: `Pickup scheduled for ${packageCount} shipments`,
        data: {
            pickup_id: pickupRequestId,
            pickup_date: targetDate,
            shipment_count: packageCount,
            awbs: awbs,
            is_new_pickup: !existingPickup
        }
        });

    } catch (error) {
        console.error('❌ Bulk pickup error:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to create bulk pickup',
        error: error.message
        });
    }
    }

};

module.exports = PickupController;