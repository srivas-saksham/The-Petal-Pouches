// frontend/src/components/user/ProtectedCustomerRoute.jsx

import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';

export default function ProtectedCustomerRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-tpppeach to-white dark:from-tppdark dark:to-tppdarkgray">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white dark:bg-tppdarkgray rounded-full shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-tpppeach dark:border-tppdarkwhite/20 border-t-tppslate dark:border-t-tppdarkwhite"></div>
          </div>
          <p className="text-tppslate dark:text-tppdarkwhite font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}