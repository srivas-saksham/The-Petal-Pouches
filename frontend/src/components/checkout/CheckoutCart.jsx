// frontend/src/components/checkout/CheckoutCart.jsx
// UNIFIED: Supports BOTH bundles AND products

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Package, AlertTriangle, Loader, Check, X, Eye, ShoppingBag } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { updateCartItem, removeFromCart, validateStockLimit } from '../../services/cartService';
import ItemQuickView from '../shop/ItemQuickView';

/**
 * CheckoutCart Component - UNIFIED for Products & Bundles
 * ⭐ Handles both individual products and bundles
 */
const CheckoutCart = ({ 
  cartItems = [], 
  bundles = {}, 
  onItemUpdate,
  onQuantityChangeStart,  // ⭐ NEW PROP
  onQuantityChangeComplete  // ⭐ NEW PROP
}) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [showConfirm, setShowConfirm] = useState({});
  const [errors, setErrors] = useState({});
  const [localQuantities, setLocalQuantities] = useState({});
  const [pendingQuantities, setPendingQuantities] = useState({});
  const debounceTimersRef = useRef({});
  
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickViewItemType, setQuickViewItemType] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // ⭐ Handle item click (bundle or product)
  const handleItemClick = (item) => {
    if (item.type === 'bundle') {
      navigate(`/shop/bundles/${item.bundle_id}`);
    } else if (item.type === 'product') {
      navigate(`/shop/products/${item.product_id}`);
    }
  };

  // ⭐ Handle Quick View (products and bundles)
  const handleQuickView = (e, itemData, itemType) => {
    e.stopPropagation();
    setQuickViewItem(itemData);
    setQuickViewItemType(itemType);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewItem(null);
    setQuickViewItemType(null);
  };

  // ⭐ DEBOUNCED QUANTITY UPDATE
  const handleUpdateQuantity = (cartItemId, itemKey, newQuantity, stockLimit) => {
    if (newQuantity < 1) return;

    // ⭐ IMMEDIATELY notify parent that quantity change started
    if (onQuantityChangeStart) {
      onQuantityChangeStart();
    }

    // Validate stock limit
    const validation = validateStockLimit(itemKey, newQuantity, 0, stockLimit);
    
    if (!validation.valid) {
      setErrors({
        ...errors,
        [cartItemId]: validation.message
      });
      
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[cartItemId];
          return newErrors;
        });
      }, 3000);
      
      // ⭐ Notify parent that change is complete (failed)
      if (onQuantityChangeComplete) {
        onQuantityChangeComplete();
      }
      
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[cartItemId];
      return newErrors;
    });

    setLocalQuantities(prev => ({
      ...prev,
      [cartItemId]: newQuantity
    }));

    setPendingQuantities(prev => ({
      ...prev,
      [cartItemId]: true
    }));

    if (debounceTimersRef.current[cartItemId]) {
      clearTimeout(debounceTimersRef.current[cartItemId]);
    }

    debounceTimersRef.current[cartItemId] = setTimeout(async () => {
      setUpdating(cartItemId);

      try {
        const result = await updateCartItem(cartItemId, newQuantity, stockLimit);
        
        if (result.success) {
          if (onItemUpdate) {
            onItemUpdate(true);
          }
          
          // ⭐ Notify parent that update is complete
          if (onQuantityChangeComplete) {
            onQuantityChangeComplete();
          }
        } else {
          const currentItem = cartItems.find(item => item.id === cartItemId);
          setLocalQuantities(prev => ({
            ...prev,
            [cartItemId]: currentItem.quantity
          }));
          
          setErrors({
            ...errors,
            [cartItemId]: result.error || 'Failed to update quantity'
          });

          setTimeout(() => {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[cartItemId];
              return newErrors;
            });
          }, 3000);
          
          // ⭐ Notify parent even on error
          if (onQuantityChangeComplete) {
            onQuantityChangeComplete();
          }
        }
      } catch (error) {
        const currentItem = cartItems.find(item => item.id === cartItemId);
        setLocalQuantities(prev => ({
          ...prev,
          [cartItemId]: currentItem.quantity
        }));
        
        setErrors({
          ...errors,
          [cartItemId]: 'Failed to update quantity'
        });

        setTimeout(() => {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[cartItemId];
            return newErrors;
          });
        }, 3000);
        
        // ⭐ Notify parent even on error
        if (onQuantityChangeComplete) {
          onQuantityChangeComplete();
        }
      } finally {
        setUpdating(null);
        setPendingQuantities(prev => {
          const newPending = { ...prev };
          delete newPending[cartItemId];
          return newPending;
        });
        delete debounceTimersRef.current[cartItemId];
      }
    }, 800);
  };

  const handleRemoveClick = (cartItemId) => {
    setShowConfirm({
      ...showConfirm,
      [cartItemId]: true
    });
  };

  const handleConfirmRemove = async (cartItemId) => {
    setRemoving(cartItemId);
    try {
      const result = await removeFromCart(cartItemId);
      
      if (result.success) {
        if (onItemUpdate) {
          onItemUpdate(false);
        }
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
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
      <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
        <Package size={48} className="mx-auto mb-4 text-slate-400" />
        <p className="text-sm md:text-base text-slate-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3 md:px-6 md:py-4 border-b border-slate-200">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Order Items ({cartItems.length})
            </h2>
          </div>

          {/* Cart Items */}
          <div className="divide-y divide-slate-100">
            {cartItems.map((cartItem) => {
              // ⭐ Get item details based on type
              const isProduct = cartItem.type === 'product';
              const isBundle = cartItem.type === 'bundle';
              
              // ⭐ For bundles: look up in bundles map
              // ⭐ For products: use cartItem data directly
              const itemData = isBundle 
                ? bundles[cartItem.bundle_id]
                : isProduct
                ? {
                    id: cartItem.product_id,
                    title: cartItem.title,
                    description: cartItem.description,
                    img_url: cartItem.image_url,
                    price: cartItem.price,
                    stock_limit: cartItem.stock_limit,
                    items: [] // Products don't have sub-items
                  }
                : null;

              if (!itemData) {
                return null; // Skip invalid items
              }

              const bundleItems = itemData.items || itemData.Bundle_items || [];
              const stockLimit = itemData.stock_limit;
              const isLowStock = stockLimit && stockLimit < 5;
              const isMaxed = (localQuantities[cartItem.id] ?? cartItem.quantity) >= stockLimit;
              const hasError = errors[cartItem.id];
              const isConfirming = showConfirm[cartItem.id];

              // ⭐ Item key for stock validation
              const itemKey = isBundle ? cartItem.bundle_id : cartItem.product_id;

              return (
                <div key={cartItem.id} className="p-4 md:p-6">
                  {/* Error Alert */}
                  {hasError && (
                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5 md:w-[18px] md:h-[18px]" />
                      <p className="text-xs md:text-sm text-red-700">{hasError}</p>
                    </div>
                  )}

                  {/* MOBILE LAYOUT */}
                  <div className="md:hidden space-y-3">
                    {/* Row 1: Image + Title + Quick View */}
                    <div className="flex gap-3">
                      {/* Image */}
                      <div 
                        className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-tpppink transition-colors cursor-pointer"
                        onClick={() => handleItemClick(cartItem)}
                      >
                        {itemData.img_url ? (
                          <img
                            src={itemData.img_url}
                            alt={itemData.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = isProduct ? '/placeholder-product.png' : '/placeholder-bundle.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            {isProduct ? <ShoppingBag size={24} className="text-slate-400" /> : <Package size={24} className="text-slate-400" />}
                          </div>
                        )}
                      </div>

                      {/* Title + Quick View */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-sm font-semibold text-slate-900 mb-1 cursor-pointer hover:text-tpppink transition-colors line-clamp-2"
                          onClick={() => handleItemClick(cartItem)}
                        >
                          {itemData.title}
                        </h3>
                        
                        {/* Quick View Button (products and bundles) */}
                        <button
                          onClick={(e) => handleQuickView(e, itemData, isProduct ? 'product' : 'bundle')}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-tpppink hover:text-white bg-white hover:bg-tpppink border border-tpppink rounded transition-all"
                          title="Quick View"
                        >
                          <Eye size={12} />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    {itemData.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {itemData.description}
                      </p>
                    )}

                    {/* Row 3: Price + Controls */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Price */}
                      <div className="text-lg font-bold text-tpppink">
                        {formatBundlePrice(itemData.price)}
                      </div>

                      {/* Quantity Controls + Delete */}
                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 relative">
                          {updating === cartItem.id && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                              Syncing...
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                cartItem.id,
                                itemKey,
                                (localQuantities[cartItem.id] ?? cartItem.quantity) - 1,
                                stockLimit
                              )
                            }
                            disabled={(localQuantities[cartItem.id] ?? cartItem.quantity) <= 1 || updating === cartItem.id}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} className="text-slate-600" />
                          </button>

                          <div className="relative min-w-[28px] text-center">
                            <span className="text-sm font-semibold text-slate-900">
                              {updating === cartItem.id ? (
                                <Loader size={14} className="animate-spin mx-auto" />
                              ) : (
                                localQuantities[cartItem.id] ?? cartItem.quantity
                              )}
                            </span>

                            {pendingQuantities[cartItem.id] && !updating && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                cartItem.id,
                                itemKey,
                                (localQuantities[cartItem.id] ?? cartItem.quantity) + 1,
                                stockLimit
                              )
                            }
                            disabled={updating === cartItem.id || isMaxed}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} className="text-slate-600" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        {!isConfirming ? (
                          <button
                            onClick={() => handleRemoveClick(cartItem.id)}
                            disabled={removing === cartItem.id || updating === cartItem.id}
                            className="text-tpppink hover:text-red-600 transition-colors disabled:opacity-40"
                          >
                            {removing === cartItem.id ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16}/>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-tppslate/15 border rounded-lg p-0.5">
                            <button
                              onClick={() => handleCancelRemove(cartItem.id)}
                              disabled={removing === cartItem.id}
                              className="w-7 h-7 flex items-center justify-center rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                            >
                              <X size={14} />
                            </button>
                            <button
                              onClick={() => handleConfirmRemove(cartItem.id)}
                              disabled={removing === cartItem.id}
                              className="w-7 h-7 flex items-center justify-center rounded bg-tpppink hover:bg-tpppink/90 text-white transition-colors"
                            >
                              {removing === cartItem.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Stock Warnings */}
                    {isLowStock && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        <span className="font-medium">Only {stockLimit} unit{stockLimit === 1 ? '' : 's'} available!</span>
                      </div>
                    )}

                    {stockLimit && isMaxed && (
                      <p className="text-xs text-yellow-700">
                        Only {stockLimit} in stock
                      </p>
                    )}
                  </div>

                  {/* DESKTOP LAYOUT */}
                  <div className="hidden md:flex gap-6">
                    {/* Image with Quick View */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <div 
                        className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-tpppink transition-colors cursor-pointer relative"
                        onClick={() => handleItemClick(cartItem)}
                      >
                        {itemData.img_url ? (
                          <img
                            src={itemData.img_url}
                            alt={itemData.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = isProduct ? '/placeholder-product.png' : '/placeholder-bundle.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            {isProduct ? <ShoppingBag size={32} className="text-slate-400" /> : <Package size={32} className="text-slate-400" />}
                          </div>
                        )}
                      </div>

                      {/* Quick View Button (products and bundles) */}
                      <button
                        onClick={(e) => handleQuickView(e, itemData, isProduct ? 'product' : 'bundle')}
                        className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-tpppink hover:text-white bg-white hover:bg-tpppink border border-tpppink rounded-md transition-all active:scale-95"
                        title="Quick View"
                      >
                        <Eye size={12} />
                        <span>Quick View</span>
                      </button>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-slate-900 mb-1 cursor-pointer hover:text-tpppink transition-colors"
                        onClick={() => handleItemClick(cartItem)}
                      >
                        {itemData.title}
                      </h3>
                      
                      {itemData.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {itemData.description}
                        </p>
                      )}

                      {/* Low Stock Warning */}
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
                        {formatBundlePrice(itemData.price)}
                      </div>

                      {/* Quantity Controls + Delete */}
                      <div className="flex items-center gap-3 mb-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 w-fit relative">
                          {updating === cartItem.id && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                              Syncing...
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                cartItem.id,
                                itemKey,
                                (localQuantities[cartItem.id] ?? cartItem.quantity) - 1,
                                stockLimit
                              )
                            }
                            disabled={(localQuantities[cartItem.id] ?? cartItem.quantity) <= 1 || updating === cartItem.id}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} className="text-slate-600" />
                          </button>

                          <div className="relative min-w-[32px] text-center">
                            <span className="text-sm font-semibold text-slate-900">
                              {updating === cartItem.id ? (
                                <Loader size={14} className="animate-spin mx-auto" />
                              ) : (
                                localQuantities[cartItem.id] ?? cartItem.quantity
                              )}
                            </span>

                            {pendingQuantities[cartItem.id] && !updating && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                cartItem.id,
                                itemKey,
                                (localQuantities[cartItem.id] ?? cartItem.quantity) + 1,
                                stockLimit
                              )
                            }
                            disabled={updating === cartItem.id || isMaxed}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} className="text-slate-600" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        {!isConfirming ? (
                          <button
                            onClick={() => handleRemoveClick(cartItem.id)}
                            disabled={removing === cartItem.id || updating === cartItem.id}
                            className="text-tpppink hover:text-red-600 transition-colors disabled:opacity-40"
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
                              className="w-7 h-7 flex items-center justify-center rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => handleConfirmRemove(cartItem.id)}
                              disabled={removing === cartItem.id}
                              className="w-7 h-7 flex items-center justify-center rounded bg-tpppink hover:bg-tpppink/90 text-white transition-colors"
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

                      {/* Stock Info */}
                      {stockLimit && (
                        <p className="text-xs text-yellow-700 mt-1">
                          {isMaxed ? (
                            `Only ${stockLimit} in stock`
                          ) : (
                            stockLimit <= 5 ? `Only ${stockLimit} left!` : ``
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

      <ItemQuickView
        item={quickViewItem}
        itemType={quickViewItemType}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </>
  );
};

export default CheckoutCart;