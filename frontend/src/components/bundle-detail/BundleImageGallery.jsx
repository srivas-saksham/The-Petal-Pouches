// frontend/src/components/bundle-detail/BundleImageGallery.jsx
import React, { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import Badge from './ui/Badge.jsx';

/**
 * BundleImageGallery - Main image display with badges
 * Compact design with zoom on hover
 */
const BundleImageGallery = ({ bundle, isOutOfStock }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-md aspect-square group">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        {bundle.img_url ? (
          <img
            src={bundle.img_url}
            alt={bundle.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => e.target.src = '/placeholder-bundle.png'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Package size={48} className="text-slate-300" />
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg flex items-center gap-1">
            <AlertCircle size={12} />
            OUT OF STOCK
          </div>
        )}

        {/* Discount Badge */}
        {!isOutOfStock && bundle.discount_percent > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
            {bundle.discount_percent}% OFF
          </div>
        )}

        {/* Items Count Badge */}
        {!isOutOfStock && bundle.items?.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-tppslate border border-slate-200 text-xs font-semibold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
            <Package size={10} />
            {bundle.items.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleImageGallery;