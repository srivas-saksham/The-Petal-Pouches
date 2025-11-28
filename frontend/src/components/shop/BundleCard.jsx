// frontend/src/components/shop/BundleCard.jsx - FIXED

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { formatBundlePrice, getTotalItemsCount, formatBundleDescription } from '../../utils/bundleHelpers';

/**
 * BundleCard Component
 * Displays bundle in grid with image, title, price, and quick view
 * NO ADD TO CART - Removed as requested
 */
const BundleCard = ({ bundle, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(bundle);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <Link to={`/shop/bundles/${bundle.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Bundle Image */}
        <img
          src={bundle.img_url || '/placeholder-bundle.png'}
          alt={bundle.title}
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-bundle.png';
            setImageLoaded(true);
          }}
        />

        {/* Bundle Badge */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
          Bundle
        </div>

        {/* Items Count Badge */}
        {bundle.items && bundle.items.length > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 text-gray-900 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            <Package size={12} />
            {bundle.items.length} items
          </div>
        )}

        {/* Desktop Hover Overlay */}
        <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-40 flex-col items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickView}
            className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Eye size={18} />
            Quick View
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <Link to={`/shop/bundles/${bundle.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 hover:text-purple-600 transition-colors">
            {bundle.title}
          </h3>
        </Link>

        {/* Description */}
        {bundle.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {formatBundleDescription(bundle.description, 80)}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-purple-600">
            {formatBundlePrice(bundle.price)}
          </span>
          {bundle.original_price && (
            <span className="text-xs text-gray-500 line-through">
              {formatBundlePrice(bundle.original_price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {bundle.stock_status && (
          <div className="mb-2">
            <span className={`text-xs font-medium ${
              bundle.stock_status.in_stock 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {bundle.stock_status.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Mobile View Button */}
        <div className="md:hidden">
          <Link
            to={`/shop/bundles/${bundle.id}`}
            className="w-full bg-purple-600 text-white text-xs py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={14} />
            View Bundle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;