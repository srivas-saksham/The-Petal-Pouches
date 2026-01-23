// frontend/src/components/ProtectedByGateway.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isGatewayEnabled, hasGatewayAccess } from '../utils/gatewayAuth';

/**
 * Gateway Protection Wrapper
 * Redirects to /gateway-login if gateway is enabled and user doesn't have access
 * Shows nothing while checking to prevent premature API calls
 */
export default function ProtectedByGateway({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Skip check if already on gateway login page
    if (location.pathname === '/gateway-login') {
      setIsChecking(false);
      setHasAccess(true);
      return;
    }

    // Check gateway access
    const checkAccess = () => {
      if (isGatewayEnabled()) {
        if (!hasGatewayAccess()) {
          console.log('🔒 No gateway access - redirecting to login');
          // No access - redirect to gateway login
          navigate('/gateway-login', { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        } else {
          console.log('✅ Gateway access verified');
        }
      }
      
      // Gateway disabled OR user has valid access
      setHasAccess(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [navigate, location]);

  // ✅ CRITICAL: Show nothing while checking
  // This prevents CartProvider from mounting and making API calls
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ✅ Only render children after check passes
  if (!hasAccess) {
    return null;
  }

  return children;
}