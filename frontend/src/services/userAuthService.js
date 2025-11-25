// frontend/src/services/userAuthService.js

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Register new customer
 * POST /api/auth/register
 */
export const registerUser = async (email, password, name) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        name: name.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Registration failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Registration error',
    };
  }
};

/**
 * Login customer
 * POST /api/auth/login
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Login failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Login error',
    };
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch user',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Error fetching user',
    };
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logoutUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Logout warning:', data.message);
    }

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
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Token refresh failed',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Token refresh error',
    };
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send reset email',
      };
    }

    return {
      success: true,
      message: 'Reset email sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Password reset request error',
    };
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reset_token: resetToken,
        password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Password reset failed',
      };
    }

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Password reset error',
    };
  }
};

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (verificationToken) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: verificationToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Email verification failed',
      };
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Email verification error',
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