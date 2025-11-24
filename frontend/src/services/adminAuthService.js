// frontend/src/services/adminAuthService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add token to request headers
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle token expiration
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Try to refresh token
      const refreshResult = await refreshAdminToken();
      if (refreshResult.success) {
        // Retry original request
        return api.request(error.config);
      } else {
        // Redirect to login
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Admin Registration
 */
export const registerAdmin = async (adminData) => {
  try {
    const response = await api.post('/api/admin/auth/register', adminData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    };
  }
};

/**
 * Admin Login
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/api/admin/auth/login', {
      email,
      password
    });

    // Store token
    localStorage.setItem('admin_token', response.data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(response.data.data.admin));

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    };
  }
};

/**
 * Get Current Admin
 */
export const getCurrentAdmin = async () => {
  try {
    const response = await api.get('/api/admin/auth/me');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch admin'
    };
  }
};

/**
 * Refresh Token
 */
export const refreshAdminToken = async () => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await api.post('/api/admin/auth/refresh', { token });

    localStorage.setItem('admin_token', response.data.data.token);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Token refresh failed'
    };
  }
};

/**
 * Admin Logout
 */
export const logoutAdmin = async () => {
  try {
    await api.post('/api/admin/auth/logout');
    
    // Clear storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    return {
      success: true
    };
  } catch (error) {
    // Even if logout fails on backend, clear local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');

    return {
      success: true // Consider it success for UX
    };
  }
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('admin_token');
};

/**
 * Get stored admin data
 */
export const getStoredAdminData = () => {
  const data = localStorage.getItem('admin_user');
  return data ? JSON.parse(data) : null;
};

export default {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  refreshAdminToken,
  logoutAdmin,
  isAdminAuthenticated,
  getStoredAdminData
};