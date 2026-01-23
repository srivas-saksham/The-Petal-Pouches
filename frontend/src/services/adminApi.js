// frontend/src/services/adminApi.js
import axios from 'axios';
import { getGatewayHeaders } from '../utils/gatewayAuth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ✅ Dedicated Admin API Instance
const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// ✅ Always attach admin token AND gateway headers
adminApi.interceptors.request.use(
  (config) => {
    // 🔒 GATEWAY: Add gateway headers to every request (if gateway is enabled)
    const gatewayHeaders = getGatewayHeaders();
    Object.assign(config.headers, gatewayHeaders);
    
    // ✅ Add admin token from sessionStorage
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Admin token not found in sessionStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Admin authentication failed - token may be expired');
      // Optionally redirect to admin login
      // window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;