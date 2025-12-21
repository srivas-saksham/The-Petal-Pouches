// frontend/src/services/orderService.js - NO CHANGES NEEDED

/**
 * ✅ This file is COMPLETE and requires NO modifications for Razorpay integration
 * 
 * The payment flow is handled separately by:
 * - paymentService.js (creates payment orders, verifies payments)
 * - useRazorpay.js hook (manages Razorpay modal and flow)
 * - Checkout.jsx (initiates payment instead of direct order creation)
 * 
 * This service continues to handle:
 * - Order retrieval (getOrders, getOrderById, etc.)
 * - Order actions (cancelOrder, reorderItems)
 * - Order tracking (getOrderTracking)
 * - Order statistics and analytics
 * 
 * The createOrder() function is now only called by the backend after payment verification.
 * Frontend uses paymentService.createPaymentOrder() instead.
 */

import api, { apiRequest } from './api';

/**
 * ==================== ORDER CREATION ====================
 */

/**
 * Create new order from cart
 * ⚠️ NOTE: For online payments, use paymentService.createPaymentOrder() instead
 * This function is kept for COD orders (if enabled) or internal use
 * 
 * @param {Object} orderData - { address_id, payment_method, notes?, gift_wrap?, gift_message?, coupon_code? }
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
  return apiRequest(() => 
    api.post('/api/orders', orderData)
  );
};

/**
 * ==================== ORDER FETCHING ====================
 */

/**
 * Get all orders with filters and pagination
 * @param {Object} params - { page?, limit?, status?, payment_status?, from_date?, to_date? }
 */
export const getOrders = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', { params })
  );
};

/**
 * Get single order by ID
 * @param {string} orderId - Order UUID
 */
export const getOrderById = async (orderId) => {
  return apiRequest(() => 
    api.get(`/api/orders/${orderId}`)
  );
};

/**
 * Get order statistics for dashboard
 * Uses backend API if available, otherwise calculates from orders
 * @returns {Promise<Object>} Order stats
 */
export const getOrderStats = async () => {
  // Try backend API first
  try {
    const result = await apiRequest(() => 
      api.get('/api/orders/stats')
    );
    
    if (result.success && result.data) {
      return result;
    }
  } catch (error) {
    console.log('Backend stats API not available, calculating from orders...');
  }

  // Fallback: Calculate from all orders
  const result = await apiRequest(() => 
    api.get('/api/orders', { 
      params: { limit: 10000 }
    })
  );

  if (!result.success) {
    return {
      success: false,
      data: {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total_revenue: 0,
        avg_order_value: 0,
      },
    };
  }

  const orders = result.data.data || [];
  
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    total_revenue: orders
      .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.final_total || 0), 0),
    avg_order_value: orders.length > 0 
      ? Math.round(orders.reduce((sum, o) => sum + (o.final_total || 0), 0) / orders.length)
      : 0,
  };

  return {
    success: true,
    data: stats,
  };
};

/**
 * Get recent orders
 * @param {number} limit - Number of orders to fetch
 */
export const getRecentOrders = async (limit = 10) => {
  return apiRequest(() => 
    api.get('/api/orders', { 
      params: { 
        limit,
        sort: 'created_at_desc',
      } 
    })
  );
};

/**
 * Get orders by status
 * @param {string} status - Order status (pending, confirmed, processing, shipped, delivered, cancelled)
 * @param {Object} params - Additional params
 */
export const getOrdersByStatus = async (status, params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', { 
      params: { 
        status,
        ...params,
      } 
    })
  );
};

/**
 * Get orders by payment status
 * @param {string} paymentStatus - Payment status (paid, unpaid, refunded)
 * @param {Object} params - Additional params
 */
export const getOrdersByPaymentStatus = async (paymentStatus, params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', { 
      params: { 
        payment_status: paymentStatus,
        ...params,
      } 
    })
  );
};

/**
 * Get orders by customer
 * @param {string} userId - User ID
 * @param {Object} params - Additional params
 */
export const getOrdersByCustomer = async (userId, params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', { 
      params: { 
        user_id: userId,
        ...params,
      } 
    })
  );
};

/**
 * Search orders
 * @param {string} searchTerm - Search query
 * @param {Object} filters - Additional filters
 */
export const searchOrders = async (searchTerm, filters = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', {
      params: {
        search: searchTerm,
        ...filters,
      },
    })
  );
};

/**
 * Get orders by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} params - Additional params
 */
export const getOrdersByDateRange = async (startDate, endDate, params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', {
      params: {
        start_date: startDate,
        end_date: endDate,
        ...params,
      },
    })
  );
};

/**
 * Get today's orders
 */
export const getTodaysOrders = async () => {
  const today = new Date().toISOString().split('T')[0];
  return getOrdersByDateRange(today, today);
};

/**
 * Get pending orders
 */
export const getPendingOrders = async () => {
  return getOrdersByStatus('pending');
};

/**
 * Get orders needing action (pending + processing)
 */
export const getOrdersNeedingAction = async () => {
  const result = await getOrders();
  
  if (!result.success) {
    return result;
  }

  const orders = result.data.data || [];
  const needingAction = orders.filter(o => 
    o.status === 'pending' || o.status === 'processing'
  );

  return {
    success: true,
    data: {
      data: needingAction,
      count: needingAction.length,
    },
  };
};

/**
 * ==================== ORDER ACTIONS ====================
 */

/**
 * Cancel an order
 * @param {string} orderId - Order UUID
 * @param {string} reason - Cancellation reason
 */
export const cancelOrder = async (orderId, reason = '') => {
  return apiRequest(() => 
    api.post(`/api/orders/${orderId}/cancel`, { reason })
  );
};

/**
 * Reorder - Add items from previous order to cart
 * @param {string} orderId - Order UUID
 */
export const reorderItems = async (orderId) => {
  return apiRequest(() => 
    api.post(`/api/orders/${orderId}/reorder`)
  );
};

/**
 * ==================== ORDER TRACKING ====================
 */

/**
 * Get order tracking information with live updates
 * @param {string} orderId - Order UUID
 * @param {boolean} forceSync - Force sync with Delhivery (optional)
 */
export const getOrderTracking = async (orderId, forceSync = false) => {
  try {
    const response = await api.get(`/api/orders/${orderId}/tracking`, {
      params: { sync: forceSync }
    });
    
    return {
      success: true,
      data: response.data.tracking
    };
  } catch (error) {
    console.error('❌ Get tracking error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch tracking information'
    };
  }
};

/**
 * Refresh tracking data (force sync with courier)
 * @param {string} orderId - Order UUID
 */
export const refreshTracking = async (orderId) => {
  return getOrderTracking(orderId, true);
};

/**
 * ==================== ADMIN FUNCTIONS ====================
 */

/**
 * Update order status (Admin only)
 * @param {string} orderId - Order UUID
 * @param {string} status - New status
 */
export const updateOrderStatus = async (orderId, status) => {
  return apiRequest(() => 
    api.patch(`/api/orders/${orderId}/status`, { status })
  );
};

/**
 * Update payment status (Admin only)
 * @param {string} orderId - Order UUID
 * @param {string} paymentStatus - New payment status
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  return apiRequest(() => 
    api.patch(`/api/orders/${orderId}/payment-status`, { payment_status: paymentStatus })
  );
};

/**
 * ==================== ANALYTICS & REPORTING ====================
 */

/**
 * Calculate revenue by period
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export const getRevenuByPeriod = async (startDate, endDate) => {
  const result = await getOrdersByDateRange(startDate, endDate);
  
  if (!result.success) {
    return {
      success: false,
      data: {
        total_revenue: 0,
        order_count: 0,
        avg_order_value: 0,
      },
    };
  }

  const orders = result.data.data || [];
  const paidOrders = orders.filter(o => 
    o.payment_status === 'paid' && o.status !== 'cancelled'
  );

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.final_total || 0), 0);

  return {
    success: true,
    data: {
      total_revenue: totalRevenue,
      order_count: paidOrders.length,
      avg_order_value: paidOrders.length > 0 
        ? Math.round(totalRevenue / paidOrders.length) 
        : 0,
    },
  };
};

/**
 * Get top customers by order value
 * @param {number} limit - Number of customers to return
 */
export const getTopCustomers = async (limit = 10) => {
  const result = await getOrders({ limit: 10000 });
  
  if (!result.success) {
    return result;
  }

  const orders = result.data.data || [];
  const customerMap = {};

  orders
    .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
    .forEach(order => {
      const userId = order.user_id;
      if (!customerMap[userId]) {
        customerMap[userId] = {
          user_id: userId,
          customer_name: order.customer_name || 'Unknown',
          customer_email: order.customer_email || '',
          total_spent: 0,
          order_count: 0,
        };
      }
      customerMap[userId].total_spent += order.final_total || 0;
      customerMap[userId].order_count += 1;
    });

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, limit);

  return {
    success: true,
    data: {
      data: topCustomers,
      count: topCustomers.length,
    },
  };
};

/**
 * ==================== BULK OPERATIONS ====================
 */

/**
 * Bulk update order status
 * @param {Array<string>} orderIds - Array of order IDs
 * @param {string} status - New status
 */
export const bulkUpdateOrderStatus = async (orderIds, status) => {
  const results = await Promise.all(
    orderIds.map(id => updateOrderStatus(id, status))
  );
  
  return {
    success: results.every(r => r.success),
    data: results,
    updated: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  };
};

/**
 * ==================== EXPORT ====================
 */

/**
 * Export orders to CSV format
 * @param {Object} filters - Filter parameters
 */
export const exportOrdersToCSV = async (filters = {}) => {
  const result = await getOrders({ ...filters, limit: 10000 });
  
  if (!result.success) {
    return result;
  }

  const orders = result.data.data || [];
  
  return {
    success: true,
    data: orders.map(order => ({
      'Order ID': order.id,
      'Date': new Date(order.created_at).toLocaleString(),
      'Customer': order.customer_name || '',
      'Email': order.customer_email || '',
      'Phone': order.customer_phone || '',
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Subtotal': order.subtotal || 0,
      'Shipping': order.shipping_cost || 0,
      'Total': order.final_total || 0,
      'Items': order.order_items?.length || 0,
    })),
  };
};

/**
 * ==================== DEFAULT EXPORT ====================
 * Export all functions as default object for flexibility
 */
export default {
  // Creation
  createOrder,
  
  // Fetching
  getOrders,
  getOrderById,
  getOrderStats,
  getRecentOrders,
  getOrdersByStatus,
  getOrdersByPaymentStatus,
  getOrdersByCustomer,
  searchOrders,
  getOrdersByDateRange,
  getTodaysOrders,
  getPendingOrders,
  getOrdersNeedingAction,
  
  // Actions
  cancelOrder,
  reorderItems,
  
  // Tracking
  getOrderTracking,
  refreshTracking,
  
  // Admin
  updateOrderStatus,
  updatePaymentStatus,
  
  // Analytics
  getRevenuByPeriod,
  getTopCustomers,
  
  // Bulk Operations
  bulkUpdateOrderStatus,
  
  // Export
  exportOrdersToCSV,
};