// frontend/src/pages/admin/SettingsPage.jsx

import { useState } from 'react';
import { User, Bell, Shield, Globe, Save, Database } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@petalpouches.com',
    phone: '9876543210',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    lowStockAlerts: true,
    newCustomerAlerts: false,
    systemUpdates: true,
    emailNotifications: true,
  });

  // Store Settings
  const [store, setStore] = useState({
    storeName: 'The Petal Pouches',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleStoreChange = (e) => {
    setStore({ ...store, [e.target.name]: e.target.value });
  };

  const handleSave = async (settingType) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate API call
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `${settingType} settings saved successfully!` 
      });
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'store', label: 'Store Settings', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      {/* Messages */}
      {message.text && (
        <div className={`
          p-4 rounded-lg border animate-slide-in
          ${message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          {message.text}
        </div>
      )}

      {/* Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                      transition-all font-medium
                      ${activeTab === tab.id
                        ? 'bg-admin-pink text-white'
                        : 'text-text-secondary hover:bg-surface'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Profile Information
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Update your account profile information
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="primary"
                    icon={<Save className="w-5 h-5" />}
                    onClick={() => handleSave('Profile')}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Choose what notifications you want to receive
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 bg-surface rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text-primary">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-sm text-text-secondary mt-1">
                          {key === 'orderNotifications' && 'Get notified about new orders'}
                          {key === 'lowStockAlerts' && 'Alerts when products are low in stock'}
                          {key === 'newCustomerAlerts' && 'Notifications for new customer registrations'}
                          {key === 'systemUpdates' && 'Important system updates and maintenance'}
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                        </div>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle(key)}
                          className="sr-only peer"
                        />
                        <div className={`
                          w-12 h-6 rounded-full transition-colors cursor-pointer
                          ${value ? 'bg-admin-pink' : 'bg-admin-grey'}
                        `}>
                          <div className={`
                            absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                            ${value ? 'translate-x-6' : 'translate-x-0'}
                          `} />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="primary"
                    icon={<Save className="w-5 h-5" />}
                    onClick={() => handleSave('Notification')}
                    loading={loading}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* Store Settings */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Store Configuration
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Configure your store settings and preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Store Name</label>
                    <input
                      type="text"
                      name="storeName"
                      value={store.storeName}
                      onChange={handleStoreChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Currency</label>
                    <select
                      name="currency"
                      value={store.currency}
                      onChange={handleStoreChange}
                      className="form-input"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Timezone</label>
                    <select
                      name="timezone"
                      value={store.timezone}
                      onChange={handleStoreChange}
                      className="form-input"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Language</label>
                    <select
                      name="language"
                      value={store.language}
                      onChange={handleStoreChange}
                      className="form-input"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="primary"
                    icon={<Save className="w-5 h-5" />}
                    onClick={() => handleSave('Store')}
                    loading={loading}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Security Settings
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Manage your account security and password
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">
                          Change Password
                        </h4>
                        <p className="text-sm text-yellow-800">
                          For security reasons, password changes are handled through a secure process.
                          Please contact your system administrator or use the password reset link.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="form-input"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="form-input"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="form-input"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="primary"
                    icon={<Save className="w-5 h-5" />}
                    disabled
                  >
                    Update Password
                  </Button>
                  <p className="text-xs text-text-muted mt-2">
                    Password management coming soon
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}