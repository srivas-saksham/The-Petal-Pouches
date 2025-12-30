// frontend/src/pages/user/UserRegister.jsx - REDESIGNED WITH MODAL OTP

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, X, Chrome } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { sendOTP, verifyOTP, resendOTP } from '../../services/userAuthService';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register, completeRegistrationWithOTP, loginWithGoogle, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Refs for OTP inputs
  const otpInputRefs = useRef([]);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // OTP resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-submit OTP when all digits filled
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !verifyingOtp) {
      handleOtpVerification();
    }
  }, [otp]);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    pastedData.forEach((char, index) => {
      if (/^\d$/.test(char) && index < 6) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const lastFilledIndex = newOtp.findIndex(val => !val);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    otpInputRefs.current[focusIndex]?.focus();
  };

  // ✅ Validate form
  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
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

  // ✅ Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Google login failed');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || 'Google login error');
      setLoading(false);
    }
  };

  // ✅ Handle registration submission - Step 1: Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      if (result.success && result.requiresOTP) {
        toast.success('Verification code sent to your email!');
        setShowOtpModal(true);
        setResendTimer(60);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle OTP verification - Step 2
  const handleOtpVerification = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    try {
      const result = await completeRegistrationWithOTP(
        formData.email,
        formData.password,
        formData.name,
        otpString,
        formData.phone
      );

      if (result.success) {
        toast.success('Registration successful! Welcome to Rizara Jewels.');
        setShowOtpModal(false);
        navigate('/user/dashboard');
      } else {
        setOtpError(result.error || 'Invalid verification code');
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      setOtpError(error.message || 'Verification error');
      toast.error(error.message || 'Verification error occurred');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ✅ Handle OTP resend
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const result = await resendOTP(formData.email, 'registration', formData.name);

      if (result.success) {
        toast.success('Verification code resent!');
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        otpInputRefs.current[0]?.focus();
      } else {
        toast.error(result.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error(error.message || 'Resend failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Close OTP modal
  const closeOtpModal = () => {
    if (!verifyingOtp) {
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
    }
  };

  return (
    <>
      <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-tpppeach via-white to-tpppeach/50">
        {/* Left Section - Image (60%) */}
        <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-8 bg-tpppink">
          <div className="relative w-full max-w-md">
          </div>
        </div>

        {/* Right Section - Register Form (40%) */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-tppslate mb-2">Create Account</h1>
              <p className="text-tppslate/60">Join Rizara Jewels community</p>
            </div>

            {/* Google Sign Up */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-tppslate/60 text-center mb-3 uppercase tracking-wider">
                Register with
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
                <span className="bg-white px-4 text-tppslate/60 font-semibold">Or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-tppslate mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-tppslate mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-tppslate mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-tppslate mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                    required
                    disabled={loading}
                  />
                </div>
                {formData.confirmPassword && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                    formData.password === formData.confirmPassword ? 'text-tppmint' : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <><CheckCircle2 className="w-3 h-3" /><span>Match</span></>
                    ) : (
                      <><AlertCircle className="w-3 h-3" /><span>Don't match</span></>
                    )}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-tppslate/20 text-tpppink focus:ring-tpppink cursor-pointer mt-0.5 flex-shrink-0"
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-xs text-tppslate/80 cursor-pointer leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" className="text-tpppink hover:text-tpppink/80 font-semibold">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-tpppink hover:text-tpppink/80 font-semibold">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full py-3 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-tppslate/80">
                Already have an account?{' '}
                <Link to="/login" className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp relative">
            {/* Close Button */}
            <button
              onClick={closeOtpModal}
              disabled={verifyingOtp}
              className="absolute top-4 right-4 text-tppslate/40 hover:text-tppslate transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tpppink/10 rounded-full mb-4">
                <Mail className="w-8 h-8 text-tpppink" />
              </div>
              <h2 className="text-2xl font-bold text-tppslate mb-2">
                Verify Your Email
              </h2>
              <p className="text-sm text-tppslate/60">
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-tppslate">{formData.email}</span>
              </p>
            </div>

            {/* OTP Input - Individual Boxes */}
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  disabled={verifyingOtp}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all focus:outline-none ${
                    digit
                      ? 'border-tpppink bg-tpppink/5 text-tpppink'
                      : 'border-tppslate/20 text-tppslate'
                  } focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 disabled:opacity-50`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Error Message */}
            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {otpError}
                </p>
              </div>
            )}

            {/* Verifying State */}
            {verifyingOtp && (
              <div className="mb-4 p-3 bg-tpppink/10 border border-tpppink/20 rounded-lg">
                <p className="text-sm text-tpppink flex items-center gap-2 justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-tpppink border-t-transparent"></div>
                  <span className="font-medium">Verifying code...</span>
                </p>
              </div>
            )}

            {/* Resend Code */}
            <div className="text-center mb-4">
              <p className="text-xs text-tppslate/60 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading || verifyingOtp}
                className="text-sm text-tpppink hover:text-tpppink/80 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-center text-tppslate/60">
              Code will be verified automatically
            </p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}