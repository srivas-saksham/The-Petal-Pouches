// frontend/src/services/adminCustomerService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ✅ Create separate admin API instance
const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ✅ UNCOMMENTED: Attach admin token to every request
adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminCustomerService = {
  async getAllCustomers(params = {}) {
    try {
      const response = await adminApi.get('/api/admin/customers', { params }); // ✅ Use adminApi
      return {
        success: true,
        data: response.data.data,
        metadata: response.data.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customers'
      };
    }
  },

  async getCustomerById(customerId) {
    try {
      const response = await adminApi.get(`/api/admin/customers/${customerId}`); // ✅ Use adminApi
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer'
      };
    }
  },

  async getCustomerStats() {
    try {
      const response = await adminApi.get('/api/admin/customers/stats'); // ✅ Use adminApi
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  },

  async toggleCustomerStatus(customerId) {
    try {
      const response = await adminApi.put(`/api/admin/customers/${customerId}/status`); // ✅ Use adminApi
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update status'
      };
    }
  }
};

export default adminCustomerService;