// frontend/src/components/user/profile/SecuritySettingsCard.jsx

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Check, X, Loader2, Shield, AlertCircle, KeyRound } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useUserAuth } from '../../../context/UserAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function SecuritySettingsCard() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [formData, setFormData] = useState({ otp: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const toast = useToast();
  const { getAuthHeader } = useUserAuth();

  useEffect(() => {
    const pwd = formData.newPassword;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  }, [formData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!otpRequested) return true;
    if (!formData.otp) { newErrors.otp = 'OTP is required'; }
    else if (!/^[0-9]{6}$/.test(formData.otp)) { newErrors.otp = 'OTP must be 6 digits'; }
    if (!formData.currentPassword) { newErrors.currentPassword = 'Current password is required'; }
    if (!formData.newPassword) { newErrors.newPassword = 'New password is required'; }
    else if (formData.newPassword.length < 8) { newErrors.newPassword = 'Password must be at least 8 characters'; }
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) { newErrors.newPassword = 'Password must contain uppercase, lowercase, and number'; }
    if (!formData.confirmPassword) { newErrors.confirmPassword = 'Please confirm your password'; }
    else if (formData.newPassword !== formData.confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; }
    if (formData.currentPassword === formData.newPassword) { newErrors.newPassword = 'New password must be different'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async () => {
    setIsRequestingOTP(true);
    try {
      const authHeaders = getAuthHeader();
      console.log('🔍 [SecuritySettings] Requesting OTP with auth');
      const response = await fetch(`${API_URL}/api/auth/change-password/request`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error(data.message || 'Failed to send OTP');
      }
      setOtpRequested(true);
      toast.success('OTP sent to your email');
    } catch (error) {
      console.error('❌ [SecuritySettings] OTP request error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const authHeaders = getAuthHeader();
      console.log('🔍 [SecuritySettings] Changing password with auth');
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ otp: formData.otp, currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error(data.message || 'Failed to change password');
      }
      setFormData({ otp: '', currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtpRequested(false);
      setIsChangingPassword(false);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('❌ [SecuritySettings] Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ otp: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setOtpRequested(false);
    setIsChangingPassword(false);
  };

  const getPasswordStrengthDisplay = () => {
    const strengths = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];
    return strengths[Math.min(passwordStrength, 4)];
  };

  const strengthDisplay = getPasswordStrengthDisplay();

  const inputBase = "w-full py-2.5 text-sm rounded-lg border transition-all bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite";
  const inputNormal = `${inputBase} pl-10 pr-12 border-tppslate/20 dark:border-tppdarkwhite/10 focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10`;
  const inputError = `${inputBase} pl-10 pr-12 border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;

  return (
    <div className="bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-tppslate/10 dark:border-tppdarkwhite/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-tppslate dark:text-tppdarkwhite flex items-center gap-2">
          <Shield className="w-4 h-4 text-tpppink dark:text-tppdarkwhite" />
          Security Settings
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-tppslate dark:text-tppdarkwhite bg-tppslate/5 dark:bg-tppdarkwhite/5 hover:bg-tppslate/10 dark:hover:bg-tppdarkwhite/10 border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg transition-colors"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            {/* OTP Request Section */}
            {!otpRequested ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Verification Required</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400/80 mb-2">We'll send a verification code to your email</p>
                    <button
                      onClick={handleRequestOTP}
                      disabled={isRequestingOTP}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRequestingOTP ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</>
                      ) : (
                        <><KeyRound className="w-3.5 h-3.5" />Send Code</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 ${
                      errors.otp
                        ? 'border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-tppslate/20 dark:border-tppdarkwhite/10 focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10'
                    }`}
                  />
                  {errors.otp && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.otp}</p>}
                  <p className="mt-1 text-xs text-tppslate/50 dark:text-tppdarkwhite/30">Check your email for the code</p>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={errors.currentPassword ? inputError : inputNormal}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tppslate/40 dark:text-tppdarkwhite/30 hover:text-tppslate dark:hover:text-tppdarkwhite"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={errors.newPassword ? inputError : inputNormal}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tppslate/40 dark:text-tppdarkwhite/30 hover:text-tppslate dark:hover:text-tppdarkwhite"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.newPassword}</p>}

                  {/* Password Strength */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-1.5 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strengthDisplay.color} transition-all duration-300`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-tppslate/60 dark:text-tppdarkwhite/50">
                          {strengthDisplay.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-tppslate/60 dark:text-tppdarkwhite/40">
                          <div className={`w-1 h-1 rounded-full ${formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-tppslate/20 dark:bg-tppdarkwhite/20'}`} />
                          8+ characters
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-tppslate/60 dark:text-tppdarkwhite/40">
                          <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-tppslate/20 dark:bg-tppdarkwhite/20'}`} />
                          Upper & lowercase
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-tppslate/60 dark:text-tppdarkwhite/40">
                          <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-tppslate/20 dark:bg-tppdarkwhite/20'}`} />
                          At least one number
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? inputError : inputNormal}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tppslate/40 dark:text-tppdarkwhite/30 hover:text-tppslate dark:hover:text-tppdarkwhite"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}

                  {formData.confirmPassword && formData.newPassword && (
                    <div className={`mt-1.5 flex items-center gap-1 text-xs ${
                      formData.newPassword === formData.confirmPassword
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formData.newPassword === formData.confirmPassword ? (
                        <><Check className="w-3 h-3" />Passwords match</>
                      ) : (
                        <><X className="w-3 h-3" />Passwords don't match</>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-tppslate dark:text-tppdarkwhite bg-white dark:bg-tppdark border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white dark:text-tppdark bg-tpppink dark:bg-tppdarkwhite rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                    ) : (
                      <><Check className="w-4 h-4" />Change Password</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}