// frontend/src/pages/user/UserLogin.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Chrome } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import AuthPageTransition from '../../components/auth/AuthPageTransition';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const { login, loginWithGoogle, isAuthenticated } = useUserAuth();
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

  // ✅ Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Google login failed');
      }
      // Note: User will be redirected to Google, so no need to setLoading(false)
    } catch (error) {
      toast.error(error.message || 'Google login error');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-tpppeach via-white to-tpppeach/50">
        {/* Left Section - Image (60%) - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-8 bg-tpppink">
          <div className="relative w-full max-w-md">
          </div>
        </div>

        <AuthPageTransition>
        {/* Right Section - Login Form (40%) - Proper Container */}
        <div className="w-full flex flex-col p-4 sm:p-6">
          {/* Back to Shop Link & Sign Up Link - FIXED AT TOP */}
          <div className="mb-4 flex items-center justify-between flex-shrink-0">
            <Link
              to="/"
              className="text-sm text-tppslate/60 hover:text-tpppink font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Back to Shop
            </Link>
            <p className="text-sm text-tppslate/60">
              <Link to="/register" className="hover:text-tpppink transition-colors">
                Don't have an account?{' '}
              </Link>
              <Link
                to="/register"
                className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Centered Content Container */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-tppslate mb-2">Welcome Back</h1>
                <p className="text-tppslate/60">Sign in to your account</p>
              </div>

              {/* Google Sign In */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-tppslate/60 text-center mb-3 uppercase tracking-wider">
                  Sign in with
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 border-2 border-tppslate/20 rounded-xl text-tppslate font-medium hover:border-tpppink hover:bg-tpppeach/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Chrome className="w-5 h-5 text-tpppink" />
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-tppslate/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-tppslate/60 font-semibold">Or sign in with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-tppslate mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
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
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-16 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Error message for too many attempts */}
                {attemptCount > 2 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800">
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
                    <span className="text-xs text-tppslate/80 group-hover:text-tppslate transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-tppslate/80">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </AuthPageTransition>
      </div>

      {/* Animations */}
      <style>{`
        /* Hide scrollbar */
        body {
          overflow-y: hidden;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}