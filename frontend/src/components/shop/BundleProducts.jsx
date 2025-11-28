// frontend/src/components/shop/BundleProducts.jsx

import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';

/**
 * BundleProducts Component
 * Displays all products included in a bundle
 * 
 * Accepts items with structure:
 * {
 *   id, quantity, product_id, product_variant_id,
 *   Products: { id, title, price, img_url, sku, description, stock },
 *   Product_variants: { id, sku, attributes, img_url, price, stock }
 * }
 */
const BundleProducts = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No products in this bundle</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        // Extract product data - handle both Products and product keys
        const product = item.Products || item.product;
        const variant = item.Product_variants || item.variant;

        if (!product) {
          return (
            <div key={item.id || index} className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-900 font-medium">Product data missing</p>
                  <p className="text-sm text-red-700">Item ID: {item.product_id}</p>
                </div>
              </div>
            </div>
          );
        }

        // Get image - prioritize variant image
        const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';

        // Get price - prioritize variant price
        const price = variant?.price || product?.price || 0;

        // Get SKU - prioritize variant SKU
        const sku = variant?.sku || product?.sku || 'N/A';

        // Get title
        const title = product.title || 'Unknown Product';

        // Get description
        const description = product.description || '';

        // Get attributes for display
        const attributes = variant?.attributes || {};
        const attributesText = Object.entries(attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' • ');

        return (
          <div
            key={item.id || index}
            className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border border-gray-200">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                {title}
              </h3>

              {/* Attributes (if variant) */}
              {attributesText && (
                <p className="text-sm text-gray-600 mb-2">
                  {attributesText}
                </p>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {/* Price */}
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900">
                    {formatBundlePrice(price)}
                  </p>
                </div>

                {/* SKU */}
                <div>
                  <p className="text-gray-500">SKU</p>
                  <p className="font-mono text-gray-900">{sku}</p>
                </div>

                {/* Quantity in Bundle */}
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-semibold text-gray-900">{item.quantity}</p>
                </div>

                {/* Stock Status */}
                <div>
                  <p className="text-gray-500">Stock</p>
                  {(product?.stock || 0) > 0 ? (
                    <p className="font-semibold text-green-700">
                      {product.stock} available
                    </p>
                  ) : (
                    <p className="font-semibold text-red-700">Out of stock</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Badge */}
            <div className="flex-shrink-0 flex items-start pt-1">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                x{item.quantity}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BundleProducts;