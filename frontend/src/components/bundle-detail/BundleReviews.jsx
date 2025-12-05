// frontend/src/components/bundle-detail/BundleReviews.jsx
import React, { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { getDisplayRating, formatRating, formatTimeAgo } from '../../utils/reviewHelpers';

/**
 * BundleReviews - Reviews section with distribution and list
 * Compact minimal design
 */
const BundleReviews = ({ bundle }) => {
  const [sortBy, setSortBy] = useState('recent');
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);
  const reviews = bundle.reviews || [];

  // Mock rating distribution
  const distribution = {
    5: Math.floor(reviews.length * 0.6),
    4: Math.floor(reviews.length * 0.25),
    3: Math.floor(reviews.length * 0.1),
    2: Math.floor(reviews.length * 0.03),
    1: Math.floor(reviews.length * 0.02)
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-tpppink to-tppslate px-4 py-3 border-b border-slate-200">
        <h2 className="text-base font-bold text-white">Customer Reviews</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Rating Summary */}
        <div className="flex items-start gap-6 pb-4 border-b border-slate-100">
          {/* Average Rating */}
          <div className="text-center">
            <p className="text-3xl font-bold text-tppslate mb-1">
              {formatRating(ratingInfo.rating)}
            </p>
            <div className="flex items-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={`${
                    star <= Math.floor(ratingInfo.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {ratingInfo.count} {ratingInfo.count === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 w-4">{rating}</span>
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: `${reviews.length > 0 ? (distribution[rating] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">
                  {distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sort & Filter */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-tppslate">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-tpppink focus:border-tpppink"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="pb-3 border-b border-slate-100 last:border-0">
                {/* Reviewer Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <User size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-tppslate">
                      {review.user_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTimeAgo(review.created_at)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-slate-700 leading-snug mb-2">
                  {review.comment}
                </p>

                {/* Helpful Button */}
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-tpppink transition-colors">
                  <ThumbsUp size={12} />
                  Helpful ({review.helpful_count || 0})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-2">No reviews yet</p>
            <button className="text-xs font-semibold text-tpppink hover:underline">
              Be the first to review
            </button>
          </div>
        )}

        {/* Write Review Button */}
        <button className="w-full py-2.5 border-2 border-tpppink text-tpppink rounded-lg font-bold text-sm hover:bg-tpppink/5 transition-all">
          Write a Review
        </button>
      </div>
    </div>
  );
};

export default BundleReviews;