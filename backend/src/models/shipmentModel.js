// backend/src/models/shipmentModel.js

const supabase = require('../config/supabaseClient');
const delhiveryService = require('../services/delhiveryService');

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
  },

  /**
 * Create shipment with cost calculation
 * ✅ Sets estimated_delivery from order metadata
 * ✅ Handles all NULL fields with defaults
 * ✅ Parses detailed cost breakdown from Delhivery
 * ✅ Includes mode comparison (Surface vs Express)
 */
async createWithCostCalculation(orderId, shipmentData) {
  try {
    const supabase = require('../config/supabaseClient');
    const delhiveryService = require('../services/delhiveryService');

    const { data: order, error: orderError } = await supabase
      .from('Orders')
      .select('*, Users!inner(name, email, phone)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    console.log('📦 Creating shipment for order:', orderId);

    // Calculate cost using Delhivery for selected mode
    const costData = await delhiveryService.calculateShippingCost(
      shipmentData.destination_pincode,
      {
        mode: shipmentData.shipping_mode === 'Express' ? 'E' : 'S',
        weight: shipmentData.weight_grams,
        paymentType: (order.payment_method === 'cod' || order.payment_method === 'COD') ? 'COD' : 'Pre-paid'
      }
    );

    console.log('💰 Calculated shipping cost:', costData.amount);

    // ✅ Also calculate the alternate mode for comparison
    const alternateMode = shipmentData.shipping_mode === 'Express' ? 'S' : 'E';
    const alternateCostData = await delhiveryService.calculateShippingCost(
      shipmentData.destination_pincode,
      {
        mode: alternateMode,
        weight: shipmentData.weight_grams,
        paymentType: (order.payment_method === 'cod' || order.payment_method === 'COD') ? 'COD' : 'Pre-paid'
      }
    );

    // ✅ Parse detailed breakdown from Delhivery response
    const rawData = costData.rawData?.[0] || costData.rawData || {};
    const baseCost = rawData.charge_DL || rawData.base_rate || costData.amount;
    const codCharge = rawData.charge_COD || 0;
    const otherCharges = (rawData.charge_LM || 0) + (rawData.charge_DPH || 0);
    const grossAmount = rawData.gross_amount || costData.amount;
    const cgst = rawData.tax_data?.CGST || 0;
    const sgst = rawData.tax_data?.SGST || 0;
    const totalTax = cgst + sgst;

    console.log('💰 Cost breakdown:');
    console.log('   Base delivery:', baseCost);
    console.log('   COD charges:', codCharge);
    console.log('   Other charges:', otherCharges);
    console.log('   Gross amount:', grossAmount);
    console.log('   Tax (GST):', totalTax);
    console.log('   Final total:', costData.amount);

    // ✅ FIXED: Use expected_delivery_date directly from order metadata
    const deliveryMetadata = order.delivery_metadata || {};
    let estimatedDeliveryStr;

    // Priority 1: Use the expected_delivery_date if it exists (most accurate)
    if (deliveryMetadata.expected_delivery_date) {
      estimatedDeliveryStr = deliveryMetadata.expected_delivery_date;
      console.log(`📅 Using expected delivery from metadata: ${estimatedDeliveryStr}`);
    } else if (deliveryMetadata.estimated_days) {
      // Fallback: Calculate from estimated_days
      const estimatedDays = deliveryMetadata.estimated_days;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
      estimatedDeliveryStr = estimatedDate.toISOString().split('T')[0];
      console.log(`📅 Calculated delivery from days: ${estimatedDeliveryStr} (${estimatedDays} days)`);
    } else {
      // Default fallback
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 5);
      estimatedDeliveryStr = estimatedDate.toISOString().split('T')[0];
      console.log(`📅 Using default 5-day delivery: ${estimatedDeliveryStr}`);
    }

    // ✅ Build cost comparison note
    const surfaceCost = shipmentData.shipping_mode === 'Express' 
      ? Math.ceil(alternateCostData.amount) 
      : Math.ceil(costData.amount);
    const expressCost = shipmentData.shipping_mode === 'Express' 
      ? Math.ceil(costData.amount) 
      : Math.ceil(alternateCostData.amount);
    const expressExtra = expressCost - surfaceCost;

    // Create shipment with all fields properly set
    const { data: shipment, error: shipmentError } = await supabase
      .from('Shipments')
      .insert([{
        order_id: orderId,
        status: 'pending_review',
        
        // Shipping details
        shipping_mode: shipmentData.shipping_mode,
        weight_grams: shipmentData.weight_grams,
        dimensions_cm: shipmentData.dimensions_cm || { length: 30, width: 25, height: 10 },
        package_count: 1,
        
        // Destination
        destination_pincode: shipmentData.destination_pincode,
        destination_city: shipmentData.destination_city,
        destination_state: shipmentData.destination_state,
        
        // Dates - ✅ Set estimated_delivery immediately
        estimated_delivery: estimatedDeliveryStr,
        pickup_scheduled_date: shipmentData.pickup_scheduled_date || null,
        pickup_actual_date: null,
        placed_at: null,
        approved_at: null,
        
        // Cost - ✅ DETAILED BREAKDOWN
        estimated_cost: Math.ceil(costData.amount),
        actual_cost: null, // Will be set after placement
        cost_breakdown: {
          base_delivery_charge: Math.ceil(baseCost),
          cod_charges: Math.ceil(codCharge),
          other_charges: Math.ceil(otherCharges),
          gross_amount: Math.ceil(grossAmount),
          cgst: Math.ceil(cgst),
          sgst: Math.ceil(sgst),
          total_tax: Math.ceil(totalTax),
          total: Math.ceil(costData.amount),
          currency: 'INR',
          source: costData.source,
          // ✅ Mode comparison for reference
          mode_comparison: {
            selected_mode: shipmentData.shipping_mode,
            surface_cost: surfaceCost,
            express_cost: expressCost,
            express_extra: expressExtra,
            customer_paid_extra: shipmentData.shipping_mode === 'Express' ? expressExtra : 0
          }
        },
        
        // ✅ Courier/Tracking fields - NULL until placement
        courier: null,
        awb: null,
        tracking_url: null,
        delhivery_order_id: null,
        
        // ✅ Document URLs - NULL until placement
        label_url: null,
        invoice_url: null,
        manifest_url: null,
        
        // ✅ Tracking data - Empty array instead of NULL
        tracking_history: [],
        
        // Admin fields
        admin_notes: null,
        edited_by: null,
        approved_by: null,
        editable: true,
        
        // Failure tracking
        failed_reason: null,
        retry_count: 0,
        
        // Timestamps
        last_sync_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    console.log(`✅ Shipment created: ${shipment.id}`);
    console.log(`   Status: ${shipment.status}`);
    console.log(`   Estimated cost: ₹${shipment.estimated_cost}`);
    console.log(`   Estimated delivery: ${shipment.estimated_delivery}`);
    console.log(`   Mode comparison: Surface ₹${surfaceCost} | Express ₹${expressCost}`);

    return shipment;
  } catch (error) {
    console.error('❌ Create shipment with cost error:', error);
    throw error;
  }
},

  /**
   * Get all shipments with filters (admin)
   */
  async getAllShipments(filters = {}) {
    try {
      const { status, page = 1, limit = 20, search, from_date, to_date, sort = 'created_at', order = 'desc' } = filters;

      let query = supabase
        .from('Shipments')
        .select(`
          *,
          Orders!inner(
            id,
            final_total,
            payment_method,
            shipping_address,
            Users!inner(name, email, phone)
          )
        `, { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (search) query = query.or(`awb.ilike.%${search}%`);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);

      query = query.order(sort, { ascending: order === 'asc' });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        shipments: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Get all shipments error:', error);
      throw error;
    }
  },

  /**
   * Get pending review shipments
   */
  async getPendingReviewShipments() {
    try {
      const { data, error } = await supabase
        .from('Shipments')
        .select(`
          *,
          Orders!inner(
            id,
            final_total,
            payment_method,
            shipping_address,
            Users!inner(name, email, phone)
          )
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Get pending shipments error:', error);
      throw error;
    }
  },

  /**
   * Update shipment details (admin edit)
   */
  async updateShipmentDetails(shipmentId, updateData, adminId) {
    try {
      const { data: shipment, error: fetchError } = await supabase
        .from('Shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (fetchError) throw fetchError;

      if (!shipment.editable) {
        throw new Error('SHIPMENT_NOT_EDITABLE');
      }

      // Recalculate cost if weight/dimensions changed
      let costBreakdown = shipment.cost_breakdown;
      if (updateData.weight_grams || updateData.dimensions_cm) {
        const costData = await delhiveryService.calculateShippingCost(
          shipment.destination_pincode,
          {
            mode: updateData.shipping_mode || shipment.shipping_mode === 'Express' ? 'E' : 'S',
            weight: updateData.weight_grams || shipment.weight_grams,
            paymentType: 'Pre-paid'
          }
        );

        costBreakdown = {
          ...costBreakdown,
          base_rate: costData.amount,
          total: costData.amount
        };
        updateData.estimated_cost = costData.amount;
      }

      const { data: updated, error: updateError } = await supabase
        .from('Shipments')
        .update({
          ...updateData,
          cost_breakdown: costBreakdown,
          edited_by: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updated;
    } catch (error) {
      console.error('❌ Update shipment error:', error);
      throw error;
    }
  },

  /**
   * Approve and place shipment with Delhivery
   * ✅ Updates order status to 'confirmed'
   * ✅ Populates all NULL fields with Delhivery response
   * ✅ Recalculates estimated_delivery if Delhivery provides it
   */
  async approveAndPlace(shipmentId, adminId) {
    try {
      const supabase = require('../config/supabaseClient');
      const delhiveryService = require('../services/delhiveryService');

      const { data: shipment, error: fetchError } = await supabase
        .from('Shipments')
        .select('*, Orders!inner(*, Users!inner(*))')
        .eq('id', shipmentId)
        .single();

      if (fetchError) throw fetchError;

      if (shipment.status !== 'pending_review') {
        throw new Error('Shipment must be in pending_review status');
      }

      console.log(`📦 Approving and placing shipment: ${shipmentId}`);

      // ✅ FIXED: Set approved_at timestamp
      const approvedAt = new Date().toISOString();
      const placedAt = new Date().toISOString();

      // ===== STEP 1: Update to approved =====
      await supabase
        .from('Shipments')
        .update({
          status: 'approved',
          approved_by: adminId,
          approved_at: approvedAt, // ✅ NOW BEING SET
          updated_at: approvedAt
        })
        .eq('id', shipmentId);

      console.log('✅ Shipment approved at:', approvedAt);

      // ===== STEP 2: Calculate pickup_scheduled_date =====
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pickupScheduledDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log('📅 Pickup scheduled for:', pickupScheduledDate);

      // ===== STEP 3: Call Delhivery API =====
      const delhiveryResponse = await delhiveryService.createShipment({
        shipment_id: shipmentId,
        order_id: shipment.order_id,
        destination_pincode: shipment.destination_pincode,
        destination_city: shipment.destination_city,
        destination_state: shipment.destination_state,
        customer_name: shipment.Orders.Users.name,
        customer_phone: shipment.Orders.Users.phone || shipment.Orders.shipping_address.phone,
        customer_address: shipment.Orders.shipping_address,
        weight_grams: shipment.weight_grams,
        dimensions_cm: shipment.dimensions_cm,
        payment_mode: shipment.Orders.payment_method === 'cod' ? 'COD' : 'Prepaid',
        cod_amount: shipment.Orders.payment_method === 'cod' ? shipment.Orders.final_total : 0,
        shipping_mode: shipment.shipping_mode
      });

      console.log('✅ Delhivery shipment created:', delhiveryResponse.awb);

      // ===== STEP 4: Calculate estimated delivery =====
      let finalEstimatedDelivery = shipment.estimated_delivery;
      
      if (!finalEstimatedDelivery) {
        const deliveryMetadata = shipment.Orders.delivery_metadata || {};
        const estimatedDays = deliveryMetadata.estimated_days || 5;
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
        finalEstimatedDelivery = estimatedDate.toISOString().split('T')[0];
      }

      // ===== STEP 5: Update with ALL details =====
      const { data: updated, error: updateError } = await supabase
        .from('Shipments')
        .update({
          status: 'placed',
          
          // ✅ Courier/Tracking
          awb: delhiveryResponse.awb,
          courier: delhiveryResponse.courier || 'Delhivery',
          tracking_url: delhiveryResponse.tracking_url,
          delhivery_order_id: delhiveryResponse.order_id || null,
          
          // ✅ Document URLs - NOW PROPERLY SET
          label_url: delhiveryResponse.label_url,
          invoice_url: delhiveryResponse.invoice_url,
          manifest_url: delhiveryResponse.manifest_url,
          
          // ✅ Dates - NOW PROPERLY SET
          estimated_delivery: finalEstimatedDelivery,
          pickup_scheduled_date: pickupScheduledDate, // ✅ NOW SET
          placed_at: placedAt, // ✅ NOW SET
          
          // Cost
          actual_cost: delhiveryResponse.cost || shipment.estimated_cost,
          
          // Timestamps
          updated_at: placedAt,
          
          // Lock editing
          editable: false
        })
        .eq('id', shipmentId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Shipment updated with all details:');
      console.log('   AWB:', updated.awb);
      console.log('   Label URL:', updated.label_url);
      console.log('   Invoice URL:', updated.invoice_url);
      console.log('   Approved At:', updated.approved_at);
      console.log('   Pickup Scheduled:', updated.pickup_scheduled_date);
      console.log('   Placed At:', updated.placed_at);

      // ===== STEP 6: Update order status =====
      const { error: orderUpdateError } = await supabase
        .from('Orders')
        .update({
          status: 'confirmed',
          updated_at: placedAt
        })
        .eq('id', shipment.order_id);

      if (orderUpdateError) {
        console.error('⚠️ Failed to update order status:', orderUpdateError);
      } else {
        console.log(`✅ Order ${shipment.order_id} confirmed`);
      }

      return updated;
    } catch (error) {
      console.error('❌ Approve and place error:', error);
      
      // Rollback
      try {
        await supabase
          .from('Shipments')
          .update({
            status: 'pending_review',
            failed_reason: error.message,
            retry_count: shipment.retry_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', shipmentId);
        
        console.log('⚠️ Shipment rolled back to pending_review');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
      
      throw error;
    }
  },

  /**
   * Schedule pickup for placed shipment
   */
  async schedulePickup(shipmentId, pickupDate = null, adminId) {
    try {
      const { data: shipment, error } = await supabase
        .from('Shipments')
        .select('awb, status')
        .eq('id', shipmentId)
        .single();

      if (error) throw error;
      if (!shipment.awb) throw new Error('No AWB found');
      if (shipment.status !== 'placed') throw new Error('Must be placed first');

      const pickupResult = await delhiveryService.schedulePickup({
        awbs: [shipment.awb],
        pickupDate: pickupDate,
        pickupTime: '10:00:00',
        packageCount: 1
      });

      const { data: updated, error: updateError } = await supabase
        .from('Shipments')
        .update({
          status: 'pending_pickup',
          pickup_scheduled_date: pickupResult.pickup_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    } catch (error) {
      console.error('❌ Schedule pickup error:', error);
      throw error;
    }
  },
  /**
   * Update shipment tracking status from Delhivery
   * ✅ Also updates order status based on shipment progress
   * ✅ Handles estimated_delivery updates from courier
   */
  async updateTrackingStatus(shipmentId, trackingData) {
    try {
      const supabase = require('../config/supabaseClient');

      const updateData = {
        status: trackingData.current_status,
        tracking_history: trackingData.tracking_history || [],
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // ✅ Update estimated_delivery if Delhivery provides it
      if (trackingData.expected_delivery_date) {
        updateData.estimated_delivery = trackingData.expected_delivery_date;
        console.log(`📅 Updated estimated delivery: ${trackingData.expected_delivery_date}`);
      }

      const { data: shipment, error } = await supabase
        .from('Shipments')
        .update(updateData)
        .eq('id', shipmentId)
        .select('order_id, status, awb')
        .single();

      if (error) throw error;

      console.log(`✅ Shipment tracking updated: ${shipment.awb} -> ${trackingData.current_status}`);

      // ✅ Update order status based on shipment status
      const orderStatusMap = {
        'placed': 'confirmed',
        'pending_pickup': 'confirmed',
        'picked_up': 'confirmed',
        'in_transit': 'shipped',
        'out_for_delivery': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'failed': 'cancelled',
        'rto_initiated': 'cancelled',
        'rto_delivered': 'cancelled'
      };

      const newOrderStatus = orderStatusMap[trackingData.current_status];
      
      if (newOrderStatus) {
        const orderUpdate = {
          status: newOrderStatus,
          updated_at: new Date().toISOString()
        };

        // ✅ Set delivered_at timestamp when delivered
        if (newOrderStatus === 'delivered') {
          orderUpdate.delivered_at = new Date().toISOString();
        }

        const { error: orderError } = await supabase
          .from('Orders')
          .update(orderUpdate)
          .eq('id', shipment.order_id);

        if (orderError) {
          console.error('⚠️ Failed to update order status:', orderError);
        } else {
          console.log(`✅ Order ${shipment.order_id} status updated to '${newOrderStatus}'`);
        }
      }

      return shipment;
    } catch (error) {
      console.error('❌ Update tracking error:', error);
      throw error;
    }
  },

  /**
   * Get shipment statistics
   */
  async getShipmentStats() {
    try {
      const { data, error } = await supabase
        .from('Shipments')
        .select('status');

      if (error) throw error;

      const stats = data.reduce((acc, shipment) => {
        acc[shipment.status] = (acc[shipment.status] || 0) + 1;
        return acc;
      }, {});

      // Add total count
      stats.total = data.length;

      return stats;
    } catch (error) {
      console.error('❌ Get stats error:', error);
      throw error;
    }
  },
  /**
   * Get shipment by ID with full details
   */
  async getShipmentById(shipmentId) {
    try {
      const { data, error } = await supabase
        .from('Shipments')
        .select(`
          *,
          Orders!inner(
            id,
            final_total,
            payment_method,
            shipping_address,
            Users!inner(name, email, phone)
          )
        `)
        .eq('id', shipmentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Get shipment by ID error:', error);
      throw error;
    }
  },

  /**
   * Sync shipment status with Delhivery
   */
  async syncWithDelhivery(shipmentId) {
    try {
      const delhiveryService = require('../services/delhiveryService');

      // Get shipment
      const { data: shipment, error: fetchError } = await supabase
        .from('Shipments')
        .select('awb, status')
        .eq('id', shipmentId)
        .single();

      if (fetchError) throw fetchError;

      if (!shipment.awb) {
        throw new Error('Shipment does not have AWB yet');
      }

      // Skip if already delivered or cancelled
      if (['delivered', 'cancelled', 'rto_delivered'].includes(shipment.status)) {
        console.log(`⏭️ Skipping sync for completed shipment: ${shipmentId}`);
        return shipment;
      }

      // Fetch tracking from Delhivery
      const trackingData = await delhiveryService.getTrackingInfo(shipment.awb);

      if (!trackingData.success) {
        throw new Error(trackingData.error);
      }

      // Update shipment with new tracking data
      const updated = await this.updateTrackingStatus(shipmentId, trackingData);

      return updated;
    } catch (error) {
      console.error('❌ Sync with Delhivery error:', error);
      throw error;
    }
  },

  /**
   * Get tracking info for user (simplified statuses)
   */
  async getTrackingForUser(orderId) {
    try {
      const { data: shipment, error } = await supabase
        .from('Shipments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No shipment yet
        }
        throw error;
      }

      // Map admin statuses to user-friendly statuses
      const userStatus = this._mapToUserStatus(shipment.status);

      return {
        id: shipment.id,
        awb: shipment.awb,
        status: userStatus,
        admin_status: shipment.status,
        tracking_url: shipment.tracking_url,
        estimated_delivery: shipment.estimated_delivery,
        tracking_history: shipment.tracking_history || [],
        courier: shipment.courier,
        shipping_mode: shipment.shipping_mode,
        created_at: shipment.created_at,
        updated_at: shipment.updated_at
      };
    } catch (error) {
      console.error('❌ Get tracking for user error:', error);
      throw error;
    }
  },

  /**
   * Map admin status to user-friendly status
   * @private
   */
  _mapToUserStatus(adminStatus) {
    const statusMap = {
      'pending_review': 'Pending',
      'approved': 'Confirmed',
      'placed': 'Confirmed',
      'pending_pickup': 'Confirmed',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'failed': 'Undelivered',
      'rto_initiated': 'Undelivered',
      'rto_delivered': 'Undelivered',
      'cancelled': 'Cancelled'
    };

    return statusMap[adminStatus] || 'Processing';
  },

  /**
   * Bulk sync active shipments with Delhivery
   */
  async bulkSyncActiveShipments() {
    try {
      // Get all active shipments (not delivered/cancelled)
      const { data: shipments, error } = await supabase
        .from('Shipments')
        .select('id, awb, status')
        .not('awb', 'is', null)
        .not('status', 'in', '(delivered,cancelled,rto_delivered)');

      if (error) throw error;

      console.log(`📦 Syncing ${shipments.length} active shipments...`);

      const results = {
        success: [],
        failed: []
      };

      for (const shipment of shipments) {
        try {
          await this.syncWithDelhivery(shipment.id);
          results.success.push(shipment.id);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to sync ${shipment.id}:`, error.message);
          results.failed.push({ id: shipment.id, error: error.message });
        }
      }

      console.log(`✅ Sync complete: ${results.success.length} success, ${results.failed.length} failed`);

      return results;
    } catch (error) {
      console.error('❌ Bulk sync error:', error);
      throw error;
    }
  }
};

module.exports = ShipmentModel;