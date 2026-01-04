// frontend/src/components/bundle-detail/BundleHeader.jsx
import React from 'react';
import { Share2, Heart } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';
import Breadcrumb from './ui/Breadcrumb';
import { generateBreadcrumbs } from '../../utils/bundleHelpers';

/**
 * Enhanced BundleHeader Component
 * 
 * FEATURES:
 * - Uses CommonHeader for brand, search, auth, and cart
 * - Breadcrumb navigation (Home > Shop > Bundles > Current Bundle)
 * - Share and Wishlist buttons
 * 
 * @param {Object} bundle - Bundle data
 * @param {Function} onShare - Share handler
 * @param {Function} onWishlist - Wishlist handler
 */
const BundleHeader = ({ bundle, onShare, onWishlist }) => {
  // Generate breadcrumbs from bundle data
  const breadcrumbItems = bundle ? generateBreadcrumbs(bundle) : [];

  return (
    <div className="sticky top-0 z-30">
      {/* Main Header - Using CommonHeader */}
      <CommonHeader />
    
      {/* Breadcrumb & Actions Row */}
      <div className="bg-white/90 border-b border-slate-100">
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