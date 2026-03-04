// frontend/src/components/shop/UserProfileMenu.jsx
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

const UserProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useUserAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard', description: 'Overview & stats' },
    { icon: Package, label: 'Orders', path: '/user/orders', description: 'Track your orders' },
    { icon: Heart, label: 'Wishlist', path: '/user/wishlist', description: 'Saved items' },
    { icon: MapPin, label: 'Addresses', path: '/user/addresses', description: 'Manage addresses' },
    { icon: Settings, label: 'Profile Settings', path: '/user/profile', description: 'Account settings' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg border border-transparent transition-all ${
          isOpen
            ? 'text-tpppink dark:text-tppdarkwhite'
            : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
        }`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all">
          <User size={22} />
        </div>
        <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-tppdarkgray rounded-xl border border-slate-200 dark:border-tppdarkwhite/10 shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">

          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-tppdark dark:to-tppdarkgray border-b border-slate-100 dark:border-tppdarkwhite/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tpppink to-tpppeach dark:from-tppdarkwhite/20 dark:to-tppdarkwhite/10 flex items-center justify-center text-white dark:text-tppdarkwhite font-inter text-lg font-bold shadow-md">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-tppslate dark:text-tppdarkwhite truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-600 dark:text-tppdarkwhite/50 truncate">
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
                onClick={() => { setIsOpen(false); navigate(item.path); }}
                className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 transition-colors group text-left"
              >
                <item.icon
                  size={18}
                  className="text-slate-400 dark:text-tppdarkwhite/40 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-tppdarkwhite/70 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-100 dark:border-tppdarkwhite/10 p-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group text-left"
            >
              <LogOut
                size={18}
                className="text-slate-400 dark:text-tppdarkwhite/40 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-tppdarkwhite group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
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