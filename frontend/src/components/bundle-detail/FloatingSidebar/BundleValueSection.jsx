// frontend/src/components/bundle-detail/FloatingSidebar/BundleValueSection.jsx
import React from 'react';
import { Package, Gift, Sparkles } from 'lucide-react';

/**
 * BundleValueSection - Compact bundle value display
 * Shows product count, items preview, and packaging info
 */
const BundleValueSection = ({ bundle, items = [] }) => {
  const productCount = items.length;
  
  // Calculate savings if original price exists
  const hasSavings = bundle.original_price && bundle.original_price > bundle.price;
  const savingsAmount = hasSavings ? bundle.original_price - bundle.price : 0;
  const savingsPercent = hasSavings 
    ? Math.round((savingsAmount / bundle.original_price) * 100) 
    : 0;

  // Get first 3 products for preview
  const previewItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
        <Sparkles size={14} className="text-tpppink" />
        Bundle Value
      </h3>

      {/* Products Count & Savings */}
      <div className="bg-gradient-to-br from-tpppink/10 to-purple-50 rounded-lg p-3 border border-tpppink/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-tpppink rounded-full flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Products</p>
              <p className="text-xl font-bold text-tpppink">{productCount}</p>
            </div>
          </div>
          
          {hasSavings && (
            <div className="text-right">
              <p className="text-xs text-green-600 font-semibold">Save ₹{savingsAmount.toFixed(0)}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                {savingsPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Preview List */}
        {previewItems.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-tpppink/10">
            {previewItems.map((item, index) => {
              const product = item.Products || item.product;
              const variant = item.Product_variants || item.variant;
              const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';
              const title = product?.title || 'Unknown Product';

              return (
                <div key={item.id || index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border border-slate-200 flex-shrink-0 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/placeholder-product.png'}
                    />
                  </div>
                  <p className="text-xs text-gray-700 flex-1 truncate font-medium">
                    {title}
                  </p>
                  <span className="text-xs text-tpppink font-bold">×{item.quantity}</span>
                </div>
              );
            })}
            {hasMore && (
              <p className="text-xs text-tpppink font-semibold pt-1">
                +{items.length - 3} more items
              </p>
            )}
          </div>
        )}
      </div>

      {/* Compact Experience Features */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
          <Gift size={14} className="text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-800 leading-tight">Premium</p>
            <p className="text-xs text-gray-600">Packaging</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg border border-pink-100">
          <Sparkles size={14} className="text-tpppink flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-800 leading-tight">Unboxing</p>
            <p className="text-xs text-gray-600">Experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleValueSection;