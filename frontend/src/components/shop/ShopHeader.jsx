// frontend/src/components/shop/ShopHeader.jsx - WITH CART SIDEBAR INTEGRATION
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Grid3x3, Search, X, ShoppingCart, Grid3x2, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar'; // ✅ NEW IMPORT
import UserProfileMenu from './UserProfileMenu';

/**
 * ShopHeader Component - WITH CART SIDEBAR INTEGRATION
 * 
 * FEATURES:
 * - Shows user profile menu when authenticated
 * - Shows Sign In / Sign Up buttons when not authenticated
 * - Dynamic cart count from CartContext
 * - ✅ NEW: Opens cart sidebar on cart button click
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
  const { openCart } = useCartSidebar(); // ✅ NEW: Cart sidebar hook
  const navigate = useNavigate();

  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

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

  // ✅ MODIFIED: Handle cart click - Opens cart sidebar
  const handleCartClick = () => {
    openCart(); // Simply opens the cart sidebar
  };

  // Get cart count
  const cartCount = cartTotals?.item_count || 0;

  return (
    <>
      {/* STICKY SECTION - Tag Pills with Grid Layout Buttons on Right */}
      <div className="sticky top-0 z-30">
        <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm relative z-20">
          <div className="px-6 py-4">
            {/* Main Row: Title | Search Bar | Auth & Cart Buttons */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Title Section */}
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-tpppink" />
                  Bundle Collections
                </h1>
                {!loading && metadata && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {metadata.currentCount || 0} of {metadata.totalCount} bundles
                    {filters.page > 1 && ` • Page ${filters.page} of ${metadata.totalPages}`}
                  </p>
                )}
              </div>

              {/* Middle: Search Bar - Flex Grow */}
              <div className="relative flex-1 max-w-md">
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

              {/* Right: Authentication & Cart Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 relative z-50">
                {authLoading ? (
                  // Loading State
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse"></div>
                    <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse"></div>
                  </div>
                ) : isAuthenticated && user ? (
                  // Authenticated: Show Profile Menu + Cart Button
                  <>
                    <UserProfileMenu user={user} />
                    
                    {/* ✅ Cart Button - Opens Sidebar */}
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
                  // Not Authenticated: Show Sign In / Sign Up + Cart Button
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

                    {/* Sign Up Button (Highlighted) */}
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

                    {/* ✅ Cart Button - Opens Sidebar (even if not logged in) */}
                    <button
                      onClick={handleCartClick}
                      className="relative p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 
                        hover:border-tpppink hover:text-tpppink transition-all text-slate-600
                        focus:outline-none focus:ring-2 focus:ring-tpppink/30"
                      title="Shopping Cart"
                      aria-label="Shopping Cart"
                    >
                      <ShoppingCart size={18} />
                      {/* Show badge even for guest users if they have items */}
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
        <div className="px-6 py-3 bg-white border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            {/* Tags Pills - Scrollable */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              {!loading && availableTags.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  {availableTags.map((tag) => {
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
                  
                  {/* Clear Tags Button */}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => onTagClick(null)}
                      className="flex-shrink-0 text-xs text-white font-bold px-3 py-1.5 whitespace-nowrap bg-tpppink backdrop-blur-md rounded-full shadow-md border-2 border-tpppink hover:bg-tpppink/90 hover:shadow-lg transition-all"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              ) : loading ? (
                // Loading skeleton for tags
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 h-8 w-20 bg-white backdrop-blur-md rounded-full animate-pulse shadow-md border-2 border-slate-200"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Grid Layout Switcher - Right End */}
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