// frontend/src/services/userAuthService.js
import api from './api';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== OTP FUNCTIONS ====================

/**
 * Send OTP to email
 * POST /api/otp/send
 */
export const sendOTP = async (email, type, name = '') => {
  try {
    const response = await api.post('/api/otp/send', {
      email: email.trim(),
      type,
      name: name.trim(),
    });

    return {
      success: true,
      message: response.data.message,
      attemptsRemaining: response.data.attemptsRemaining,
      expiresIn: response.data.expiresIn,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send OTP',
    };
  }
};

/**
 * Verify OTP code
 * POST /api/otp/verify
 */
export const verifyOTP = async (email, otp, type) => {
  try {
    const response = await api.post('/api/otp/verify', {
      email: email.trim(),
      otp,
      type,
    });

    return {
      success: true,
      message: response.data.message,
      verified: response.data.verified,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'OTP verification failed',
      code: error.response?.data?.code,
    };
  }
};

/**
 * Resend OTP
 * POST /api/otp/resend
 */
export const resendOTP = async (email, type, name = '') => {
  try {
    const response = await api.post('/api/otp/resend', {
      email: email.trim(),
      type,
      name: name.trim(),
    });

    return {
      success: true,
      message: response.data.message,
      attemptsRemaining: response.data.attemptsRemaining,
      expiresIn: response.data.expiresIn,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to resend OTP',
    };
  }
};

/**
 * Register new customer - Step 1: Send OTP
 * POST /api/auth/register
 */
export const registerUser = async (email, password, name, phone = null) => {
  try {
    const response = await api.post('/api/auth/register', {
      email: email.trim(),
      password,
      name: name.trim(),
      phone,
    });

    return {
      success: true,
      requiresOTP: response.data.requiresOTP,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Registration failed',
    };
  }
};

/**
 * Complete registration after OTP verification - Step 2
 * POST /api/auth/register/complete
 */
export const completeRegistration = async (email, password, name, otp, phone = null) => {
  try {
    const response = await api.post('/api/auth/register/complete', {
      email: email.trim(),
      password,
      name: name.trim(),
      otp,
      phone,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Registration completion failed',
    };
  }
};

/**
 * Login customer
 * POST /api/auth/login
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email: email.trim(),
      password,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Login failed',
    };
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await api.get('/api/auth/me');

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch user',
    };
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logoutUser = async (token) => {
  try {
    await api.post('/api/auth/logout');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Refresh authentication token
 * POST /api/auth/refresh-token
 */
export const refreshAuthToken = async (token) => {
  try {
    const response = await api.post('/api/auth/refresh-token');

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Token refresh failed',
    };
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', {
      email: email.trim(),
    });

    return {
      success: true,
      message: 'Reset email sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send reset email',
    };
  }
};

/**
 * Reset password with OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      email: email.trim(),
      otp,
      password: newPassword,
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Password reset failed',
    };
  }
};

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (verificationToken) => {
  try {
    const response = await api.post('/api/auth/verify-email', {
      token: verificationToken,
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Email verification failed',
    };
  }
};

/**
 * Request password change - Send OTP
 * POST /api/auth/change-password/request
 */
export const requestPasswordChange = async (token) => {
  try {
    const response = await api.post('/api/auth/change-password/request');

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send verification code',
    };
  }
};

/**
 * Change password with OTP verification
 * PUT /api/auth/change-password
 */
export const changePassword = async (token, otp, currentPassword, newPassword) => {
  try {
    const response = await api.put('/api/auth/change-password', {
      otp,
      currentPassword,
      newPassword,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Password change failed',
    };
  }
};

/**
 * Clear all auth data from localStorage
 */
export const clearAllCustomerAuthData = () => {
  localStorage.removeItem('customer_token');
  localStorage.removeItem('customer_user');
  localStorage.removeItem('customer_cart');
};

/**
 * Get stored auth token
 */
export const getStoredToken = () => {
  return localStorage.getItem('customer_token');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('customer_user');
  return user ? JSON.parse(user) : null;
};