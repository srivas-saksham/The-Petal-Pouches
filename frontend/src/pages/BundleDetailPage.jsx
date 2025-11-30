// frontend/src/pages/BundleDetailPage.jsx - WITH FULL CART INTEGRATION

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Check, AlertCircle, Package, Plus, Minus, ShoppingCart, AlertTriangle, Trash2 } from 'lucide-react';
import { formatBundlePrice, getBundleStockMessage } from '../utils/bundleHelpers';
import BundleProducts from '../components/shop/BundleProducts';
import bundleService from '../services/bundleService';
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';

/**
 * BundleDetailPage - WITH CART INTEGRATION
 * Features:
 * - Add to cart functionality
 * - Quantity controls
 * - Stock limit validation
 * - Low stock warnings
 * - Real-time cart sync
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bundle, setBundle] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local quantity for UI
  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // ⭐ Debouncing state
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  // ⭐ Extract stock limit EARLY (before cart hooks)
  const stockLimit = bundle?.stock_limit;
  const isLowStock = stockLimit && stockLimit < 5;
  
  // ⭐ Cart integration (AFTER stockLimit is defined)
  const { cartItems, refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  const cartItem = getCartItemByBundleId(id);
  const quantityInCart = getBundleQuantityInCart(id);
  const isInCart = quantityInCart > 0;

  // Fetch bundle details
  useEffect(() => {
    const fetchBundle = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('📍 Fetching bundle:', id);
        
        const [bundleResponse, stockResponse] = await Promise.all([
          bundleService.getBundleDetails(id),
          bundleService.checkBundleStock(id)
        ]);

        console.log('✅ Bundle Response:', bundleResponse);
        console.log('✅ Stock Response:', stockResponse);

        const bundleData = bundleResponse.data;
        const stockData = stockResponse.data;

        const items = bundleData.Bundle_items || bundleData.items || [];
        
        setBundle({
          ...bundleData,
          items
        });
        
        setStockStatus(stockData);
      } catch (err) {
        console.error('❌ Failed to fetch bundle:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load bundle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBundle();
    }
  }, [id]);

  // ⭐ Sync local quantity when cart changes
  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(1);
    }
  }, [cartItem]);

  // ⭐ DEBOUNCED UPDATE TO SERVER (when in cart)
  useEffect(() => {
    if (pendingQuantity === null || !isInCart || !cartItem) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 800ms
    debounceTimerRef.current = setTimeout(async () => {
      if (!cartItem) return;

      console.log(`🔄 Syncing quantity to server: ${pendingQuantity}`);
      setUpdating(true);

      try {
        if (pendingQuantity === 0) {
          // Remove from cart
          const result = await removeFromCart(cartItem.id);
          if (result.success) {
            console.log('✅ Item removed from cart');
            refreshCart();
          } else {
            console.error('❌ Failed to remove:', result.error);
            alert(result.error || 'Failed to remove item');
            // Revert local quantity on error
            setLocalQuantity(cartItem.quantity);
          }
        } else {
          // Update quantity with stock limit validation
          const result = await updateCartItem(cartItem.id, pendingQuantity, stockLimit);
          if (result.success) {
            console.log(`✅ Quantity synced: ${pendingQuantity}`);
            refreshCart();
          } else {
            console.error('❌ Failed to update:', result.error);
            alert(result.error || 'Failed to update quantity');
            // Revert local quantity on error
            setLocalQuantity(cartItem.quantity);
          }
        }
      } catch (error) {
        console.error('❌ Update error:', error);
        alert('Failed to update quantity');
        // Revert local quantity on error
        setLocalQuantity(cartItem.quantity);
      } finally {
        setUpdating(false);
        setPendingQuantity(null);
      }
    }, 800); // 800ms debounce delay

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pendingQuantity, cartItem, stockLimit, refreshCart, isInCart]);

  // ⭐ Extract stock limit and other computed values (AFTER hooks)
  const items = bundle?.items || [];
  const hasItems = items.length > 0;

  // ⭐ Handle Add to Cart
  const handleAddToCart = async () => {
    if (!stockStatus?.available) {
      alert('This bundle is currently out of stock');
      return;
    }

    setAdding(true);

    try {
      const result = await addBundleToCart(id, localQuantity, stockLimit, quantityInCart);

      if (result.success) {
        console.log('✅ Bundle added to cart');
        refreshCart();
      } else {
        console.error('❌ Failed to add:', result.error);
        alert(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // ⭐ Handle Quantity Increment
  const handleIncrement = () => {
    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed per bundle`);
      return;
    }
    setLocalQuantity(prev => prev + 1);
  };

  // ⭐ Handle Quantity Decrement
  const handleDecrement = () => {
    if (localQuantity > 1) {
      setLocalQuantity(prev => prev - 1);
    }
  };

  // ⭐ Handle Cart Increment (when in cart) - WITH DEBOUNCING
  const handleCartIncrement = () => {
    const newQuantity = localQuantity + 1;
    if (stockLimit && newQuantity > stockLimit) {
      alert(`Maximum ${stockLimit} units allowed per bundle`);
      return;
    }
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity); // Trigger debounced update
    console.log(`➕ Increment: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  // ⭐ Handle Cart Decrement (when in cart) - WITH DEBOUNCING
  const handleCartDecrement = () => {
    if (localQuantity <= 1) return;
    
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity); // Trigger debounced update
    console.log(`➖ Decrement: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  // ⭐ Handle Remove from Cart
  const handleRemoveFromCart = async () => {
    if (!cartItem) return;

    if (!window.confirm(`Remove "${bundle.title}" from cart?`)) {
      return;
    }

    setUpdating(true);

    try {
      const result = await removeFromCart(cartItem.id);

      if (result.success) {
        console.log('✅ Removed from cart');
        setLocalQuantity(1);
        refreshCart();
      } else {
        console.error('❌ Failed to remove:', result.error);
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('❌ Remove error:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bundle.title,
          text: bundle.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Bundle</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/shop/bundles')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Bundles
          </button>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Bundle not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/shop/bundles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Bundles
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              {bundle.img_url ? (
                <img
                  src={bundle.img_url}
                  alt={bundle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-bundle.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package size={64} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Bundle Info Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Products Included</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bundle.product_count || items.length}
                </p>
              </div>
              {bundle.savings > 0 && (
                <div className="bg-green-50 rounded-lg p-4 shadow">
                  <p className="text-sm text-green-700 mb-1">You Save</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatBundlePrice(bundle.savings)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {bundle.title}
              </h1>
              {bundle.description && (
                <p className="text-gray-600 leading-relaxed text-lg">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-b py-6">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-gray-900">
                  {formatBundlePrice(bundle.price)}
                </p>
                {bundle.original_price && bundle.original_price > bundle.price && (
                  <p className="text-xl text-gray-400 line-through">
                    {formatBundlePrice(bundle.original_price)}
                  </p>
                )}
              </div>
              {bundle.discount_percent > 0 && (
                <div className="inline-block mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {bundle.discount_percent}% OFF
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3">
                Complete bundle price • Tax included
              </p>
            </div>

            {/* Stock Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {stockStatus?.available ? (
                  <>
                    <Check size={24} className="text-green-600" />
                    <span className="text-green-600 font-medium text-lg">In Stock</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} className="text-red-600" />
                    <span className="text-red-600 font-medium text-lg">Out of Stock</span>
                  </>
                )}
              </div>

              {/* ⭐ LOW STOCK WARNING */}
              {isLowStock && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span className="font-semibold">Only {stockLimit} unit{stockLimit === 1 ? '' : 's'} left in stock!</span>
                </div>
              )}
            </div>

            {/* ⭐ CART CONTROLS */}
            {!isInCart ? (
              // Add to Cart Section (when not in cart)
              <>
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDecrement}
                      disabled={localQuantity <= 1}
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={localQuantity}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        if (stockLimit && val > stockLimit) {
                          alert(`Maximum ${stockLimit} units allowed`);
                          return;
                        }
                        setLocalQuantity(val);
                      }}
                      className="w-24 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max={stockLimit || undefined}
                    />
                    <button
                      onClick={handleIncrement}
                      disabled={stockLimit && localQuantity >= stockLimit}
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    {stockLimit && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Max: {stockLimit})
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding || !stockStatus?.available || stockLimit === 0}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    !stockStatus?.available || stockLimit === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : adding
                      ? 'bg-purple-400 text-white cursor-wait'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-md hover:shadow-lg'
                  }`}
                >
                  {adding ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      Add to Cart
                    </>
                  )}
                </button>
              </>
            ) : (
              // Already in Cart Section
              <div className="space-y-4">
                {/* In Cart Badge */}
                <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 relative">
                  {/* Syncing Indicator */}
                  {updating && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap z-10 shadow-lg">
                      Syncing...
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Check size={20} className="text-green-700" />
                    <span className="text-green-700 font-semibold text-lg">
                      Already in Cart: {quantityInCart} unit{quantityInCart === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCartDecrement}
                      disabled={updating || localQuantity <= 1}
                      className="w-10 h-10 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                    >
                      <Minus size={18} />
                    </button>

                    <div className="flex-1 text-center relative">
                      <span className="text-2xl font-bold text-green-700">{localQuantity}</span>
                      {/* Pending indicator dot */}
                      {pendingQuantity !== null && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" title="Syncing..." />
                      )}
                    </div>

                    <button
                      onClick={handleCartIncrement}
                      disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                      className="w-10 h-10 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={handleRemoveFromCart}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  Remove from Cart
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="border-2 border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart size={18} />
                Wishlist
              </button>
              <button 
                onClick={handleShare}
                className="border-2 border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What's Included ({items.length} {items.length === 1 ? 'Product' : 'Products'})
            </h2>
            
            {hasItems ? (
              <BundleProducts items={items} />
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No products in this bundle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;