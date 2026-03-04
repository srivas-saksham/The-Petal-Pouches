// frontend/src/components/user/layout/TopBar.jsx

import { Menu, Search, Store, Bell, User, LogOut, X, House, ShoppingCart, Circle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../../context/UserAuthContext';
import { useToast } from '../../../hooks/useToast';
import { useCart } from '../../../hooks/useCart';
import { useCartSidebar } from '../../../hooks/useCartSidebar';
import SmartBundleSearch from '../../common/SmartBundleSearch';
import { useBrand } from '../../../context/BrandContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UserTopBar({ onMenuClick }) {
  const { logout, user } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const navigate = useNavigate();
  const toast = useToast();
  const { brandMode, setBrandMode } = useBrand();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const cartCount = cartTotals?.item_count || 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsMobileSearchVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsMobileSearchVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchFocused(false);
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

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-tppdarkgray border-b-2 border-tppslate/10 dark:border-tppdarkwhite/10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={onMenuClick}
                className="lg:hidden hover:bg-tpppeach/30 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all duration-200 text-tppslate dark:text-tppdarkwhite border-2 border-transparent hover:border-tppslate dark:hover:border-tppdarkwhite/20"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center flex-shrink-0 mr-4 py-1 md:py-0">
                <Link to="/" className="relative inline-block">
                  <h1 className="text-5xl font-italianno text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 transition-colors">
                    Rizara
                  </h1>
                  <span className="font-yatraone absolute -right-1 bottom-1 uppercase text-[8px] tracking-[0.35em] font-light text-tpppink dark:text-tppdarkwhite/80 pointer-events-none">
                    {brandMode === 'feminine' ? 'Luxe' : 'Men'}
                  </span>
                </Link>
              </div>

              <div className="hidden md:block w-full max-w-md relative">
                <SmartBundleSearch
                  placeholder="Search for your wishes here..."
                  onNavigate={(path) => navigate(path)}
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-tpppink dark:text-tppdarkwhite hover:bg-pink-50 dark:hover:bg-tppdarkwhite/5 hover:text-tpppink/90 dark:hover:text-tppdarkwhite/80 transition-all
                  text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30 dark:focus:ring-tppdarkwhite/20"
                title="Go to Home"
              >
                <span>Go to Home</span>
              </button>

              <Circle size={6} className="hidden sm:block text-tpppink dark:text-tppdarkwhite/50 fill-current" />

              <button
                onClick={() => navigate('/shop')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-tpppink dark:text-tppdarkwhite hover:bg-pink-50 dark:hover:bg-tppdarkwhite/5 hover:text-tpppink/90 dark:hover:text-tppdarkwhite/80 transition-all
                  text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30 dark:focus:ring-tppdarkwhite/20"
                title="Go to Shop"
              >
                <span>Go to Shop</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="sm:hidden hover:bg-tpppeach/30 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all duration-200 text-tppslate dark:text-tppdarkwhite border-2 border-transparent hover:border-tppslate dark:hover:border-tppdarkwhite/20"
                title="Go to Home"
                aria-label="Go to Home"
              >
                <House size={18} />
              </button>

              <Circle size={6} className="lg:hidden sm:block text-tppslate dark:text-tppdarkwhite/50 fill-current" />

              <button
                onClick={() => navigate('/shop')}
                className="sm:hidden hover:bg-tpppeach/30 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all duration-200 text-tppslate dark:text-tppdarkwhite border-2 border-transparent hover:border-tppslate dark:hover:border-tppdarkwhite/20"
                title="Go to Shop"
                aria-label="Go to Shop"
              >
                <Store size={18} />
              </button>

              {/* BRAND TOGGLE — Desktop */}
              <div className="hidden sm:flex items-center bg-tpppink dark:bg-tppdarkwhite border border-[#e0e0e0] dark:border-tppdarkwhite/10 rounded-lg p-0.5 gap-0.5 font-inter">
                <button
                  onClick={() => setBrandMode('feminine')}
                  aria-label="Shop Women"
                  className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                    brandMode === 'feminine'
                      ? 'bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite shadow-sm'
                      : 'bg-transparent text-[#999] dark:text-tppdark/60 hover:text-[#555] dark:hover:text-tppdark'
                  }`}
                >
                  Women
                </button>
                <button
                  onClick={() => setBrandMode('masculine')}
                  aria-label="Shop Men"
                  className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                    brandMode === 'masculine'
                      ? 'bg-white dark:bg-tppdark text-[#130100] dark:text-tppdarkwhite shadow-sm'
                      : 'bg-transparent text-white dark:text-tppdarkwhite/40 hover:text-white/70 dark:hover:text-tppdarkwhite/70'
                  }`}
                >
                  Men
                </button>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-tpppeach/30 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all duration-200 group border-2 border-transparent hover:border-tppslate dark:hover:border-tppdarkwhite/20"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-tpppink to-tpppeach dark:from-tppdarkwhite dark:to-tppdarkwhite/70 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white dark:text-tppdark text-xs font-semibold">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-tppslate dark:text-tppdarkwhite leading-tight">
                      {user?.name?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-[10px] text-tppslate/60 dark:text-tppdarkwhite/50 leading-tight">
                      Account
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-tppdarkgray rounded-xl shadow-xl border border-tppslate/10 dark:border-tppdarkwhite/10 z-50 animate-scale-in overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-tppslate/5 to-tpppink/5 dark:from-tppdarkwhite/5 dark:to-tppdarkwhite/5 border-b border-tppslate/10 dark:border-tppdarkwhite/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-tpppink to-tppslate dark:from-tppdarkwhite dark:to-tppdarkwhite/70 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-tppdarkgray">
                            <span className="text-white dark:text-tppdark text-sm font-bold">
                              {getInitials(user?.name)}
                            </span>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-tppdarkgray" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-tppslate dark:text-tppdarkwhite truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/50 truncate">
                            {user?.email || 'email@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/user/profile'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-tppslate dark:text-tppdarkwhite hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all duration-200 font-medium group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-tppslate/5 dark:bg-tppdarkwhite/5 group-hover:bg-tppslate/10 dark:group-hover:bg-tppdarkwhite/10 transition-colors">
                          <User className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
                        </div>
                        <span>My Profile</span>
                      </button>

                      <div className="my-2 border-t border-tppslate/10 dark:border-tppdarkwhite/10" />

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-200 font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/10 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors">
                          {isLoggingOut ? (
                            <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-lg border border-slate-300 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdark hover:bg-slate-100 dark:hover:bg-tppdarkwhite/5
                  hover:border-tpppink dark:hover:border-tppdarkwhite/30 hover:text-tpppink dark:hover:text-tppdarkwhite transition-all text-slate-600 dark:text-tppdarkwhite/70
                  focus:outline-none focus:ring-2 focus:ring-tpppink/30 dark:focus:ring-tppdarkwhite/20"
                title="Shopping Cart"
                aria-label={`Shopping Cart (${cartCount} items)`}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark text-[10px] font-bold
                    rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1
                    border-2 border-white dark:border-tppdarkgray shadow-sm animate-in zoom-in-50 duration-200">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div
          className={`md:hidden px-4 sm:px-6 py-3 border-t-2 border-tppslate/10 dark:border-tppdarkwhite/10 bg-tpppeach/5 dark:bg-tppdark transition-transform duration-300 ease-in-out ${
            isMobileSearchVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <SmartBundleSearch
            placeholder="Search for your wishes here..."
            onNavigate={(path) => navigate(path)}
          />

          {/* BRAND TOGGLE — Mobile, centered below search */}
          <div className="flex items-center justify-center mt-2 sm:hidden">
            <div className="flex items-center bg-tpppink dark:bg-tppdarkwhite border border-[#e0e0e0] dark:border-tppdarkwhite/10 rounded-lg p-0.5 gap-0.5 font-inter">
              <button
                onClick={() => setBrandMode('feminine')}
                aria-label="Shop Women"
                className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                  brandMode === 'feminine'
                    ? 'bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite shadow-sm'
                    : 'bg-transparent text-[#999] dark:text-tppdark/60 hover:text-[#555] dark:hover:text-tppdark'
                }`}
              >
                Women
              </button>
              <button
                onClick={() => setBrandMode('masculine')}
                aria-label="Shop Men"
                className={`px-3.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                  brandMode === 'masculine'
                    ? 'bg-white dark:bg-tppdark text-[#130100] dark:text-tppdarkwhite shadow-sm'
                    : 'bg-transparent text-white dark:text-tppdarkwhite/40 hover:text-white/70 dark:hover:text-tppdarkwhite/70'
                }`}
              >
                Men
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}