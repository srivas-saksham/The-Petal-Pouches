// frontend/src/components/checkout/CheckoutCart.jsx

import React, { useState, useRef } from 'react';
import { Trash2, Plus, Minus, Package, AlertTriangle, Loader, Check, X } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { updateCartItem, removeFromCart, validateStockLimit } from '../../services/cartService';

/**
 * CheckoutCart Component
 * Displays all cart items (bundles) with ability to modify quantity/remove
 * Only shows bundle details, NOT individual product prices
 * ⭐ Includes stock limit validation
 * ⭐ Includes debounced quantity updates (800ms)
 * ⭐ Inline delete confirmation (like CartItem)
 */
const CheckoutCart = ({ cartItems = [], bundles = {}, onItemUpdate }) => {
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [showConfirm, setShowConfirm] = useState({});
  const [errors, setErrors] = useState({});
  const [localQuantities, setLocalQuantities] = useState({}); // ⭐ Track local UI state
  const [pendingQuantities, setPendingQuantities] = useState({}); // ⭐ Track pending updates
  const debounceTimersRef = useRef({}); // ⭐ Store debounce timers

  // ⭐ DEBOUNCED QUANTITY UPDATE
  const handleUpdateQuantity = (cartItemId, bundleId, newQuantity) => {
    if (newQuantity < 1) return;

    const bundle = bundles[bundleId];
    const stockLimit = bundle?.stock_limit;

    // ⭐ VALIDATE STOCK LIMIT (Frontend)
    const validation = validateStockLimit(bundleId, newQuantity, 0, stockLimit);
    
    if (!validation.valid) {
      setErrors({
        ...errors,
        [cartItemId]: validation.message
      });
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[cartItemId];
          return newErrors;
        });
      }, 3000);
      
      return;
    }

    // Clear error if validation passed
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cartItemId];
      return newErrors;
    });

    // ⭐ UPDATE LOCAL QUANTITY IMMEDIATELY FOR UI
    setLocalQuantities(prev => ({
      ...prev,
      [cartItemId]: newQuantity
    }));

    // ⭐ MARK AS PENDING
    setPendingQuantities(prev => ({
      ...prev,
      [cartItemId]: true
    }));

    // ⭐ CLEAR EXISTING DEBOUNCE TIMER
    if (debounceTimersRef.current[cartItemId]) {
      clearTimeout(debounceTimersRef.current[cartItemId]);
    }

    // ⭐ SET NEW DEBOUNCE TIMER (800ms)
    debounceTimersRef.current[cartItemId] = setTimeout(async () => {
      console.log(`🔄 Syncing quantity to server: ${newQuantity}`);
      setUpdating(cartItemId);

      try {
        // ⭐ Pass stock limit to updateCartItem for backend validation
        const result = await updateCartItem(cartItemId, newQuantity, stockLimit);
        
        if (result.success) {
          console.log('✅ Cart item updated');
          onItemUpdate();
        } else {
          console.error('❌ Failed to update:', result.error);
          // Revert to previous quantity on error
          const currentItem = cartItems.find(item => item.id === cartItemId);
          setLocalQuantities(prev => ({
            ...prev,
            [cartItemId]: currentItem.quantity
          }));
          
          setErrors({
            ...errors,
            [cartItemId]: result.error || 'Failed to update quantity'
          });

          // Clear error after 3 seconds
          setTimeout(() => {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[cartItemId];
              return newErrors;
            });
          }, 3000);
        }
      } catch (error) {
        console.error('❌ Update error:', error);
        // Revert to previous quantity on error
        const currentItem = cartItems.find(item => item.id === cartItemId);
        setLocalQuantities(prev => ({
          ...prev,
          [cartItemId]: currentItem.quantity
        }));
        
        setErrors({
          ...errors,
          [cartItemId]: 'Failed to update quantity'
        });

        // Clear error after 3 seconds
        setTimeout(() => {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[cartItemId];
            return newErrors;
          });
        }, 3000);
      } finally {
        setUpdating(null);
        // ⭐ CLEAR PENDING INDICATOR
        setPendingQuantities(prev => {
          const newPending = { ...prev };
          delete newPending[cartItemId];
          return newPending;
        });
        // ⭐ CLEAR TIMER REFERENCE
        delete debounceTimersRef.current[cartItemId];
      }
    }, 800); // ⭐ 800ms DEBOUNCE DELAY
  };

  const handleRemoveClick = (cartItemId) => {
    setShowConfirm({
      ...showConfirm,
      [cartItemId]: true
    });
  };

  const handleConfirmRemove = async (cartItemId, bundleTitle) => {
    setRemoving(cartItemId);
    try {
      const result = await removeFromCart(cartItemId);
      
      if (result.success) {
        console.log('✅ Item removed from cart');
        onItemUpdate();
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('❌ Remove error:', error);
      alert('Failed to remove item');
    } finally {
      setRemoving(null);
      setShowConfirm(prev => {
        const newConfirm = { ...prev };
        delete newConfirm[cartItemId];
        return newConfirm;
      });
    }
  };

  const handleCancelRemove = (cartItemId) => {
    setShowConfirm(prev => {
      const newConfirm = { ...prev };
      delete newConfirm[cartItemId];
      return newConfirm;
    });
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Order Items ({cartItems.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-slate-100">
          {cartItems.map((cartItem) => {
            const bundle = bundles[cartItem.bundle_id];
            const bundleItems = bundle?.items || bundle?.Bundle_items || [];
            
            // ⭐ Extract stock limit
            const stockLimit = bundle?.stock_limit;
            const isLowStock = stockLimit && stockLimit < 5;
            const isMaxed = (localQuantities[cartItem.id] ?? cartItem.quantity) >= stockLimit;
            const hasError = errors[cartItem.id];
            const isConfirming = showConfirm[cartItem.id];

            return (
              <div key={cartItem.id} className="p-6">
                {/* Error Alert */}
                {hasError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{hasError}</p>
                  </div>
                )}

                {/* Main Bundle Info */}
                <div className="flex gap-6">
                  {/* Bundle Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {bundle?.img_url ? (
                        <img
                          src={bundle.img_url}
                          alt={bundle.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-bundle.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                          <Package size={32} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bundle Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {bundle?.title || 'Bundle'}
                    </h3>
                    
                    {bundle?.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {bundle.description}
                      </p>
                    )}

                    {/* Bundle Badge */}
                    <div className="inline-block bg-tpppink/10 text-tpppink px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      Bundle • {bundleItems.length} items
                    </div>

                    {/* ⭐ LOW STOCK WARNING */}
                    {isLowStock && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md w-fit">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        <span className="font-medium">Only {stockLimit} unit{stockLimit === 1 ? '' : 's'} available!</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Controls */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-tpppink mb-4">
                      {formatBundlePrice(bundle?.price || cartItem.price)}
                    </div>

                    {/* Quantity Controls + Delete */}
                    <div className="flex items-center gap-3 mb-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 w-fit relative">
                        {/* Syncing Indicator */}
                        {updating === cartItem.id && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                            Syncing...
                          </div>
                        )}

                        {/* Decrease Button */}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              cartItem.id,
                              cartItem.bundle_id,
                              (localQuantities[cartItem.id] ?? cartItem.quantity) - 1
                            )
                          }
                          disabled={(localQuantities[cartItem.id] ?? cartItem.quantity) <= 1 || updating === cartItem.id}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Decrease quantity"
                        >
                          <Minus size={14} className="text-slate-600" />
                        </button>

                        {/* Quantity Display - ⭐ USE LOCAL STATE */}
                        <div className="relative min-w-[32px] text-center">
                          <span className="text-sm font-semibold text-slate-900">
                            {updating === cartItem.id ? (
                              <Loader size={14} className="animate-spin mx-auto" />
                            ) : (
                              localQuantities[cartItem.id] ?? cartItem.quantity
                            )}
                          </span>

                          {/* ⭐ PENDING INDICATOR DOT */}
                          {pendingQuantities[cartItem.id] && !updating && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Syncing..." />
                          )}
                        </div>

                        {/* Increase Button - ⭐ DISABLED AT STOCK LIMIT */}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              cartItem.id,
                              cartItem.bundle_id,
                              (localQuantities[cartItem.id] ?? cartItem.quantity) + 1
                            )
                          }
                          disabled={updating === cartItem.id || isMaxed}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
                          title={isMaxed ? `Maximum ${stockLimit} units allowed` : 'Increase quantity'}
                        >
                          <Plus size={14} className="text-slate-600" />
                        </button>
                      </div>

                      {/* Remove Button / Confirm Button */}
                      {!isConfirming ? (
                        <button
                          onClick={() => handleRemoveClick(cartItem.id)}
                          disabled={removing === cartItem.id || updating === cartItem.id}
                          className="text-tpppink hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Remove item"
                          title="Remove from cart"
                        >
                          {removing === cartItem.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16}/>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-tppslate/15 border rounded-xl">
                          <button
                            onClick={() => handleCancelRemove(cartItem.id)}
                            disabled={removing === cartItem.id}
                            className="w-7 h-7 flex items-center justify-center rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Cancel removal"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleConfirmRemove(cartItem.id, bundle?.title)}
                            disabled={removing === cartItem.id}
                            className="w-7 h-7 flex items-center justify-center rounded bg-tpppink hover:bg-tpppink/90 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Confirm removal"
                            title="Confirm removal"
                          >
                            {removing === cartItem.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ⭐ STOCK LIMIT INFO */}
                    {stockLimit && (
                      <p className="text-xs text-yellow-700 mt-1">
                        {isMaxed ? (
                          `Only ${stockLimit} item${stockLimit === 1 ? '' : 's'} in stock`
                        ) : (
                          stockLimit <= 5 ? `Hurry! Only ${stockLimit} left in stock.` : ``
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCart;