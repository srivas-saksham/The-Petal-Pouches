// frontend/src/components/checkout/CheckoutCart.jsx

import React, { useState, useRef } from 'react';
import { Trash2, Plus, Minus, ChevronDown, ChevronUp, Package, AlertTriangle } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { updateCartItem, removeFromCart, validateStockLimit } from '../../services/cartService';

/**
 * CheckoutCart Component
 * Displays all cart items (bundles) with ability to modify quantity/remove
 * Only shows bundle details, NOT individual product prices
 * ⭐ Includes stock limit validation
 * ⭐ Includes debounced quantity updates (800ms)
 */
const CheckoutCart = ({ cartItems = [], bundles = {}, onItemUpdate }) => {
  const [expandedBundles, setExpandedBundles] = useState({});
  const [updating, setUpdating] = useState(null);
  const [errors, setErrors] = useState({});
  const [localQuantities, setLocalQuantities] = useState({}); // ⭐ Track local UI state
  const [pendingQuantities, setPendingQuantities] = useState({}); // ⭐ Track pending updates
  const debounceTimersRef = useRef({}); // ⭐ Store debounce timers

  const toggleExpanded = (bundleId) => {
    setExpandedBundles(prev => ({
      ...prev,
      [bundleId]: !prev[bundleId]
    }));
  };

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

  const handleRemoveItem = async (cartItemId, bundleTitle) => {
    if (!window.confirm(`Remove "${bundleTitle}" from cart?`)) {
      return;
    }

    setUpdating(cartItemId);
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
      setUpdating(null);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Order Items ({cartItems.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="divide-y">
          {cartItems.map((cartItem) => {
            const bundle = bundles[cartItem.bundle_id];
            const isExpanded = expandedBundles[cartItem.bundle_id];
            const bundleItems = bundle?.items || bundle?.Bundle_items || [];
            
            // ⭐ Extract stock limit
            const stockLimit = bundle?.stock_limit;
            const isLowStock = stockLimit && stockLimit < 5;
            const isMaxed = cartItem.quantity >= stockLimit;
            const hasError = errors[cartItem.id];

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
                <div className="flex gap-6 mb-4">
                  {/* Bundle Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Package size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bundle Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {bundle?.title || 'Bundle'}
                    </h3>
                    
                    {bundle?.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {bundle.description}
                      </p>
                    )}

                    {/* Bundle Badge */}
                    <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
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

                  {/* Price & Quantity */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-purple-600 mb-4">
                      {formatBundlePrice(bundle?.price || cartItem.price)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit relative">
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
                        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      {/* Quantity Display - ⭐ USE LOCAL STATE */}
                      <span className="w-8 text-center font-semibold">
                        {localQuantities[cartItem.id] ?? cartItem.quantity}
                      </span>

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
                        className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={isMaxed ? `Maximum ${stockLimit} units allowed` : 'Increase quantity'}
                      >
                        <Plus size={16} />
                      </button>

                      {/* ⭐ PENDING INDICATOR DOT */}
                      {pendingQuantities[cartItem.id] && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" title="Syncing..." />
                      )}
                    </div>

                    {/* ⭐ STOCK LIMIT INFO */}
                    {stockLimit && (
                      <p className="text-xs text-gray-500 mt-2">
                        Max: {stockLimit} unit{stockLimit === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bundle Items Expandable */}
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => toggleExpanded(cartItem.bundle_id)}
                    className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} />
                        Hide items
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Show {bundleItems.length} items included
                      </>
                    )}
                  </button>

                  {/* Expanded Items List */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      {bundleItems.map((item, index) => {
                        const product = item.Products || item.product;
                        const variant = item.Product_variants || item.variant;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-12 h-12 rounded overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                              <img
                                src={
                                  variant?.img_url ||
                                  product?.img_url ||
                                  '/placeholder-product.png'
                                }
                                alt={product?.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product?.title}
                              </p>
                              {variant?.attributes &&
                                Object.keys(variant.attributes).length > 0 && (
                                  <p className="text-xs text-gray-600">
                                    {Object.entries(variant.attributes)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' • ')}
                                  </p>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-600 flex-shrink-0">
                              ×{item.quantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <button
                    onClick={() => handleRemoveItem(cartItem.id, bundle?.title)}
                    disabled={updating === cartItem.id}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    <Trash2 size={16} />
                    Remove from Cart
                  </button>
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