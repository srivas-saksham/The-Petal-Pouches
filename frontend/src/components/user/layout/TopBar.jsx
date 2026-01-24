// frontend/src/components/user/layout/TopBar.jsx - WITH CART SIDEBAR INTEGRATION + MOBILE ENHANCEMENTS

import { Menu, Search, Store, Bell, User, LogOut, X, House, ShoppingCart, Circle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../../context/UserAuthContext';
import { useToast } from '../../../hooks/useToast';
import { useCart } from '../../../hooks/useCart';
import { useCartSidebar } from '../../../hooks/useCartSidebar';
import SmartBundleSearch from '../../common/SmartBundleSearch';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UserTopBar({ onMenuClick }) {
  const { logout, user } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // ⭐ SCROLL HIDE/SHOW STATE (Mobile Search Bar)
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const cartCount = cartTotals?.item_count || 0;

  // ⭐ SCROLL DETECTION FOR MOBILE SEARCH BAR (Identical to BundleHeader)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ignore tiny scroll movements
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }

      // Scrolling down - hide breadcrumb
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsMobileSearchVisible(false);
      } 
      // Scrolling up - show breadcrumb immediately
      else if (currentScrollY < lastScrollY.current) {
        setIsMobileSearchVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

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

  const handleCartClick = () => {
    openCart();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b-2 border-tppslate/10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="lg:hidden hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* ⭐ MOBILE BRAND TEXT (Italianno Font) */}
              <div className="md:hidden">
                {/* Logo - Left */}
                <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                  <h1 className="text-5xl font-italianno text-tpppink hover:text-tpppink/80 transition-colors mt-2">
                    Rizara
                  </h1>
                </Link>
              </div>

              {/* Desktop Search Bar */}
              <div className="hidden md:block w-full max-w-md relative">
                <SmartBundleSearch 
                  placeholder="Search for your wishes here..."
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
                <span>Go to Shop</span>
              </button>

              {/* ⭐ MOBILE Navigation Shortcuts (Home & Shop) */}
              <button
                onClick={() => navigate('/')}
                className="sm:hidden hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
                title="Go to Home"
                aria-label="Go to Home"
              >
                <House size={18} />
              </button>

              {/* Divider */}
              <Circle size={6} className="lg:hidden sm:block text-tppslate fill-current" />

              <button
                onClick={() => navigate('/shop')}
                className="sm:hidden hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
                title="Go to Shop"
                aria-label="Go to Shop"
              >
                <Store size={18} />
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-tppslate/10 z-50 animate-scale-in overflow-hidden">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-tppslate/5 to-tpppink/5 border-b border-tppslate/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-tpppink to-tppslate rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                            <span className="text-white text-sm font-bold">
                              {getInitials(user?.name)}
                            </span>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-tppslate truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-tppslate/60 truncate">
                            {user?.email || 'email@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {/* Profile Link */}
                      <button
                        onClick={() => {
                          navigate('/user/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-tppslate hover:bg-tppslate/5 rounded-lg transition-all duration-200 font-medium group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-tppslate/5 group-hover:bg-tppslate/10 transition-colors">
                          <User className="w-4 h-4 text-tppslate" />
                        </div>
                        <span>My Profile</span>
                      </button>

                      <div className="my-2 border-t border-tppslate/10" />

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                          {isLoggingOut ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
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

        {/* ⭐ MOBILE SEARCH WITH SCROLL ANIMATION (Identical to BundleHeader) */}
        <div
          className={`md:hidden px-4 sm:px-6 py-3 border-t-2 border-tppslate/10 bg-tpppeach/5 transition-transform duration-300 ease-in-out ${
            isMobileSearchVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <SmartBundleSearch 
            placeholder="Search for your wishes here..."
            onNavigate={(path) => navigate(path)}
          />
        </div>
      </header>
    </>
  );
}