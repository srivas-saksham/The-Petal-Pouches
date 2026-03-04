// frontend/src/components/common/CommonHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, X, ChevronDown, Package, Gem, CircleDot, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import { useBrand } from '../../context/BrandContext';
import UserProfileMenu from '../shop/UserProfileMenu';
import SmartBundleSearch from '../common/SmartBundleSearch';

const CommonHeader = () => {
  const { isAuthenticated, user, loading: authLoading, logout } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const { brandMode, setBrandMode } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);
  const categoriesRefMobile = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target) &&
        categoriesRefMobile.current &&
        !categoriesRefMobile.current.contains(event.target)
      ) {
        setShowCategories(false);
      }
    };
    if (showCategories) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategories]);

  const handleCartClick = () => openCart();
  const handleOrdersClick = () => navigate('/user/orders');
  const handleNavigate = (path) => { navigate(path); setShowSearch(false); };

  const cartCount = cartTotals?.item_count || 0;

  const categories = [
    { name: 'Premium Pendants', path: '/shop?tags=pendant', icon: Gem, description: 'Elegant neck pieces' },
    { name: 'Signature Rings', path: '/shop?tags=ring', icon: CircleDot, description: 'Statement & stackable' },
    { name: 'Korean Earrings', path: '/shop?tags=earings', icon: Sparkles, description: 'Trendy & minimalist' },
    { name: 'All Anti Tarnish', path: '/shop?tags=anti-tarnish', icon: Shield, description: 'Long-lasting quality' },
    { name: 'Best Sellers', path: '/shop/category/best-sellers', icon: TrendingUp, description: 'Customer favorites' },
  ];

  const isActiveSection = (section) => {
    const path = location.pathname;
    switch (section) {
      case '/': return path === '/';
      case '/shop': return path === '/shop' || path.startsWith('/shop/') || path === '/checkout' || path === '/cart' || path.startsWith('/category/');
      case '/about': return path === '/about';
      case '/faqs': return path === '/faqs';
      default: return false;
    }
  };

  const getActiveSection = () => {
    if (isActiveSection('/')) return 'home';
    if (isActiveSection('/shop')) return 'shop';
    if (isActiveSection('/about')) return 'about';
    if (isActiveSection('/faqs')) return 'faqs';
    return null;
  };

  const activeSection = getActiveSection();

  // Reusable brand toggle markup
  const BrandToggle = ({ className = '' }) => (
    <div className={`flex items-center bg-tpppink dark:bg-tppdarkwhite border border-[#e0e0e0] dark:border-tppdarkwhite/10 rounded-lg p-0.5 gap-0.5 font-inter ${className}`}>
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
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-tppdark backdrop-blur-md border-b border-slate-200 dark:border-tppdarkwhite/10 shadow-sm">
      <div className="max-w-8xl mx-auto">
        <div className="max-w-8xl mx-auto px-6">

          {/* ── MAIN HEADER ROW ── */}
          <div className="flex items-stretch md:items-center md:h-16">

            {/* LEFT COL: Logo — spans both sub-rows on mobile */}
            <div className="flex items-center flex-shrink-0 mr-4 py-1 md:py-0">
              <Link to="/" className="relative inline-block">
                <h1 className="text-6xl font-italianno text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 transition-colors">
                  Rizara
                </h1>
                <span className="font-yatraone absolute -right-1 bottom-1 uppercase text-[10px] tracking-[0.35em] font-light text-tpppink dark:text-tppdarkwhite/80 pointer-events-none">
                  {brandMode === 'feminine' ? 'Luxe' : 'Men'}
                </span>
              </Link>
            </div>

            {/* RIGHT COL: two sub-rows on mobile, single row on desktop */}
            <div className="flex flex-col md:flex-row md:items-center md:flex-1 md:justify-between flex-1">

              {/* RIGHT SUB-ROW 1: icons */}
              <div className="flex items-center justify-end flex-1 py-2 md:py-0 gap-4">

                {/* Desktop nav — absolutely centered */}
                <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
                  <Link
                    to="/"
                    className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                      isActiveSection('/') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                    }`}
                  >
                    {activeSection === 'home' && <motion.div layoutId="desktop-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                    Home
                  </Link>

                  <Link
                    to="/shop"
                    className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                      isActiveSection('/shop') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                    }`}
                  >
                    {activeSection === 'shop' && <motion.div layoutId="desktop-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                    Shop
                  </Link>

                  {/* Categories Dropdown — Desktop */}
                  <div className="relative" ref={categoriesRef}>
                    <button
                      onClick={() => setShowCategories(!showCategories)}
                      className="font-inter flex items-center gap-1.5 text-sm font-semibold text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors"
                    >
                      <span>Categories</span>
                      <motion.div animate={{ rotate: showCategories ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                        <ChevronDown size={14} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showCategories && brandMode === 'feminine' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="fixed left-1/2 -translate-x-1/2 top-20 w-[600px] bg-white dark:bg-tppdarkgray backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden z-50 border border-transparent dark:border-tppdarkwhite/10"
                        >
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                              {categories.map((category, index) => {
                                const Icon = category.icon;
                                return (
                                  <motion.button
                                    key={category.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
                                    onClick={() => { setShowCategories(false); navigate(category.path); }}
                                    className="group w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 transition-all duration-200"
                                  >
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} className="flex-shrink-0">
                                      <Icon size={22} className="text-tpppink dark:text-tppdarkwhite/80" strokeWidth={2} />
                                    </motion.div>
                                    <div className="flex-1 text-left">
                                      <div className="font-semibold text-sm text-tppslate dark:text-tppdarkwhite group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors duration-200">{category.name}</div>
                                      <div className="text-xs text-tppslate/60 dark:text-tppdarkwhite/40 mt-0.5">{category.description}</div>
                                    </div>
                                    <motion.div initial={{ x: -4, opacity: 0 }} whileHover={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                                      <ChevronDown size={16} className="-rotate-90 text-tpppink/40 dark:text-tppdarkwhite/30 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors" />
                                    </motion.div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="py-3 px-4">
                            <button
                              onClick={() => { setShowCategories(false); navigate('/shop'); }}
                              className="w-full px-5 py-2.5 text-center text-sm font-semibold text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 rounded-xl transition-all duration-200"
                            >
                              View All Products →
                            </button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/about"
                    className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                      isActiveSection('/about') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                    }`}
                  >
                    {activeSection === 'about' && <motion.div layoutId="desktop-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                    About
                  </Link>

                  <Link
                    to="/faqs"
                    className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                      isActiveSection('/faqs') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                    }`}
                  >
                    {activeSection === 'faqs' && <motion.div layoutId="desktop-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                    FAQs
                  </Link>
                </nav>

                {/* Desktop brand toggle */}
                <BrandToggle className="hidden sm:flex" />

                {/* Search */}
                <div className="relative" ref={searchRef}>
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="text-slate-600 dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors translate-y-0.5"
                    title="Search Bundles"
                    aria-label="Search"
                  >
                    {showSearch ? <X size={20} /> : <Search size={20} />}
                  </button>
                  {showSearch && (
                    <div className="fixed left-3 right-3 mt-2 md:absolute md:left-auto md:right-0 md:w-[450px] bg-transparent rounded-xl z-[100]">
                      <div className="p-3" style={{ minHeight: '400px' }}>
                        <SmartBundleSearch placeholder="Just type-in what you're looking for..." onNavigate={handleNavigate} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Auth / Cart */}
                {authLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-full animate-pulse" />
                    <div className="w-5 h-5 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-full animate-pulse" />
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    <UserProfileMenu user={user} />
                    <button
                      onClick={handleOrdersClick}
                      className="flex items-center gap-2 rounded-lg border border-transparent transition-all text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite"
                      title="Orders & Tracking"
                      aria-label="Orders & Tracking"
                    >
                      <Package size={20} className="md:hidden" />
                      <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">Your Orders</span>
                    </button>
                    <button
                      onClick={handleCartClick}
                      className="relative text-slate-600 dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors ml-2"
                      title="Shopping Cart"
                      aria-label={`Shopping Cart (${cartCount} items)`}
                    >
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors">
                      Sign In
                    </button>
                    <button onClick={() => navigate('/register')} className="px-4 py-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark text-sm font-semibold rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-colors">
                      Sign Up
                    </button>
                    <button
                      onClick={handleCartClick}
                      className="relative text-slate-600 dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors"
                      title="Shopping Cart"
                      aria-label="Shopping Cart"
                    >
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* RIGHT SUB-ROW 2: Brand toggle — mobile only, removed from here */}

            </div>
          </div>

          {/* ── MOBILE NAV ROW ── */}
          <div className="md:hidden border-t border-slate-100 dark:border-tppdarkwhite/10">
            <nav className="flex items-center justify-between py-3">

              <Link
                to="/"
                className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                  isActiveSection('/') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                }`}
              >
                {activeSection === 'home' && <motion.div layoutId="mobile-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                Home
              </Link>

              <Link
                to="/shop"
                className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                  isActiveSection('/shop') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                }`}
              >
                {activeSection === 'shop' && <motion.div layoutId="mobile-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                Shop
              </Link>

              {/* Categories Dropdown — Mobile */}
              <div className="relative" ref={categoriesRefMobile}>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="font-inter flex items-center gap-1.5 text-sm font-semibold text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors"
                >
                  <span>Categories</span>
                  <motion.div animate={{ rotate: showCategories ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                    <ChevronDown size={14} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showCategories && brandMode === 'feminine' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="fixed left-0 right-0 top-[7.5rem] w-full bg-white/95 dark:bg-tppdarkgray backdrop-blur-xl shadow-2xl overflow-hidden z-50 border-b border-transparent dark:border-tppdarkwhite/10"
                    >
                      <div className="py-3 px-3">
                        {categories.map((category, index) => {
                          const Icon = category.icon;
                          return (
                            <motion.button
                              key={category.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
                              onClick={() => { setShowCategories(false); navigate(category.path); }}
                              className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 transition-all duration-200 mb-1"
                            >
                              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} className="flex-shrink-0">
                                <Icon size={20} className="text-tpppink dark:text-tppdarkwhite/80" strokeWidth={2} />
                              </motion.div>
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-sm text-tppslate dark:text-tppdarkwhite group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors duration-200 leading-tight">{category.name}</div>
                                <div className="text-xs text-tppslate/60 dark:text-tppdarkwhite/40 mt-0.5 leading-tight">{category.description}</div>
                              </div>
                              <div className="flex-shrink-0">
                                <ChevronDown size={14} className="-rotate-90 text-tpppink dark:text-tppdarkwhite/50 group-hover:translate-x-0.5 transition-transform duration-200" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="py-3 px-3">
                        <button
                          onClick={() => { setShowCategories(false); navigate('/shop'); }}
                          className="w-full px-4 py-2.5 text-center text-sm font-semibold text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          View All Products
                          <ChevronDown size={14} className="-rotate-90" />
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                  isActiveSection('/about') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                }`}
              >
                {activeSection === 'about' && <motion.div layoutId="mobile-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                About
              </Link>

              <Link
                to="/faqs"
                className={`font-inter text-sm font-semibold transition-colors relative pb-1 ${
                  isActiveSection('/faqs') ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate dark:text-tppdarkwhite/70 hover:text-tpppink dark:hover:text-tppdarkwhite'
                }`}
              >
                {activeSection === 'faqs' && <motion.div layoutId="mobile-nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tpppink dark:bg-tppdarkwhite" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }} />}
                FAQs
              </Link>

            </nav>

            {/* Brand Toggle — mobile only, centered below nav links */}
            <div className="flex items-center justify-center pb-3">
              <BrandToggle />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default CommonHeader;