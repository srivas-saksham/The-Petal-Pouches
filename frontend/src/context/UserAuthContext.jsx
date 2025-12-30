// frontend/src/context/UserAuthContext.jsx - WITH CART MERGE + OTP

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mergeCarts } from '../services/cartService';
import { completeRegistration } from '../services/userAuthService';

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // ✅ Initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('customer_token');
        const savedUser = localStorage.getItem('customer_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Verify token is still valid
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            // Token expired or invalid
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [API_URL]);

  // ✅ Register new user - Step 1: Send OTP
  const register = useCallback(async (email, password, name, phone = null) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }

      // ✅ Returns requiresOTP flag
      return { 
        success: true, 
        requiresOTP: data.requiresOTP,
        message: data.message 
      };
    } catch (err) {
      const errorMsg = err.message || 'Registration error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [API_URL]);

  // ✅ Complete registration - Step 2: Verify OTP and create account
  const completeRegistrationWithOTP = useCallback(async (email, password, name, otp, phone = null) => {
    setError(null);
    try {
      const result = await completeRegistration(email, password, name, otp, phone);

      if (!result.success) {
        setError(result.error || 'Registration completion failed');
        return { success: false, error: result.error };
      }

      // Auto-login after successful registration
      const { token: newToken, user: newUser } = result.data;
      setToken(newToken);
      setUser(newUser);

      localStorage.setItem('customer_token', newToken);
      localStorage.setItem('customer_user', JSON.stringify(newUser));

      // ✅ Merge guest cart after registration
      if (newUser.id) {
        try {
          await mergeCarts(newUser.id);
          console.log('✅ Guest cart merged after registration');
        } catch (mergeError) {
          console.error('⚠️ Cart merge failed:', mergeError);
        }
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Registration completion error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // ✅ Login user
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return { success: false, error: data.message };
      }

      const { token: newToken, user: newUser } = data.data;
      setToken(newToken);
      setUser(newUser);

      localStorage.setItem('customer_token', newToken);
      localStorage.setItem('customer_user', JSON.stringify(newUser));

      // ✅ Merge guest cart after login
      if (newUser.id) {
        try {
          await mergeCarts(newUser.id);
          console.log('✅ Guest cart merged after login');
        } catch (mergeError) {
          console.error('⚠️ Cart merge failed:', mergeError);
        }
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Login error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [API_URL]);

  // ✅ Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      // Redirect to Supabase Google OAuth
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Google login error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // ✅ Handle OAuth callback (call this on redirect page)
  const handleOAuthCallback = useCallback(async () => {
    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Exchange Supabase token for our JWT
      const response = await fetch(`${API_URL}/api/auth/oauth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OAuth authentication failed');
      }

      const { token: newToken, user: newUser } = data.data;
      setToken(newToken);
      setUser(newUser);

      localStorage.setItem('customer_token', newToken);
      localStorage.setItem('customer_user', JSON.stringify(newUser));

      // Merge cart for OAuth users too
      if (newUser.id) {
        try {
          await mergeCarts(newUser.id);
          console.log('✅ Guest cart merged after Google login');
        } catch (mergeError) {
          console.error('⚠️ Cart merge failed:', mergeError);
        }
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'OAuth callback error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [API_URL]);

  // ✅ Logout user
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      setError(null);
    }
  }, [token, API_URL]);

  // ✅ Refresh token (call before token expires)
  const refreshToken = useCallback(async () => {
    if (!token) return { success: false };

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
        logout();
        return { success: false };
      }

      const newToken = data.data.token;
      setToken(newToken);
      localStorage.setItem('customer_token', newToken);

      return { success: true, token: newToken };
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      return { success: false };
    }
  }, [token, API_URL, logout]);

  // ✅ Update user data (called after profile changes)
  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
    localStorage.setItem('customer_user', JSON.stringify({
      ...user,
      ...updatedData
    }));
  }, [user]);

  // ✅ Get authorization header
  const getAuthHeader = useCallback(() => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,

    // Methods
    register,
    completeRegistrationWithOTP,
    login,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    refreshToken,
    updateUser,
    getAuthHeader,
    setError,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

// ✅ Hook to use auth context
export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
}