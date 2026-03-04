// frontend/src/components/bundle-detail/FloatingSidebar/BundleValueSection.jsx

import React from 'react';
import { Package, Sparkles, Circle } from 'lucide-react';

const BundleValueSection = ({ bundle, items = [] }) => {
  const isBundle = items.length > 0;

  const productCount = items.length;
  const hasSavings = bundle.original_price && bundle.original_price > bundle.price;
  const savingsAmount = hasSavings ? bundle.original_price - bundle.price : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / bundle.original_price) * 100) : 0;

  const singleImage =
    bundle?.Product_images?.find(img => img.is_primary)?.img_url ||
    bundle?.Product_images?.[0]?.img_url ||
    bundle?.img_url ||
    '/placeholder-product.png';

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 dark:text-tppdarkwhite uppercase tracking-wide flex items-center gap-1.5">
        <Sparkles size={14} className="text-tpppink dark:text-tppdarkwhite" />
        {isBundle ? 'Bundle Value' : 'Product'}
      </h3>

      <div className="bg-gradient-to-br from-tpppink/10 to-purple-50 dark:from-tppdarkwhite/10 dark:to-tppdarkwhite/5 rounded-lg p-3 border border-tpppink/20 dark:border-tppdarkwhite/20">

        {isBundle ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-tpppink dark:bg-tppdarkwhite rounded-full flex items-center justify-center">
                  <Package size={14} className="text-white dark:text-tppdark" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-tppdarkwhite/50 font-medium">Products</p>
                  <p className="text-xl font-bold text-tpppink dark:text-tppdarkwhite">{productCount}</p>
                </div>
              </div>
              {hasSavings && (
                <div className="text-right">
                  <p className="font-inter text-xs text-green-600 dark:text-green-400 font-semibold">Save ₹{savingsAmount.toFixed(0)}</p>
                  <span className="font-inter text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">{savingsPercent}% OFF</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-tpppink/10 dark:border-tppdarkwhite/10">
              {items.map((item, index) => {
                const product = item.Products || item.product;
                const variant = item.Product_variants || item.variant;
                const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';
                const title = product?.title || 'Unknown Product';
                return (
                  <div key={item.id || index} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 flex-shrink-0 overflow-hidden">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => e.target.src = '/placeholder-product.png'} />
                    </div>
                    <p className="text-xs text-gray-700 dark:text-tppdarkwhite/70 flex-1 truncate font-medium">{title}</p>
                    <span className="text-xs text-tpppink dark:text-tppdarkwhite font-bold">×{item.quantity}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 flex-shrink-0 overflow-hidden">
              <img
                src={singleImage}
                alt={bundle.title}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = '/placeholder-product.png'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-tppdarkwhite/50 font-medium mb-0.5">You're buying</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-tppdarkwhite leading-snug line-clamp-2">{bundle.title}</p>
            </div>
            {hasSavings && (
              <div className="text-right flex-shrink-0">
                <p className="font-inter text-xs text-green-600 dark:text-green-400 font-semibold">Save ₹{savingsAmount.toFixed(0)}</p>
                <span className="font-inter text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">{savingsPercent}% OFF</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-6">
        <p className="text-xs text-gray-600 dark:text-tppdarkwhite/50">Premium Packaging</p>
        <Circle size={10} className="text-gray-400 dark:text-tppdarkwhite/20" />
        <p className="text-xs text-gray-600 dark:text-tppdarkwhite/50">Experience Unboxing</p>
      </div>
    </div>
  );
};

export default BundleValueSection;