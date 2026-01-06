// frontend/src/components/shop/ProductCard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Plus, Minus, Trash2, AlertTriangle, XCircle, Loader, ArrowBigRightDash } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useUserAuth } from '../../context/UserAuthContext';

/**
 * ProductCard Component - Individual Product Display
 * Same logic as BundleCard but for products
 */
const ProductCard = ({ product, onQuickView }) => {
  
  // ===========================
  // STATE & CONTEXT
  // ===========================
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const { cartItems, refreshCart, getProductQuantityInCart, getCartItemByProductId } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  
  // Find if this product is in cart
  const cartItem = getCartItemByProductId(product.id);
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  // Stock status
  const stockLimit = product.stock;
  const isOutOfStock = stockLimit === 0;
  const isLowStock = !isOutOfStock && stockLimit && stockLimit < 5;
  const isInCart = localQuantity > 0;

  // ===========================
  // CART SYNC EFFECTS
  // ===========================

  useEffect(() => {
    const currentQuantity = getProductQuantityInCart(product.id);
    setLocalQuantity(currentQuantity);
  }, [cartItems, product.id, getProductQuantityInCart]);

  useEffect(() => {
    if (pendingQuantity === null) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!cartItem) return;

      setUpdating(true);

      try {
        const cartService = (await import('../../services/cartService')).default;
        
        if (pendingQuantity === 0) {
          const result = await cartService.removeFromCart(cartItem.id);
          if (result.success) {
            refreshCart();
          } else {
            setLocalQuantity(cartItem.quantity);
          }
        } else {
          const result = await cartService.updateCartItem(cartItem.id, pendingQuantity, stockLimit);
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

  // ===========================
  // HANDLERS
  // ===========================

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      alert('This product is out of stock');
      return;
    }

    setAdding(true);

    try {
      const cartService = (await import('../../services/cartService')).default;
      const result = await cartService.addProductToCart(product.id, 1);

      if (result.success) {
        setLocalQuantity(1);
        refreshCart();
      } else {
        alert(result.error || 'Failed to add product to cart');
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
      alert(`Maximum ${stockLimit} units available`);
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

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    setUpdating(true);

    try {
      const cartService = (await import('../../services/cartService')).default;
      const result = await cartService.removeFromCart(cartItem.id);
      
      if (result.success) {
        setLocalQuantity(0);
        setPendingQuantity(null);
        setShowRemoveConfirm(false);
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

  const handleCancelRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRemoveConfirm(false);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className={`bg-white rounded-lg border border-tppgrey shadow-sm hover:shadow-md hover:border-tppslate/60 transition-all duration-200 overflow-hidden group ${isInCart ? 'border-2 border-tpppink' : ''}`}>
      
      {/* IMAGE SECTION */}
      <Link 
        to={`/shop/products/${product.id}`} 
        className="block relative aspect-square overflow-hidden bg-tpppeach/10"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-tppgrey/10 animate-pulse" />
        )}
        
        <img
          src={product.img_url}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
            setImageLoaded(true);
          }}
        />

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="font-inter absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-lg z-10">
            <XCircle size={14} />
            OUT OF STOCK
          </div>
        )}

        {/* Quick View on Hover - Desktop Only */}
        {!isOutOfStock && (
          <div className="hidden md:flex absolute inset-0 bg-tppslate/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-end justify-end p-2 z-10">
            <button
              onClick={handleQuickView}
              className="bg-tpppink text-white hover:bg-tpppink/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Eye size={16} />
            </button>
          </div>
        )}
      </Link>

      {/* CONTENT SECTION */}
      <div className="p-3">
        
        {/* Title */}
        <Link to={`/shop/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-tppslate line-clamp-2 mb-2 hover:text-tpppink transition-colors leading-tight min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>

        {/* Price & Stock Section */}
        <div className="mb-3">
          {isOutOfStock ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-600">
                Currently Unavailable
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-tpppink">
                  ₹{product.price}
                </span>
                <span className="text-xs font-medium text-green-600">
                  • In Stock
                </span>
              </div>
              
              {/* Low Stock Warning */}
              {isLowStock && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertTriangle size={12} className="flex-shrink-0" />
                  <span className="font-medium">Only {stockLimit} left!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isInCart ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-sm transition-all ${
                isOutOfStock
                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300'
                  : adding
                  ? 'bg-tpppink/70 text-white cursor-wait'
                  : 'bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <XCircle size={14} />
                  Out of Stock
                </>
              ) : adding ? (
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
            {!isOutOfStock && (
              <button
                onClick={handleQuickView}
                className="md:hidden flex items-center justify-center w-10 py-2 rounded-lg border border-tpppink text-tpppink hover:bg-tpppink/10 transition-colors"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Quantity Row */}
            <div className="flex items-center gap-1.5 relative">
              {updating && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tppslate text-white text-xs px-2 py-0.5 rounded whitespace-nowrap z-10">
                  Syncing...
                </div>
              )}

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

              <div className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 border border-green-600 rounded py-1.5 px-2 relative">
                <Check size={12} className="stroke-[3] text-green-700" />
                <span className="text-xs font-semibold text-green-700">
                  {localQuantity}
                </span>
                
                {pendingQuantity !== null && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

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

            {/* Remove / Checkout Buttons */}
            {!showRemoveConfirm ? (
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleRemoveClick}
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
                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded border font-medium text-xs transition-all ${
                    updating
                      ? 'border-tppgrey bg-slate-100 text-tppslate/40 cursor-not-allowed'
                      : 'border-tpppink bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
                  }`}
                >
                  Checkout
                  <ArrowBigRightDash size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmRemove}
                  disabled={updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-all disabled:opacity-40"
                >
                  {updating ? (
                    <Loader size={14} className="animate-spin mx-auto" />
                  ) : (
                    'Confirm'
                  )}
                </button>
                <button
                  onClick={handleCancelRemove}
                  disabled={updating}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;