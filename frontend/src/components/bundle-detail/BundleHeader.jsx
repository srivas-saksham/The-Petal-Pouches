// frontend/src/components/bundle-detail/BundleHeader.jsx
import React from 'react';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BundleHeader - Sticky navigation header
 * Compact design with back button and action icons
 */
const BundleHeader = ({ bundle, onShare, onWishlist }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 text-tppslate hover:text-tpppink transition-colors text-sm font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Shop</span>
          </button>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="p-1.5 border border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 transition-all text-slate-600 hover:text-tpppink"
              title="Share"
            >
              <Share2 size={14} />
            </button>
            
            <button
              onClick={onWishlist}
              className="p-1.5 border border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 transition-all text-slate-600 hover:text-tpppink"
              title="Add to Wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleHeader;