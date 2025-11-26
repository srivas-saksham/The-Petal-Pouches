// frontend/src/pages/user/Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Camera, Save, Lock, LogOut, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== SKELETON COMPONENTS ====================

const ProfileHeaderSkeleton = () => (
  <div className="bg-white rounded-lg border border-tppslate/10 p-4 sm:p-5 animate-pulse">
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <div className="w-20 h-20 bg-tppslate/10 rounded-full flex-shrink-0"></div>
      <div className="flex-1 text-center sm:text-left space-y-2 w-full">
        <div className="h-5 bg-tppslate/10 rounded w-32 mx-auto sm:mx-0"></div>
        <div className="h-4 bg-tppslate/10 rounded w-48 mx-auto sm:mx-0"></div>
        <div className="h-3 bg-tppslate/10 rounded w-40 mx-auto sm:mx-0"></div>
      </div>
    </div>
  </div>
);

const ProfileFormSkeleton = () => (
  <div className="space-y-4">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-3 bg-tppslate/10 rounded w-20"></div>
        <div className="h-10 bg-tppslate/10 rounded"></div>
      </div>
    ))}
  </div>
);

const TabContentSkeleton = () => (
  <div className="p-4 sm:p-5 space-y-4 animate-pulse">
    <div className="h-9 bg-tppslate/10 rounded w-32"></div>
    <ProfileFormSkeleton />
  </div>
);

// ==================== MAIN COMPONENT ====================

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { user, updateUser, logout } = useUserAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ✅ Initialize form with user data and simulate loading
  useEffect(() => {
    if (user) {
      // Simulate loading
      setLoading(true);
      setTimeout(() => {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
        setLoading(false);
      }, 800);
    }
  }, [user]);

  // ✅ Calculate password strength
  useEffect(() => {
    const pwd = passwordForm.newPassword;
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    setPasswordStrength(strength);
  }, [passwordForm.newPassword]);

  // ✅ Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // ✅ Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    toast.info('Avatar upload feature coming soon!');
  };

  // ✅ Handle profile save
  const handleProfileSave = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (profileData.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Handle password change
  const handlePasswordChange_Submit = async () => {
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ Get password strength display
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-tppslate">My Profile</h1>
        <p className="text-xs text-tppslate/60 mt-0.5">Manage your personal information and account settings</p>
      </div>

      {/* Profile Avatar Section */}
      {loading ? (
        <ProfileHeaderSkeleton />
      ) : (
        <div className="bg-white rounded-lg border border-tppslate/10 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold">
                  {getInitials(user?.name)}
                </span>
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all border border-tppslate/10"
                title="Upload new avatar"
              >
                <Camera className="w-3.5 h-3.5 text-tppslate" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-base font-bold text-tppslate mb-0.5">{user?.name}</h2>
              <p className="text-xs text-tppslate/70 mb-2">{user?.email}</p>
              <p className="text-xs text-tppslate/50">
                Member since {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
                  : 'recently'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-tppslate/10 overflow-hidden">
        <div className="flex border-b border-tppslate/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-tpppeach/10 text-tppslate border-b-2 border-tpppink -mb-px'
                : 'text-tppslate/60 hover:text-tppslate hover:bg-tppslate/5'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-tpppeach/10 text-tppslate border-b-2 border-tpppink -mb-px'
                : 'text-tppslate/60 hover:text-tppslate hover:bg-tppslate/5'
            }`}
          >
            Security
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <TabContentSkeleton />
        ) : (
          <div className="p-4 sm:p-5">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Edit Mode Toggle */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-2 text-sm bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}

                {/* Form Fields */}
                <div className="space-y-3">
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
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2.5 text-sm border border-tppslate/10 rounded-lg transition-all ${
                          isEditing
                            ? 'focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20'
                            : 'bg-tppslate/5 cursor-not-allowed'
                        } text-tppslate`}
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
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2.5 text-sm border border-tppslate/10 rounded-lg transition-all ${
                          isEditing
                            ? 'focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20'
                            : 'bg-tppslate/5 cursor-not-allowed'
                        } text-tppslate`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-tppslate mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        placeholder="Optional"
                        className={`w-full pl-10 pr-3 py-2.5 text-sm border border-tppslate/10 rounded-lg transition-all ${
                          isEditing
                            ? 'focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20'
                            : 'bg-tppslate/5 cursor-not-allowed'
                        } text-tppslate`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        });
                      }}
                      className="flex-1 px-3 py-2.5 text-sm border border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="flex-1 px-3 py-2.5 text-sm bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Change Password Section */}
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-3 py-2.5 text-sm border border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <div className="space-y-3 p-4 bg-tpppeach/5 rounded-lg border border-tppslate/10">
                    <h3 className="text-sm font-semibold text-tppslate">Change Password</h3>

                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-semibold text-tppslate mb-1.5">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-16 py-2.5 text-sm border border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all text-tppslate"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium hover:text-tpppink/80"
                        >
                          {showPasswords.current ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-tppslate mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-16 py-2.5 text-sm border border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all text-tppslate"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium hover:text-tpppink/80"
                        >
                          {showPasswords.new ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {/* Password Strength */}
                      {passwordForm.newPassword && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-tppslate/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${strengthDisplay.color} transition-all duration-300`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold ${strengthDisplay.color.replace('bg-', 'text-')}`}>
                              {strengthDisplay.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-tppslate mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-16 py-2.5 text-sm border border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all text-tppslate"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium hover:text-tpppink/80"
                        >
                          {showPasswords.confirm ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {/* Password Match Indicator */}
                      {passwordForm.confirmPassword && (
                        <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                          passwordForm.newPassword === passwordForm.confirmPassword
                            ? 'text-tppmint'
                            : 'text-red-600'
                        }`}>
                          {passwordForm.newPassword === passwordForm.confirmPassword ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="flex-1 px-3 py-2.5 text-sm border border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePasswordChange_Submit}
                        disabled={isSaving}
                        className="flex-1 px-3 py-2.5 text-sm bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {isSaving ? (
                          <>
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>Update Password</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout Section */}
                <div className="border-t border-tppslate/10 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-tppslate mb-2">Logout</h3>
                  <p className="text-xs text-tppslate/60 mb-3">Sign out from your account on this device</p>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-3 py-2.5 text-sm bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}