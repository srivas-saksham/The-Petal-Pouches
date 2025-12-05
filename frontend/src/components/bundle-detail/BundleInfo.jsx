// frontend/src/components/bundle-detail/BundleInfo.jsx
import React from 'react';
import { Star } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';

/**
 * BundleInfo - Title, rating, price, description
 * Compact minimal design
 */
const BundleInfo = ({ bundle, isOutOfStock }) => {
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-tppslate leading-tight">
        {bundle.title}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
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
        <span className="text-xs font-bold text-tppslate">
          {formatRating(ratingInfo.rating)}
        </span>
        {ratingInfo.count > 0 && (
          <span className="text-xs text-slate-500">
            ({ratingInfo.count})
          </span>
        )}
      </div>

      {/* Price */}
      <div className="bg-gradient-to-br from-tpppink/5 to-slate-50 rounded-xl p-4 border border-tpppink/20">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-bold text-tpppink">
            {formatBundlePrice(bundle.price)}
          </p>
          {bundle.original_price && bundle.original_price > bundle.price && (
            <p className="text-base text-slate-400 line-through">
              {formatBundlePrice(bundle.original_price)}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-600 font-medium">
          Tax included • Free shipping
        </p>
      </div>

      {/* Description */}
      {bundle.description && (
        <p className="text-sm text-slate-600 leading-snug">
          {bundle.description}
        </p>
      )}
    </div>
  );
};

export default BundleInfo;