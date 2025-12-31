import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useUserAuth();
  const toast = useToast();

  const [requiresPassword, setRequiresPassword] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleOAuthCallback();
        
        if (result.success) {
          // ✅ Existing user - redirect
          toast.success('Welcome back!');
          navigate('/user/dashboard');
        } else if (result.requiresPasswordSetup) {
          // ✅ New user - show password modal
          setRequiresPassword(true);
          setTempUserData(result.tempUserData);
        } else {
          toast.error('Google login failed. Please try again.');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Authentication error occurred');
        navigate('/login');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate, toast]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/oauth/google/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempUserData.email,
          name: tempUserData.name,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete signup');
      }

      // Save auth data
      const { token, user } = data.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(user));

      toast.success('Account created successfully!');
      navigate('/user/dashboard');
      window.location.reload(); // Refresh to update auth context

    } catch (error) {
      toast.error(error.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tpppeach via-white to-tpppeach/50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-tpppink/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-tpppink" />
            </div>
            <h2 className="text-2xl font-bold text-tppslate mb-2">Set Your Password</h2>
            <p className="text-sm text-tppslate/60">
              Complete your signup by creating a secure password
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-tppslate mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tppslate/40 hover:text-tpppink"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-tppslate mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-tpppeach/20 p-3 rounded-lg">
              <p className="text-xs text-tppslate/60 mb-1 font-medium">Password must contain:</p>
              <ul className="text-xs text-tppslate/60 space-y-1">
                <li className="flex items-center gap-1">
                  <span className={password.length >= 8 ? 'text-tppmint' : ''}>• At least 8 characters</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className={/[A-Z]/.test(password) ? 'text-tppmint' : ''}>• One uppercase letter</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className={/[a-z]/.test(password) ? 'text-tppmint' : ''}>• One lowercase letter</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className={/\d/.test(password) ? 'text-tppmint' : ''}>• One number</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tpppeach via-white to-tpppeach/50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-tpppink border-t-transparent"></div>
        </div>
        <h2 className="text-2xl font-bold text-tppslate mb-2">Completing Sign In</h2>
        <p className="text-tppslate/60">Please wait while we verify your account...</p>
      </div>
    </div>
  );
}