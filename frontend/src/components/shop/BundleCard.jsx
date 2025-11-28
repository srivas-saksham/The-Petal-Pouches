// frontend/src/components/shop/BundleCard.jsx - ENHANCED PROFESSIONAL VERSION

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, ShoppingCart, Eye } from 'lucide-react';
import { formatBundlePrice, getItemDisplayName, getItemImageUrl } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';

/**
 * Enhanced BundleCard Component
 * Professional, modern, compact design with ratings and product list
 */
const BundleCard = ({ bundle, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get rating info (real or placeholder)
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(bundle);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Non-functional for now
    console.log('Add to cart clicked:', bundle.id);
  };

  // Get first 3 products for display
  const displayProducts = bundle.items?.slice(0, 3) || [];
  const hasMoreProducts = (bundle.items?.length || 0) > 3;

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group">
      
      {/* Image Section */}
      <Link to={`/shop/bundles/${bundle.id}`} className="block relative aspect-[4/3] overflow-hidden bg-tpppeach">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-tppgrey/30 animate-pulse" />
        )}
        
        <img
          src={bundle.img_url || '/placeholder-bundle.png'}
          alt={bundle.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-bundle.png';
            setImageLoaded(true);
          }}
        />

        {/* Bundle Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-pill shadow-soft">
          Bundle
        </div>

        {/* Items Count */}
        {bundle.items && bundle.items.length > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-tppslate text-xs font-semibold px-3 py-1.5 rounded-pill flex items-center gap-1.5 shadow-soft">
            <Package size={13} className="text-purple-600" />
            {bundle.items.length} items
          </div>
        )}

        {/* Desktop Hover Overlay */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-4">
          <button
            onClick={handleQuickView}
            className="bg-white text-purple-600 px-5 py-2.5 rounded-pill font-semibold text-sm flex items-center gap-2 hover:bg-tpppeach transition-colors shadow-soft"
          >
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        
        {/* Title & Rating Row */}
        <div className="mb-3">
          <Link to={`/shop/bundles/${bundle.id}`}>
            <h3 className="text-sm font-semibold text-tppslate line-clamp-2 mb-2 hover:text-purple-600 transition-colors leading-snug">
              {bundle.title}
            </h3>
          </Link>
          
          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    star <= Math.floor(ratingInfo.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : star === Math.ceil(ratingInfo.rating) && ratingInfo.rating % 1 !== 0
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-tppslate">
              {formatRating(ratingInfo.rating)}
            </span>
            {ratingInfo.count > 0 && (
              <span className="text-xs text-slate-400">
                ({ratingInfo.count})
              </span>
            )}
          </div>
        </div>

        {/* Products Included Section */}
        <div className="mb-3 pb-3 border-b border-tppgrey/40">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Products Included
          </p>
          <div className="space-y-1.5">
            {displayProducts.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md overflow-hidden bg-tpppeach flex-shrink-0 border border-tppgrey/30">
                  <img
                    src={getItemImageUrl(item)}
                    alt={getItemDisplayName(item)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
                <span className="text-xs text-slate-600 line-clamp-1 flex-1">
                  {getItemDisplayName(item)}
                  {item.quantity > 1 && (
                    <span className="text-slate-400 ml-1">×{item.quantity}</span>
                  )}
                </span>
              </div>
            ))}
            {hasMoreProducts && (
              <p className="text-xs text-purple-600 font-medium pl-10">
                +{bundle.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-purple-600">
              {formatBundlePrice(bundle.price)}
            </span>
            {bundle.stock_status && (
              <span className={`text-xs font-medium ${
                bundle.stock_status.in_stock 
                  ? 'text-tppmint' 
                  : 'text-red-500'
              }`}>
                {bundle.stock_status.in_stock ? '• In Stock' : '• Out of Stock'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={bundle.stock_status && !bundle.stock_status.in_stock}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              bundle.stock_status && !bundle.stock_status.in_stock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-soft hover:shadow-md'
            }`}
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>

          {/* Mobile Quick View */}
          <button
            onClick={handleQuickView}
            className="md:hidden flex items-center justify-center w-11 py-2.5 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;