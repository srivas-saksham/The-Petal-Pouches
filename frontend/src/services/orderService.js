// frontend/src/services/orderService.js

import api, { apiRequest } from './api';

/**
 * Get all orders with filters and pagination
 */
export const getOrders = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/orders', { params })
  );
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId) => {
  return apiRequest(() => 
    api.get(`/api/orders/${orderId}`)
  );
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  return apiRequest(() => 
    api.patch(`/api/orders/${orderId}/status`, { status })
  );
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  return apiRequest(() => 
    api.patch(`/api/orders/${orderId}/payment-status`, { payment_status: paymentStatus })
  );
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason = '') => {
  return apiRequest(() => 
    api.post(`/api/orders/${orderId}/cancel`, { reason })
  );
};

/**
 * Get order statistics
 */
export const getOrderStats = async () => {
  const result = await apiRequest(() => 
    api.get('/api/orders', { 
      params: { limit: 10000 } // Get all for stats calculation
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
 * Calculate revenue by period
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
 * Export orders to CSV format
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
 * Bulk update order status
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

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
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
  getRevenuByPeriod,
  getTopCustomers,
  exportOrdersToCSV,
  bulkUpdateOrderStatus,
};