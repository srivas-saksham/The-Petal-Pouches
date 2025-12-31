// frontend/src/pages/user/ForgotPassword.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, X, Check, HeartCrack, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { requestPasswordReset, resetPassword } from '../../services/userAuthService';
import AuthPageTransition from '../../components/auth/AuthPageTransition';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP modal, 3 = new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  
  // Refs for OTP inputs
  const otpInputRefs = useRef([]);

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
    if (otpString.length === 6 && !verifyingOtp && step === 2) {
      handleOtpComplete();
    }
  }, [otp, step]);

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

  // ✅ Step 1: Request password reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        toast.success('Verification code sent to your email!');
        setShowOtpModal(true);
        setStep(2);
        setResendTimer(60);
      } else {
        toast.error(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: OTP entered completely - just move to password step
  const handleOtpComplete = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    // Don't verify yet - just close modal and move to password step
    setVerifyingOtp(true);
    
    // Simulate brief validation UI
    setTimeout(() => {
      toast.success('Code accepted! Set your new password.');
      setShowOtpModal(false);
      setStep(3);
      setVerifyingOtp(false);
    }, 500);
  };

  // ✅ Step 3: Reset password (OTP + password sent together)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const otpString = otp.join('');
      
      // ✅ Send OTP + password together for verification and reset
      const result = await resetPassword(email, otpString, newPassword);

      if (result.success) {
        toast.success('Password reset successful! You can now login.');
        // Clear sensitive data
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        navigate('/login');
      } else {
        toast.error(result.error || 'Password reset failed. Please try again.');
        // If OTP is invalid/expired, go back to step 1
        if (result.error?.toLowerCase().includes('otp') || 
            result.error?.toLowerCase().includes('expired') ||
            result.error?.toLowerCase().includes('invalid')) {
          setStep(1);
          setOtp(['', '', '', '', '', '']);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

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
      setShowConfirmClose(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setStep(1);
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
          {/* Right Section - Dynamic Content Based on Step */}
          <div className="w-full flex flex-col p-4 sm:p-6">
            {/* Back to Shop Link - FIXED AT TOP */}
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <Link
                to="/"
                className="text-sm text-tppslate/60 hover:text-tpppink font-medium transition-colors inline-flex items-center gap-1"
              >
                ← Back to Shop
              </Link>
              <Link
                to="/login"
                className="text-sm text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
              >
                Back to Login
              </Link>
            </div>

            {/* Centered Content Container */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-lg">

                {/* ==================== STEP 1: EMAIL INPUT ==================== */}
                {step === 1 && (
                  <>
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <h1 className="text-3xl font-bold text-tppslate mb-2">Reset Password</h1>
                      <p className="text-tppslate/60">Enter your email to receive a verification code</p>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleRequestReset} className="space-y-4">
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

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sending Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-tppslate/80">
                        Remember your password?{' '}
                        <Link
                          to="/login"
                          className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </>
                )}

                {/* ==================== STEP 3: NEW PASSWORD ==================== */}
                {step === 3 && (
                  <>
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-tpppink/10 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-tpppink" />
                      </div>
                      <h1 className="text-3xl font-bold text-tppslate mb-2">Set New Password</h1>
                      <p className="text-tppslate/60">Create a strong password for your account</p>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-tppslate mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="w-full pl-10 pr-16 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                            required
                            disabled={loading}
                            autoFocus
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
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full pl-10 pr-16 py-2.5 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/10 transition-all text-sm text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-tppslate/40 hover:text-tpppink"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && (
                          <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                            newPassword === confirmPassword ? 'text-tppmint' : 'text-red-600'
                          }`}>
                            {newPassword === confirmPassword ? (
                              <><CheckCircle2 className="w-3 h-3" /><span>Match</span></>
                            ) : (
                              <><AlertCircle className="w-3 h-3" /><span>Don't match</span></>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-tpppeach/20 p-3 rounded-lg">
                        <p className="text-xs text-tppslate/60 mb-1 font-medium">Password must contain:</p>
                        <ul className="text-xs text-tppslate/60 space-y-1">
                          <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-tppmint' : ''}`}>
                            <span>• At least 8 characters</span>
                          </li>
                          <li className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-tppmint' : ''}`}>
                            <span>• One uppercase letter</span>
                          </li>
                          <li className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'text-tppmint' : ''}`}>
                            <span>• One lowercase letter</span>
                          </li>
                          <li className={`flex items-center gap-1 ${/\d/.test(newPassword) ? 'text-tppmint' : ''}`}>
                            <span>• One number</span>
                          </li>
                        </ul>
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
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <span>Reset Password</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-tppslate/80">
                        Password reset complete?{' '}
                        <Link
                          to="/login"
                          className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
                        >
                          Sign in now
                        </Link>
                      </p>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </AuthPageTransition>
      </div>

      {/* ✅ OTP VERIFICATION MODAL */}
      {showOtpModal && step === 2 && (
        <>
          {/* Floating sad message */}
          {showConfirmClose && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-[280px] z-[60] animate-fadeIn">
              <div className="bg-white px-6 py-3 rounded-full shadow-lg border-2">
                <p className="text-sm font-medium text-tppslate">
                  Don't want to reset? <HeartCrack className="inline-block w-4 h-4 text-tppslate -translate-y-0.5" />
                </p>
              </div>
            </div>
          )}

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp relative">
              {/* Close/Confirm Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {showConfirmClose ? (
                  <>
                    {/* Cancel (X) Button */}
                    <button
                      onClick={() => setShowConfirmClose(false)}
                      disabled={verifyingOtp}
                      className="flex items-center justify-center w-9 h-9 text-tppslate hover:bg-tppslate/10 rounded-full transition-all disabled:opacity-50 hover:scale-110"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {/* Confirm (Check) Button */}
                    <button
                      onClick={closeOtpModal}
                      disabled={verifyingOtp}
                      className="flex items-center justify-center w-9 h-9 text-tpppink hover:bg-tpppink/20 rounded-full transition-all disabled:opacity-50 hover:scale-110"
                      title="Confirm Close"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  /* Regular Close Button */
                  <button
                    onClick={() => setShowConfirmClose(true)}
                    disabled={verifyingOtp}
                    className="text-tppslate/40 hover:text-tppslate transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

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
                  <span className="font-semibold text-tppslate">{email}</span>
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
                    <span className="font-medium">Accepting code...</span>
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
                Code will be verified when you set your password
              </p>
            </div>
          </div>
        </>
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