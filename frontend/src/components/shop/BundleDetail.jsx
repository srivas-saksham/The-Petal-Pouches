// frontend/src/components/shop/BundleDetail.jsx - FIXED WITH CART SERVICE

import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Share2, Check } from 'lucide-react';
import { formatBundlePrice, getBundleStockMessage, isBundleInStock } from '../../utils/bundleHelpers';
import BundleProducts from './BundleProducts';
import { addBundleToCart } from '../../services/cartService';

const BundleDetail = ({ bundle, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Handle both 'items' and 'Bundle_items' (from Supabase)
  const bundleItems = bundle?.items || bundle?.Bundle_items || [];

  const handleAddToCart = async () => {
    if (!bundle.stock_status?.in_stock) {
      alert('This bundle is out of stock');
      return;
    }

    setLoading(true);

    try {
      console.log('🛒 Adding bundle to cart:', bundle.id, 'Quantity:', quantity);

      const result = await addBundleToCart(bundle.id, quantity);

      if (result.success) {
        console.log('✅ Bundle added successfully');
        
        // Optional: Show success message with toast
        // toast.success('Bundle added to cart!');
        
        // Close modal after short delay
        if (onClose) {
          setTimeout(() => onClose(), 500);
        }
      } else {
        console.error('❌ Failed to add bundle:', result.error);
        alert(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!bundle) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Bundle Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={bundle.img_url || '/placeholder-bundle.png'}
                  alt={bundle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-bundle.png';
                  }}
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title & Description */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {bundle.title}
                </h1>
                {bundle.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {bundle.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                <p className="text-3xl font-bold text-gray-900">
                  {formatBundlePrice(bundle.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Complete bundle price
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {bundle.stock_status?.in_stock ? (
                  <>
                    <Check size={20} className="text-green-600" />
                    <span className="text-green-600 font-medium">
                      {getBundleStockMessage(bundle.stock_status)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center border rounded-lg"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !bundle.stock_status?.in_stock}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      Add to Cart
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Heart size={18} />
                    Wishlist
                  </button>
                  <button className="border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products List - Pass bundleItems instead of bundle.items */}
          <div className="mt-8 border-t pt-8">
            <BundleProducts items={bundleItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetail;