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
  const token = sessionStorage.getItem('admin_token'); // ✅ Changed to sessionStorage
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
      // Clear session and redirect to re-auth
      sessionStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
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
 * Admin Login (Fresh Login)
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/api/admin/auth/login', {
      email,
      password
    });

    // ✅ Store token in sessionStorage (cleared on browser close)
    sessionStorage.setItem('admin_token', response.data.data.token);
    
    // ✅ Store admin info in localStorage (persists for "Welcome back" message)
    localStorage.setItem('admin_name', response.data.data.admin.name);
    localStorage.setItem('admin_email', response.data.data.admin.email);
    localStorage.setItem('admin_id', response.data.data.admin._id);

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
 * ✅ NEW: Admin Re-authentication (Password Verification)
 */
export const verifyAdminPassword = async (password) => {
  try {
    const adminEmail = localStorage.getItem('admin_email');
    
    if (!adminEmail) {
      return {
        success: false,
        error: 'No admin session found'
      };
    }

    const response = await api.post('/api/admin/auth/verify', {
      email: adminEmail,
      password
    });

    // ✅ Store new session token
    sessionStorage.setItem('admin_token', response.data.data.token);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Password verification failed'
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
 * Refresh Token (Removed - no longer needed with session-based approach)
 */
export const refreshAdminToken = async () => {
  // Token refresh removed - sessions expire on browser close
  return { success: false };
};

/**
 * Admin Logout
 */
/**
 * Admin Logout
 */
export const logoutAdmin = async () => {
  try {
    await api.post('/api/admin/auth/logout');
    
    // ✅ Clear session storage
    sessionStorage.removeItem('admin_token');
    
    // ✅ Set logout flag in localStorage (persists across reloads)
    localStorage.setItem('explicit_logout', 'true');

    return {
      success: true
    };
  } catch (error) {
    sessionStorage.removeItem('admin_token');
    localStorage.setItem('explicit_logout', 'true');

    return {
      success: true
    };
  }
};

/**
 * ✅ Check if admin has active session
 */
export const isAdminAuthenticated = () => {
  return !!sessionStorage.getItem('admin_token');
};

/**
 * ✅ Check if admin data exists (for re-auth check)
 */
export const hasAdminData = () => {
  return !!localStorage.getItem('admin_email');
};

/**
 * ✅ Get stored admin data (from localStorage)
 */
export const getStoredAdminData = () => {
  const name = localStorage.getItem('admin_name');
  const email = localStorage.getItem('admin_email');
  const id = localStorage.getItem('admin_id');
  
  if (email) {
    return { name, email, _id: id };
  }
  
  return null;
};

/**
 * ✅ Clear all admin data (use on full logout)
 */
export const clearAllAdminData = () => {
  sessionStorage.removeItem('admin_token');
  localStorage.removeItem('admin_name');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_id');
};

export default {
  registerAdmin,
  loginAdmin,
  verifyAdminPassword,
  getCurrentAdmin,
  refreshAdminToken,
  logoutAdmin,
  isAdminAuthenticated,
  hasAdminData,
  getStoredAdminData,
  clearAllAdminData
};