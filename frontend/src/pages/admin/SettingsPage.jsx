// frontend/src/pages/admin/SettingsPage.jsx

import { useState } from 'react';
import { 
  User, 
  Store, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'The Petal Pouches',
    store_email: 'contact@thepetalpouches.com',
    store_phone: '+91 9876543210',
    store_address: 'New Delhi, India',
    currency: 'INR',
    currency_symbol: '₹',
    tax_rate: '18',
    shipping_fee: '50',
    free_shipping_threshold: '500',
  });

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    admin_name: 'Admin User',
    admin_email: 'admin@thepetalpouches.com',
    admin_phone: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_orders: true,
    email_low_stock: true,
    email_customer_messages: false,
    push_new_orders: true,
    push_low_stock: true,
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    sidebar_collapsed: false,
    items_per_page: '20',
  });

  const tabs = [
    { id: 'store', label: 'Store', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, save to backend/localStorage
    try {
      localStorage.setItem('admin_store_settings', JSON.stringify(storeSettings));
      localStorage.setItem('admin_profile_settings', JSON.stringify(profileSettings));
      localStorage.setItem('admin_notification_settings', JSON.stringify(notificationSettings));
      localStorage.setItem('admin_appearance_settings', JSON.stringify(appearanceSettings));

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Store Name</label>
          <input
            type="text"
            value={storeSettings.store_name}
            onChange={(e) => setStoreSettings(s => ({ ...s, store_name: e.target.value }))}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Store Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="email"
              value={storeSettings.store_email}
              onChange={(e) => setStoreSettings(s => ({ ...s, store_email: e.target.value }))}
              className="form-input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="form-label">Store Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="tel"
              value={storeSettings.store_phone}
              onChange={(e) => setStoreSettings(s => ({ ...s, store_phone: e.target.value }))}
              className="form-input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="form-label">Store Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={storeSettings.store_address}
              onChange={(e) => setStoreSettings(s => ({ ...s, store_address: e.target.value }))}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <h3 className="text-lg font-semibold text-text-primary">Pricing & Shipping</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="form-label">Currency</label>
          <select
            value={storeSettings.currency}
            onChange={(e) => setStoreSettings(s => ({ ...s, currency: e.target.value }))}
            className="form-input"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div>
          <label className="form-label">Tax Rate (%)</label>
          <input
            type="number"
            value={storeSettings.tax_rate}
            onChange={(e) => setStoreSettings(s => ({ ...s, tax_rate: e.target.value }))}
            className="form-input"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="form-label">Shipping Fee (₹)</label>
          <input
            type="number"
            value={storeSettings.shipping_fee}
            onChange={(e) => setStoreSettings(s => ({ ...s, shipping_fee: e.target.value }))}
            className="form-input"
            min="0"
          />
        </div>
        <div>
          <label className="form-label">Free Shipping Above (₹)</label>
          <input
            type="number"
            value={storeSettings.free_shipping_threshold}
            onChange={(e) => setStoreSettings(s => ({ ...s, free_shipping_threshold: e.target.value }))}
            className="form-input"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-admin-pink text-white flex items-center justify-center text-3xl font-bold">
          {profileSettings.admin_name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-text-primary">{profileSettings.admin_name}</h3>
          <p className="text-text-secondary">Administrator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={profileSettings.admin_name}
            onChange={(e) => setProfileSettings(s => ({ ...s, admin_name: e.target.value }))}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={profileSettings.admin_email}
            onChange={(e) => setProfileSettings(s => ({ ...s, admin_email: e.target.value }))}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            value={profileSettings.admin_phone}
            onChange={(e) => setProfileSettings(s => ({ ...s, admin_phone: e.target.value }))}
            className="form-input"
            placeholder="Optional"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'email_new_orders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
            { key: 'email_low_stock', label: 'Low Stock Alerts', desc: 'Get notified when products are running low' },
            { key: 'email_customer_messages', label: 'Customer Messages', desc: 'Get notified for customer inquiries' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-4 bg-surface rounded-lg cursor-pointer hover:bg-admin-grey transition-colors">
              <div>
                <div className="font-medium text-text-primary">{item.label}</div>
                <div className="text-sm text-text-secondary">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[item.key]}
                onChange={(e) => setNotificationSettings(s => ({ ...s, [item.key]: e.target.checked }))}
                className="w-5 h-5 text-admin-pink rounded focus:ring-admin-pink"
              />
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'push_new_orders', label: 'New Orders', desc: 'Browser notifications for new orders' },
            { key: 'push_low_stock', label: 'Low Stock Alerts', desc: 'Browser notifications for low stock' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-4 bg-surface rounded-lg cursor-pointer hover:bg-admin-grey transition-colors">
              <div>
                <div className="font-medium text-text-primary">{item.label}</div>
                <div className="text-sm text-text-secondary">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[item.key]}
                onChange={(e) => setNotificationSettings(s => ({ ...s, [item.key]: e.target.checked }))}
                className="w-5 h-5 text-admin-pink rounded focus:ring-admin-pink"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">Theme</label>
        <div className="grid grid-cols-2 gap-4">
          {['light', 'dark'].map(theme => (
            <label
              key={theme}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${appearanceSettings.theme === theme 
                  ? 'border-admin-pink bg-admin-peach' 
                  : 'border-border hover:border-admin-pink/50'
                }
              `}
            >
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={appearanceSettings.theme === theme}
                onChange={(e) => setAppearanceSettings(s => ({ ...s, theme: e.target.value }))}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`
                  w-12 h-12 mx-auto rounded-lg mb-2
                  ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800'}
                `}></div>
                <span className="font-medium text-text-primary capitalize">{theme}</span>
              </div>
            </label>
          ))}
        </div>
        <p className="text-sm text-text-muted mt-2">Dark theme coming soon!</p>
      </div>

      <div>
        <label className="form-label">Items Per Page</label>
        <select
          value={appearanceSettings.items_per_page}
          onChange={(e) => setAppearanceSettings(s => ({ ...s, items_per_page: e.target.value }))}
          className="form-input w-48"
        >
          <option value="10">10 items</option>
          <option value="20">20 items</option>
          <option value="50">50 items</option>
          <option value="100">100 items</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-surface rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Change Password</h3>
        <p className="text-sm text-text-secondary mb-4">
          Update your password to keep your account secure
        </p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Enter new password" />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" placeholder="Confirm new password" />
          </div>
          <Button variant="outline">Update Password</Button>
        </div>
      </div>

      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
          Delete Account
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'store': return renderStoreSettings();
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      default: return renderStoreSettings();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your store and account settings"
        actions={
          <Button
            variant="primary"
            icon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            loading={saving}
          >
            Save Changes
          </Button>
        }
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-6">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${activeTab === tab.id
                        ? 'bg-admin-pink text-white'
                        : 'text-text-secondary hover:bg-surface'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}