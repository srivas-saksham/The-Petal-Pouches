// backend/src/models/orderModel.js

const supabase = require('../config/supabaseClient');

/**
 * Order Model - Handles all order-related database operations
 * Manages order creation, status updates, and order retrieval with items
 */
const OrderModel = {

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new order with items (transaction)
   * @param {Object} orderData - Order information
   * @param {string} orderData.user_id - Customer UUID
   * @param {number} orderData.subtotal - Items total before shipping/discount
   * @param {number} orderData.shipping_cost - Delivery charge
   * @param {number} orderData.final_total - Final payable amount
   * @param {Object} orderData.shipping_address - Delivery address (JSONB)
   * @param {string} [orderData.payment_id] - Payment transaction ID
   * @param {string} [orderData.bundle_type='single'] - Order type
   * @param {string} [orderData.custom_bundle_id] - Custom bundle reference
   * @param {Array} items - Order items array
   * @param {string} items[].product_variant_id - Variant UUID
   * @param {number} items[].quantity - Item quantity
   * @param {number} items[].price - Price at order time
   * @param {string} [items[].bundle_origin] - Bundle origin type
   * @param {string} [items[].bundle_id] - Bundle reference ID
   * @returns {Promise<Object>} Created order with items
   */
  async create(orderData, items) {
    try {
      const {
        user_id,
        subtotal,
        shipping_cost,
        final_total,
        shipping_address,
        payment_id = null,
        bundle_type = 'single',
        custom_bundle_id = null
      } = orderData;

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('Orders')
        .insert([{
          user_id,
          status: 'pending',
          subtotal,
          shipping_cost,
          final_total,
          shipping_address,
          payment_status: 'unpaid',
          payment_id,
          custom_bundle_id,
          bundle_type,
          created_at: new Date().toISOString(),
          placed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.price,
        bundle_origin: item.bundle_origin || null,
        bundle_id: item.bundle_id || null,
        created_at: new Date().toISOString()
      }));

      const { data: orderItems, error: itemsError } = await supabase
        .from('Order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) throw itemsError;

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
   * Get order by ID with full details
   * @param {string} orderId - Order UUID
   * @param {string} [userId] - Optional user ID for authorization
   * @returns {Promise<Object|null>} Order with items and product details
   */
  async findById(orderId, userId = null) {
    try {
      // Build query with user filter if provided
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

      // Get order items with product details
      const { data: orderItems, error: itemsError } = await supabase
        .from('Order_items')
        .select(`
          *,
          Product_variants!inner(
            id,
            sku,
            attributes,
            img_url,
            Products!inner(
              title,
              img_url
            )
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Format items
      const items = (orderItems || []).map(item => ({
        id: item.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.price,
        bundle_origin: item.bundle_origin,
        bundle_id: item.bundle_id,
        product_title: item.Product_variants.Products.title,
        product_img: item.Product_variants.Products.img_url,
        variant_sku: item.Product_variants.sku,
        variant_attributes: item.Product_variants.attributes,
        variant_img: item.Product_variants.img_url
      }));

      return {
        ...order,
        items
      };
      
    } catch (error) {
      console.error('[OrderModel] Error finding order by ID:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a user with pagination
   * @param {string} userId - User UUID
   * @param {Object} options - Query options
   * @param {number} [options.limit=20] - Results per page
   * @param {number} [options.offset=0] - Pagination offset
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.sortBy='created_at'] - Sort field
   * @param {string} [options.sortOrder='DESC'] - Sort direction
   * @returns {Promise<Array>} Array of orders
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

      // Build orders query
      let ordersQuery = supabase
        .from('Orders')
        .select('id, status, subtotal, shipping_cost, final_total, payment_status, created_at, placed_at, bundle_type')
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

      // Get order items for all orders
      const orderIds = orders.map(o => o.id);
      const { data: allItems, error: itemsError } = await supabase
        .from('Order_items')
        .select(`
          order_id,
          quantity,
          Product_variants!inner(
            img_url,
            Products!inner(
              title,
              img_url
            )
          )
        `)
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Group items by order_id and format results
      const itemsByOrder = {};
      (allItems || []).forEach(item => {
        if (!itemsByOrder[item.order_id]) {
          itemsByOrder[item.order_id] = [];
        }
        itemsByOrder[item.order_id].push({
          product_title: item.Product_variants.Products.title,
          product_img: item.Product_variants.img_url || item.Product_variants.Products.img_url,
          quantity: item.quantity
        });
      });

      // Combine orders with their items
      return orders.map(order => ({
        ...order,
        item_count: itemsByOrder[order.id] ? itemsByOrder[order.id].length : 0,
        items_preview: itemsByOrder[order.id] || []
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
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      
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
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_spent: 0,
          avg_order_value: 0,
          last_order_date: null
        };
      }

      // Calculate statistics
      const stats = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        confirmed_orders: orders.filter(o => o.status === 'confirmed').length,
        shipped_orders: orders.filter(o => o.status === 'shipped').length,
        delivered_orders: orders.filter(o => o.status === 'delivered').length,
        cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
        total_spent: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.final_total, 0),
        avg_order_value: 0,
        last_order_date: orders.reduce((latest, o) => {
          const orderDate = new Date(o.created_at);
          return orderDate > latest ? orderDate : latest;
        }, new Date(0))
      };

      // Calculate average order value for delivered orders
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      if (deliveredOrders.length > 0) {
        stats.avg_order_value = Math.round(
          deliveredOrders.reduce((sum, o) => sum + o.final_total, 0) / deliveredOrders.length
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
   * Get order items by order ID
   * @param {string} orderId - Order UUID
   * @returns {Promise<Array>} Order items with product details
   */
  async getOrderItems(orderId) {
    try {
      const { data: items, error } = await supabase
        .from('Order_items')
        .select(`
          *,
          Product_variants!inner(
            sku,
            attributes,
            img_url,
            Products!inner(
              title,
              img_url
            )
          )
        `)
        .eq('order_id', orderId)
        .order('created_at');

      if (error) throw error;

      // Format items
      return (items || []).map(item => ({
        ...item,
        product_title: item.Product_variants.Products.title,
        product_img: item.Product_variants.Products.img_url,
        variant_sku: item.Product_variants.sku,
        variant_attributes: item.Product_variants.attributes,
        variant_img: item.Product_variants.img_url
      }));
      
    } catch (error) {
      console.error('[OrderModel] Error getting order items:', error);
      throw error;
    }
  }
};

module.exports = OrderModel;