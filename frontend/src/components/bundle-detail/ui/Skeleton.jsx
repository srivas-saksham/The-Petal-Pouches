// frontend/src/components/ui/Skeleton.jsx
import React from 'react';

/**
 * Skeleton - Loading placeholder with shimmer
 * Compact minimal design
 */
const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded',
  className = '' 
}) => {
  return (
    <div
      className={`
        bg-slate-200 animate-pulse relative overflow-hidden
        ${width} ${height} ${rounded} ${className}
      `}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

/**
 * Predefined skeleton components
 */
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? 'w-2/3' : 'w-full'}
        height="h-3"
      />
    ))}
  </div>
);

export const SkeletonImage = ({ className = '' }) => (
  <Skeleton
    width="w-full"
    height="h-48"
    rounded="rounded-lg"
    className={className}
  />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
    <Skeleton height="h-32" rounded="rounded-lg" />
    <Skeleton height="h-4" width="w-3/4" />
    <SkeletonText lines={2} />
  </div>
);

export default Skeleton;