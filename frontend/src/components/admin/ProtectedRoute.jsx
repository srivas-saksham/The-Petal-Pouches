// frontend/src/components/admin/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpppink"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && admin?.role !== requiredRole && admin?.role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}