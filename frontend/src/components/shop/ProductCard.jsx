// frontend/src/components/shop/ProductCard.jsx - MOBILE OPTIMIZED UI

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Plus, Minus, Trash2, AlertTriangle, XCircle, Loader, ArrowBigRightDash, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useUserAuth } from '../../context/UserAuthContext';

const ProductCard = ({ product, onQuickView }) => {
  
  // ===========================
  // IMAGE GALLERY STATE
  // ===========================
  
  const images = useMemo(() => {
    const imageArray = product?.Product_images || product?.images;
    
    if (imageArray && Array.isArray(imageArray) && imageArray.length > 0) {
      return [...imageArray].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.display_order - b.display_order;
      });
    }
    
    if (product?.img_url) {
      return [{ 
        id: 'legacy', 
        img_url: product.img_url, 
        is_primary: true,
        display_order: 0 
      }];
    }
    
    return [];
  }, [product]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex] || null;
  
  // ===========================
  // STATE & CONTEXT
  // ===========================
  
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const { cartItems, refreshCart, getProductQuantityInCart, getCartItemByProductId } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  
  const cartItem = getCartItemByProductId(product.id);
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  const stockLimit = product.stock;
  const isOutOfStock = stockLimit === 0;
  const isLowStock = !isOutOfStock && stockLimit && stockLimit < 5;
  const isInCart = localQuantity > 0;

  // ===========================
  // IMAGE NAVIGATION HANDLERS
  // ===========================

  const handlePreviousImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
      setImageLoaded(false);
    }
  };

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
    if (images.length > 0 && images[0]?.img_url) {
      const img = new Image();
      img.src = images[0].img_url;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, [product.id, images]);

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
  // RENDER - MOBILE OPTIMIZED
  // ===========================

  return (
    <div className={`bg-white rounded-lg border border-tppgrey shadow-sm hover:shadow-md hover:border-tppslate/60 transition-all duration-200 overflow-hidden group ${isInCart ? 'border-2 border-tpppink' : ''}`}>
      
      {/* IMAGE SECTION - COMPACT */}
      <Link 
        to={`/shop/products/${product.id}`} 
        className="block relative aspect-square overflow-hidden bg-tpppeach/10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-tppgrey/10 animate-pulse" />
        )}
        
        {currentImage ? (
          <img
            key={`${product.id}-${currentImageIndex}`}
            src={currentImage.img_url}
            alt={`${product.title} - Image ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = '/placeholder-product.png';
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Package size={48} className="text-slate-300" />
          </div>
        )}

        {/* Navigation Arrows - SMALLER FOR MOBILE */}
        {hasMultipleImages && isHovering && !isOutOfStock && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} className="text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20"
              aria-label="Next image"
            >
              <ChevronRight size={14} className="text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
            </button>
          </>
        )}

        {/* Dot Indicators - SMALLER */}
        {hasMultipleImages && isHovering && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1 bg-black/60 backdrop-blur-sm rounded-full z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(e, index)}
                className={`transition-all duration-200 rounded-full ${
                  index === currentImageIndex
                    ? 'w-1.5 h-1 bg-white'
                    : 'w-1 h-1 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Out of Stock Badge - COMPACT */}
        {isOutOfStock && (
          <div className="font-inter absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-0.5 shadow-lg z-10">
            <XCircle size={10} />
            OUT OF STOCK
          </div>
        )}

        {/* Quick View - DESKTOP ONLY */}
        {!isOutOfStock && (
          <div className="hidden md:flex absolute inset-0 bg-tppslate/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-end justify-end p-2 z-10">
            <button
              onClick={handleQuickView}
              className="bg-tpppink text-white hover:bg-tpppink/90 px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Eye size={14} />
            </button>
          </div>
        )}
      </Link>

      {/* CONTENT SECTION - ULTRA COMPACT */}
      <div className="p-2">
        
        {/* Title - SMALLER TEXT */}
        <Link to={`/shop/products/${product.id}`}>
          <h3 className="text-[11px] leading-tight md:text-xs font-semibold text-tppslate line-clamp-2 mb-1 hover:text-tpppink transition-colors min-h-[2rem]">
            {product.title}
          </h3>
        </Link>

        {/* Price & Stock - COMPACT */}
        <div className="mb-2">
          {isOutOfStock ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-red-600">
                Unavailable
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-lg font-bold text-tpppink">
                  ₹{product.price}
                </span>
                <span className="text-[9px] font-medium text-green-600">
                  • In Stock
                </span>
              </div>
              
              {isLowStock && (
                <div className="mt-1 flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  <AlertTriangle size={10} className="flex-shrink-0" />
                  <span className="font-medium">Only {stockLimit} left!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons - ULTRA COMPACT */}
        {!isInCart ? (
          <div className="flex gap-1">
            <button
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded font-semibold text-[10px] transition-all ${
                isOutOfStock
                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300'
                  : adding
                  ? 'bg-tpppink/70 text-white cursor-wait'
                  : 'bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <XCircle size={10} />
                  Out
                </>
              ) : adding ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={10} />
                  Add
                </>
              )}
            </button>

            {!isOutOfStock && (
              <button
                onClick={handleQuickView}
                className="md:hidden flex items-center justify-center w-8 py-1.5 rounded border border-tpppink text-tpppink hover:bg-tpppink/10 transition-colors"
              >
                <Eye size={10} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Quantity Row - COMPACT */}
            <div className="flex items-center gap-1 relative">
              {updating && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tppslate text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  Syncing...
                </div>
              )}

              <button
                onClick={handleDecrement}
                disabled={updating || localQuantity <= 0}
                className={`flex items-center justify-center w-7 h-7 rounded border transition-all ${
                  updating || localQuantity <= 0
                    ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                    : 'border-tpppink text-tpppink hover:bg-tpppink/10 active:scale-95'
                }`}
              >
                <Minus size={10} />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1 bg-green-50 border border-green-600 rounded py-1 px-1.5 relative">
                <Check size={10} className="stroke-[3] text-green-700" />
                <span className="text-[10px] font-semibold text-green-700">
                  {localQuantity}
                </span>
                
                {pendingQuantity !== null && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

              <button
                onClick={handleIncrement}
                disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                className={`flex items-center justify-center w-7 h-7 rounded border transition-all ${
                  updating || (stockLimit && localQuantity >= stockLimit)
                    ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                    : 'border-tpppink text-tpppink hover:bg-tpppink/10 active:scale-95'
                }`}
              >
                <Plus size={10} />
              </button>
            </div>

            {/* Remove / Checkout - COMPACT */}
            {!showRemoveConfirm ? (
              <div className='flex items-center gap-1'>
                <button
                  onClick={handleRemoveClick}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-1 py-1 rounded border font-medium text-[9px] transition-all ${
                    updating
                      ? 'border-tppgrey text-tppslate/40 cursor-not-allowed'
                      : 'border-red-500 text-red-600 hover:bg-red-50 active:scale-95'
                  }`}
                >
                  <Trash2 size={9} />
                  Remove
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-1 py-1 rounded border font-medium text-[9px] transition-all ${
                    updating
                      ? 'border-tppgrey bg-slate-100 text-tppslate/40 cursor-not-allowed'
                      : 'border-tpppink bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
                  }`}
                >
                  Checkout
                  <ArrowBigRightDash size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleConfirmRemove}
                  disabled={updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded transition-all disabled:opacity-40"
                >
                  {updating ? (
                    <Loader size={10} className="animate-spin mx-auto" />
                  ) : (
                    'Confirm'
                  )}
                </button>
                <button
                  onClick={handleCancelRemove}
                  disabled={updating}
                  className="px-2 py-1 text-slate-500 hover:text-slate-700 text-[9px] font-medium disabled:opacity-40"
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