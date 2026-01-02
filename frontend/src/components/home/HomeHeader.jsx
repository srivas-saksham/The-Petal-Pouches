// frontend/src/components/home/HomeHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, UserPlus, Search, X } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import UserProfileMenu from '../shop/UserProfileMenu';
import SmartBundleSearch from '../common/SmartBundleSearch';

const HomeHeader = () => {
  const { isAuthenticated, user, loading: authLoading } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  const handleCartClick = () => {
    openCart();
  };

  const handleOrdersClick = () => {
    navigate('/user/orders');
  };

  const handleBundleSelect = (bundle) => {
    setShowSearch(false);
    navigate(`/shop?search=${encodeURIComponent(bundle.title)}`);
  };

  const cartCount = cartTotals?.item_count || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-5xl font-italianno text-tpppink hover:text-tpppink/80 transition-colors">
              Rizara
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/shop"
              className="text-sm font-semibold text-tppslate hover:text-tpppink transition-colors"
            >
              Shop All
            </Link>
            <Link
              to="/gift-quiz"
              className="px-4 py-2 bg-tpppink text-white text-sm font-semibold rounded-lg hover:bg-tpppink/90 transition-colors"
            >
              Gift Quiz
            </Link>
            <Link
              to="/shop"
              className="text-sm font-semibold text-tppslate hover:text-tpppink transition-colors"
            >
              Bundles
            </Link>
          </nav>

          {/* Right Section: Search + Auth + Cart */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-tpppink hover:text-tpppink transition-all text-slate-600"
                title="Search Bundles"
              >
                {showSearch ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* Search Dropdown */}
              {showSearch && (
                <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100]">
                  <SmartBundleSearch
                    onBundleSelect={handleBundleSelect}
                    placeholder="Search bundles..."
                  />
                </div>
              )}
            </div>

            {authLoading ? (
              // Loading State
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
            ) : isAuthenticated && user ? (
              // Authenticated: Show Profile Menu + Orders + Cart
              <>
                <UserProfileMenu user={user} />
                
                <button
                  onClick={handleOrdersClick}
                  className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all text-slate-700 min-w-[80px]"
                  title="Orders & Tracking"
                >
                  <span className="text-[11px] font-semibold leading-tight">
                    Orders &<br/>Tracking
                  </span>
                </button>
                
                <button
                  onClick={handleCartClick}
                  className="relative p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-tpppink hover:text-tpppink transition-all text-slate-600"
                  title="Shopping Cart"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-tpppink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              // Not Authenticated: Show Sign In / Sign Up + Cart
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all text-slate-700 text-sm font-medium"
                  title="Sign In"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tppslate hover:bg-tppslate/90 transition-all text-white text-sm font-semibold shadow-sm hover:shadow-md"
                  title="Sign Up"
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>

                <button
                  onClick={handleCartClick}
                  className="relative p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-tpppink hover:text-tpppink transition-all text-slate-600"
                  title="Shopping Cart"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-tpppink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;