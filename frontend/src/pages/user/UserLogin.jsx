// frontend/src/pages/user/UserLogin.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Chrome } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { useBrand } from '../../context/BrandContext';
import AuthPageTransition from '../../components/auth/AuthPageTransition';
import SEO from '../../components/seo/SEO';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const { login, loginWithGoogle, isAuthenticated } = useUserAuth();
  const { brandMode } = useBrand();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) navigate('/user/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!password) { toast.error('Please enter your password'); return; }

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

  const handleForgotPassword = () => navigate('/forgot-password');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Google login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Google login error');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Login to Your Account"
        description="Sign in to access your Rizara Luxe account, track orders, and manage your profile."
        canonical="https://www.rizara.in/login"
        noindex={true}
      />

      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-tpppeach via-white to-tpppeach/50 dark:from-tppdark dark:via-tppdark dark:to-tppdark">
        
        {/* Left Section - Image */}
        <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-8">
          <img
            src={brandMode === 'masculine'
              ? "/assets/login_illustrations/man_illustration_2.jpeg"
              : "/assets/login_illustrations/girl_illustration_2.png"
            }
            alt="Login Illustration"
            className="absolute inset-0 w-full h-full object-cover dark:opacity-60"
          />
        </div>

        <AuthPageTransition>
          <div className="w-full flex flex-col p-4 sm:p-6">
            
            {/* Top Nav */}
            <div className="mb-4 flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to="/"
                  className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite font-medium transition-colors inline-flex items-center gap-1"
                >
                  ← Home
                </Link>
                <div className="w-1 h-1 rounded-full bg-tppslate/50 dark:bg-tppdarkwhite/30" />
                <Link
                  to="/shop"
                  className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite font-medium transition-colors"
                >
                  Shop
                </Link>
              </div>
              <div className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 flex flex-col sm:block text-right flex-shrink-0">
                <span className="whitespace-nowrap">Don't have an account?{' '}</span>
                <Link
                  to="/register"
                  className="text-tpppink dark:text-tppdarkwhite hover:opacity-80 font-semibold transition-colors whitespace-nowrap"
                >
                  Sign up here
                </Link>
              </div>
            </div>

            {/* Centered Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-lg">

                {/* Header */}
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-tppslate dark:text-tppdarkwhite mb-2">Welcome Back</h1>
                  <p className="text-tppslate/60 dark:text-tppdarkwhite/50">Sign in to your account</p>
                </div>

                {/* Google Sign In */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-tppslate/60 dark:text-tppdarkwhite/40 text-center mb-3 uppercase tracking-wider">
                    Sign in with
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 border-2 border-tppslate/20 dark:border-tppdarkwhite/10 rounded-xl text-tppslate dark:text-tppdarkwhite font-medium hover:border-tpppink dark:hover:border-tppdarkwhite/30 hover:bg-tpppeach/20 dark:hover:bg-tppdarkwhite/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-white dark:bg-tppdarkgray"
                  >
                    <FcGoogle className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>
                  <p className="mt-3 text-[11px] sm:text-xs text-center text-tppslate/60 dark:text-tppdarkwhite/40 leading-snug">
                    By continuing with <span className='font-bold'>Google</span>, you agree to our{' '}
                    <Link to="/terms-and-conditions" className="text-tpppink dark:text-tppdarkwhite font-medium hover:opacity-80 transition-colors">
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-tpppink dark:text-tppdarkwhite font-medium hover:opacity-80 transition-colors">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-tppslate/20 dark:border-tppdarkwhite/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-tppdark px-4 text-tppslate/60 dark:text-tppdarkwhite/40 font-semibold">
                      Or sign in with email
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-tppslate dark:text-tppdarkwhite/70 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite/40 focus:ring-2 focus:ring-tpppink/10 dark:focus:ring-tppdarkwhite/10 transition-all text-sm text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 bg-white dark:bg-tppdarkgray hover:border-tppslate/20 dark:hover:border-tppdarkwhite/20"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-tppslate dark:text-tppdarkwhite/70 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-16 py-2.5 border-2 border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite/40 focus:ring-2 focus:ring-tpppink/10 dark:focus:ring-tppdarkwhite/10 transition-all text-sm text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 bg-white dark:bg-tppdarkgray hover:border-tppslate/20 dark:hover:border-tppdarkwhite/20"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink dark:text-tppdarkwhite/60 hover:text-tpppink/80 dark:hover:text-tppdarkwhite font-medium transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Too many attempts warning */}
                  {attemptCount > 2 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800 dark:text-yellow-400">
                        {5 - attemptCount} attempt{5 - attemptCount !== 1 ? 's' : ''} remaining before account lockout
                      </p>
                    </div>
                  )}

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-2 border-tppslate/20 dark:border-tppdarkwhite/20 text-tpppink focus:ring-tpppink cursor-pointer bg-white dark:bg-tppdarkgray"
                        disabled={loading}
                      />
                      <span className="text-xs text-tppslate/80 dark:text-tppdarkwhite/50 group-hover:text-tppslate dark:group-hover:text-tppdarkwhite transition-colors">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-tpppink dark:text-tppdarkwhite/70 hover:text-tpppink/80 dark:hover:text-tppdarkwhite font-medium transition-colors"
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-tpppink to-tpppink/90 dark:from-tppdarkwhite dark:to-tppdarkwhite/90 text-white dark:text-tppdark font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-tppdark"></div>
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
                  <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/50">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-tpppink dark:text-tppdarkwhite hover:opacity-80 font-semibold transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </AuthPageTransition>
      </div>

      <style>{`
        body { overflow-y: hidden; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}