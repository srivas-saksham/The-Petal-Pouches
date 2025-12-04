// frontend/src/components/shop/UserProfileMenu.jsx
// Professional Dropdown Menu for Authenticated Users

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';

/**
 * UserProfileMenu Component
 * Beautiful animated dropdown menu for authenticated users
 * 
 * FEATURES:
 * - Shows user avatar with initials
 * - Displays user name and email
 * - Quick navigation to all user pages
 * - Professional logout functionality
 * - Click outside to close
 * - Smooth animations
 * 
 * @param {Object} user - User object from auth context
 */
const UserProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useUserAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  // Menu items configuration
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/user/dashboard',
      description: 'Overview & stats'
    },
    {
      icon: Package,
      label: 'Orders',
      path: '/user/orders',
      description: 'Track your orders'
    },
    {
      icon: Heart,
      label: 'Wishlist',
      path: '/user/wishlist',
      description: 'Saved items'
    },
    {
      icon: MapPin,
      label: 'Addresses',
      path: '/user/addresses',
      description: 'Manage addresses'
    },
    {
      icon: Settings,
      label: 'Profile Settings',
      path: '/user/profile',
      description: 'Account settings'
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${isOpen 
            ? 'border-tpppink bg-pink-50 text-tpppink' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700'
          }
          focus:outline-none focus:ring-2 focus:ring-tpppink/30`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* User Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${isOpen ? 'bg-tpppink text-white' : 'bg-gradient-to-br from-tpppink to-tpppeach text-white'}`}
        >
          {getInitials(user?.name)}
        </div>

        {/* User Name (hidden on mobile) */}
        <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
          {user?.name?.split(' ')[0] || 'User'}
        </span>

        {/* Chevron Icon */}
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl 
          overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
          // style={{
          //   backgroundImage: 'url(/assets/doodle_bg.png)',
          //   backgroundRepeat: 'repeat',
          //   backgroundSize: 'auto',
          // }}
        >
          
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-pink-50 to-orange-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tpppink to-tpppeach 
                flex items-center justify-center text-white text-lg font-bold shadow-md">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setIsOpen(false);
                  navigate(item.path);
                }}
                className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 
                  transition-colors group text-left"
              >
                <item.icon 
                  size={18} 
                  className="text-slate-400 group-hover:text-tpppink transition-colors flex-shrink-0 mt-0.5" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 group-hover:text-tpppink transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 
                rounded-lg transition-colors group text-left"
            >
              <LogOut 
                size={18} 
                className="text-slate-400 group-hover:text-red-600 transition-colors" 
              />
              <span className="text-sm font-medium text-slate-900 group-hover:text-red-600 transition-colors">
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;