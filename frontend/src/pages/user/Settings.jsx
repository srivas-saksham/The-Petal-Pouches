// frontend/src/pages/user/Settings.jsx

import React, { useState } from 'react';
import { Settings, Bell, Lock, Eye, Save, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const SettingsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    // Notifications
    order_updates: true,
    marketing_emails: false,
    promotional_offers: true,
    shipping_notifications: true,
    payment_alerts: true,
    
    // Privacy
    profile_visibility: 'private',
    email_visibility: 'private',
    phone_visibility: 'private',
    
    // Preferences
    currency: 'INR',
    language: 'en',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
          <Settings className="w-8 h-8 text-tpppink" />
          Settings
        </h1>
        <p className="text-tppslate/70">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border-2 border-tppslate/10 overflow-hidden">
        <div className="flex border-b-2 border-tppslate/10">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-tpppeach/20 text-tppslate border-b-4 border-tpppink -mb-2'
                : 'text-tppslate/70 hover:text-tppslate'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-tpppeach/20 text-tppslate border-b-4 border-tpppink -mb-2'
                : 'text-tppslate/70 hover:text-tppslate'
            }`}
          >
            <Lock className="w-5 h-5" />
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-tpppeach/20 text-tppslate border-b-4 border-tpppink -mb-2'
                : 'text-tppslate/70 hover:text-tppslate'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <p className="text-tppslate/70 mb-6">Choose what notifications you want to receive</p>

              {[
                { key: 'order_updates', label: 'Order Updates', description: 'Get notified about your order status' },
                { key: 'shipping_notifications', label: 'Shipping Notifications', description: 'Receive shipping and tracking updates' },
                { key: 'payment_alerts', label: 'Payment Alerts', description: 'Important payment notifications' },
                { key: 'promotional_offers', label: 'Promotional Offers', description: 'Special deals and discounts' },
                { key: 'marketing_emails', label: 'Marketing Emails', description: 'New product announcements and news' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-tpppeach/10 rounded-lg">
                  <div>
                    <p className="font-semibold text-tppslate">{item.label}</p>
                    <p className="text-sm text-tppslate/60">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative w-12 h-7 rounded-full transition-all ${
                      settings[item.key] ? 'bg-tppmint' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings[item.key] ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <p className="text-tppslate/70 mb-6">Control who can see your information</p>

              {[
                { key: 'profile_visibility', label: 'Profile Visibility' },
                { key: 'email_visibility', label: 'Email Visibility' },
                { key: 'phone_visibility', label: 'Phone Visibility' },
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <label className="block font-semibold text-tppslate">{item.label}</label>
                  <select
                    value={settings[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink"
                  >
                    <option value="private">Private (Only me)</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              ))}

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Privacy Reminder</p>
                  <p className="text-sm text-yellow-800">We'll always protect your data. These settings only affect visibility on your profile.</p>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <p className="text-tppslate/70 mb-6">Customize your experience</p>

              <div className="space-y-2">
                <label className="block font-semibold text-tppslate">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-tppslate">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                </select>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex gap-3 pt-6 border-t-2 border-tppslate/10">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;