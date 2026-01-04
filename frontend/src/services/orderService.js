// frontend/src/services/orderService.js - FIXED WITH SEPARATE CUSTOMER & ADMIN FUNCTIONS

/**
 * Order Service
 * Handles all order-related API operations
 * 
 * IMPORTANT: 
 * - getOrderStats() = CUSTOMER endpoint (user's own orders)
 * - getAdminOrderStats() = ADMIN endpoint (all orders)
 */

import api, { apiRequest } from './api';
import adminApi from './adminApi';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * ==================== ORDER CREATION ====================
 */

/**
 * Create new order from cart
 * ⚠️ NOTE: For online payments, use paymentService.createPaymentOrder() instead
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
 * Get order statistics for CUSTOMER (user's own orders only)
 * ✅ CUSTOMER ENDPOINT: /api/orders/stats
 * @returns {Promise<Object>} Customer's order stats
 */
export const getOrderStats = async () => {
  try {
    const response = await api.get('/api/orders/stats');
    
    console.log('📊 [Customer] Raw API response:', response.data);
    
    // Backend returns: { success: true, stats: {...} }
    if (response.data?.success && response.data?.stats) {
      return {
        success: true,
        stats: response.data.stats
      };
    }
    
    // Fallback if format is different
    if (response.data?.data) {
      return {
        success: true,
        stats: response.data.data
      };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ [Customer] Backend stats API error:', error);
    
    // Fallback: Calculate from user's orders
    try {
      const result = await apiRequest(() => 
        api.get('/api/orders', { params: { limit: 10000 } })
      );

      if (!result.success) {
        return {
          success: false,
          stats: {
            total_orders: 0,
            pending: 0,
            confirmed: 0,
            processing: 0,
            in_transit: 0,
            out_for_delivery: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            total_spent: 0,
            avg_order_value: 0,
            recent_orders: []
          }
        };
      }

      const orders = result.data.data || result.data || [];
      
      const stats = {
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        processing: orders.filter(o => o.status === 'processing').length,
        in_transit: orders.filter(o => o.status === 'in_transit').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        total_spent: orders
          .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.final_total || 0), 0),
        avg_order_value: orders.length > 0 
          ? Math.round(orders.reduce((sum, o) => sum + (o.final_total || 0), 0) / orders.length)
          : 0,
        recent_orders: orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      };

      return {
        success: true,
        stats
      };
    } catch (fallbackError) {
      console.error('❌ [Customer] Fallback calculation failed:', fallbackError);
      return {
        success: false,
        stats: {
          total_orders: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          in_transit: 0,
          out_for_delivery: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          total_spent: 0,
          avg_order_value: 0,
          recent_orders: []
        }
      };
    }
  }
};

/**
 * Get order statistics for ADMIN (all orders across all users)
 * ✅ ADMIN ENDPOINT: /api/admin/orders/stats
 * @returns {Promise<Object>} Complete order stats for all orders
 */
export const getAdminOrderStats = async () => {
  try {
    console.log('📊 [Admin] Fetching admin order stats from /api/admin/orders/stats');
    
    const response = await adminApi.get('/api/admin/orders/stats');
    
    console.log('📊 [Admin] Admin stats received:', {
      success: response.data.success,
      hasStats: !!response.data.stats,
      total_orders: response.data.stats?.total_orders
    });

    return {
      success: true,
      stats: response.data.stats || {}
    };
    
  } catch (error) {
    console.error('❌ [Admin] Error fetching admin stats:', error);
    
    // Fallback: Calculate from all orders
    try {
      console.log('⚠️ [Admin] Using fallback: fetching all orders...');
      const fallbackResponse = await adminApi.get('/api/admin/orders', {
        params: { limit: 10000 }
      });

      const orders = fallbackResponse.data.data || [];
      console.log(`📊 [Admin] Fallback: Found ${orders.length} orders`);

      const stats = {
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        processing: orders.filter(o => o.status === 'processing').length,
        in_transit: orders.filter(o => o.status === 'in_transit').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        failed: orders.filter(o => o.status === 'failed').length,
        rto_initiated: orders.filter(o => o.status === 'rto_initiated').length,
        rto_delivered: orders.filter(o => o.status === 'rto_delivered').length,
        paid: orders.filter(o => o.payment_status === 'paid').length,
        unpaid: orders.filter(o => o.payment_status === 'unpaid').length,
        refunded: orders.filter(o => o.payment_status === 'refunded').length,
        cod: orders.filter(o => o.payment_method === 'cod').length,
        online: orders.filter(o => o.payment_method === 'online' || o.payment_method === 'razorpay').length,
        total_spent: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0),
        avg_order_value: orders.length > 0 
          ? Math.round(orders.reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0) / orders.length)
          : 0
      };

      return {
        success: true,
        stats
      };
    } catch (fallbackError) {
      console.error('❌ [Admin] Fallback failed:', fallbackError);
      return {
        success: false,
        stats: {
          total_orders: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          in_transit: 0,
          out_for_delivery: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          failed: 0,
          rto_initiated: 0,
          rto_delivered: 0,
          paid: 0,
          unpaid: 0,
          refunded: 0,
          cod: 0,
          online: 0,
          surface: 0,
          express: 0,
          total_spent: 0,
          avg_order_value: 0
        }
      };
    }
  }
};

/**
 * Get all admin orders
 * @param {Object} params - Query params
 */
export const getAdminOrders = async (params = {}) => {
  try {
    const response = await adminApi.get('/api/admin/orders', { params });
    
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

/**
 * Get recent admin orders (for dashboard)
 * @param {number} limit - Number of orders
 */
export const getRecentAdminOrders = async (limit = 10) => {
  try {
    const response = await adminApi.get('/api/admin/orders', {
      params: {
        limit,
        sort: 'created_at',
        order: 'desc'
      }
    });
    
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
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
 * @param {string} status - Order status
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
 * @param {string} paymentStatus - Payment status
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
 */
export default {
  // Creation
  createOrder,
  
  // Fetching
  getOrders,
  getOrderById,
  getOrderStats,           // ✅ CUSTOMER stats (user's orders)
  getAdminOrderStats,      // ✅ ADMIN stats (all orders)
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