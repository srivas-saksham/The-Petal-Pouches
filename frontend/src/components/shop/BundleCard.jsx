// frontend/src/components/shop/BundleCard.jsx - WITH STOCK LIMITS & LOW STOCK WARNINGS

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, ShoppingCart, Eye, Check, Plus, Minus, Trash2, AlertTriangle } from 'lucide-react';
import { formatBundlePrice, getItemDisplayName, getItemImageUrl, isBundleInStock } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';
import { addBundleToCart, updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';

/**
 * Enhanced BundleCard Component with:
 * - Cart Context integration
 * - Stock limit validation
 * - Low stock warnings
 * - Debounced quantity updates
 */
const BundleCard = ({ bundle, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // ⭐ Use Cart Context instead of props
  const { cartItems, refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  
  // Find if this bundle is in cart
  const cartItem = getCartItemByBundleId(bundle.id);
  
  // Local quantity for immediate UI updates
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  
  // Track pending quantity to sync with server
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  // ⭐ Extract stock limit from bundle
  const stockLimit = bundle.stock_limit;
  const isLowStock = stockLimit && stockLimit < 5;
  
  // Get rating info (real or placeholder)
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);

  // Sync local quantity when cart items change
  useEffect(() => {
    const currentQuantity = getBundleQuantityInCart(bundle.id);
    setLocalQuantity(currentQuantity);
  }, [cartItems, bundle.id, getBundleQuantityInCart]);

  // Debounced update to server
  useEffect(() => {
    if (pendingQuantity === null) return;

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
            // Revert local quantity on error
            setLocalQuantity(cartItem.quantity);
          }
        } else {
          // ⭐ Update quantity with stock limit validation
          const result = await updateCartItem(cartItem.id, pendingQuantity, stockLimit);
          if (result.success) {
            console.log(`✅ Quantity synced: ${pendingQuantity}`);
            refreshCart();
          } else {
            console.error('❌ Failed to update:', result.error);
            alert(result.error); // Show stock limit error
            // Revert local quantity on error
            setLocalQuantity(cartItem.quantity);
          }
        }
      } catch (error) {
        console.error('❌ Update error:', error);
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
  }, [pendingQuantity, cartItem, stockLimit, refreshCart]);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(bundle);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isBundleInStock) {
      alert('This bundle is out of stock');
      return;
    }

    setAdding(true);

    try {
      // ⭐ Add with stock limit validation
      const result = await addBundleToCart(bundle.id, 1, stockLimit, localQuantity);

      if (result.success) {
        setLocalQuantity(1);
        console.log('✅ Bundle added successfully');
        refreshCart();
      } else {
        console.error('❌ Failed to add bundle:', result.error);
        alert(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // ⭐ Check stock limit before incrementing
    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed per bundle`);
      return;
    }

    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
    console.log(`➕ Increment: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (localQuantity <= 0) return;

    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
    console.log(`➖ Decrement: ${localQuantity} → ${newQuantity} (debouncing...)`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    // Confirm deletion
    if (!window.confirm(`Remove "${bundle.title}" from cart?`)) {
      return;
    }

    setUpdating(true);

    try {
      const result = await removeFromCart(cartItem.id);
      
      if (result.success) {
        setLocalQuantity(0);
        setPendingQuantity(null);
        console.log('✅ Item removed from cart');
        refreshCart();
      } else {
        console.error('❌ Failed to remove:', result.error);
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  // Get bundle items - handle both 'items' and 'Bundle_items' (from Supabase)
  const bundleItems = bundle?.items || bundle?.Bundle_items || [];
  
  // Get first 3 products for display
  const displayProducts = bundleItems.slice(0, 3);
  const hasMoreProducts = bundleItems.length > 3;

  const isInCart = localQuantity > 0;

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group">
      
      {/* Image Section */}
      <Link to={`/shop/bundles/${bundle.id}`} className="block relative aspect-[4/3] overflow-hidden bg-tpppeach">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-tppgrey/30 animate-pulse" />
        )}
        
        <img
          src={bundle.img_url || '/placeholder-bundle.png'}
          alt={bundle.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-bundle.png';
            setImageLoaded(true);
          }}
        />

        {/* Bundle Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-pill shadow-soft">
          Bundle
        </div>

        {/* Items Count */}
        {bundleItems.length > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-tppslate text-xs font-semibold px-3 py-1.5 rounded-pill flex items-center gap-1.5 shadow-soft">
            <Package size={13} className="text-purple-600" />
            {bundleItems.length} items
          </div>
        )}

        {/* Desktop Hover Overlay */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-4">
          <button
            onClick={handleQuickView}
            className="bg-white text-purple-600 px-5 py-2.5 rounded-pill font-semibold text-sm flex items-center gap-2 hover:bg-tpppeach transition-colors shadow-soft"
          >
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        
        {/* Title & Rating Row */}
        <div className="mb-3">
          <Link to={`/shop/bundles/${bundle.id}`}>
            <h3 className="text-sm font-semibold text-tppslate line-clamp-2 mb-2 hover:text-purple-600 transition-colors leading-snug">
              {bundle.title}
            </h3>
          </Link>
          
          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
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
            <span className="text-xs font-medium text-tppslate">
              {formatRating(ratingInfo.rating)}
            </span>
            {ratingInfo.count > 0 && (
              <span className="text-xs text-slate-400">
                ({ratingInfo.count})
              </span>
            )}
          </div>
        </div>

        {/* Products Included Section */}
        <div className="mb-3 pb-3 border-b border-tppgrey/40">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Products Included
          </p>
          <div className="space-y-1.5">
            {displayProducts.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md overflow-hidden bg-tpppeach flex-shrink-0 border border-tppgrey/30">
                  <img
                    src={getItemImageUrl(item)}
                    alt={getItemDisplayName(item)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
                <span className="text-xs text-slate-600 line-clamp-1 flex-1">
                  {getItemDisplayName(item)}
                  {item.quantity > 1 && (
                    <span className="text-slate-400 ml-1">×{item.quantity}</span>
                  )}
                </span>
              </div>
            ))}
            {hasMoreProducts && (
              <p className="text-xs text-purple-600 font-medium pl-10">
                +{bundleItems.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-purple-600">
              {formatBundlePrice(bundle.price)}
            </span>
            {bundle.stock_status && (
              <span className={`text-xs font-medium ${
                bundle.stock_status.in_stock 
                  ? 'text-tppmint' 
                  : 'text-red-500'
              }`}>
                {bundle.stock_status.in_stock ? '• In Stock' : '• Out of Stock'}
              </span>
            )}
          </div>
          
          {/* ⭐ LOW STOCK WARNING */}
          {isLowStock && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span className="font-medium">Only {stockLimit} unit{stockLimit === 1 ? '' : 's'} left!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isInCart ? (
            // Add to Cart Button (when not in cart)
            <>
              <button
                onClick={handleAddToCart}
                disabled={adding || (bundle.stock_status && !bundle.stock_status.in_stock) || (stockLimit === 0)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  bundle.stock_status && !bundle.stock_status.in_stock || stockLimit === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : adding
                    ? 'bg-purple-400 text-white cursor-wait'
                    : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-soft hover:shadow-md'
                }`}
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Mobile Quick View */}
              <button
                onClick={handleQuickView}
                className="md:hidden flex items-center justify-center w-11 py-2.5 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Eye size={16} />
              </button>
            </>
          ) : (
            // Quantity Controls (when in cart)
            <>
              <div className="flex-1 flex flex-col gap-2">
                {/* Quantity Controls Row */}
                <div className="flex items-center gap-2 relative">
                  {/* Syncing Indicator */}
                  {updating && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      Syncing...
                    </div>
                  )}

                  {/* Decrease Button */}
                  <button
                    onClick={handleDecrement}
                    disabled={updating || localQuantity <= 0}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all ${
                      updating || localQuantity <= 0
                        ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                        : 'border-purple-600 text-purple-600 hover:bg-purple-50 active:scale-95'
                    }`}
                  >
                    <Minus size={16} />
                  </button>

                  {/* Quantity Display */}
                  <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 border-2 border-green-600 rounded-lg py-2 px-3 relative">
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="stroke-[3] text-green-700" />
                      <span className="text-xs font-semibold text-green-700">In Cart:</span>
                      <span className="text-lg font-bold text-green-700">{localQuantity}</span>
                      <span className="text-xs text-green-600 font-medium">
                        {localQuantity === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    
                    {/* Pending indicator dot */}
                    {pendingQuantity !== null && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Syncing..." />
                    )}
                  </div>

                  {/* Increase Button */}
                  <button
                    onClick={handleIncrement}
                    disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all ${
                      updating || (stockLimit && localQuantity >= stockLimit)
                        ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                        : 'border-purple-600 text-purple-600 hover:bg-purple-50 active:scale-95'
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Delete Button Row */}
                <button
                  onClick={handleDelete}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                    updating
                      ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                      : 'border-red-500 text-red-600 hover:bg-red-50 active:scale-95'
                  }`}
                >
                  <Trash2 size={16} />
                  Remove from Cart
                </button>
              </div>

              {/* Mobile Quick View */}
              <button
                onClick={handleQuickView}
                className="md:hidden flex items-center justify-center w-11 py-2.5 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Eye size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BundleCard;