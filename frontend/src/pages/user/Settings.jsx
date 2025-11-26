// frontend/src/pages/user/Settings.jsx

import { useState, useEffect } from 'react';
import { Bell, Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const SettingSkeleton = () => (
  <div className="border border-tppslate/10 rounded-lg p-2.5 animate-pulse">
    <div className="h-3 bg-tppslate/10 rounded w-24 mb-2"></div>
    <div className="h-3 bg-tppslate/10 rounded w-full"></div>
  </div>
);

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { token } = useUserAuth();
  const toast = useToast();

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPreferences(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);

    try {
      await fetch(`${API_URL}/api/users/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: updated[key] }),
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Error updating preference');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword?.trim()) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordData.newPassword?.trim()) {
      toast.error('New password is required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully');
        setEditingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-base font-bold text-tppslate">Settings</h1>
        <p className="text-xs text-tppslate/60">Manage your preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-tppslate/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-tppslate/10">
          <Bell className="w-4 h-4 text-tpppink" />
          <h2 className="text-xs font-bold text-tppslate">Notifications</h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            <SettingSkeleton />
            <SettingSkeleton />
            <SettingSkeleton />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-2 hover:bg-tppslate/5 rounded transition-colors">
              <div>
                <p className="text-xs font-medium text-tppslate">Email Notifications</p>
                <p className="text-xs text-tppslate/60">Order updates and promotions</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('emailNotifications')}
                className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                  preferences.emailNotifications
                    ? 'bg-tpppink'
                    : 'bg-tppslate/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-2 hover:bg-tppslate/5 rounded transition-colors">
              <div>
                <p className="text-xs font-medium text-tppslate">SMS Notifications</p>
                <p className="text-xs text-tppslate/60">Important updates via SMS</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('smsNotifications')}
                className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                  preferences.smsNotifications
                    ? 'bg-tpppink'
                    : 'bg-tppslate/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    preferences.smsNotifications ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-2 hover:bg-tppslate/5 rounded transition-colors">
              <div>
                <p className="text-xs font-medium text-tppslate">Push Notifications</p>
                <p className="text-xs text-tppslate/60">Browser push alerts</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('pushNotifications')}
                className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                  preferences.pushNotifications
                    ? 'bg-tpppink'
                    : 'bg-tppslate/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    preferences.pushNotifications ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-2 hover:bg-tppslate/5 rounded transition-colors">
              <div>
                <p className="text-xs font-medium text-tppslate">Marketing Emails</p>
                <p className="text-xs text-tppslate/60">Deals and special offers</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('marketingEmails')}
                className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                  preferences.marketingEmails
                    ? 'bg-tpppink'
                    : 'bg-tppslate/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    preferences.marketingEmails ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Settings */}
      <div className="bg-white border border-tppslate/10 rounded-lg p-3">
        <div className="flex items-center justify-between pb-2 border-b border-tppslate/10">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-tpppink" />
            <h2 className="text-xs font-bold text-tppslate">Password</h2>
          </div>
          {!editingPassword && (
            <button
              onClick={() => setEditingPassword(true)}
              className="text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors"
            >
              Change
            </button>
          )}
        </div>

        {editingPassword ? (
          <div className="mt-2 space-y-2">
            {/* Current Password */}
            <div>
              <label className="text-xs font-medium text-tppslate/80 block mb-0.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter current password"
                  className="w-full px-2 py-1 text-xs border border-tppslate/20 rounded focus:outline-none focus:border-tpppink bg-white text-tppslate pr-8"
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-tppslate/60 hover:text-tppslate"
                >
                  {showPasswords ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-medium text-tppslate/80 block mb-0.5">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter new password"
                className="w-full px-2 py-1 text-xs border border-tppslate/20 rounded focus:outline-none focus:border-tpppink bg-white text-tppslate"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-tppslate/80 block mb-0.5">Confirm Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="Confirm new password"
                className="w-full px-2 py-1 text-xs border border-tppslate/20 rounded focus:outline-none focus:border-tpppink bg-white text-tppslate"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-tppslate/10">
              <button
                onClick={handlePasswordChange}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-tpppink text-white text-xs font-medium rounded hover:bg-tpppink/90 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-tppslate/20 text-tppslate text-xs font-medium rounded hover:bg-tppslate/5 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-tppslate/60 mt-2">Last changed: Not available</p>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="bg-white border border-tppslate/10 rounded-lg p-3">
        <h2 className="text-xs font-bold text-tppslate mb-2">Data & Privacy</h2>
        <div className="space-y-1">
          <p className="text-xs text-tppslate/60">
            Your data is encrypted and secure. We never share your information with third parties.
          </p>
          <button className="text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors">
            Privacy Policy →
          </button>
        </div>
      </div>
    </div>
  );
}