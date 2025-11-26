// backend/src/models/orderModel.js

const pool = require('../config/database');

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
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
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
      const orderQuery = `
        INSERT INTO orders (
          id, user_id, status, subtotal, shipping_cost, final_total,
          shipping_address, payment_status, payment_id, created_at, placed_at,
          custom_bundle_id, bundle_type
        )
        VALUES (
          gen_random_uuid(), $1, 'pending', $2, $3, $4,
          $5, 'unpaid', $6, now(), now(),
          $7, $8
        )
        RETURNING *
      `;
      
      const orderValues = [
        user_id,
        subtotal,
        shipping_cost,
        final_total,
        JSON.stringify(shipping_address),
        payment_id,
        custom_bundle_id,
        bundle_type
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Insert order items
      const itemsQuery = `
        INSERT INTO order_items (
          id, order_id, product_variant_id, quantity, price, 
          bundle_origin, bundle_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        RETURNING *
      `;

      const orderItems = [];
      for (const item of items) {
        const itemValues = [
          null, // Let database generate UUID
          order.id,
          item.product_variant_id,
          item.quantity,
          item.price,
          item.bundle_origin || null,
          item.bundle_id || null
        ];
        
        const itemResult = await client.query(
          itemsQuery.replace('$1', 'gen_random_uuid()'),
          itemValues.slice(1)
        );
        orderItems.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');
      
      console.log(`[OrderModel] Order created: ${order.id} for user: ${user_id}`);
      
      return {
        ...order,
        items: orderItems
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[OrderModel] Error creating order:', error);
      throw error;
    } finally {
      client.release();
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
    const query = `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_variant_id', oi.product_variant_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'bundle_origin', oi.bundle_origin,
            'bundle_id', oi.bundle_id,
            'product_title', p.title,
            'product_img', p.img_url,
            'variant_sku', pv.sku,
            'variant_attributes', pv.attributes,
            'variant_img', pv.img_url
          )
        ) as items
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE o.id = $1
        ${userId ? 'AND o.user_id = $2' : ''}
      GROUP BY o.id
    `;
    
    const values = userId ? [orderId, userId] : [orderId];
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
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
    const {
      limit = 20,
      offset = 0,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const validSortFields = ['created_at', 'placed_at', 'final_total', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        o.id,
        o.status,
        o.subtotal,
        o.shipping_cost,
        o.final_total,
        o.payment_status,
        o.created_at,
        o.placed_at,
        o.bundle_type,
        COUNT(oi.id) as item_count,
        json_agg(
          json_build_object(
            'product_title', p.title,
            'product_img', COALESCE(pv.img_url, p.img_url),
            'quantity', oi.quantity
          )
        ) as items_preview
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE o.user_id = $1
        ${status ? 'AND o.status = $4' : ''}
      GROUP BY o.id
      ORDER BY o.${sortField} ${sortDir}
      LIMIT $2 OFFSET $3
    `;
    
    const values = status 
      ? [userId, limit, offset, status]
      : [userId, limit, offset];
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Get order count for a user
   * @param {string} userId - User UUID
   * @param {string} [status] - Optional status filter
   * @returns {Promise<number>} Order count
   */
  async countByUser(userId, status = null) {
    const query = `
      SELECT COUNT(*) as count
      FROM orders
      WHERE user_id = $1
        ${status ? 'AND status = $2' : ''}
    `;
    
    const values = status ? [userId, status] : [userId];
    const result = await pool.query(query, values);
    
    return parseInt(result.rows[0].count);
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
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('INVALID_STATUS');
    }

    const query = `
      UPDATE orders
      SET 
        status = $1,
        updated_at = now()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, orderId]);
    
    if (result.rows.length === 0) {
      throw new Error('ORDER_NOT_FOUND');
    }
    
    console.log(`[OrderModel] Order ${orderId} status updated to: ${status}`);
    return result.rows[0];
  },

  /**
   * Update payment status
   * @param {string} orderId - Order UUID
   * @param {string} paymentStatus - New payment status (unpaid/paid/refunded/failed)
   * @param {string} [paymentId] - Payment transaction ID
   * @returns {Promise<Object>} Updated order
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentId = null) {
    const validStatuses = ['unpaid', 'paid', 'refunded', 'failed'];
    
    if (!validStatuses.includes(paymentStatus)) {
      throw new Error('INVALID_PAYMENT_STATUS');
    }

    const query = `
      UPDATE orders
      SET 
        payment_status = $1,
        payment_id = COALESCE($2, payment_id),
        updated_at = now()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [paymentStatus, paymentId, orderId]);
    
    if (result.rows.length === 0) {
      throw new Error('ORDER_NOT_FOUND');
    }
    
    console.log(`[OrderModel] Order ${orderId} payment status: ${paymentStatus}`);
    return result.rows[0];
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order UUID
   * @param {string} userId - User UUID (for authorization)
   * @returns {Promise<Object>} Updated order
   */
  async cancel(orderId, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if order belongs to user and can be cancelled
      const checkQuery = `
        SELECT status, payment_status
        FROM orders
        WHERE id = $1 AND user_id = $2
      `;
      
      const checkResult = await client.query(checkQuery, [orderId, userId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const { status, payment_status } = checkResult.rows[0];

      // Only allow cancellation for pending/confirmed orders
      if (!['pending', 'confirmed'].includes(status)) {
        throw new Error('ORDER_CANNOT_BE_CANCELLED');
      }

      // Update order status
      const updateQuery = `
        UPDATE orders
        SET 
          status = 'cancelled',
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [orderId]);

      // If payment was completed, mark for refund
      if (payment_status === 'paid') {
        await client.query(
          `UPDATE orders SET payment_status = 'refunded' WHERE id = $1`,
          [orderId]
        );
      }

      await client.query('COMMIT');
      
      console.log(`[OrderModel] Order cancelled: ${orderId}`);
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[OrderModel] Error cancelling order:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // ==================== ORDER STATISTICS ====================

  /**
   * Get order statistics for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN final_total ELSE 0 END), 0)::int as total_spent,
        COALESCE(AVG(CASE WHEN status = 'delivered' THEN final_total END), 0)::int as avg_order_value,
        MAX(created_at) as last_order_date
      FROM orders
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
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
    const {
      status = null,
      payment_status = null,
      limit = 50,
      offset = 0
    } = filters;

    let whereClause = [];
    let values = [];
    let paramCounter = 1;

    if (status) {
      whereClause.push(`o.status = $${paramCounter}`);
      values.push(status);
      paramCounter++;
    }

    if (payment_status) {
      whereClause.push(`o.payment_status = $${paramCounter}`);
      values.push(payment_status);
      paramCounter++;
    }

    const whereString = whereClause.length > 0 
      ? `WHERE ${whereClause.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        COUNT(oi.id) as item_count
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereString}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    values.push(limit, offset);
    const result = await pool.query(query, values);
    
    return result.rows;
  },

  /**
   * Get order items by order ID
   * @param {string} orderId - Order UUID
   * @returns {Promise<Array>} Order items with product details
   */
  async getOrderItems(orderId) {
    const query = `
      SELECT 
        oi.*,
        p.title as product_title,
        p.img_url as product_img,
        pv.sku as variant_sku,
        pv.attributes as variant_attributes,
        pv.img_url as variant_img
      FROM order_items oi
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at
    `;
    
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }
};

module.exports = OrderModel;