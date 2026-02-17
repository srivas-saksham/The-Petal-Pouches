// frontend/src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresReauth, setRequiresReauth] = useState(false); // ✅ Re-auth state
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);   // ✅ NEW: unix timestamp
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(null); // ✅ NEW: countdown

  // Check auth on mount
  useEffect(() => {
    const checkAuth = () => {
      // ✅ Check if user explicitly logged out (from localStorage)
      const explicitLogout = localStorage.getItem('explicit_logout');
      
      // If explicit logout, DON'T clear the flag yet - just show full login
      if (explicitLogout === 'true') {
        setAdmin(null);
        setRequiresReauth(false);
        setLoading(false);
        return;
      }
      
      // Check if there's an active session token
      if (adminAuthService.isAdminAuthenticated()) {
        const storedAdmin = adminAuthService.getStoredAdminData();
        setAdmin(storedAdmin);
        setRequiresReauth(false);
        // ✅ Restore countdown from sessionStorage on page refresh
        const savedExpiry = adminAuthService.getTokenExpiresAt();isAuthenticated: !!admin && !requiresReauth
        if (savedExpiry) setSessionExpiresAt(savedExpiry);
      } 
      // ✅ Check if admin data exists but no active session (requires re-auth)
      else if (adminAuthService.hasAdminData()) {
        const storedAdmin = adminAuthService.getStoredAdminData();
        setAdmin(storedAdmin);
        setRequiresReauth(true); // ✅ Trigger re-auth screen
      } 
      // No data at all - fresh login required
      else {
        setAdmin(null);
        setRequiresReauth(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // ✅ Fresh Login (email + password)
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await adminAuthService.loginAdmin(email, password);

      if (result.success) {
        setAdmin(result.data.admin);
        setRequiresReauth(false);
        if (result.data.expiresAt) setSessionExpiresAt(result.data.expiresAt); // ✅ NEW
        localStorage.removeItem('explicit_logout');
        setLoading(false);
        return { success: true };
      } else {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // ✅ NEW: Re-authentication (password only)
  const reAuthenticate = async (password) => {
    setLoading(true);
    setError('');

    try {
      const result = await adminAuthService.verifyAdminPassword(password);

      if (result.success) {
        setAdmin(result.data.admin);
        setRequiresReauth(false);
        if (result.data.expiresAt) setSessionExpiresAt(result.data.expiresAt); // ✅ NEW
        localStorage.removeItem('explicit_logout');
        setLoading(false);
        return { success: true };
      } else {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Password verification failed');
      setLoading(false);
      return { success: false, error: 'Password verification failed' };
    }
  };

  // ✅ NEW: Countdown timer — ticks every 10 seconds
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const tick = () => {
      const secondsLeft = sessionExpiresAt - Math.floor(Date.now() / 1000);
      if (secondsLeft <= 0) {
        setSessionSecondsLeft(0);
        completeLogout();
        return;
      }
      setSessionSecondsLeft(secondsLeft);
    };

    tick(); // run immediately
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  // ✅ NEW: Extend session by 15 minutes
  const extendSession = async () => {
    const result = await adminAuthService.extendAdminSession();
    if (result.success) {
      setSessionExpiresAt(result.expiresAt);
      setSessionSecondsLeft(result.expiresInSeconds);
    }
    return result;
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await adminAuthService.logoutAdmin();
      setAdmin(null);
      setRequiresReauth(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Complete logout (clears everything including localStorage)
  const completeLogout = async () => {
    setLoading(true);
    try {
      await adminAuthService.logoutAdmin();
      adminAuthService.clearAllAdminData(); // ✅ Clear all stored data
      setAdmin(null);
      setRequiresReauth(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    loading,
    error,
    requiresReauth,
    sessionSecondsLeft,   // ✅ NEW
    sessionExpiresAt,     // ✅ NEW
    login,
    reAuthenticate, // ✅ NEW: Expose re-auth function
    logout,
    completeLogout,
    extendSession,
    isAuthenticated: !!admin && !requiresReauth // ✅ Updated: Only authenticated if no re-auth needed
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}