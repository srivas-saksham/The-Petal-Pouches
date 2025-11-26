// frontend/src/pages/user/UserLogin.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const { login, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // ✅ Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    // Check for too many attempts
    const maxAttempts = 5;
    if (attemptCount >= maxAttempts) {
      toast.error('Too many failed attempts. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        setAttemptCount(0);
        toast.success('Login successful! Welcome back.');
        navigate('/user/dashboard');
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        const remaining = maxAttempts - newAttemptCount;

        if (remaining > 0) {
          toast.error(`${result.error || 'Login failed'}. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        } else {
          toast.error('Too many failed attempts. Account temporarily locked.');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle forgot password
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-gradient-to-br from-tpppeach via-white to-tpppeach/50">
      {/* Left Section - Image (60%) - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-8">
        <div className="relative w-full max-w-md">
          <img 
            src="/assets/logo3d.png" 
            alt="The Petal Pouches" 
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tpppeach/20 to-transparent rounded-3xl"></div>
        </div>
      </div>

      {/* Right Section - Login Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-tpppink to-tpppeach rounded-xl shadow-lg mb-4">
              <span className="text-white font-bold text-xl">TP</span>
            </div>
            <h1 className="text-4xl font-bold text-tppslate mb-2">Welcome Back</h1>
            <p className="text-tppslate/60 text-lg">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-tppslate">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error message for too many attempts */}
            {attemptCount > 2 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {5 - attemptCount} attempt{5 - attemptCount !== 1 ? 's' : ''} remaining before account lockout
                </p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-tppslate/20 text-tpppink focus:ring-tpppink cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-tppslate/80 group-hover:text-tppslate transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                disabled={loading}
              >
                Forgot Password?
              </button>
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

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-tppslate/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-br from-tpppeach via-white to-tpppeach/50 text-tppslate/60">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons (Future enhancement) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={loading}
              className="py-3 px-4 border-2 border-tppslate/20 rounded-xl text-tppslate font-medium hover:border-tpppink hover:bg-tpppeach/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Google
            </button>
            <button
              disabled={loading}
              className="py-3 px-4 border-2 border-tppslate/20 rounded-xl text-tppslate font-medium hover:border-tpppink hover:bg-tpppeach/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-tppslate/80">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Back to Shop Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-tppslate/60 hover:text-tppslate font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}