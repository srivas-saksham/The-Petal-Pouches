// frontend/src/components/adminComps/BundlePreview.jsx

import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';

export default function BundlePreview({ bundleId, onClose }) {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bundleId) {
      fetchBundle();
    }
  }, [bundleId]);

  const fetchBundle = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminApi.get(`/api/bundles/${bundleId}`);

      if (response.data) {
        setBundle(response.data);
      } else {
        setError(response.message || 'Failed to load bundle');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!bundleId) return null;

  // Calculate savings
  const calculateOriginalPrice = () => {
    if (!bundle) return 0;
    return bundle.bundle_items.reduce((total, item) => {
      const price = item.Product_variants ? item.Product_variants.price : item.Products.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const originalPrice = calculateOriginalPrice();
  const bundlePrice = bundle?.price || 0;
  const savings = originalPrice - bundlePrice;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  // Format variant attributes
  const formatVariantAttributes = (attributes) => {
    if (!attributes) return '';
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bundle Preview</h3>
            <p className="text-sm text-gray-600">Customer View</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          {bundle && (
            <div className="space-y-6">
              {/* Bundle Image & Title */}
              <div className="text-center">
                {bundle.img_url && (
                  <div className="w-full max-w-md mx-auto mb-4 rounded-lg overflow-hidden">
                    <img
                      src={bundle.img_url}
                      alt={bundle.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {bundle.title}
                </h1>
                {bundle.description && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {bundle.description}
                  </p>
                )}
              </div>

              {/* Pricing Card */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg border-2 border-pink-200">
                <div className="text-center">
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                      SAVE {discountPercent}%
                    </div>
                  )}

                  {/* Price Display */}
                  <div className="flex justify-center items-center gap-4 mb-2">
                    <div className="text-gray-500 line-through text-xl">
                      ₹{originalPrice}
                    </div>
                    <div className="text-4xl font-bold text-pink-600">
                      ₹{bundlePrice}
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="text-green-700 font-semibold">
                    You save ₹{savings}!
                  </div>

                  {/* Stock Status */}
                  {bundle.stock_limit && (
                    <div className="mt-3 text-sm">
                      {bundle.stock_limit > 0 ? (
                        <span className="text-orange-600 font-medium">
                          Only {bundle.stock_limit} bundles left in stock!
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* What's Included Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  What's Included in This Bundle
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    {bundle.bundle_items.map((item, index) => {
                      const product = item.Products;
                      const variant = item.Product_variants;
                      const itemPrice = variant ? variant.price : product.price;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200"
                        >
                          {/* Item Number Badge */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          </div>

                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                              {(variant?.img_url || product.img_url) ? (
                                <img
                                  src={variant?.img_url || product.img_url}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {product.title}
                            </h3>
                            
                            {/* Variant Info */}
                            {variant && (
                              <p className="text-sm text-gray-600 mt-1">
                                {formatVariantAttributes(variant.attributes)}
                              </p>
                            )}

                            {/* Quantity */}
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity}
                            </p>

                            {/* Individual Price */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Unit Price:
                              </span>
                              <span className="text-sm font-semibold text-gray-700">
                                ₹{itemPrice}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-xs text-gray-500">
                                  (Total: ₹{itemPrice * item.quantity})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Items Count */}
                  <div className="mt-4 pt-4 border-t border-gray-300 text-center">
                    <p className="text-gray-700 font-medium">
                      <span className="text-pink-600 font-bold text-lg">
                        {bundle.bundle_items.length}
                      </span>{' '}
                      Items in this bundle
                    </p>
                  </div>
                </div>
              </div>

              {/* Bundle Benefits */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  Why Buy This Bundle?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="font-semibold text-gray-900">Save Money</div>
                    <div className="text-sm text-gray-600">
                      {discountPercent}% off regular price
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <div className="font-semibold text-gray-900">Perfect Gift</div>
                    <div className="text-sm text-gray-600">
                      Curated combination
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">✨</div>
                    <div className="font-semibold text-gray-900">Ready to Go</div>
                    <div className="text-sm text-gray-600">
                      Everything in one package
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button (Preview Only) */}
              <div className="text-center">
                <button
                  disabled
                  className="px-8 py-4 bg-pink-600 text-white font-bold rounded-lg text-lg opacity-50 cursor-not-allowed"
                >
                  Add to Cart (Preview Only)
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  This is how customers will see your bundle
                </p>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 ${bundle.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {bundle.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(bundle.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}