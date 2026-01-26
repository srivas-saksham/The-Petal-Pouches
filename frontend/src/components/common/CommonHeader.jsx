// frontend/src/components/common/CommonHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, X, ChevronDown, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import UserProfileMenu from '../shop/UserProfileMenu';
import SmartBundleSearch from '../common/SmartBundleSearch';

const CommonHeader = () => {
  const { isAuthenticated, user, loading: authLoading, logout } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);

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

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    if (showCategories) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategories]);

  const handleCartClick = () => {
    openCart();
  };

  const handleOrdersClick = () => {
    navigate('/user/orders');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowSearch(false);
  };

  const cartCount = cartTotals?.item_count || 0;

  // Categories data
  const categories = [
    { name: 'Pouches', path: '/shop/category/pouches' },
    { name: 'Accessories', path: '/shop/category/accessories' },
    { name: 'Gift Sets', path: '/shop/category/gift-sets' },
    { name: 'New Arrivals', path: '/shop/category/new-arrivals' },
    { name: 'Best Sellers', path: '/shop/category/best-sellers' },
  ];

  // ⭐ ENHANCED: Check if current path matches or belongs to a section
  const isActiveSection = (section) => {
    const path = location.pathname;
    
    switch (section) {
      case '/':
        return path === '/';
      
      case '/shop':
        // Shop is active for: /shop, /shop/*, /checkout, /cart, bundle pages, category pages
        return (
          path === '/shop' ||
          path.startsWith('/shop/') ||
          path === '/checkout' ||
          path === '/cart' ||
          path.startsWith('/category/')
        );
      
      case '/about':
        return path === '/about';
      
      case '/faqs':
        return path === '/faqs';
      
      default:
        return false;
    }
  };

  // ⭐ NEW: Get active section for underline animation
  const getActiveSection = () => {
    if (isActiveSection('/')) return 'home';
    if (isActiveSection('/shop')) return 'shop';
    if (isActiveSection('/about')) return 'about';
    if (isActiveSection('/faqs')) return 'faqs';
    return null;
  };

  const activeSection = getActiveSection();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-8xl mx-auto">
        
      <div className="max-w-8xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Left */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <h1 className="text-5xl font-italianno text-tpppink hover:text-tpppink/80 transition-colors">
              Rizara
            </h1>
          </Link>

          {/* Navigation Links - Center (Absolutely Centered) - DESKTOP ONLY */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'home' && (
                <motion.div
                  layoutId="desktop-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              Home
            </Link>
            
            <Link
              to="/shop"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/shop') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'shop' && (
                <motion.div
                  layoutId="desktop-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              Shop
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="font-inter flex items-center gap-1.5 text-sm font-semibold text-tppslate hover:text-tpppink transition-colors"
              >
                <span>Categories</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform ${showCategories ? 'rotate-180' : ''}`}
                />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      onClick={() => setShowCategories(false)}
                      className="block px-4 py-2 text-sm font-medium text-tppslate hover:bg-tpppeach hover:text-tpppink transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/about') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'about' && (
                <motion.div
                  layoutId="desktop-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              About
            </Link>

            <Link
              to="/faqs"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/faqs') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'faqs' && (
                <motion.div
                  layoutId="desktop-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              FAQs
            </Link>
          </nav>

          {/* Right Section: Search + Auth + Cart */}
          <div className="flex items-center gap-4">
            
            {/* Search Button & Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-slate-600 hover:text-tpppink transition-colors translate-y-0.5"
                title="Search Bundles"
                aria-label="Search"
              >
                {showSearch ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Search Dropdown - MOBILE RESPONSIVE FIXED */}
              {showSearch && (
                <div className="fixed left-3 right-3 mt-2 md:absolute md:left-auto md:right-0 md:w-[450px] bg-transparent rounded-xl z-[100]">
                  <div className="p-3" style={{ minHeight: '400px' }}>
                    <SmartBundleSearch
                      placeholder="Just type-in what you're looking for..."
                      onNavigate={handleNavigate}
                    />
                  </div>
                </div>
              )}
            </div>

            {authLoading ? (
              // Loading State
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse"></div>
              </div>
            ) : isAuthenticated && user ? (
              // Authenticated: Show minimal icons
              <>
                {/* User Profile Menu Component */}
                <UserProfileMenu user={user} />

                {/* Orders & Tracking Button - MOBILE: Icon only, DESKTOP: Text */}
                <button
                  onClick={handleOrdersClick}
                  className="flex items-center gap-2 rounded-lg border border-transparent transition-all text-tppslate hover:text-tpppink"
                  title="Orders & Tracking"
                  aria-label="Orders & Tracking"
                >
                  {/* Icon - MOBILE ONLY */}
                  <Package size={20} className="md:hidden" />
                  
                  {/* Label - DESKTOP ONLY */}
                  <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                    Your Orders
                  </span>
                </button>
                
                {/* Cart Icon */}
                <button
                  onClick={handleCartClick}
                  className="relative text-slate-600 hover:text-tpppink transition-colors ml-2"
                  title="Shopping Cart"
                  aria-label={`Shopping Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-tpppink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              // Not Authenticated: Show Login + Cart icon
              <>
                {/* Login Button */}
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-tppslate hover:text-tpppink transition-colors"
                >
                  Sign In
                </button>

                {/* Sign Up Button */}
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-tpppink text-white text-sm font-semibold rounded-lg hover:bg-tpppink/90 transition-colors"
                >
                  Sign Up
                </button>

                {/* Cart Icon */}
                <button
                  onClick={handleCartClick}
                  className="relative text-slate-600 hover:text-tpppink transition-colors"
                  title="Shopping Cart"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-tpppink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ROW 2: Navigation Links - MOBILE ONLY */}
        <div className="md:hidden border-t border-slate-100">
          <nav className="flex items-center justify-between py-3">
            <Link
              to="/"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'home' && (
                <motion.div
                  layoutId="mobile-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              Home
            </Link>
            
            <Link
              to="/shop"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/shop') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'shop' && (
                <motion.div
                  layoutId="mobile-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              Shop
            </Link>

            {/* Categories Dropdown - Mobile */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="font-inter flex items-center gap-1.5 text-sm font-semibold text-tppslate hover:text-tpppink transition-colors"
              >
                <span>Categories</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform ${showCategories ? 'rotate-180' : ''}`}
                />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      onClick={() => setShowCategories(false)}
                      className="block px-4 py-2 text-sm font-medium text-tppslate hover:bg-tpppeach hover:text-tpppink transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/about') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'about' && (
                <motion.div
                  layoutId="mobile-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              About
            </Link>

            <Link
              to="/faqs"
              className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                isActiveSection('/faqs') 
                  ? 'text-tpppink' 
                  : 'text-tppslate hover:text-tpppink'
              }`}
            >
              {activeSection === 'faqs' && (
                <motion.div
                  layoutId="mobile-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.6
                  }}
                />
              )}
              FAQs
            </Link>
          </nav>
        </div>
      </div>
      </div>
    </header>
  );
};

export default CommonHeader;