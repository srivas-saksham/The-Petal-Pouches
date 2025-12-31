// frontend/src/components/bundle-detail/BundleHeader.jsx
import React from 'react';
import { Share2, Heart, ShoppingCart, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import UserProfileMenu from '../shop/UserProfileMenu';
import Breadcrumb from './ui/Breadcrumb';
import { generateBreadcrumbs } from '../../utils/bundleHelpers';
import SmartBundleSearch from '../common/SmartBundleSearch';

/**
 * Enhanced BundleHeader Component
 * 
 * FEATURES:
 * - Brand name "Rizara" on the left
 * - SmartBundleSearch with real-time tag matching
 * - User authentication (Sign In/Sign Up or Profile Menu)
 * - Orders & Tracking button
 * - Cart button with count
 * - Breadcrumb navigation (Home > Shop > Bundles > Current Bundle)
 * - Share and Wishlist buttons
 * 
 * @param {Object} bundle - Bundle data
 * @param {Function} onShare - Share handler
 * @param {Function} onWishlist - Wishlist handler
 */
const BundleHeader = ({ bundle, onShare, onWishlist }) => {
  const navigate = useNavigate();
  
  // Auth & Cart Context
  const { isAuthenticated, user, loading: authLoading } = useUserAuth();
  const { cartTotals } = useCart();
  const { openCart } = useCartSidebar();

  // Generate breadcrumbs from bundle data
  const breadcrumbItems = bundle ? generateBreadcrumbs(bundle) : [];

  // Handle cart click
  const handleCartClick = () => {
    openCart();
  };

  // Handle orders click
  const handleOrdersClick = () => {
    navigate('/user/orders');
  };

  // Get cart count
  const cartCount = cartTotals?.item_count || 0;

  return (
    <div className="sticky top-0 z-30">
      {/* Main Header Bar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-6 py-4">
          {/* Row 1: Brand | Search | Auth & Cart */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Name */}
            <div className="flex-shrink-0">
              <h1 className="text-5xl font-greyqo text-tpppink cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/shop')}>
                Rizara
              </h1>
            </div>

            {/* Middle: Smart Bundle Search */}
            <div className="flex-1 max-w-md">
              <SmartBundleSearch
                placeholder="Search bundles..."
                onNavigate={(path) => navigate(path)}
                onResultClick={(bundle) => {
                  console.log('Bundle clicked:', bundle);
                }}
              />
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
                // Authenticated: Show Profile Menu + Orders + Cart Button
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

                  {/* Cart Button - Opens Sidebar (even if not logged in) */}
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

      {/* Breadcrumb & Actions Row */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-9xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Breadcrumb Navigation */}
            {breadcrumbItems.length > 0 && (
              <Breadcrumb items={breadcrumbItems} />
            )}

            {/* Right: Action Buttons (Share & Wishlist) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onShare}
                className="p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Share Bundle"
                aria-label="Share bundle"
              >
                <Share2 size={16} />
              </button>
              
              <button
                onClick={onWishlist}
                className="p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Add to Wishlist"
                aria-label="Add to wishlist"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleHeader;