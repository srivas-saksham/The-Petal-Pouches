// frontend/src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check auth on mount
  useEffect(() => {
    const checkAuth = () => {
      if (adminAuthService.isAdminAuthenticated()) {
        const storedAdmin = adminAuthService.getStoredAdminData();
        setAdmin(storedAdmin);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await adminAuthService.loginAdmin(email, password);

      if (result.success) {
        setAdmin(result.data.admin);
        setLoading(false); // ✅ FIX: Set loading to false on success
        return { success: true };
      } else {
        setError(result.error);
        setLoading(false); // ✅ FIX: Set loading to false on error
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setLoading(false); // ✅ FIX: Set loading to false on exception
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await adminAuthService.logoutAdmin();
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false); // ✅ Always reset loading state
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin
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