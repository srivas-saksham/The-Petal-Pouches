// frontend/src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresReauth, setRequiresReauth] = useState(false); // ✅ NEW: Re-auth state

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
        localStorage.removeItem('explicit_logout'); // ✅ Clear logout flag ONLY on successful fresh login
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
        localStorage.removeItem('explicit_logout'); // ✅ Clear logout flag on successful re-auth too
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
    requiresReauth, // ✅ NEW: Expose re-auth state
    login,
    reAuthenticate, // ✅ NEW: Expose re-auth function
    logout,
    completeLogout, // ✅ NEW: Expose complete logout
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