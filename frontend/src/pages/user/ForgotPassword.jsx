// frontend/src/pages/user/ForgotPassword.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { requestPasswordReset, resetPassword } from '../../services/userAuthService';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const toast = useToast();

  // OTP resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  // ✅ Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      const result = await resetPassword(email, otp, newPassword);

      if (result.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      } else {
        setOtpError(result.error || 'Password reset failed');
        toast.error(result.error || 'Password reset failed');
      }
    } catch (error) {
      setOtpError(error.message || 'Reset failed');
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
        setOtp('');
        setOtpError('');
      } else {
        toast.error(result.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error(error.message || 'Resend failed');
    } finally {
      setLoading(false);
    }
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

      {/* Right Section - Reset Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-tpppink to-tpppeach rounded-xl shadow-lg mb-4">
              <span className="text-white font-bold text-xl">TP</span>
            </div>
            <h1 className="text-4xl font-bold text-tppslate mb-2">Reset Password</h1>
            <p className="text-tppslate/60 text-lg">
              {step === 1 ? 'Enter your email to receive a verification code' : 'Enter the code and your new password'}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP + New Password */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-tpppink/10 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-tpppink" />
                </div>
                <p className="text-tppslate/60">
                  Code sent to<br />
                  <span className="font-semibold text-tppslate">{email}</span>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2 text-center">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      setOtpError('');
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate placeholder-tppslate/40 bg-white hover:border-tppslate/20"
                    required
                    disabled={loading}
                    autoFocus
                  />
                  {otpError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {otpError}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
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
                  {confirmPassword && (
                    <div className={`mt-2 flex items-center gap-2 text-xs ${
                      newPassword === confirmPassword ? 'text-tppmint' : 'text-red-600'
                    }`}>
                      {newPassword === confirmPassword ? (
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-tpppink to-tpppink/90 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-sm text-tppslate/60 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm text-tpppink hover:text-tpppink/80 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>

                {/* Change Email */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setOtpError('');
                      setResendTimer(0);
                    }}
                    className="text-sm text-tppslate/60 hover:text-tppslate font-medium transition-colors"
                  >
                    ← Change Email Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <p className="text-tppslate/80">
              Remember your password?{' '}
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
    </div>
  );
}