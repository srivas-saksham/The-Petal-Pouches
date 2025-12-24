// backend/src/models/orderModel.js - COMPLETE VERSION WITH ALL FUNCTIONALITY PRESERVED

const supabase = require('../config/supabaseClient');

/**
 * Order Model - Handles all order-related database operations
 * Manages order creation, status updates, and order retrieval with items
 * ⭐ UPDATED: Works with BUNDLES ONLY (No Product_variants)
 * ✅ ENHANCED: Returns complete order data including shipping_address and delivery_metadata
 */
const OrderModel = {

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new order with items (transaction)
   * ⭐ UPDATED: Now stores ONLY bundle details in Order_items
   *   - NOT individual products from bundle
   *   - Each Order_item row = 1 bundle ordered
   * 
   * @param {Object} orderData - Order information
   * @param {string} orderData.user_id - Customer UUID
   * @param {number} orderData.subtotal - Items total before shipping/discount
   * @param {number} orderData.express_charge - Express delivery charge
   * @param {number} orderData.discount - Discount amount
   * @param {number} orderData.final_total - Final payable amount
   * @param {Object} orderData.shipping_address - Delivery address (JSONB)
   * @param {Object} orderData.delivery_metadata - Delivery mode and details (JSONB)
   * @param {string} orderData.payment_method - Payment method
   * @param {string} orderData.payment_status - Payment status
   * @param {string} [orderData.payment_id] - Payment transaction ID
   * @param {string} [orderData.bundle_type='mixed'] - Order type
   * @param {string} [orderData.custom_bundle_id] - Custom bundle reference
   * @param {string} [orderData.notes] - Order notes
   * @param {boolean} [orderData.gift_wrap=false] - Gift wrap option
   * @param {string} [orderData.gift_message] - Gift message
   * @param {Array} items - Order items array (bundles only)
   * @param {string} items[].bundle_id - Bundle UUID
   * @param {string} items[].bundle_title - Bundle title
   * @param {number} items[].bundle_quantity - How many of this bundle
   * @param {number} items[].price - Bundle price per unit
   * @param {string} [items[].bundle_origin='brand-bundle'] - Bundle origin type
   * @returns {Promise<Object>} Created order with items
   */
  async create(orderData, items) {
    try {
      const {
        user_id,
        subtotal,
        express_charge = 0,
        discount = 0,
        final_total,
        shipping_address,
        payment_method = 'cod',
        payment_status = 'unpaid',
        payment_id = null,
        bundle_type = 'mixed',
        custom_bundle_id = null,
        notes = null,
        gift_wrap = false,
        gift_message = null,
        status = 'pending'
      } = orderData;

      // Insert order with all fields including delivery_metadata
      const { data: order, error: orderError } = await supabase
        .from('Orders')
        .insert([{
          user_id,
          status,
          subtotal,
          express_charge,
          discount,
          final_total,
          shipping_address,
          payment_method,
          payment_status,
          payment_id,
          custom_bundle_id,
          bundle_type,
          notes,
          gift_wrap,
          gift_message,
          delivery_metadata: orderData.delivery_metadata || {}, // ✅ Store delivery metadata
          created_at: new Date().toISOString(),
          placed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      console.log(`✅ Order created: ${order.id}`);

      // ===== ⭐ UPDATED: Store ONLY bundle details (not individual items) =====
      // Each row in Order_items = 1 bundle (with bundle_quantity)
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        bundle_id: item.bundle_id,                    // ⭐ Bundle reference
        quantity: item.bundle_quantity || 1,          // ⭐ How many of this bundle
        price: item.price,                            // Bundle unit price
        bundle_origin: item.bundle_origin || 'brand-bundle', // Keep for tracking
        bundle_title: item.bundle_title || null,      // Store bundle title
        created_at: new Date().toISOString()
      }));

      console.log(`📝 Inserting ${orderItemsData.length} order items (bundles only)`);

      const { data: orderItems, error: itemsError } = await supabase
        .from('Order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) throw itemsError;

      console.log(`✅ ${orderItems.length} order items created`);

      console.log(`[OrderModel] Order created: ${order.id} for user: ${user_id}`);
      
      return {
        ...order,
        items: orderItems
      };
      
    } catch (error) {
      console.error('[OrderModel] Error creating order:', error);
      throw error;
    }
  },

  // ==================== READ OPERATIONS ====================

  /**
   * Get order by ID with full details (bundles only)
   * @param {string} orderId - Order UUID
   * @param {string} [userId] - Optional user ID for authorization
   * @returns {Promise<Object|null>} Order with bundle items
   */
  async findById(orderId, userId = null) {
  try {
    let orderQuery = supabase
      .from('Orders')
      .select('*')
      .eq('id', orderId);

    if (userId) {
      orderQuery = orderQuery.eq('user_id', userId);
    }

    const { data: order, error: orderError } = await orderQuery.single();

    if (orderError) {
      if (orderError.code === 'PGRST116') return null;
      throw orderError;
    }

    // ✅ GET SHIPMENT DATA (with all fields)
    const { data: shipment, error: shipmentError } = await supabase
      .from('Shipments')
      .select(`
        id,
        awb, 
        status, 
        tracking_url, 
        courier, 
        estimated_delivery, 
        shipping_mode,
        label_url,
        invoice_url,
        manifest_url,
        tracking_history,
        weight_grams,
        dimensions_cm,
        destination_city,
        destination_state,
        destination_pincode,
        estimated_cost,
        actual_cost,
        placed_at,
        created_at,
        updated_at
      `)
      .eq('order_id', orderId)
      .single();

    if (shipmentError && shipmentError.code !== 'PGRST116') {
      console.warn('⚠️ Shipment fetch failed:', shipmentError);
    }

    // ✅ Get order items with BUNDLE details
    const { data: orderItems, error: itemsError } = await supabase
      .from('Order_items')
      .select(`
        *,
        Bundles!inner(
          id,
          title,
          description,
          img_url,
          price
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const items = (orderItems || []).map(item => ({
      id: item.id,
      bundle_id: item.bundle_id,
      quantity: item.quantity,
      price: item.price,
      bundle_origin: item.bundle_origin,
      bundle_title: item.Bundles.title,
      bundle_description: item.Bundles.description,
      bundle_img: item.Bundles.img_url,
      bundle_price: item.Bundles.price
    }));

    return {
      ...order,
      items,
      shipment: shipment || null // ✅ NULL if no shipment yet
    };
    
  } catch (error) {
    console.error('[OrderModel] Error finding order by ID:', error);
    throw error;
  }
},

  /**
   * Get all orders for a user with pagination
   * ✅ ENHANCED: Now returns COMPLETE order data including shipping_address and delivery_metadata
   * @param {string} userId - User UUID
   * @param {Object} options - Query options
   * @param {number} [options.limit=20] - Results per page
   * @param {number} [options.offset=0] - Pagination offset
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.sortBy='created_at'] - Sort field
   * @param {string} [options.sortOrder='DESC'] - Sort direction
   * @returns {Promise<Array>} Array of orders with bundle items
   */
  async findByUser(userId, options = {}) {
  try {
    const {
      limit = 20,
      offset = 0,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const validSortFields = ['created_at', 'placed_at', 'final_total', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder.toUpperCase() === 'ASC';

    // ✅ Fetch orders
    let ordersQuery = supabase
      .from('Orders')
      .select(`
        id, 
        status, 
        subtotal, 
        express_charge, 
        discount,
        final_total, 
        payment_status, 
        payment_method,
        created_at, 
        placed_at, 
        delivered_at,
        bundle_type,
        shipping_address,
        delivery_metadata,
        gift_wrap,
        gift_message,
        notes
      `)
      .eq('user_id', userId);

    if (status) {
      ordersQuery = ordersQuery.eq('status', status);
    }

    ordersQuery = ordersQuery
      .order(sortField, { ascending })
      .range(offset, offset + limit - 1);

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return [];
    }

    const orderIds = orders.map(o => o.id);

    // ✅ GET SHIPMENTS DATA (with all fields)
    const { data: shipments, error: shipmentsError } = await supabase
      .from('Shipments')
      .select(`
        order_id, 
        awb, 
        status, 
        tracking_url, 
        courier, 
        estimated_delivery,
        shipping_mode,
        label_url,
        invoice_url,
        tracking_history
      `)
      .in('order_id', orderIds);

    if (shipmentsError) {
      console.warn('⚠️ Failed to fetch shipments:', shipmentsError);
    }

    // Map shipments by order_id
    const shipmentsByOrder = {};
    (shipments || []).forEach(shipment => {
      shipmentsByOrder[shipment.order_id] = shipment;
    });

    // ✅ Get order items with BUNDLE details
    const { data: allItems, error: itemsError } = await supabase
      .from('Order_items')
      .select(`
        order_id,
        quantity,
        bundle_id,
        bundle_title,
        Bundles!inner(
          id,
          title,
          img_url,
          price
        )
      `)
      .in('order_id', orderIds);

    if (itemsError) throw itemsError;

    // Group items by order_id
    const itemsByOrder = {};
    (allItems || []).forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push({
        bundle_id: item.bundle_id,
        bundle_title: item.bundle_title || item.Bundles.title,
        bundle_img: item.Bundles.img_url,
        bundle_price: item.Bundles.price,
        quantity: item.quantity
      });
    });

    // ✅ Combine orders with items AND shipments
    return orders.map(order => ({
      ...order,
      item_count: itemsByOrder[order.id] ? itemsByOrder[order.id].length : 0,
      items_preview: itemsByOrder[order.id] || [],
      shipment: shipmentsByOrder[order.id] || null, // ✅ NULL if no shipment yet
      shipping_address: order.shipping_address,
      delivery_metadata: order.delivery_metadata || {}
    }));
    
  } catch (error) {
    console.error('[OrderModel] Error finding orders by user:', error);
    throw error;
  }
},

  /**
   * Get order count for a user
   * @param {string} userId - User UUID
   * @param {string} [status] - Optional status filter
   * @returns {Promise<number>} Order count
   */
  async countByUser(userId, status = null) {
    try {
      let query = supabase
        .from('Orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[OrderModel] Error counting orders:', error);
      throw error;
    }
  },

  /**
   * Get recent orders for a user
   * @param {string} userId - User UUID
   * @param {number} [limit=5] - Number of orders
   * @returns {Promise<Array>} Recent orders
   */
  async getRecentOrders(userId, limit = 5) {
    return await this.findByUser(userId, {
      limit,
      offset: 0,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  },

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update order status
   * @param {string} orderId - Order UUID
   * @param {string} status - New status (pending/confirmed/shipped/delivered/cancelled)
   * @returns {Promise<Object>} Updated order
   */
  async updateStatus(orderId, status) {
    try {
      const validStatuses = [
        'pending', 
        'confirmed', 
        'processing',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed',
        'rto_initiated',
        'rto_delivered',
        'cancelled'
      ];
      
      if (!validStatuses.includes(status)) {
        throw new Error('INVALID_STATUS');
      }

      const { data, error } = await supabase
        .from('Orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('ORDER_NOT_FOUND');
        }
        throw error;
      }

      console.log(`[OrderModel] Order ${orderId} status updated to: ${status}`);
      return data;
      
    } catch (error) {
      console.error('[OrderModel] Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Update payment status
   * @param {string} orderId - Order UUID
   * @param {string} paymentStatus - New payment status (unpaid/paid/refunded/failed)
   * @param {string} [paymentId] - Payment transaction ID
   * @returns {Promise<Object>} Updated order
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentId = null) {
    try {
      const validStatuses = ['unpaid', 'paid', 'refunded', 'failed'];
      
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error('INVALID_PAYMENT_STATUS');
      }

      const updateData = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      const { data, error } = await supabase
        .from('Orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('ORDER_NOT_FOUND');
        }
        throw error;
      }

      console.log(`[OrderModel] Order ${orderId} payment status: ${paymentStatus}`);
      return data;
      
    } catch (error) {
      console.error('[OrderModel] Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order UUID
   * @param {string} userId - User UUID (for authorization)
   * @returns {Promise<Object>} Updated order
   */
  async cancel(orderId, userId) {
    try {
      // Check if order belongs to user and can be cancelled
      const { data: order, error: fetchError } = await supabase
        .from('Orders')
        .select('status, payment_status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('ORDER_NOT_FOUND');
        }
        throw fetchError;
      }

      const { status, payment_status } = order;

      // Only allow cancellation for pending/confirmed orders
      if (!['pending', 'confirmed'].includes(status)) {
        throw new Error('ORDER_CANNOT_BE_CANCELLED');
      }

      // Update order status
      const updateData = {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };

      // If payment was completed, mark for refund
      if (payment_status === 'paid') {
        updateData.payment_status = 'refunded';
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('Orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log(`[OrderModel] Order cancelled: ${orderId}`);
      return updatedOrder;
      
    } catch (error) {
      console.error('[OrderModel] Error cancelling order:', error);
      throw error;
    }
  },

  // ==================== ORDER STATISTICS ====================

  /**
   * Get order statistics for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(userId) {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('status, final_total, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return {
          total_orders: 0,
          pending_orders: 0,
          confirmed_orders: 0,
          processing_orders: 0,
          picked_up_orders: 0,
          in_transit_orders: 0,
          out_for_delivery_orders: 0,
          delivered_orders: 0,
          failed_orders: 0,
          rto_initiated_orders: 0,
          rto_delivered_orders: 0,
          cancelled_orders: 0,
          total_spent: 0,
          avg_order_value: 0,
          last_order_date: null,
          recent_orders: []
        };
      }

      const stats = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        confirmed_orders: orders.filter(o => o.status === 'confirmed').length,
        processing_orders: orders.filter(o => o.status === 'processing').length,
        picked_up_orders: orders.filter(o => o.status === 'picked_up').length,
        in_transit_orders: orders.filter(o => o.status === 'in_transit').length,
        out_for_delivery_orders: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered_orders: orders.filter(o => o.status === 'delivered').length,
        failed_orders: orders.filter(o => o.status === 'failed').length,
        rto_initiated_orders: orders.filter(o => o.status === 'rto_initiated').length,
        rto_delivered_orders: orders.filter(o => o.status === 'rto_delivered').length,
        cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
        total_spent: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + parseFloat(o.final_total || 0), 0),
        avg_order_value: 0,
        last_order_date: orders.reduce((latest, o) => {
          const orderDate = new Date(o.created_at);
          return orderDate > latest ? orderDate : latest;
        }, new Date(0)),
        recent_orders: orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)
      };

      stats.pending = stats.pending_orders;
      stats.confirmed = stats.confirmed_orders;
      stats.shipped = stats.shipped_orders;
      stats.delivered = stats.delivered_orders;
      stats.cancelled = stats.cancelled_orders;

      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      if (deliveredOrders.length > 0) {
        stats.avg_order_value = Math.round(
          deliveredOrders.reduce((sum, o) => sum + parseFloat(o.final_total || 0), 0) / deliveredOrders.length
        );
      }

      return stats;
      
    } catch (error) {
      console.error('[OrderModel] Error getting statistics:', error);
      throw error;
    }
  },

  // ==================== ADMIN OPERATIONS ====================

  /**
   * Get all orders with filters (admin)
   * @param {Object} filters - Query filters
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.payment_status] - Filter by payment status
   * @param {number} [filters.limit=50] - Results per page
   * @param {number} [filters.offset=0] - Pagination offset
   * @returns {Promise<Array>} Array of orders
   */
  async findAll(filters = {}) {
    try {
      const {
        status = null,
        payment_status = null,
        limit = 50,
        offset = 0
      } = filters;

      // Build query
      let query = supabase
        .from('Orders')
        .select(`
          *,
          Users!inner(
            name,
            email
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      if (payment_status) {
        query = query.eq('payment_status', payment_status);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: orders, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get item counts for all orders
      const orderIds = orders.map(o => o.id);
      const { data: itemCounts, error: itemsError } = await supabase
        .from('Order_items')
        .select('order_id')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Count items per order
      const itemCountByOrder = {};
      (itemCounts || []).forEach(item => {
        itemCountByOrder[item.order_id] = (itemCountByOrder[item.order_id] || 0) + 1;
      });

      // Format results
      return orders.map(order => ({
        ...order,
        customer_name: order.Users.name,
        customer_email: order.Users.email,
        item_count: itemCountByOrder[order.id] || 0
      }));
      
    } catch (error) {
      console.error('[OrderModel] Error finding all orders:', error);
      throw error;
    }
  },

  /**
   * Get order items by order ID (bundles only)
   * @param {string} orderId - Order UUID
   * @returns {Promise<Array>} Order items with bundle details
   */
  async getOrderItems(orderId) {
    try {
      const { data: items, error } = await supabase
        .from('Order_items')
        .select(`
          *,
          Bundles!inner(
            id,
            title,
            description,
            img_url,
            price
          )
        `)
        .eq('order_id', orderId)
        .order('created_at');

      if (error) throw error;

      // Format items
      return (items || []).map(item => ({
        ...item,
        bundle_title: item.Bundles.title,
        bundle_description: item.Bundles.description,
        bundle_img: item.Bundles.img_url,
        bundle_price: item.Bundles.price
      }));
      
    } catch (error) {
      console.error('[OrderModel] Error getting order items:', error);
      throw error;
    }
  }
};

module.exports = OrderModel;