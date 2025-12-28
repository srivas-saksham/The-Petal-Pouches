import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Grid3x2, Grid3x3, Search, X, ShoppingCart, LogIn, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import UserProfileMenu from './UserProfileMenu';

/**
 * ShopHeader Component - COMPLETE VERSION WITH TWO-ROW NAVIGATION
 * 
 * FEATURES:
 * - Two-row layout: Navigation links on top, Search bar below
 * - Navigation: Home, Shop, About, FAQs, Categories dropdown
 * - Full auth integration with UserAuthContext
 * - Dynamic cart count from CartContext
 * - Cart sidebar integration
 * - UserProfileMenu when authenticated
 * - Orders & Tracking button for authenticated users
 * - Shows only top 3 tags with "Show All" toggle
 * - Professional animations and transitions
 * 
 * @param {Object} filters - Current filter values
 * @param {Function} onSearchChange - Search input change handler
 * @param {Function} onTagClick - Tag click handler
 * @param {Array} availableTags - Array of available tags with counts
 * @param {Array} selectedTags - Array of currently selected tag names
 * @param {boolean} loading - Loading state
 * @param {Object} metadata - Pagination metadata
 * @param {string} layoutMode - Current layout mode ('4', '5', or '6')
 * @param {Function} onLayoutChange - Layout change handler
 */
const ShopHeader = ({
  filters = {},
  onSearchChange,
  onTagClick,
  availableTags = [],
  selectedTags = [],
  loading = false,
  metadata = null,
  layoutMode = '4',
  onLayoutChange,
}) => {
  // Auth & Cart Context
  const { isAuthenticated, user, loading: authLoading } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();
  const navigate = useNavigate();

  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  // Tags expansion state
  const [showAllTags, setShowAllTags] = useState(false);

  // Categories dropdown state
  const [showCategories, setShowCategories] = useState(false);
  const categoriesRef = useRef(null);

  // Sync search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  // Handle search input with debouncing
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
      setIsSearching(false);
    }, 500);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setIsSearching(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearchChange('');
  };

  // Handle cart click - Opens cart sidebar
  const handleCartClick = () => {
    openCart();
  };

  // Handle orders click
  const handleOrdersClick = () => {
    navigate('/user/orders');
  };

  // Get cart count
  const cartCount = cartTotals?.item_count || 0;

  // Determine which tags to show
  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 3);
  const hasMoreTags = availableTags.length > 3;

  // Placeholder categories
  const categories = [
    { name: 'Pouches', path: '/shop/category/pouches' },
    { name: 'Accessories', path: '/shop/category/accessories' },
    { name: 'Gift Sets', path: '/shop/category/gift-sets' },
    { name: 'New Arrivals', path: '/shop/category/new-arrivals' },
    { name: 'Best Sellers', path: '/shop/category/best-sellers' },
  ];

  return (
    <>
      {/* STICKY SECTION */}
      <div className="sticky top-0 z-30">
        <div className="bg-tpppeach/90 backdrop-blur-sm border-b border-slate-200 shadow-sm relative z-20">
          <div className="px-6 py-2">
            {/* Main Row: Title | Navigation & Search (2 rows) | Auth & Cart Buttons */}
            <div className="flex items-center justify-between gap-6">
              {/* Left: Title Section */}
              <div className="flex-shrink-0">
                <h1 className="text-5xl font-greyqo text-tpppink">
                  The Petal Pouches
                </h1>
                {!loading && metadata && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {metadata.currentCount || 0} of {metadata.totalCount} products
                    {filters.page > 1 && ` • Page ${filters.page} of ${metadata.totalPages}`}
                  </p>
                )}
              </div>

              {/* Middle: Two-Row Layout - Navigation + Search */}
              <div className="flex-1 max-w-xl space-y-1">
                {/* Row 1: Navigation Links */}
                <div className="flex items-center justify-center gap-6">
                  {/* Home */}
                  <Link
                    to="/"
                    className="px-4 py-2 text-[16px] font-semibold text-slate-700 hover:text-tpppink 
                      hover:bg-white/50 rounded-lg transition-all"
                  >
                    Home
                  </Link>

                  {/* Shop */}
                  <Link
                    to="/shop"
                    className="px-4 py-2 text-[16px] font-semibold text-slate-700 hover:text-tpppink 
                      hover:bg-white/50 rounded-lg transition-all"
                  >
                    Shop
                  </Link>

                  {/* Categories Dropdown */}
                  <div className="relative" ref={categoriesRef}>
                    <button
                      onClick={() => setShowCategories(!showCategories)}
                      className="flex items-center gap-1.5 px-4 py-2 text-[16px] font-semibold text-slate-700 
                        hover:text-tpppink hover:bg-white/50 rounded-lg transition-all"
                    >
                      <span>Categories</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform ${showCategories ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {showCategories && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 
                        rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            to={category.path}
                            onClick={() => setShowCategories(false)}
                            className="block px-4 py-2 text-sm font-medium text-slate-700 
                              hover:bg-tpppeach hover:text-tpppink transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* About */}
                  <Link
                    to="/about"
                    className="px-4 py-2 text-[16px] font-semibold text-slate-700 hover:text-tpppink 
                      hover:bg-white/50 rounded-lg transition-all"
                  >
                    About
                  </Link>

                  {/* FAQs */}
                  <Link
                    to="/faqs"
                    className="px-4 py-2 text-[16px] font-semibold text-slate-700 hover:text-tpppink 
                      hover:bg-white/50 rounded-lg transition-all"
                  >
                    FAQs
                  </Link>
                </div>

                {/* Row 2: Search Bar */}
                <div className="relative max-w-md mx-auto">
                  <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors ${
                    isSearching ? 'text-tpppink animate-pulse' : 'text-slate-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search bundles..."
                    value={searchInput}
                    onChange={handleSearchInput}
                    className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg
                      focus:outline-none focus:border-tpppink focus:bg-white
                      hover:border-slate-400 transition-all text-slate-900 placeholder:text-slate-400
                      font-medium"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tpppink transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Authentication & Cart Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 relative z-50">
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
                    
                    {/* Orders & Tracking Button */}
                    <button
                      onClick={handleOrdersClick}
                      className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 
                        bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all text-slate-700
                        focus:outline-none focus:ring-2 focus:ring-slate-300 min-w-[80px]"
                      title="Orders & Tracking"
                    >
                      <span className="text-[11px] font-semibold leading-tight">
                        Orders &<br/>Tracking
                      </span>
                    </button>
                    
                    {/* Cart Button */}
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
                  </>
                ) : (
                  // Not Authenticated: Show Sign In / Sign Up + Cart
                  <>
                    {/* Sign In Button */}
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 
                        bg-white hover:bg-slate-50 hover:border-slate-400 transition-all text-slate-700
                        text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
                      title="Sign In"
                    >
                      <LogIn size={16} />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>

                    {/* Sign Up Button */}
                    <button
                      onClick={() => navigate('/register')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg 
                        bg-tpppink hover:bg-tpppink/90 transition-all text-white
                        text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/50
                        shadow-sm hover:shadow-md"
                      title="Sign Up"
                    >
                      <UserPlus size={16} />
                      <span className="hidden sm:inline">Sign Up</span>
                    </button>

                    {/* Cart Button */}
                    <button
                      onClick={handleCartClick}
                      className="relative p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 
                        hover:border-tpppink hover:text-tpppink transition-all text-slate-600
                        focus:outline-none focus:ring-2 focus:ring-tpppink/30"
                      title="Shopping Cart"
                      aria-label="Shopping Cart"
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="px-6 py-3 bg-transparent backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-3">
            {/* Tags Pills */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              {!loading && availableTags.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  {visibleTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        onClick={() => onTagClick(tag.name)}
                        className={`
                          flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold
                          transition-all whitespace-nowrap shadow-md backdrop-blur-md
                          ${isSelected 
                            ? 'bg-tpppink text-white border-2 border-tpppink' 
                            : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-pink-50 hover:shadow-lg'
                          }
                        `}
                      >
                        <span>{tag.label}</span>
                        <span className={`
                          text-[10px] font-bold px-1.5 py-0.5 rounded-full
                          ${isSelected 
                            ? 'bg-white/30 text-white' 
                            : 'bg-slate-100 text-slate-600'
                          }
                        `}>
                          {tag.count}
                        </span>
                      </button>
                    );
                  })}
                  
                  {/* Show All / Show Less Toggle */}
                  {hasMoreTags && (
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 
                        whitespace-nowrap rounded-full border-2 border-slate-300 bg-white text-slate-700
                        hover:border-tpppink hover:text-tpppink hover:bg-pink-50 transition-all shadow-md"
                    >
                      <span>{showAllTags ? 'Show Less' : `Show All (${availableTags.length})`}</span>
                      {showAllTags ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                  
                  {/* Clear Tags Button */}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => onTagClick(null)}
                      className="flex-shrink-0 text-xs text-white font-bold px-3 py-1.5 whitespace-nowrap 
                        bg-tpppink backdrop-blur-md rounded-full shadow-md border-2 border-tpppink 
                        hover:bg-tpppink/90 hover:shadow-lg transition-all"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              ) : loading ? (
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 h-8 w-20 bg-white backdrop-blur-md rounded-full animate-pulse shadow-md border-2 border-slate-200"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Grid Layout Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 border border-slate-200 flex-shrink-0">
              <button
                onClick={() => onLayoutChange('4')}
                className={`p-1.5 rounded transition-all ${
                  layoutMode === '4'
                    ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
                title="4 Column Layout"
                aria-label="4 Column Layout"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => onLayoutChange('5')}
                className={`p-1.5 rounded transition-all ${
                  layoutMode === '5'
                    ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
                title="5 Column Layout"
                aria-label="5 Column Layout"
              >
                <Grid3x2 size={16} />
              </button>
              <button
                onClick={() => onLayoutChange('6')}
                className={`p-1.5 rounded transition-all ${
                  layoutMode === '6'
                    ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
                title="6 Column Layout"
                aria-label="6 Column Layout"
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Hide Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default ShopHeader;