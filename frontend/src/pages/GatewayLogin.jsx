// frontend/src/pages/GatewayLogin.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { setGatewayToken } from '../utils/gatewayAuth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function GatewayLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Verifying gateway password...');

    try {
      const response = await fetch(`${API_URL}/api/gateway/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        console.log('✅ Token received - storing and redirecting');
        
        // Store JWT token (not password!)
        setGatewayToken(data.token);
        
        // Redirect to original destination
        navigate(from, { replace: true });
      } else {
        console.log('❌ Invalid response:', data);
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      console.error('❌ Gateway login error:', err);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 rounded-full mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            The Petal Pouches
          </h1>
          <p className="text-sm text-gray-600">
            Development Preview
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🔒 Site Access Required
            </h2>
            <p className="text-sm text-gray-600">
              This site is currently in development. Please enter the access password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter password"
                autoComplete="current-password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-pink-500 text-white font-semibold py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Verifying...
                </span>
              ) : (
                'Access Site'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your access will be valid for 7 days. Contact the administrator if you need the password.
            </p>
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg text-xs font-mono">
            <div className="font-bold mb-2">🔍 Debug Info:</div>
            <div>Gateway Enabled: {import.meta.env.VITE_GATEWAY_ENABLED}</div>
            <div>API URL: {API_URL}</div>
          </div>
        )}
      </div>
    </div>
  );
}