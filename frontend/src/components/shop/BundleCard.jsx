// frontend/src/components/shop/BundleCard.jsx - ENHANCED MINIMAL UI

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, ShoppingCart, Eye, Check, Plus, Minus, Trash2, AlertTriangle } from 'lucide-react';
import { formatBundlePrice, getItemDisplayName, getItemImageUrl, isBundleInStock } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';
import { addBundleToCart, updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';

const BundleCard = ({ bundle, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Cart Context
  const { cartItems, refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  
  // Find if this bundle is in cart
  const cartItem = getCartItemByBundleId(bundle.id);
  
  // Local quantity for immediate UI updates
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  
  // Track pending quantity to sync with server
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  // Extract stock limit from bundle
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

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!cartItem) return;

      setUpdating(true);

      try {
        if (pendingQuantity === 0) {
          const result = await removeFromCart(cartItem.id);
          if (result.success) {
            refreshCart();
          } else {
            setLocalQuantity(cartItem.quantity);
          }
        } else {
          const result = await updateCartItem(cartItem.id, pendingQuantity, stockLimit);
          if (result.success) {
            refreshCart();
          } else {
            alert(result.error);
            setLocalQuantity(cartItem.quantity);
          }
        }
      } catch (error) {
        console.error('❌ Update error:', error);
        setLocalQuantity(cartItem.quantity);
      } finally {
        setUpdating(false);
        setPendingQuantity(null);
      }
    }, 800);

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
      const result = await addBundleToCart(bundle.id, 1, stockLimit, localQuantity);

      if (result.success) {
        setLocalQuantity(1);
        refreshCart();
      } else {
        alert(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed per bundle`);
      return;
    }

    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (localQuantity <= 0) return;

    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    if (!window.confirm(`Remove "${bundle.title}" from cart?`)) {
      return;
    }

    setUpdating(true);

    try {
      const result = await removeFromCart(cartItem.id);
      
      if (result.success) {
        setLocalQuantity(0);
        setPendingQuantity(null);
        refreshCart();
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  // Get bundle items
  const bundleItems = bundle?.items || bundle?.Bundle_items || [];
  const isInCart = localQuantity > 0;

  return (
    <div className="bg-white rounded-lg border border-tppgrey shadow-sm hover:shadow-md hover:border-tppslate/60 transition-all duration-200 overflow-hidden group">
      
      {/* Image Section */}
      <Link to={`/shop/bundles/${bundle.id}`} className="block relative aspect-square overflow-hidden bg-tpppeach/10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-tppgrey/10 animate-pulse" />
        )}
        
        <img
          src={bundle.img_url || '/placeholder-bundle.png'}
          alt={bundle.title}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-bundle.png';
            setImageLoaded(true);
          }}
        />

        {/* Items Count Badge */}
        {bundleItems.length > 0 && (
          <div className="absolute top-2 right-2 bg-tpppink text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <Package size={12} />
            {bundleItems.length}
          </div>
        )}

        {/* Quick View on Hover */}
        <div className="hidden md:flex absolute inset-0 bg-tppslate/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-end justify-end p-2">
          <button
            onClick={handleQuickView}
            className="bg-tpppink text-white hover:bg-tpppink/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-tpppeach transition-colors shadow-sm"
          >
            <Eye size={16} />
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-3">
        
        {/* Title */}
        <Link to={`/shop/bundles/${bundle.id}`}>
          <h3 className="text-sm font-semibold text-tppslate line-clamp-2 mb-2 hover:text-tpppink transition-colors leading-tight min-h-[2.5rem]">
            {bundle.title}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
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

        {/* Price & Stock */}
        <div className="mb-3 pb-3 border-b border-tppgrey/30">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-tpppink">
              {formatBundlePrice(bundle.price)}
            </span>
            {bundle.stock_status && (
              <span className={`text-xs font-medium ${
                bundle.stock_status.in_stock 
                  ? 'text-green-600' 
                  : 'text-red-500'
              }`}>
                • {bundle.stock_status.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            )}
          </div>
          
          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <AlertTriangle size={12} className="flex-shrink-0" />
              <span className="font-medium">Only {stockLimit} left!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isInCart ? (
          // Add to Cart Button
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={adding || (bundle.stock_status && !bundle.stock_status.in_stock) || (stockLimit === 0)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-sm transition-all ${
                bundle.stock_status && !bundle.stock_status.in_stock || stockLimit === 0
                  ? 'bg-tppgrey/20 text-tppslate/40 cursor-not-allowed'
                  : adding
                  ? 'bg-tpppink/70 text-white cursor-wait'
                  : 'bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
              }`}
            >
              {adding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add to Cart
                </>
              )}
            </button>

            {/* Mobile Quick View */}
            <button
              onClick={handleQuickView}
              className="md:hidden flex items-center justify-center w-10 py-2 rounded-lg border border-tpppink text-tpppink hover:bg-tpppink/10 transition-colors"
            >
              <Eye size={14} />
            </button>
          </div>
        ) : (
          // Quantity Controls
          <div className="space-y-2">
            {/* Quantity Row */}
            <div className="flex items-center gap-1.5 relative">
              {/* Syncing Indicator */}
              {updating && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tppslate text-white text-xs px-2 py-0.5 rounded whitespace-nowrap z-10">
                  Syncing...
                </div>
              )}

              {/* Decrease */}
              <button
                onClick={handleDecrement}
                disabled={updating || localQuantity <= 0}
                className={`flex items-center justify-center w-8 h-8 rounded border transition-all ${
                  updating || localQuantity <= 0
                    ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                    : 'border-tpppink text-tpppink hover:bg-tpppink/10 active:scale-95'
                }`}
              >
                <Minus size={14} />
              </button>

              {/* Quantity Display */}
              <div className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 border border-green-600 rounded py-1.5 px-2 relative">
                <Check size={12} className="stroke-[3] text-green-700" />
                <span className="text-xs font-semibold text-green-700">
                  {localQuantity}
                </span>
                
                {/* Pending dot */}
                {pendingQuantity !== null && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Increase */}
              <button
                onClick={handleIncrement}
                disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                className={`flex items-center justify-center w-8 h-8 rounded border transition-all ${
                  updating || (stockLimit && localQuantity >= stockLimit)
                    ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                    : 'border-tpppink text-tpppink hover:bg-tpppink/10 active:scale-95'
                }`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleDelete}
              disabled={updating}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded border font-medium text-xs transition-all ${
                updating
                  ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                  : 'border-red-500 text-red-600 hover:bg-red-50 active:scale-95'
              }`}
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleCard;