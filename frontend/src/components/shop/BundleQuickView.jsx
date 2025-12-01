// frontend/src/components/shop/BundleQuickView.jsx - WITH FULL CART INTEGRATION

import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Star, Package, AlertTriangle, XCircle, Plus, Minus, Trash2, Check } from 'lucide-react';
import { formatBundlePrice, getItemDisplayName, getItemImageUrl } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';
import { addBundleToCart, updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';

/**
 * BundleQuickView Component - WITH FULL CART INTEGRATION
 * 
 * Features:
 * - Add to cart with stock validation
 * - Debounced quantity updates (800ms delay)
 * - Real-time cart sync
 * - Stock limit warnings
 * - Smooth animations
 * - Professional UX
 */
const BundleQuickView = ({ bundle, isOpen, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Cart Context
  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();

  // Find if this bundle is in cart
  const cartItem = getCartItemByBundleId(bundle?.id);
  const quantityInCart = getBundleQuantityInCart(bundle?.id);
  const isInCart = quantityInCart > 0;

  // Local quantity for immediate UI updates
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);

  // Track pending quantity to sync with server (debouncing)
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);

  // Extract bundle data
  const stockLimit = bundle?.stock_limit;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const isLowStock = !isOutOfStock && stockLimit && stockLimit < 5;
  const isInStock = !isOutOfStock;
  const bundleItems = bundle?.items || bundle?.Bundle_items || [];

  // Get rating info
  const ratingInfo = bundle ? getDisplayRating(bundle.reviews, bundle.average_rating) : { rating: 0, count: 0 };

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setAdding(false);
      setUpdating(false);
      setPendingQuantity(null);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  }, [isOpen]);

  /**
   * Sync local quantity when cart changes
   */
  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(0);
    }
  }, [cartItem]);

  /**
   * ⭐ DEBOUNCED UPDATE TO SERVER (when in cart)
   * Updates server after 800ms of no changes
   */
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
            onClose(); // Close modal after removing
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
  }, [pendingQuantity, cartItem, stockLimit, refreshCart, isInCart, onClose]);

  /**
   * Handle add to cart (when not in cart)
   */
  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (isOutOfStock) {
      alert('This bundle is out of stock');
      return;
    }

    if (!bundle?.id) {
      alert('Invalid bundle');
      return;
    }

    setAdding(true);

    try {
      const result = await addBundleToCart(bundle.id, 1, stockLimit, quantityInCart);

      if (result.success) {
        console.log('✅ Bundle added to cart');
        refreshCart();
        // Don't close modal - let user see it was added
      } else {
        alert(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  /**
   * Handle increment (when in cart) - WITH DEBOUNCING
   */
  const handleCartIncrement = (e) => {
    e.stopPropagation();

    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed per bundle`);
      return;
    }

    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity); // Trigger debounced update
    console.log(`➕ Increment: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  /**
   * Handle decrement (when in cart) - WITH DEBOUNCING
   */
  const handleCartDecrement = (e) => {
    e.stopPropagation();

    if (localQuantity <= 1) return;

    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity); // Trigger debounced update
    console.log(`➖ Decrement: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  /**
   * Handle remove from cart
   */
  const handleRemoveFromCart = async (e) => {
    e.stopPropagation();

    if (!cartItem) return;

    if (!window.confirm(`Remove "${bundle.title}" from cart?`)) {
      return;
    }

    setUpdating(true);

    try {
      const result = await removeFromCart(cartItem.id);

      if (result.success) {
        console.log('✅ Removed from cart');
        setLocalQuantity(0);
        setPendingQuantity(null);
        refreshCart();
        onClose(); // Close modal after removing
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

  /**
   * Handle modal close
   */
  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose();
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !bundle) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 animate-in fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={handleBackdropClick}
      >
        <div
          className="
            bg-white rounded-2xl shadow-2xl max-w-4xl w-full
            max-h-[90vh] overflow-hidden
            transform transition-all duration-300
            animate-in zoom-in-95 slide-in-from-bottom-4
            pointer-events-auto
          "
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-tppgrey z-10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-tppslate flex items-center gap-2">
              <Package size={20} className="text-tpppink" />
              Bundle Quick View
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Image Section */}
              <div className="flex flex-col gap-4">
                {/* Main Image */}
                <div className="relative bg-slate-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  {/* Loading Skeleton */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                  )}

                  {/* Image */}
                  <img
                    src={bundle.img_url || '/placeholder-bundle.png'}
                    alt={bundle.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.target.src = '/placeholder-bundle.png';
                      setImageLoaded(true);
                    }}
                  />

                  {/* Out of Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                      <XCircle size={16} />
                      OUT OF STOCK
                    </div>
                  )}

                  {/* Items Count Badge */}
                  {!isOutOfStock && bundleItems.length > 0 && (
                    <div className="absolute top-4 right-4 bg-tpppink text-white text-sm font-semibold px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                      <Package size={14} />
                      {bundleItems.length} Items
                    </div>
                  )}
                </div>

                {/* Bundle Info Card */}
                <div className="bg-tpppeach/10 border border-tppgrey rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-tppslate mb-2 uppercase tracking-wide">
                    What's Included
                  </h3>
                  <p className="text-xs text-slate-600">
                    This bundle contains {bundleItems.length} carefully selected {bundleItems.length === 1 ? 'item' : 'items'} at a special bundled price.
                  </p>
                </div>
              </div>

              {/* Bundle Info Section */}
              <div className="flex flex-col gap-4">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-tpppink uppercase tracking-wide bg-tpppeach/20 px-3 py-1 rounded-full w-fit">
                  Bundle Deal
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-tppslate leading-tight">
                  {bundle.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= Math.floor(ratingInfo.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : star === Math.ceil(ratingInfo.rating) && ratingInfo.rating % 1 !== 0
                            ? 'fill-amber-400/50 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-tppslate">
                    {formatRating(ratingInfo.rating)}
                  </span>
                  {ratingInfo.count > 0 && (
                    <span className="text-sm text-slate-400">
                      ({ratingInfo.count} reviews)
                    </span>
                  )}
                </div>

                {/* Price Section */}
                <div className="py-4 border-y border-tppgrey">
                  {isOutOfStock ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">
                        Currently Unavailable
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl md:text-4xl font-bold text-tpppink mb-2">
                        {formatBundlePrice(bundle.price)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-green-600">In Stock</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="text-slate-600 text-sm leading-relaxed">
                  {bundle.description || 'A carefully curated bundle of premium products designed to give you the best value. Save money while getting all your favorites in one convenient package.'}
                </div>

                {/* Low Stock Warning */}
                {isLowStock && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span className="font-semibold">Only {stockLimit} left in stock!</span>
                  </div>
                )}

                {/* Products Included List */}
                <div className="bg-slate-50 border border-tppgrey rounded-xl p-4 max-h-48 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-tppslate mb-3 uppercase tracking-wide flex items-center gap-2 sticky top-0 bg-slate-50 pb-2">
                    <Package size={14} />
                    Products Included ({bundleItems.length})
                  </h3>
                  <div className="space-y-2">
                    {bundleItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-tppgrey/50">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-tpppeach/20 flex-shrink-0 border border-tppgrey/30">
                          <img
                            src={getItemImageUrl(item)}
                            alt={getItemDisplayName(item)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 line-clamp-1">
                            {getItemDisplayName(item)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-slate-500">
                              Quantity: {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⭐ CART ACTION BUTTONS */}
                {!isInCart ? (
                  // Add to Cart Button (when not in cart)
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || adding}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-6 py-3.5
                        rounded-lg font-semibold transition-all duration-200
                        ${isOutOfStock || adding
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-tpppink text-white hover:bg-tppslate active:scale-95 shadow-sm hover:shadow-md'
                        }
                      `}
                    >
                      {adding ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : isOutOfStock ? (
                        <>
                          <XCircle size={18} />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          Add Bundle to Cart
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // Already in Cart - Quantity Controls
                  <div className="space-y-3 pt-2">
                    {/* In Cart Badge with Controls */}
                    <div className="bg-green-50 border-2 border-green-600 rounded-xl p-4 relative">
                      {/* Syncing Indicator */}
                      {updating && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-tppslate text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap z-10 shadow-lg">
                          Syncing...
                        </div>
                      )}

                      {/* In Cart Label */}
                      <div className="flex items-center gap-2 mb-3">
                        <Check size={18} className="text-green-700 stroke-[3]" />
                        <span className="text-green-700 font-semibold text-base">
                          In Cart
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        {/* Decrement */}
                        <button
                          onClick={handleCartDecrement}
                          disabled={updating || localQuantity <= 1}
                          className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all ${
                            updating || localQuantity <= 1
                              ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                              : 'border-green-600 text-green-700 hover:bg-green-100 active:scale-95'
                          }`}
                        >
                          <Minus size={18} />
                        </button>

                        {/* Quantity Display */}
                        <div className="flex-1 flex items-center justify-center gap-1.5 bg-white border-2 border-green-600 rounded-lg py-2.5 px-3 relative">
                          <span className="text-xl font-bold text-green-700">{localQuantity}</span>

                          {/* Pending indicator dot */}
                          {pendingQuantity !== null && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Syncing..." />
                          )}
                        </div>

                        {/* Increment */}
                        <button
                          onClick={handleCartIncrement}
                          disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                          className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all ${
                            updating || (stockLimit && localQuantity >= stockLimit)
                              ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                              : 'border-green-600 text-green-700 hover:bg-green-100 active:scale-95'
                          }`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {/* Stock limit info */}
                      {stockLimit && (
                        <p className="text-xs text-green-700 text-center mt-2">
                          Max: {stockLimit} units
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={updating}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all ${
                        updating
                          ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                          : 'border-red-500 text-red-600 hover:bg-red-50 active:scale-95'
                      }`}
                    >
                      <Trash2 size={16} />
                      Remove from Cart
                    </button>
                  </div>
                )}

                {/* View Details Link */}
                <a
                  href={`/shop/bundles/${bundle.id}`}
                  className="
                    text-center px-6 py-2 text-tpppink font-semibold
                    hover:text-tppslate transition-colors
                    border-b-2 border-transparent hover:border-tpppink
                    mt-2
                  "
                  onClick={handleClose}
                >
                  View Full Bundle Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BundleQuickView;