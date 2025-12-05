// frontend/src/components/bundle-detail/BundleProducts.jsx
import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';

/**
 * BundleProducts - COMPACT VERSION
 * Minimal design with smaller text and tight spacing
 */
const BundleProducts = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <Package size={32} className="mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-500 font-medium">No products in this bundle</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const product = item.Products || item.product;
        const variant = item.Product_variants || item.variant;

        if (!product) {
          return (
            <div key={item.id || index} className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-900 font-semibold">Product data missing</p>
                  <p className="text-xs text-red-700">Item ID: {item.product_id}</p>
                </div>
              </div>
            </div>
          );
        }

        const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';
        const price = variant?.price || product?.price || 0;
        const sku = variant?.sku || product?.sku || 'N/A';
        const title = product.title || 'Unknown Product';
        const description = product.description || '';
        const attributes = variant?.attributes || {};
        const attributesText = Object.entries(attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' • ');

        return (
          <div
            key={item.id || index}
            className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-tpppink/30 transition-colors"
          >
            {/* Image - Compact */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = '/placeholder-product.png'}
                />
              </div>
            </div>

            {/* Details - Compact */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-tppslate text-sm mb-0.5 line-clamp-1">
                {title}
              </h3>

              {/* Attributes */}
              {attributesText && (
                <p className="text-xs text-slate-500 mb-1">
                  {attributesText}
                </p>
              )}

              {/* Description */}
              {description && (
                <p className="text-xs text-slate-600 mb-1.5 line-clamp-1">
                  {description}
                </p>
              )}

              {/* Meta - Compact Grid */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Price:</span>
                  <span className="text-tpppink font-bold ml-1">
                    {formatBundlePrice(price)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">SKU:</span>
                  <span className="text-tppslate font-mono ml-1">{sku}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Stock:</span>
                  <span className={`font-semibold ml-1 ${
                    (product?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(product?.stock || 0) > 0 ? `${product.stock}` : 'Out'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Badge - Compact */}
            <div className="flex-shrink-0 flex items-start">
              <div className="bg-tpppink/10 text-tpppink px-2 py-0.5 rounded-md text-xs font-bold border border-tpppink/20">
                ×{item.quantity}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BundleProducts;