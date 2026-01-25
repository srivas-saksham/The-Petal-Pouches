// frontend/src/components/bundle-detail/BundleHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Share2, Heart, Check } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';
import Breadcrumb from './ui/Breadcrumb';
import { generateBreadcrumbs } from '../../utils/bundleHelpers';
import useBundleDetail from '../../hooks/useBundleDetail';
import shopService from '../../services/shopService';

/**
 * Enhanced BundleHeader Component with Scroll Behavior
 * 
 * FEATURES:
 * - CommonHeader: Static at top-0 (always visible)
 * - Breadcrumb row: Slides up on scroll down, slides down on scroll up
 * - Share and Wishlist buttons
 * - Mobile responsive: Compact layout and touch-friendly buttons
 * - Wishlist: Simple heart fill toggle (no popup)
 * - Self-contained: Fetches bundle data internally
 * 
 * NO PROPS NEEDED - Fully self-contained component
 */
const BundleHeader = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detect if viewing product or bundle from URL
  const isProductView = location.pathname.includes('/shop/products/');
  
  // State for bundle/product data
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use bundle hook only for bundles
  const bundleHook = useBundleDetail(isProductView ? null : id);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Generate breadcrumbs from bundle data
  const breadcrumbItems = item ? generateBreadcrumbs(item) : [];

  // ⭐ WISHLIST STATE - Simple toggle for heart fill
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ⭐ Fetch product or bundle data
  useEffect(() => {
    if (isProductView) {
      const fetchProduct = async () => {
        setLoading(true);
        
        try {
          const result = await shopService.getProductById(id);
          
          if (result.success && result.data) {
            setItem(result.data);
          }
        } catch (err) {
          console.error('Failed to fetch product:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    } else {
      // Use bundle hook data
      setItem(bundleHook.bundle);
      setLoading(bundleHook.loading);
    }
  }, [id, isProductView, bundleHook.bundle, bundleHook.loading]);

  // ⭐ Check if bundle is in wishlist on mount
  useEffect(() => {
    if (item?.id) {
      // Check localStorage for wishlist
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const inWishlist = wishlist.some(wishItem => wishItem.id === item.id);
      setIsWishlisted(inWishlist);
    }
  }, [item?.id]);

  // ⭐ SCROLL HIDE/SHOW STATE
  const [isBreadcrumbVisible, setIsBreadcrumbVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  // ⭐ SCROLL DETECTION FOR HIDE/SHOW BREADCRUMB ROW
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ignore tiny scroll movements
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }

      // Scrolling down - hide breadcrumb
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsBreadcrumbVisible(false);
      } 
      // Scrolling up - show breadcrumb immediately
      else if (currentScrollY < lastScrollY.current) {
        setIsBreadcrumbVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ⭐ HANDLE SHARE - Web Share API or fallback to clipboard
  const handleShare = async () => {
  const stockLimit = isProductView 
    ? item?.stock          // ✅ Products use 'stock'
    : item?.stock_limit;   // ✅ Bundles use 'stock_limit'
    
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  
  // Only bundles have discount_percent and original_price
  const hasDiscount = !isProductView && item?.discount_percent;  // ✅ Correct!
  const hasOriginalPrice = !isProductView && item?.original_price; // ✅ Correct!
  
  const shareData = {
    title: `${item?.title}${hasDiscount ? ` - ${item.discount_percent}% OFF` : ''} - Rizara Luxe`,
    text: `${item?.title}

${item?.description}

₹${item.price}${hasOriginalPrice ? ` (was ₹${item.original_price})` : ''}${isLowStock ? '\n⚠️ Limited stock!' : ''}

Rizara Luxe`,
    url: window.location.href
  };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  // ⭐ HANDLE WISHLIST TOGGLE - Simple state toggle with localStorage
  const handleWishlistClick = () => {
    const newWishlistState = !isWishlisted;
    setIsWishlisted(newWishlistState);
    
    // Update localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (newWishlistState) {
      // Add to wishlist
      wishlist.push({ id: item?.id, addedAt: new Date().toISOString() });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } else {
      // Remove from wishlist
      const filtered = wishlist.filter(wishItem => wishItem.id !== item?.id);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
    }
  };

  return (
    <div className="sticky top-0 z-30">
      {/* Main Header - Using CommonHeader - ALWAYS VISIBLE */}
      <CommonHeader />
      
      {/* Share Success Toast */}
      {showShareModal && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-4 duration-200">
          <Check size={14} />
          <span className="font-medium">Link copied!</span>
        </div>
      )}
    
      {/* Breadcrumb & Actions Row - SLIDES UP/DOWN ON SCROLL - MOBILE RESPONSIVE */}
      <div
        className={`sticky top-16 bg-white/95 backdrop-blur-sm border-b border-slate-100 transition-transform duration-300 ease-in-out ${
          isBreadcrumbVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-9xl mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left: Breadcrumb Navigation - MOBILE: Truncated, DESKTOP: Full */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {breadcrumbItems.length > 0 && (
                <Breadcrumb items={breadcrumbItems} />
              )}
            </div>

            {/* Right: Action Buttons (Share & Wishlist) - MOBILE: Touch-friendly */}
            <div className="flex items-center gap-2 md:gap-2.5 flex-shrink-0">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 md:p-2.5 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  active:scale-95 transition-all text-slate-600 hover:text-tpppink touch-manipulation"
                title="Share Bundle"
                aria-label="Share bundle"
              >
                <Share2 size={18} className="md:w-5 md:h-5" />
              </button>
              
              {/* Wishlist Button - Simple Heart Toggle (No Popup) */}
              <button
                onClick={handleWishlistClick}
                className={`p-2 md:p-2.5 border-2 rounded-lg active:scale-95 transition-all touch-manipulation ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-slate-200 hover:border-tpppink hover:bg-tpppink/5 text-slate-600 hover:text-tpppink'
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  size={18} 
                  className="md:w-5 md:h-5"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleHeader;