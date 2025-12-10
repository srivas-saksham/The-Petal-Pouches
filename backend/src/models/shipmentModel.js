// backend/src/models/shipmentModel.js

const supabase = require('../config/supabaseClient');

/**
 * Shipment Model
 * Handles shipment records and tracking
 */
const ShipmentModel = {

  /**
   * Create shipment from order
   * @param {string} orderId - Order UUID
   * @param {Object} shipmentData - Shipment details
   * @returns {Promise<Object>} Created shipment
   */
  async createFromOrder(orderId, shipmentData = {}) {
    try {
      const { data, error } = await supabase
        .from('Shipments')
        .insert([{
          order_id: orderId,
          status: 'pending_pickup',
          shipping_mode: shipmentData.shipping_mode || 'Surface',
          weight_grams: shipmentData.weight_grams || 1000,
          destination_pincode: shipmentData.destination_pincode,
          destination_city: shipmentData.destination_city,
          destination_state: shipmentData.destination_state,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`[ShipmentModel] Shipment created for order: ${orderId}`);
      return data;
    } catch (error) {
      console.error('[ShipmentModel] Error creating shipment:', error);
      throw error;
    }
  },

  /**
   * Get shipment by order ID
   * @param {string} orderId - Order UUID
   * @returns {Promise<Object>} Shipment record
   */
  async getByOrderId(orderId) {
    try {
      const { data, error } = await supabase
        .from('Shipments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No shipment found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[ShipmentModel] Error getting shipment:', error);
      throw error;
    }
  },

  /**
   * Update shipment status
   * @param {string} shipmentId - Shipment UUID
   * @param {string} status - New status
   * @param {Object} trackingData - Optional tracking update
   * @returns {Promise<Object>} Updated shipment
   */
  async updateStatus(shipmentId, status, trackingData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      // Add tracking data if provided
      if (trackingData.awb) updateData.awb = trackingData.awb;
      if (trackingData.courier) updateData.courier = trackingData.courier;
      if (trackingData.tracking_url) updateData.tracking_url = trackingData.tracking_url;

      const { data, error } = await supabase
        .from('Shipments')
        .update(updateData)
        .eq('id', shipmentId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[ShipmentModel] Shipment status updated: ${shipmentId} -> ${status}`);
      return data;
    } catch (error) {
      console.error('[ShipmentModel] Error updating shipment:', error);
      throw error;
    }
  },

  /**
   * Get all shipments (admin)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Shipments list
   */
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('Shipments')
        .select(`
          *,
          Orders!inner(
            id,
            order_number,
            status,
            final_total,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[ShipmentModel] Error getting shipments:', error);
      throw error;
    }
  }
};

module.exports = ShipmentModel;