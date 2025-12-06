// frontend/src/components/bundle-detail/BundleImageGallery.jsx
import React, { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';

/**
 * BundleImageGallery - Clean product image without card styling
 * Integrates seamlessly with adjacent BundleKeyDetails
 */
const BundleImageGallery = ({ bundle, isOutOfStock }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative bg-white" style={{ height: 'min(70vh, 600px)' }}>
      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}

      {/* Main Image */}
      {bundle.img_url ? (
        <img
          src={bundle.img_url}
          alt={bundle.title}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => e.target.src = '/placeholder-bundle.png'}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-50">
          <Package size={64} className="text-slate-300" />
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <AlertCircle size={16} />
          OUT OF STOCK
        </div>
      )}

      {/* Discount Badge */}
      {!isOutOfStock && bundle.discount_percent > 0 && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg">
          {bundle.discount_percent}% OFF
        </div>
      )}
    </div>
  );
};

export default BundleImageGallery;