// frontend/src/components/user/ProtectedCustomerRoute.jsx

import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';;

/**
 * Route guard component for authenticated customer pages
 * Redirects to login if user is not authenticated
 * Shows loading state while checking authentication
 */
export default function ProtectedCustomerRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useUserAuth();

  // ✅ Loading state - show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-tpppeach to-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-tpppeach border-t-tppslate"></div>
          </div>
          <p className="text-tppslate font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Check required role if specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Authenticated - render children
  return children;
}