// frontend/src/pages/user/Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Camera, Save, Lock, LogOut, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // ✅ Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
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

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // TODO: Upload to Cloudinary
    toast.info('Avatar upload feature coming soon!');
  };

  // ✅ Handle profile save
  const handleProfileSave = async () => {
    // Validate
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
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/api/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(profileData),
      // });

      // Simulate API call
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
    // Validate
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
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/api/profile/password`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     currentPassword: passwordForm.currentPassword,
      //     newPassword: passwordForm.newPassword,
      //   }),
      // });

      // Simulate API call
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-tppslate mb-2">My Profile</h1>
        <p className="text-tppslate/70">Manage your personal information and account settings</p>
      </div>

      {/* Profile Avatar Section */}
      <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-5xl font-bold">
                {getInitials(user?.name)}
              </span>
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all border-2 border-tppslate/10"
              title="Upload new avatar"
            >
              <Camera className="w-5 h-5 text-tppslate" />
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
            <h2 className="text-2xl font-bold text-tppslate mb-1">{user?.name}</h2>
            <p className="text-tppslate/70 mb-4">{user?.email}</p>
            <p className="text-sm text-tppslate/60 mb-4">
              Member since {user?.created_at 
                ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
                : 'recently'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-tppslate/10 overflow-hidden">
        <div className="flex border-b-2 border-tppslate/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-tpppeach/20 text-tppslate border-b-4 border-tpppink -mb-2'
                : 'text-tppslate/70 hover:text-tppslate'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === 'security'
                ? 'bg-tpppeach/20 text-tppslate border-b-4 border-tpppink -mb-2'
                : 'text-tppslate/70 hover:text-tppslate'
            }`}
          >
            Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Edit Mode Toggle */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors"
                >
                  Edit Profile
                </button>
              ) : null}

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl transition-all ${
                        isEditing
                          ? 'focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10'
                          : 'bg-tppslate/5 cursor-not-allowed'
                      } text-tppslate`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl transition-all ${
                        isEditing
                          ? 'focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10'
                          : 'bg-tppslate/5 cursor-not-allowed'
                      } text-tppslate`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-tppslate mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Optional"
                      className={`w-full pl-12 pr-4 py-3 border-2 border-tppslate/10 rounded-xl transition-all ${
                        isEditing
                          ? 'focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10'
                          : 'bg-tppslate/5 cursor-not-allowed'
                      } text-tppslate`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                      });
                    }}
                    className="flex-1 px-4 py-3 border-2 border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
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
            <div className="space-y-6">
              {/* Change Password Section */}
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full px-4 py-3 border-2 border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              ) : (
                <div className="space-y-5 p-6 bg-tpppeach/10 rounded-lg border-2 border-tppslate/10">
                  <h3 className="font-semibold text-tppslate">Change Password</h3>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-tppslate mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-10 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium"
                      >
                        {showPasswords.current ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-tppslate mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-10 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium"
                      >
                        {showPasswords.new ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {passwordForm.newPassword && (
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
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-tppslate mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-10 py-3 border-2 border-tppslate/10 rounded-xl focus:outline-none focus:border-tpppink focus:ring-4 focus:ring-tpppink/10 transition-all text-tppslate"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tpppink font-medium"
                      >
                        {showPasswords.confirm ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {passwordForm.confirmPassword && (
                      <div className={`mt-2 flex items-center gap-2 text-xs ${
                        passwordForm.newPassword === passwordForm.confirmPassword
                          ? 'text-tppmint'
                          : 'text-red-600'
                      }`}>
                        {passwordForm.newPassword === passwordForm.confirmPassword ? (
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="flex-1 px-4 py-3 border-2 border-tppslate/20 text-tppslate rounded-lg font-medium hover:border-tppslate/40 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange_Submit}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
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
              <div className="border-t-2 border-tppslate/10 pt-6 mt-6">
                <h3 className="font-semibold text-tppslate mb-3">Logout</h3>
                <p className="text-sm text-tppslate/70 mb-4">Sign out from your account on this device</p>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      </div>
    </div>
  );
}