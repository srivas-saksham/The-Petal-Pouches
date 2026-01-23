// frontend/src/services/api.js - COMPLETE WITH ORDER ENDPOINTS
// ⭐ FIXED: Proper token handling for both customer and admin

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ⭐ FIX: Check request URL instead of window.location
    const requestUrl = config.url || '';
    const isAdminRequest = requestUrl.includes('/admin/') || requestUrl.includes('/api/admin');
    
    // Get tokens from correct storage
    const customerToken = localStorage.getItem('customer_token');
    const adminToken = sessionStorage.getItem('admin_token');
    
    // ⭐ FIX: Choose token based on REQUEST URL, not browser URL
    let token = null;
    if (isAdminRequest && adminToken) {
      // Admin request with admin token available
      token = adminToken;
    } else if (customerToken) {
      // Customer request or fallback to customer token
      token = customerToken;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // ⭐ Check if this is a coupon validation error
      const isCouponError = error.config?.url?.includes('/api/coupons/validate');
      
      switch (status) {
        case 401:
          console.error('Unauthorized access');
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        case 400:
          // ⭐ Don't log coupon validation errors - they're expected
          if (!isCouponError) {
            console.error('API Error:', data?.message || 'Bad request');
          }
          break;
        default:
          console.error('API Error:', data?.message || 'Unknown error');
      }
      
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        data: data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response received');
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// Helper function to handle file uploads
export const createFormDataRequest = (data, fileField = 'image') => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === fileField && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

/**
 * API request wrapper with error handling
 * 
 * This wrapper handles both response formats:
 * 1. Backend responses that already have {success, data, message} structure
 * 2. Raw responses that need to be wrapped
 * 
 * @param {Function} requestFn - The axios request function to execute
 * @returns {Promise<Object>} Normalized response with {success, data, message, status}
 */
export const apiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    
    // Check if backend already returned a structured response
    const backendResponse = response.data;
    
    // If backend response has a 'success' field, it's already structured
    if (backendResponse && typeof backendResponse.success === 'boolean') {
      // Backend already returns {success, data, message}
      // Pass it through directly with status added
      return {
        success: backendResponse.success,
        data: backendResponse.data || backendResponse,
        message: backendResponse.message,
        status: response.status,
      };
    }
    
    // Otherwise, wrap the raw response
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('❌ API Request Error:', error);
    
    return {
      success: false,
      error: error.message || 'Request failed',
      message: error.message || 'Request failed',
      status: error.status || 0,
      data: null,
    };
  }
};

// ==================== ORDER API ENDPOINTS ====================

/**
 * Order Management API
 * All order-related endpoints
 */
export const orderAPI = {
  /**
   * Create new order from cart
   * @param {Object} orderData - { address_id, payment_method, notes?, gift_wrap?, gift_message?, coupon_code? }
   * @returns {Promise<Object>} Created order data
   */
  createOrder: async (orderData) => {
    return apiRequest(() => api.post('/api/orders', orderData));
  },

  /**
   * Get all orders for logged-in user
   * @param {Object} params - { page?, limit?, status?, payment_status?, from_date?, to_date? }
   * @returns {Promise<Object>} Orders list with pagination
   */
  getOrders: async (params = {}) => {
    return apiRequest(() => api.get('/api/orders', { params }));
  },

  /**
   * Get single order details by ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderById: async (orderId) => {
    return apiRequest(() => api.get(`/api/orders/${orderId}`));
  },

  /**
   * Get order statistics for user
   * @returns {Promise<Object>} Order stats (total orders, total spent, etc.)
   */
  getOrderStats: async () => {
    return apiRequest(() => api.get('/api/orders/stats'));
  },

  /**
   * Get order tracking information
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Tracking information
   */
  getOrderTracking: async (orderId) => {
    return apiRequest(() => api.get(`/api/orders/${orderId}/tracking`));
  },

  /**
   * Cancel an order
   * @param {string|number} orderId - Order ID
   * @param {Object} data - { reason? }
   * @returns {Promise<Object>} Cancellation confirmation
   */
  cancelOrder: async (orderId, data = {}) => {
    return apiRequest(() => api.post(`/api/orders/${orderId}/cancel`, data));
  },

  /**
   * Reorder - Add all items from previous order to cart
   * @param {string|number} orderId - Order ID to reorder
   * @returns {Promise<Object>} Cart update confirmation
   */
  reorderItems: async (orderId) => {
    return apiRequest(() => api.post(`/api/orders/${orderId}/reorder`));
  },
};

// ==================== EXPORT ====================

export default api;