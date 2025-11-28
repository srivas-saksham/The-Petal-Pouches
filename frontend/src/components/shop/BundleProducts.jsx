// frontend/src/components/shop/BundleProducts.jsx

import React from 'react';
import { Package } from 'lucide-react';
import { getItemDisplayName, getItemImageUrl } from '../../utils/bundleHelpers';

const BundleProducts = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package size={48} className="mx-auto mb-2 text-gray-400" />
        <p>No items in this bundle</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        What's Included ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Product Image */}
            <div className="flex-shrink-0 w-20 h-20 bg-white rounded-md overflow-hidden">
              <img
                src={getItemImageUrl(item)}
                alt={getItemDisplayName(item)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <h4 className="font-medium text-gray-900 mb-1">
                {getItemDisplayName(item)}
              </h4>

              {/* Product Description (if available) */}
              {item.product?.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {item.product.description}
                </p>
              )}

              {/* Quantity Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  Qty: {item.quantity}
                </span>

                {/* Category Badge */}
                {item.product?.category?.name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    {item.product.category.name}
                  </span>
                )}
              </div>

              {/* Variant Attributes */}
              {item.variant?.attributes && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(item.variant.attributes).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-xs text-gray-500 bg-white px-2 py-1 rounded"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total Items Summary */}
      <div className="mt-4 p-4 bg-pink-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Total Items in Bundle:</span>{' '}
          <span className="font-semibold text-pink-600">
            {items.reduce((sum, item) => sum + item.quantity, 0)} pieces
          </span>
        </p>
      </div>
    </div>
  );
};

export default BundleProducts;