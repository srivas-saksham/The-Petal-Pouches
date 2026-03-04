// frontend/src/components/bundle-detail/BundleInfo.jsx

import React from 'react';
import { Star } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';

const BundleInfo = ({ bundle, isOutOfStock }) => {
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-tppslate dark:text-tppdarkwhite leading-tight">{bundle.title}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map((star) => (
            <Star key={star} size={14} className={`${
              star <= Math.floor(ratingInfo.rating) ? 'fill-amber-400 text-amber-400'
              : star === Math.ceil(ratingInfo.rating) && ratingInfo.rating % 1 !== 0 ? 'fill-amber-400/50 text-amber-400'
              : 'fill-slate-200 dark:fill-tppdarkwhite/20 text-slate-200 dark:text-tppdarkwhite/20'
            }`} />
          ))}
        </div>
        <span className="text-xs font-bold text-tppslate dark:text-tppdarkwhite">{formatRating(ratingInfo.rating)}</span>
        {ratingInfo.count > 0 && <span className="text-xs text-slate-500 dark:text-tppdarkwhite/40">({ratingInfo.count})</span>}
      </div>

      <div className="bg-gradient-to-br from-tpppink/5 to-slate-50 dark:from-tppdarkwhite/10 dark:to-tppdarkwhite/5 rounded-xl p-4 border border-tpppink/20 dark:border-tppdarkwhite/20">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-bold text-tpppink dark:text-tppdarkwhite">{formatBundlePrice(bundle.price)}</p>
          {bundle.original_price && bundle.original_price > bundle.price && (
            <p className="text-base text-slate-400 dark:text-tppdarkwhite/30 line-through">{formatBundlePrice(bundle.original_price)}</p>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-tppdarkwhite/50 font-medium">Tax included • Free shipping</p>
      </div>

      {bundle.description && <p className="text-sm text-slate-600 dark:text-tppdarkwhite/60 leading-snug">{bundle.description}</p>}
    </div>
  );
};

export default BundleInfo;