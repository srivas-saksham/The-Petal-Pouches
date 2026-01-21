// frontend/src/components/bundle-detail/BundleHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Share2, Heart } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';
import Breadcrumb from './ui/Breadcrumb';
import { generateBreadcrumbs } from '../../utils/bundleHelpers';

/**
 * Enhanced BundleHeader Component with Scroll Behavior
 * 
 * FEATURES:
 * - CommonHeader: Static at top-0 (always visible)
 * - Breadcrumb row: Slides up on scroll down, slides down on scroll up
 * - Share and Wishlist buttons
 * 
 * @param {Object} bundle - Bundle data
 * @param {Function} onShare - Share handler
 * @param {Function} onWishlist - Wishlist handler
 */
const BundleHeader = ({ bundle, onShare, onWishlist }) => {
  // Generate breadcrumbs from bundle data
  const breadcrumbItems = bundle ? generateBreadcrumbs(bundle) : [];

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

  return (
    <div className="sticky top-0 z-30">
      {/* Main Header - Using CommonHeader - ALWAYS VISIBLE */}
      <CommonHeader />
    
      {/* Breadcrumb & Actions Row - SLIDES UP/DOWN ON SCROLL */}
      <div
        className={`sticky top-16 bg-white/90 border-b border-slate-100 transition-transform duration-300 ease-in-out ${
          isBreadcrumbVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-9xl mx-auto px-3 py-2 md:px-6 md:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left: Breadcrumb Navigation */}
            {breadcrumbItems.length > 0 && (
              <Breadcrumb items={breadcrumbItems} />
            )}

            {/* Right: Action Buttons (Share & Wishlist) */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <button
                onClick={onShare}
                className="p-1.5 md:p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Share Bundle"
                aria-label="Share bundle"
              >
                <Share2 size={14} className="md:w-4 md:h-4" />
              </button>
              
              <button
                onClick={onWishlist}
                className="p-1.5 md:p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Add to Wishlist"
                aria-label="Add to wishlist"
              >
                <Heart size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleHeader;