// frontend/src/components/bundle-detail/BundleProducts.jsx

import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';

const BundleProducts = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <Package size={32} className="mx-auto mb-2 text-slate-300 dark:text-tppdarkwhite/20" />
        <p className="text-sm text-slate-500 dark:text-tppdarkwhite/40 font-medium">No products in this bundle</p>
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
            <div key={item.id || index} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-900 dark:text-red-400 font-semibold">Product data missing</p>
                  <p className="text-xs text-red-700 dark:text-red-400/70">Item ID: {item.product_id}</p>
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
        const attributesText = Object.entries(attributes).map(([k, v]) => `${k}: ${v}`).join(' • ');

        return (
          <div key={item.id || index} className="flex gap-3 p-3 bg-slate-50 dark:bg-tppdarkwhite/5 rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/30 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => e.target.src = '/placeholder-product.png'} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-tppslate dark:text-tppdarkwhite text-sm mb-0.5 line-clamp-1">{title}</h3>
              {attributesText && <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40 mb-1">{attributesText}</p>}
              {description && <p className="text-xs text-slate-600 dark:text-tppdarkwhite/50 mb-1.5 line-clamp-1">{description}</p>}
              <div className="flex flex-wrap gap-3 text-xs">
                <div><span className="text-slate-400 dark:text-tppdarkwhite/30 font-medium">Price:</span><span className="text-tpppink dark:text-tppdarkwhite font-bold ml-1">{formatBundlePrice(price)}</span></div>
                <div><span className="text-slate-400 dark:text-tppdarkwhite/30 font-medium">SKU:</span><span className="text-tppslate dark:text-tppdarkwhite/70 font-mono ml-1">{sku}</span></div>
                <div><span className="text-slate-400 dark:text-tppdarkwhite/30 font-medium">Stock:</span><span className={`font-semibold ml-1 ${(product?.stock || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{(product?.stock || 0) > 0 ? `${product.stock}` : 'Out'}</span></div>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-start">
              <div className="bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite px-2 py-0.5 rounded-md text-xs font-bold border border-tpppink/20 dark:border-tppdarkwhite/20">
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