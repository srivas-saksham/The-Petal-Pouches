// frontend/src/components/shop/ItemQuickView.jsx - MOBILE OPTIMIZED

import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Star, Package, AlertTriangle, XCircle, Plus, Minus, Trash2, Check, Loader } from 'lucide-react';
import { formatBundlePrice, getItemDisplayName, getItemImageUrl } from '../../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';
import { addBundleToCart, updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';

/**
 * ItemQuickView - Unified for Products AND Bundles - MOBILE OPTIMIZED
 */
const ItemQuickView = ({ item, itemType, isOpen, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId, getProductQuantityInCart, getCartItemByProductId } = useCart();

  // Determine if product or bundle
  const isProduct = itemType === 'product' || item?.item_type === 'product';
  const isBundle = !isProduct;

  // Get cart item based on type
  const cartItem = isProduct 
    ? getCartItemByProductId(item?.id)
    : getCartItemByBundleId(item?.id);
    
  const quantityInCart = isProduct
    ? getProductQuantityInCart(item?.id)
    : getBundleQuantityInCart(item?.id);
    
  const isInCart = quantityInCart > 0;

  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);

  // Stock data
  const stockLimit = item?.stock_limit || item?.stock;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const isLowStock = !isOutOfStock && stockLimit && stockLimit < 5;
  const isInStock = !isOutOfStock;
  const bundleItems = item?.items || item?.Bundle_items || [];

  const ratingInfo = item ? getDisplayRating(item.reviews, item.average_rating) : { rating: 0, count: 0 };

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setAdding(false);
      setUpdating(false);
      setPendingQuantity(null);
      setShowRemoveConfirm(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(0);
    }
  }, [cartItem]);

  useEffect(() => {
    if (pendingQuantity === null || !isInCart || !cartItem) return;

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
            onClose();
          } else {
            alert(result.error);
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
  }, [pendingQuantity, cartItem, stockLimit, refreshCart, isInCart, onClose]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (isOutOfStock) {
      alert(`This ${isProduct ? 'product' : 'bundle'} is out of stock`);
      return;
    }

    setAdding(true);

    try {
      let result;
      
      if (isProduct) {
        const cartService = (await import('../../services/cartService')).default;
        result = await cartService.addProductToCart(item.id, 1);
      } else {
        result = await addBundleToCart(item.id, 1, stockLimit, quantityInCart);
      }

      if (result.success) {
        refreshCart();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleCartIncrement = (e) => {
    e.stopPropagation();

    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed`);
      return;
    }

    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleCartDecrement = (e) => {
    e.stopPropagation();
    if (localQuantity <= 1) return;

    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async (e) => {
    e.stopPropagation();

    if (!cartItem) return;

    setUpdating(true);

    try {
      const result = await removeFromCart(cartItem.id);
      
      if (result.success) {
        setLocalQuantity(0);
        setPendingQuantity(null);
        setShowRemoveConfirm(false);
        refreshCart();
        onClose();
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRemove = (e) => {
    e.stopPropagation();
    setShowRemoveConfirm(false);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !item) return null;

  const detailUrl = isProduct ? `/shop/products/${item.id}` : `/shop/bundles/${item.id}`;

  return (
  <>
    <div
      className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
    />

    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 pointer-events-none"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] md:max-h-[90dvh] overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 pointer-events-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - MOBILE OPTIMIZED */}
        <div className="flex-shrink-0 bg-white border-b border-tppgrey z-10 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <h2 className="text-sm md:text-lg font-bold text-tppslate flex items-center gap-1.5 md:gap-2">
            <Package size={16} className="text-tpppink md:w-5 md:h-5" />
            <span className="hidden sm:inline">{isProduct ? 'Product' : 'Bundle'} Quick View</span>
            <span className="sm:hidden">Quick View</span>
          </h2>
          <div className='flex items-center gap-1 md:gap-2'>
            <a
              href={detailUrl}
              className="font-inter text-center px-2 md:px-6 py-1.5 md:py-2 text-xs md:text-sm text-tpppink font-semibold hover:text-tppslate transition-colors border-b-2 border-transparent hover:border-tpppink"
              onClick={handleClose}
            >
              <span className="hidden sm:inline">View Full Details →</span>
              <span className="sm:hidden">View Full Details →</span>
            </a>
            <button
              onClick={handleClose}
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content - MOBILE OPTIMIZED & SCROLLABLE */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
            
            {/* Image Section - MOBILE OPTIMIZED (10% smaller on mobile) */}
            <div className="flex flex-col gap-2 md:gap-4">
              <div className="relative bg-slate-100 rounded-lg md:rounded-xl overflow-hidden aspect-square mx-auto md:w-full aspect-square flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                )}

                <img
                  src={item.img_url || '/placeholder.png'}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    setImageLoaded(true);
                  }}
                />

                {isOutOfStock && (
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white text-xs md:text-sm font-bold px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-lg flex items-center gap-1 md:gap-2 shadow-lg">
                    <XCircle size={12} className="md:w-4 md:h-4" />
                    OUT OF STOCK
                  </div>
                )}

                {!isOutOfStock && isBundle && bundleItems.length > 0 && (
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-tpppink text-white text-xs md:text-sm font-semibold px-2 md:px-3 py-1 md:py-2 rounded-md md:rounded-lg flex items-center gap-1 md:gap-2 shadow-lg">
                    <Package size={12} className="md:w-3.5 md:h-3.5" />
                    {bundleItems.length} Items
                  </div>
                )}
              </div>

              {isBundle && (
                <div className="bg-tpppeach/10 border border-tppgrey rounded-lg md:rounded-xl p-2 md:p-4 w-[90%] mx-auto md:w-full">
                  <h3 className="text-xs md:text-sm font-semibold text-tppslate mb-1 md:mb-2 uppercase tracking-wide">
                    What's Included
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-600 leading-tight md:leading-normal">
                    This bundle contains {bundleItems.length} carefully selected {bundleItems.length === 1 ? 'item' : 'items'}.
                  </p>
                </div>
              )}
            </div>

            {/* Info Section - MOBILE OPTIMIZED */}
            <div className="flex flex-col gap-2 md:gap-4">
              <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-semibold text-tpppink uppercase tracking-wide bg-tpppeach/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full w-fit">
                {isProduct ? 'Individual Product' : 'Bundle Deal'}
              </div>

              <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-tppslate leading-tight">
                {item.title}
              </h1>

              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`md:w-4 md:h-4 ${
                        star <= Math.floor(ratingInfo.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm font-medium text-tppslate">
                  {formatRating(ratingInfo.rating)}
                </span>
              </div>

              {/* Full Description - Always Visible */}
              <div className="text-slate-600 text-xs md:text-sm leading-snug md:leading-relaxed">
                {(() => {
                  const description = item.description || `A premium ${isProduct ? 'product' : 'bundle'} designed for you.`;
                  const sentences = description.split('.');
                  
                  // Get first two sentences (if they exist) and add back the periods
                  if (sentences.length >= 2) {
                    return sentences.slice(0, 1).join('.') + '.';
                  }
                  
                  // If less than 2 sentences, return the full description
                  return description;
                })()}
              </div>

              <div className="py-2 md:py-4 border-y border-tppgrey">
                {isOutOfStock ? (
                  <div className="text-base md:text-xl font-bold text-red-600">
                    Currently Unavailable
                  </div>
                ) : (
                  <>
                    <div className="text-xl md:text-3xl lg:text-4xl font-bold text-tpppink mb-1 md:mb-2">
                      {isProduct ? `₹${item.price}` : formatBundlePrice(item.price)}
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-green-600">In Stock</span>
                    </div>
                  </>
                )}
              </div>

              {isLowStock && (
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-amber-600 bg-amber-50 px-2 md:px-4 py-1.5 md:py-3 rounded-lg border border-amber-200">
                  <AlertTriangle size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span className="font-semibold">Only {stockLimit} left!</span>
                </div>
              )}

              {isBundle && bundleItems.length > 0 && (
                <div className="bg-slate-50 border border-tppgrey rounded-lg md:rounded-xl p-2 md:p-4 max-h-32 md:max-h-48 overflow-y-auto">
                  <h3 className="text-xs md:text-sm font-semibold text-tppslate mb-1.5 md:mb-3 uppercase tracking-wide flex items-center gap-1.5 md:gap-2">
                    <Package size={12} className="md:w-3.5 md:h-3.5" />
                    Products ({bundleItems.length})
                  </h3>
                  <div className="space-y-1.5 md:space-y-2">
                    {bundleItems.map((bundleItem, index) => (
                      <div key={index} className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-md md:rounded-lg border border-tppgrey/50">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-md md:rounded-lg overflow-hidden bg-tpppeach/20 flex-shrink-0">
                          <img
                            src={getItemImageUrl(bundleItem)}
                            alt={getItemDisplayName(bundleItem)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-slate-700 line-clamp-1">
                            {getItemDisplayName(bundleItem)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Actions - MOBILE OPTIMIZED */}
              {!isInCart ? (
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-lg font-semibold text-sm md:text-base transition-all ${
                    isOutOfStock || adding
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-tpppink text-white hover:bg-tppslate active:scale-95'
                  }`}
                >
                  {adding ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                      Add to Cart
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg md:rounded-xl p-2.5 md:p-4 relative">
                    {updating && (
                      <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 bg-tppslate text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md whitespace-nowrap">
                        Syncing...
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Check size={14} className="text-green-700 stroke-[3] md:w-[18px] md:h-[18px]" />
                      <span className="text-green-700 font-semibold text-xs md:text-base">In Cart</span>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        onClick={handleCartDecrement}
                        disabled={updating || localQuantity <= 1}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          updating || localQuantity <= 1
                            ? 'border-tppgrey text-tppslate/40'
                            : 'border-green-600 text-green-700 hover:bg-green-100 active:scale-95'
                        }`}
                      >
                        <Minus size={14} className="md:w-[18px] md:h-[18px]" />
                      </button>

                      <div className="flex-1 flex items-center justify-center bg-white border-2 border-green-600 rounded-lg py-1.5 md:py-2.5 relative">
                        <span className="text-base md:text-xl font-bold text-green-700">{localQuantity}</span>
                        {pendingQuantity !== null && (
                          <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse" />
                        )}
                      </div>

                      <button
                        onClick={handleCartIncrement}
                        disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          updating || (stockLimit && localQuantity >= stockLimit)
                            ? 'border-tppgrey text-tppslate/40'
                            : 'border-green-600 text-green-700 hover:bg-green-100 active:scale-95'
                        }`}
                      >
                        <Plus size={14} className="md:w-[18px] md:h-[18px]" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button with Confirm/Cancel */}
                  {!showRemoveConfirm ? (
                    <button
                      onClick={handleRemoveClick}
                      disabled={updating}
                      className={`w-full flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 border-2 rounded-lg font-semibold text-xs md:text-base transition-all ${
                        updating
                          ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                          : 'border-red-500 text-red-600 hover:bg-red-50 active:scale-95'
                      }`}
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                      Remove from Cart
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        onClick={handleConfirmRemove}
                        disabled={updating}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all disabled:opacity-40 active:scale-95"
                      >
                        {updating ? (
                          <Loader size={14} className="md:w-4 md:h-4 animate-spin mx-auto" />
                        ) : (
                          'Confirm'
                        )}
                      </button>
                      <button
                        onClick={handleCancelRemove}
                        disabled={updating}
                        className="px-3 md:px-4 py-2 md:py-2.5 text-slate-500 hover:text-slate-700 text-xs md:text-sm font-medium disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default ItemQuickView;