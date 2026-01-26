// frontend/src/components/bundle-detail/BundleSkeleton.jsx
// Complete skeleton loader for BundleDetailPage
// Matches exact layout: Image Gallery + Key Details + FloatingSidebar + Reviews

import React from 'react';

/**
 * BundleSkeleton - Full page skeleton for bundle/product detail page
 * Includes shimmer animation and matches the exact layout structure
 */
const BundleSkeleton = () => {
  return (
    <div className="min-h-screen"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {/* Header Skeleton - CommonHeader is already rendered */}
      <div className="sticky top-0 z-30">
        {/* Main Header Bar */}
        <div className="h-16 bg-white border-b border-slate-200">
          <div className="max-w-9xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="skeleton-shimmer h-8 w-32 rounded bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="skeleton-shimmer h-8 w-8 rounded-full bg-slate-200" />
              <div className="skeleton-shimmer h-8 w-8 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Breadcrumb Bar */}
        <div className="h-12 bg-white/95 border-b border-slate-100">
          <div className="max-w-9xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-3 w-16 rounded bg-slate-200" />
              <div className="skeleton-shimmer h-3 w-3 rounded bg-slate-200" />
              <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200" />
              <div className="skeleton-shimmer h-3 w-3 rounded bg-slate-200" />
              <div className="skeleton-shimmer h-3 w-24 rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-8 w-8 rounded-lg bg-slate-200" />
              <div className="skeleton-shimmer h-8 w-8 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto md:px-6 md:py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-12">
          
          {/* ==================== LEFT COLUMN - MAIN CONTENT ==================== */}
          <div className="space-y-4 md:space-y-0">
            
            {/* CONTAINER 1: Product Details */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Image Gallery + Key Details Grid */}
              <div className="grid md:grid-cols-1 lg:grid-cols-[45%_55%]">
                
                {/* ========== IMAGE GALLERY SKELETON ========== */}
                <div className="relative">
                  {/* Main Image - Square aspect ratio */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0 bg-slate-200" />
                  </div>

                  {/* Thumbnail Carousel (Desktop only) */}
                  <div className="hidden md:block border-t border-slate-200 bg-slate-50 p-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-shimmer w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0" />
                      ))}
                    </div>
                  </div>

                  {/* Mobile Thumbnail Swiper */}
                  <div className="md:hidden border-t border-slate-200 bg-slate-50 p-2">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-shimmer w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ========== KEY DETAILS SKELETON ========== */}
                <div className="p-3 md:p-6 md:border-l border-slate-200 space-y-6">
                  
                  {/* 1. TITLE */}
                  <div>
                    <div className="skeleton-shimmer h-9 w-4/5 rounded bg-slate-200 mb-2" />
                    <div className="skeleton-shimmer h-9 w-3/5 rounded bg-slate-200" />
                  </div>

                  {/* 2. DESCRIPTION */}
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200" />
                    <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200" />
                    <div className="skeleton-shimmer h-4 w-4/5 rounded bg-slate-200" />
                  </div>

                  {/* 3. PRICE SECTION */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    {/* Price */}
                    <div className="flex items-end gap-2">
                      <div className="skeleton-shimmer h-10 w-32 rounded bg-slate-200" />
                      <div className="skeleton-shimmer h-6 w-20 rounded bg-slate-200" />
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-slate-200" />
                      <div className="skeleton-shimmer h-4 w-20 rounded bg-slate-200" />
                    </div>

                    {/* Tax Info */}
                    <div className="skeleton-shimmer h-4 w-48 rounded bg-slate-200" />
                  </div>

                  {/* 4. QUANTITY & ADD TO CART */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    {/* Quantity Label */}
                    <div className="skeleton-shimmer h-3 w-16 rounded bg-slate-200" />
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer w-9 h-9 rounded-md bg-slate-200" />
                      <div className="skeleton-shimmer w-16 h-9 rounded-md bg-slate-200" />
                      <div className="skeleton-shimmer w-9 h-9 rounded-md bg-slate-200" />
                    </div>

                    {/* Add to Cart Button */}
                    <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
                  </div>

                  {/* 5. PRODUCTS INCLUDED DROPDOWN */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="skeleton-shimmer h-4 w-40 rounded bg-slate-200" />
                      <div className="skeleton-shimmer h-4 w-4 rounded bg-slate-200" />
                    </div>

                    {/* Product Items */}
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="skeleton-shimmer w-12 h-12 rounded-md bg-slate-200 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton-shimmer h-3 w-3/4 rounded bg-slate-200" />
                            <div className="skeleton-shimmer h-3 w-1/2 rounded bg-slate-200" />
                          </div>
                          <div className="skeleton-shimmer w-8 h-5 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* About This Bundle/Product Section */}
              <div className="border-t border-slate-200 p-3 md:p-6 space-y-3">
                <div className="skeleton-shimmer h-5 w-48 rounded bg-slate-200" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-4 w-full rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-4 w-4/5 rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-4 w-3/5 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            {/* CONTAINER 2: MOBILE ONLY - Delivery/Sidebar Section */}
            <div className="md:hidden bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Delivery Section */}
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200" />
                
                {/* Address/PIN Input */}
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
                
                {/* Delivery Info */}
                <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200" />
                
                {/* Free Shipping Badge */}
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
              </div>

              {/* Section Break */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center px-4">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <div className="bg-white px-3">
                    <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                </div>
              </div>

              {/* Bundle Value Section */}
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200" />
                <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200" />
              </div>

              {/* Section Break */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center px-4">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <div className="bg-white px-3">
                    <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-4 space-y-3">
                <div className="skeleton-shimmer h-3 w-32 rounded bg-slate-200" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="skeleton-shimmer h-12 rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-12 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            {/* CONTAINER 3: Reviews Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Reviews Header */}
              <div className="px-4 py-3 bg-tppslate flex items-center justify-between">
                <div className="skeleton-shimmer h-5 w-40 rounded bg-white/20" />
                <div className="skeleton-shimmer h-5 w-5 rounded bg-white/20" />
              </div>

              {/* Reviews Content */}
              <div className="px-4 py-4 space-y-4">
                
                {/* Rating Summary */}
                <div className="flex items-center gap-6 pb-4 border-b border-slate-100">
                  {/* Score */}
                  <div className="text-center space-y-2">
                    <div className="skeleton-shimmer h-10 w-16 rounded bg-slate-200 mx-auto" />
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-shimmer w-3 h-3 rounded bg-slate-200" />
                      ))}
                    </div>
                    <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200 mx-auto" />
                  </div>

                  {/* Distribution Bars */}
                  <div className="flex-1 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="skeleton-shimmer w-2 h-3 rounded bg-slate-200" />
                        <div className="skeleton-shimmer w-2 h-2 rounded bg-slate-200" />
                        <div className="skeleton-shimmer flex-1 h-2 rounded-full bg-slate-200" />
                        <div className="skeleton-shimmer w-8 h-3 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Items */}
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="pb-3 border-b border-slate-100 space-y-2">
                      {/* User Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="skeleton-shimmer w-8 h-8 rounded-full bg-slate-200" />
                          <div className="space-y-1">
                            <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200" />
                            <div className="skeleton-shimmer h-3 w-20 rounded bg-slate-200" />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="skeleton-shimmer w-3 h-3 rounded bg-slate-200" />
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="space-y-1">
                        <div className="skeleton-shimmer h-3 w-full rounded bg-slate-200" />
                        <div className="skeleton-shimmer h-3 w-full rounded bg-slate-200" />
                        <div className="skeleton-shimmer h-3 w-3/4 rounded bg-slate-200" />
                      </div>

                      {/* Helpful */}
                      <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />

                {/* Write Review Button */}
                <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
              </div>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN - DESKTOP SIDEBAR ==================== */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-white rounded-xl border-2 border-dashed border-tppslate/50 shadow-lg overflow-hidden">
                
                {/* Delivery Section */}
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-4 w-24 rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
                  <div className="skeleton-shimmer h-24 w-full rounded-lg bg-slate-200" />
                  <div className="skeleton-shimmer h-12 w-full rounded-lg bg-slate-200" />
                </div>

                {/* Section Break */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-white px-3">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Bundle Value */}
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-4 w-32 rounded bg-slate-200" />
                  <div className="skeleton-shimmer h-32 w-full rounded-lg bg-slate-200" />
                </div>

                {/* Section Break */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-white px-3">
                      <div className="skeleton-shimmer w-2 h-2 rounded-full bg-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-4 space-y-3">
                  <div className="skeleton-shimmer h-3 w-32 rounded bg-slate-200" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="skeleton-shimmer h-14 rounded bg-slate-200" />
                    <div className="skeleton-shimmer h-14 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Shimmer Animation Keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            #e2e8f0 0%,
            #f1f5f9 20%,
            #e2e8f0 40%,
            #e2e8f0 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
};

export default BundleSkeleton;