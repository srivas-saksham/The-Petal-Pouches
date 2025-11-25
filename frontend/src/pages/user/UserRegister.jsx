// frontend/src/pages/user/UserRegister.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/customer/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // ✅ Calculate password strength
  useEffect(() => {
    const pwd = formData.password;
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    setPasswordStrength(strength);
  }, [formData.password]);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return false;
    }

    return true;
  };

  // ✅ Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success) {
        toast.success('Registration successful! Welcome to The Petal Pouches.');
        navigate('/customer/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get password strength label and color
  const getPasswordStrengthDisplay = () => {
    const strengths = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-tppmint' },
    ];

    return strengths[Math.min(passwordStrength, 4)];
  };

  const strengthDisplay = getPasswordStrengthDisplay();

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

      {/* Right Section - Register Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-tpppink to-tpppeach rounded-xl shadow-lg mb-4">
              <span className="text-white font-bold text-xl">TP</span>
            </div>
            <h1 className="text-4xl font-bold text-tppslate mb-2">Create Account</h1>
            <p className="text-tppslate/60 text-lg">Join The Petal Pouches community</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-tppslate/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthDisplay.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ${strengthDisplay.color.replace('bg-', 'text-')}`}>
                      {strengthDisplay.label}
                    </span>
                  </div>
                  <p className="text-xs text-tppslate/60">
                    Use uppercase, lowercase, numbers, and symbols for a stronger password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  className="w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${
                  formData.password === formData.confirmPassword 
                    ? 'text-tppmint' 
                    : 'text-red-600'
                }`}>
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-tppslate/20 text-tpppink focus:ring-tpppink cursor-pointer mt-1 flex-shrink-0"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-tppslate/80 cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Marketing Opt-in */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketing"
                defaultChecked={true}
                className="w-5 h-5 rounded border-2 border-tppslate/20 text-tpppink focus:ring-tpppink cursor-pointer mt-1 flex-shrink-0"
                disabled={loading}
              />
              <label htmlFor="marketing" className="text-sm text-tppslate/80 cursor-pointer">
                Send me special offers, product updates, and news (optional)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-4 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-tppslate/80">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Back to Shop Link */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-tppslate/60 hover:text-tppslate font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e8a9c0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ec4899;
        }
      `}</style>
    </div>
  );
}