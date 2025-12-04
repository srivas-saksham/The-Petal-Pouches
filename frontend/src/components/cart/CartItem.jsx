// frontend/src/components/cart/CartItem.jsx
// WITH DEBOUNCED QUANTITY UPDATES + STRICT STOCK VALIDATION + INLINE DELETE CONFIRMATION

import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Trash2, Loader, ShoppingBag } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

/**
 * CartItem Component
 * Single cart item with debounced quantity controls + strict stock validation
 * 
 * @param {Object} item - Cart item data
 * @param {string} item.id - Cart item ID
 * @param {string} item.title - Bundle title
 * @param {string} item.image_url - Bundle image
 * @param {number} item.price - Unit price
 * @param {number} item.quantity - Current quantity
 * @param {number} item.item_total - Total price (price * quantity)
 * @param {number} item.stock_limit - Maximum stock available
 */
const CartItem = ({ item }) => {
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { refreshCart } = useCart();
  const toast = useToast();

  // Local quantity for immediate UI updates
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  
  // Track pending quantity to sync with server
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);

  // Sync local quantity when prop changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Debounced update to server (SAME AS BUNDLECARD)
  useEffect(() => {
    if (pendingQuantity === null) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 800ms
    debounceTimerRef.current = setTimeout(async () => {
      setUpdating(true);

      try {
        // If quantity is 0, remove item
        if (pendingQuantity === 0) {
          const result = await removeFromCart(item.id);
          if (result.success) {
            await refreshCart();
            toast.success('Item removed from cart');
          } else {
            // Revert on failure
            setLocalQuantity(item.quantity);
            toast.error(result.error || 'Failed to remove item');
          }
        } else {
          // Update quantity with stock limit validation
          const result = await updateCartItem(item.id, pendingQuantity, item.stock_limit);
          
          if (!result.success) {
            // Revert on failure
            setLocalQuantity(item.quantity);
            toast.error(result.error || 'Failed to update quantity');
          }
        }
      } catch (error) {
        console.error('Update quantity error:', error);
        // Revert on error
        setLocalQuantity(item.quantity);
        toast.error('Failed to update quantity');
      } finally {
        setUpdating(false);
        setPendingQuantity(null);
      }
    }, 800); // 800ms debounce delay

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pendingQuantity, item.id, item.quantity, item.stock_limit, refreshCart, toast]);

  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Handle quantity increment (STRICT VALIDATION LIKE BUNDLECARD)
  const handleIncrement = () => {
    // STRICT: Validate stock limit BEFORE updating local state
    if (item.stock_limit && localQuantity >= item.stock_limit) {
      alert(`Maximum ${item.stock_limit} units allowed per bundle`);
      return;
    }

    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  // Handle quantity decrement (SAME AS BUNDLECARD)
  const handleDecrement = () => {
    if (localQuantity <= 0) return;

    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  // Handle remove item click
  const handleRemoveClick = () => {
    setShowConfirm(true);
  };

  // Handle confirmed removal
  const handleConfirmRemove = async () => {
    setRemoving(true);
    try {
      const result = await removeFromCart(item.id);
      
      if (result.success) {
        await refreshCart();
        toast.success('Item removed from cart');
      } else {
        toast.error(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
      setShowConfirm(false);
    }
  };

  // Handle cancel removal
  const handleCancelRemove = () => {
    setShowConfirm(false);
  };

  return (
    <div className={`p-4 border-b border-slate-100 transition-opacity ${
      removing ? 'opacity-50' : 'opacity-100'
    }`}>
      <div className="flex gap-3">
        {/* Item Image */}
        <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-bundle.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ShoppingBag size={24} />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
            {item.title}
          </h4>

          {/* Price */}
          <p className="text-sm font-bold text-tpppink mb-2">
            {formatPrice(item.price)}
            <span className="text-xs text-slate-500 font-normal ml-1">
              × {localQuantity}
            </span>
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            {/* Quantity Adjuster */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 relative">
              {/* Syncing Indicator */}
              {updating && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                  Syncing...
                </div>
              )}

              <button
                onClick={handleDecrement}
                disabled={updating || localQuantity <= 0}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="text-slate-600" />
              </button>

              <div className="relative min-w-[32px] text-center">
                <span className="text-sm font-semibold text-slate-900">
                  {updating ? (
                    <Loader size={14} className="animate-spin mx-auto" />
                  ) : (
                    localQuantity
                  )}
                </span>
                
                {/* Pending dot indicator */}
                {pendingQuantity !== null && !updating && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

              <button
                onClick={handleIncrement}
                disabled={updating || (item.stock_limit && localQuantity >= item.stock_limit)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                  disabled:hover:bg-slate-100"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="text-slate-600" />
              </button>
            </div>

            {/* Remove Button / Confirm Button */}
            {!showConfirm ? (
              <button
                onClick={handleRemoveClick}
                disabled={removing || updating}
                className="text-slate-400 hover:text-red-600 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Remove item"
                title="Remove from cart"
              >
                {removing ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmRemove}
                  disabled={removing}
                  className="bg-tpppink hover:bg-tpppink/90 text-white text-xs font-semibold 
                    px-3 py-1.5 rounded transition-colors disabled:opacity-40 
                    disabled:cursor-not-allowed whitespace-nowrap"
                  aria-label="Confirm removal"
                >
                  {removing ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </button>
                <button
                  onClick={handleCancelRemove}
                  disabled={removing}
                  className="text-slate-500 hover:text-slate-700 text-xs font-medium
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Cancel removal"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Stock Limit Warning */}
          {item.stock_limit && localQuantity >= item.stock_limit && (
            <p className="text-xs text-slate-500 mt-1.5">
              Only {item.stock_limit} items in stock
            </p>
          )}
        </div>

        {/* Item Total */}
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold text-slate-900">
            {formatPrice(item.price * localQuantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;