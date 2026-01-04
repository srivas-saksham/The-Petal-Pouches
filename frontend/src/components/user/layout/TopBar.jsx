// frontend/src/components/user/layout/TopBar.jsx - WITH CART SIDEBAR INTEGRATION

import { Menu, Search, ShoppingBag, Bell, User, LogOut, X, Store, ShoppingCart, Circle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../../context/UserAuthContext';
import { useToast } from '../../../hooks/useToast';
import { useCart } from '../../../hooks/useCart'; // ✅ NEW IMPORT
import { useCartSidebar } from '../../../hooks/useCartSidebar'; // ✅ NEW IMPORT
import SmartBundleSearch from '../../common/SmartBundleSearch';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UserTopBar({ onMenuClick }) {
  const { logout, user } = useUserAuth();
  const { cartTotals } = useCart(); // ✅ NEW: Get cart data from context
  const { openCart } = useCartSidebar(); // ✅ NEW: Get cart sidebar functions
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // ✅ Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // ✅ MODIFIED: Get cart count from CartContext instead of API
  const cartCount = cartTotals?.item_count || 0;

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchFocused(false);
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

  // ✅ MODIFIED: Open cart sidebar instead of navigating
  const handleCartClick = () => {
    openCart(); // Opens the cart sidebar
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-tppslate/10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:block w-full max-w-md relative">
              <SmartBundleSearch 
                placeholder="Search bundles..."
                onNavigate={(path) => navigate(path)}
              />
            </div>
          </div>

          {/* Right Section - Cart, Notifications, User */}
          <div className="flex items-center gap-3 ml-4">
            {/* Go to Home Link */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg 
                text-tpppink hover:bg-pink-50 hover:text-tpppink/90 transition-all
                text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30"
              title="Go to Home"
            >
              {/* <Store size={16} /> */}
              <span>Go to Home</span>
            </button>

            {/* Divider */}
            <Circle size={6} className="hidden sm:block text-tpppink fill-current" />

            {/* Go to Shop Link */}
            <button
              onClick={() => navigate('/shop')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg 
                text-tpppink hover:bg-pink-50 hover:text-tpppink/90 transition-all
                text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30"
              title="Go to Shop"
            >
              {/* <Store size={16} /> */}
              <span>Go to Shop</span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-tpppeach/30 rounded-lg transition-all duration-200 group border-2 border-transparent hover:border-tppslate"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-semibold">
                    {getInitials(user?.name)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-tppslate leading-tight">
                    {user?.name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-tppslate/60 leading-tight">
                    Account
                  </p>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border-2 border-tppslate/10 z-50 animate-scale-in">
                  <div className="p-4 border-b-2 border-tppslate/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-semibold">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-tppslate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-tppslate/60">
                          {user?.email || 'email@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {/* Profile Link */}
                    <button
                      onClick={() => {
                        navigate('/user/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tppslate hover:bg-tpppeach/20 rounded-lg transition-all duration-200 font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>

                    {/* Dashboard Link */}
                    <button
                      onClick={() => {
                        navigate('/user/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tppslate hover:bg-tpppeach/20 rounded-lg transition-all duration-200 font-medium"
                    >
                      <Menu className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>

                    {/* Settings Link */}
                    <button
                      onClick={() => {
                        navigate('/user/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tppslate hover:bg-tpppeach/20 rounded-lg transition-all duration-200 font-medium"
                    >
                      <span className="text-lg">⚙️</span>
                      <span>Settings</span>
                    </button>

                    <div className="my-2 border-t-2 border-tppslate/10" />

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium border-2 border-transparent hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
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

            {/* Cart Button - Opens Sidebar */}
            <button
              onClick={handleCartClick}
              className="relative p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 
                hover:border-tpppink hover:text-tpppink transition-all text-slate-600
                focus:outline-none focus:ring-2 focus:ring-tpppink/30"
              title="Shopping Cart"
              aria-label={`Shopping Cart (${cartCount} items)`}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tpppink text-white text-[10px] font-bold 
                  rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1
                  border-2 border-white shadow-sm animate-in zoom-in-50 duration-200">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 sm:px-6 py-3 border-t-2 border-tppslate/10 bg-tpppeach/5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-tppslate/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border-2 border-tppslate/10 rounded-lg text-sm text-tppslate placeholder-tppslate/50 focus:outline-none focus:border-tpppink"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium text-sm hover:bg-tpppink/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}