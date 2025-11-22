// frontend/src/components/admin/layout/TopBar.jsx

import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';

export default function TopBar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'New order received', time: '5 min ago', unread: true },
    { id: 2, text: 'Low stock alert: Teddy Bear', time: '1 hour ago', unread: true },
    { id: 3, text: 'New customer registered', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-topbar flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface rounded-lg transition-colors text-text-primary"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:block w-full max-w-md">
          <SearchBar placeholder="Search products, orders, customers..." />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-surface rounded-lg transition-colors text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-hover border border-border z-50 animate-scale-in">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-admin-pink text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-custom">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border hover:bg-surface transition-colors cursor-pointer ${
                      notif.unread ? 'bg-admin-peach bg-opacity-30' : ''
                    }`}
                  >
                    <p className="text-sm text-text-primary">{notif.text}</p>
                    <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-border">
                <button className="text-sm text-admin-pink hover:underline font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-surface rounded-lg transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-admin-mint rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AD</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-text-primary">
              Admin
            </span>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-hover border border-border z-50 animate-scale-in">
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg transition-colors">
                  <Bell className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="my-1 border-t border-border" />
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}