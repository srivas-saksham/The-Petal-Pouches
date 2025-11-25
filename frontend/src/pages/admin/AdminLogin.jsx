// frontend/src/pages/admin/AdminLogin.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as adminAuthService from '../../services/adminAuthService';
import { Lock, Mail, ArrowRight, TriangleAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0); // ✅ NEW: Track attempts
  const { login, reAuthenticate, admin, requiresReauth } = useAdminAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (admin && !requiresReauth) {
      navigate('/admin/dashboard');
    }
  }, [admin, requiresReauth, navigate]);

  // ✅ Handle Fresh Login (email + password)
  const handleFreshLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      setAttemptCount(0); // ✅ Reset on success
      navigate('/admin/dashboard');
    } else {
      setAttemptCount(prev => prev + 1); // ✅ Increment on failure
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  // ✅ Handle Re-authentication (password only)
  const handleReAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await reAuthenticate(password);

    if (result.success) {
      setAttemptCount(0); // ✅ Reset on success
      navigate('/admin/dashboard');
    } else {
      setAttemptCount(prev => prev + 1); // ✅ Increment on failure
      setError(result.error || 'Password verification failed');
    }

    setLoading(false);
  };

  // Determine which form to show
  const isReAuthMode = requiresReauth && admin;
  const maxAttempts = 5;
  const remainingAttempts = maxAttempts - attemptCount;

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Left Section - Image (60%) */}
      <div className="hidden lg:block lg:w-3/5 relative overflow-hidden">
        <img 
          src="/assets/logo3d.png" 
          alt="The Petal Pouches" 
          className="w-full h-screen object-contain"
        />
      </div>

      {/* Right Section - Login Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Conditional Header - Re-auth vs Fresh Login */}
          {isReAuthMode ? (
            // Re-authentication Header
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-tppslate mb-2">
                Welcome Back,
              </h1>
              <h1 className="text-4xl font-bold text-tpppink mb-2">
                {admin.name}!
              </h1>
              <p className="text-tppslate/80 text-lg">
                We need to verify your identity as admin access is very crucial. Please enter your password below.
              </p>
            </div>
          ) : (
            // Fresh Login Header
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-tppslate mb-2">
                Welcome Back
              </h1>
              <p className="text-tppslate/60 text-lg">
                Sign in to your admin dashboard
              </p>
            </div>
          )}

          {/* ✅ NEW: Attempt Counter Warning (show after first failed attempt) */}
          {attemptCount > 0 && attemptCount < maxAttempts && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-yellow-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {attemptCount === 1 ? 'Incorrect credentials' : `${attemptCount} failed attempts`}
                </p>
                <p className="mt-1">
                  {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before temporary lockout
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!isReAuthMode && error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
              <p className="font-medium">{isReAuthMode ? 'Verification Failed' : 'Login Failed'}</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Conditional Form - Re-auth vs Fresh Login */}
          {isReAuthMode ? (
            // Re-authentication Form (Password Only)
            <form onSubmit={handleReAuth} className="space-y-6">
              {/* Show Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                  <input
                    type="email"
                    value={admin.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl bg-tppslate/5 text-tppslate/60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verify Identity</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    // Clear everything and force full login
                    adminAuthService.clearAllAdminData();
                    window.location.reload();
                  }}
                  className="text-sm text-tppslate/80 hover:text-tpppink transition-colors"
                >
                  Not you? <span className="underline">Sign in with different account</span>
                </button>
              </div>
            </form>
          ) : (
            // Fresh Login Form (Email + Password)
            <form onSubmit={handleFreshLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@thepetalpouches.com"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="text-sm text-tpppink hover:text-tpppink/80 font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Back to Shop
            </a>
          </div>
          
          {/* Security Notice */}
          <div className="mt-8 p-4 text-center">
            <TriangleAlert className="mx-auto mb-2 w-6 h-6 text-yellow-900" />
            <p className="text-sm text-yellow-900">
              This is a secure admin area. All access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}