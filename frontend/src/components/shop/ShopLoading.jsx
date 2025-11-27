// frontend/src/components/shop/ShopLoading.jsx

import React from 'react';

/**
 * ShopLoading Component
 * Skeleton loading state matching the product grid layout
 * Uses CSS shimmer animation for visual feedback
 * 
 * @param {string} layoutMode - '3' or '5' columns to match grid
 */
const ShopLoading = ({ layoutMode = '3' }) => {
  /**
   * Determine number of skeleton cards based on layout
   */
  const getSkeletonCount = () => {
    return layoutMode === '5' ? 15 : 12;
  };

  /**
   * Get grid classes matching ProductGrid
   */
  const getGridClasses = () => {
    const baseClasses = 'grid gap-4 sm:gap-5 lg:gap-6 auto-rows-max';

    if (layoutMode === '5') {
      return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`;
    }

    return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
  };

  /**
   * SkeletonCard Component
   */
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg overflow-hidden border-2 border-slate-200">
      {/* Image Skeleton - Square */}
      <div className="w-full aspect-square bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite]" />

      {/* Content Skeleton */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite] rounded" />

        {/* Price & Stock Skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-6 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite] rounded" />
          <div className="h-5 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite] rounded" />
        </div>

        {/* Mobile Buttons Skeleton */}
        <div className="sm:hidden flex gap-2 mt-3">
          <div className="flex-1 h-9 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite] rounded" />
          <div className="flex-1 h-9 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:1000px_100%] animate-[skeleton-shimmer_2s_infinite] rounded" />
        </div>
      </div>
    </div>
  );

  const skeletonCount = getSkeletonCount();
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  return (
    <>
      {/* CSS Animation Definition */}
      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>

      {/* Loading Info */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-2 h-2 rounded-full bg-tpppink animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-tpppink animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-tpppink animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-2 text-sm font-medium">Loading products...</span>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className={getGridClasses()}>
        {skeletons.map((index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  );
};

export default ShopLoading;