// frontend/src/services/adminCustomerService.js
import adminApi from './adminApi'; // ✅ Use the centralized adminApi instance

/**
 * Admin Customer Service
 * Uses the shared adminApi instance which includes:
 * - Admin token from sessionStorage
 * - Proper error handling
 */
export const adminCustomerService = {
  /**
   * Get all customers with optional filters
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   * @returns {Promise<Object>} { success, data, metadata, error }
   */
  async getAllCustomers(params = {}) {
    try {
      const response = await adminApi.get('/api/admin/customers', { params });
      return {
        success: true,
        data: response.data.data,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('❌ Get all customers error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customers'
      };
    }
  },

  /**
   * Get single customer by ID
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Object>} { success, data, error }
   */
  async getCustomerById(customerId) {
    try {
      const response = await adminApi.get(`/api/admin/customers/${customerId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Get customer by ID error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer'
      };
    }
  },

  /**
   * Get customer statistics
   * @returns {Promise<Object>} { success, data, error }
   */
  async getCustomerStats() {
    try {
      const response = await adminApi.get('/api/admin/customers/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Get customer stats error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  },

  /**
   * Toggle customer active status
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Object>} { success, data, message, error }
   */
  async toggleCustomerStatus(customerId) {
    try {
      const response = await adminApi.put(`/api/admin/customers/${customerId}/status`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Toggle customer status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update status'
      };
    }
  }
};

export default adminCustomerService;