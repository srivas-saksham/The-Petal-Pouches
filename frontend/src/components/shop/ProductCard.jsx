// frontend/src/components/shop/ProductCard.jsx - MOBILE RESPONSIVE WITH SWIPER GESTURES

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Plus, Minus, Trash2, AlertTriangle, XCircle, Loader, ArrowBigRightDash, ChevronLeft, ChevronRight, Package, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useUserAuth } from '../../context/UserAuthContext';
import { getDisplayRating, formatRating } from '../../utils/reviewHelpers';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

/**
 * ProductCard Component - Individual Product Display with Multi-Image Gallery
 * MOBILE RESPONSIVE WITH SWIPER GESTURES - DESKTOP UI PRESERVED EXACTLY AS ORIGINAL
 * 
 * Features:
 * - Multi-image gallery with hover navigation (DESKTOP)
 * - Swiper touch gestures for mobile image navigation
 * - Left/Right arrow navigation (DESKTOP ONLY)
 * - Dot indicators (ALWAYS VISIBLE ON MOBILE)
 * - Complete cart integration
 * - Stock management
 * - Debounced quantity updates
 * - Mobile-responsive with compact UI for small screens
 * - Desktop UI preserved exactly as original
 */
const ProductCard = ({ product, onQuickView }) => {
  
  // ===========================
  // IMAGE GALLERY STATE
  // ===========================
  
  // Process images: use new images array or fallback to legacy img_url
  const images = useMemo(() => {
    // Check for Product_images array (similar to Bundle_images)
    const imageArray = product?.Product_images || product?.images;
    
    if (imageArray && Array.isArray(imageArray) && imageArray.length > 0) {
      // Sort by display_order and prioritize primary image
      return [...imageArray].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.display_order - b.display_order;
      });
    }
    
    // Fallback to legacy single image
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
  const [swiperInstance, setSwiperInstance] = useState(null);
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
  
  // Find if this product is in cart
  const cartItem = getCartItemByProductId(product.id);
  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 0);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  // Stock status
  const stockLimit = product.stock;
  const isOutOfStock = stockLimit === 0;
  const isLowStock = !isOutOfStock && stockLimit && stockLimit <= 5;
  const isInCart = localQuantity > 0;
  // Get rating info (real or placeholder) - pass product.id for deterministic generation
  const ratingInfo = getDisplayRating(product.reviews, product.average_rating, product.id);

  // ===========================
  // IMAGE NAVIGATION HANDLERS
  // ===========================

  const handlePreviousImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
    
    // Sync with Swiper if available
    if (swiperInstance) {
      swiperInstance.slideTo(newIndex);
    }
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
    
    // Sync with Swiper if available
    if (swiperInstance) {
      swiperInstance.slideTo(newIndex);
    }
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
      setImageLoaded(false);
      
      // Sync with Swiper if available
      if (swiperInstance) {
        swiperInstance.slideTo(index);
      }
    }
  };

  const handleSlideChange = (swiper) => {
    const index = hasMultipleImages ? swiper.realIndex : swiper.activeIndex;
    setCurrentImageIndex(index);
    setImageLoaded(false);
  };

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
    // Force immediate load check for primary image
    if (images.length > 0 && images[0]?.img_url) {
      const img = new Image();
      img.src = images[0].img_url;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
    
    // Reset swiper to first slide
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  }, [product.id, images, swiperInstance]);

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
  // RENDER - RESPONSIVE
  // ===========================

  return (
    <div className={`bg-white dark:bg-tppdarkgray rounded-lg border border-tppgrey dark:border-tppdarkwhite/10 shadow-sm hover:shadow-md hover:border-tppslate/60 dark:hover:border-tppdarkwhite/20 transition-all duration-200 overflow-hidden group ${isInCart ? 'border-2 border-tpppink dark:border-tppdarkwhite/40' : ''}`}>
      
      <Link 
        to={`/shop/products/${product.id}`} 
        className="block relative aspect-square overflow-hidden bg-tpppeach/10 dark:bg-tppdark/50"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* MOBILE: Swiper */}
        <div className="md:hidden w-full h-full">
          {images.length > 0 ? (
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              onSwiper={setSwiperInstance}
              onSlideChange={handleSlideChange}
              loop={hasMultipleImages}
              loopAdditionalSlides={1}
              className="w-full h-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id || index}>
                  <img
                    src={image.img_url}
                    alt={`${product.title} - Image ${index + 1}`}
                    className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                    onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-tppdark">
              <Package size={48} className="text-slate-300 dark:text-tppdarkwhite/20" />
            </div>
          )}
        </div>

        {/* DESKTOP: Hover Navigation */}
        <div className="hidden md:block w-full h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-tppgrey/10 dark:bg-tppdarkwhite/5 animate-pulse" />
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
              onError={(e) => { e.target.src = '/placeholder-product.png'; setImageLoaded(true); }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-tppdark">
              <Package size={48} className="md:w-16 md:h-16 text-slate-300 dark:text-tppdarkwhite/20" />
            </div>
          )}

          {hasMultipleImages && !isOutOfStock && (
            <>
              <button
                onClick={handlePreviousImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 dark:bg-tppdarkgray/95 hover:bg-white dark:hover:bg-tppdarkgray rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20 ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
                aria-label="Previous image"
              >
                <ChevronLeft size={16} className="text-slate-700 dark:text-tppdarkwhite group-hover/arrow:text-tpppink dark:group-hover/arrow:text-tppdarkwhite/80 transition-colors" />
              </button>
              
              <button
                onClick={handleNextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 dark:bg-tppdarkgray/95 hover:bg-white dark:hover:bg-tppdarkgray rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20 ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
                aria-label="Next image"
              >
                <ChevronRight size={16} className="text-slate-700 dark:text-tppdarkwhite group-hover/arrow:text-tpppink dark:group-hover/arrow:text-tppdarkwhite/80 transition-colors" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {hasMultipleImages && (
          <>
            <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1 bg-black/60 backdrop-blur-sm rounded-full z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentImageIndex ? 'w-1.5 h-1 bg-white' : 'w-1 h-1 bg-white/50 active:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            
            <div className={`hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 px-2 py-1.5 bg-black/60 backdrop-blur-sm rounded-full z-20 transition-opacity duration-200 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentImageIndex ? 'w-2 h-1 bg-white' : 'w-1 h-1 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {isOutOfStock && (
          <div className="font-inter absolute top-1 md:top-2 left-1 md:left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-md flex items-center gap-0.5 md:gap-1 shadow-lg z-10">
            <XCircle size={10} className="md:w-3.5 md:h-3.5" />
            OUT OF STOCK
          </div>
        )}

        {!isOutOfStock && (
          <div className="hidden md:flex absolute inset-0 bg-tppslate/20 dark:bg-tppdark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-end justify-end p-2 z-10">
            <button
              onClick={handleQuickView}
              className="bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Eye size={16} />
            </button>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-2 md:p-3">
        
        <Link to={`/shop/products/${product.id}`}>
          <h3 className="text-[13px] leading-[1.3] md:text-sm md:leading-[1.4] font-semibold text-tppslate dark:text-tppdarkwhite mb-1 md:mb-2 hover:text-tpppink dark:hover:text-tppdarkwhite/80 transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 md:gap-1.5 mb-1 md:mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                className={`md:w-3 md:h-3 ${
                  star <= Math.floor(ratingInfo.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : star === Math.ceil(ratingInfo.rating) && ratingInfo.rating % 1 !== 0
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 dark:fill-tppdarkwhite/20 text-slate-200 dark:text-tppdarkwhite/20'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs font-medium text-tppslate dark:text-tppdarkwhite/70">
            {formatRating(ratingInfo.rating)}
          </span>
          {ratingInfo.count > 0 && (
            <span className="text-[9px] md:text-xs text-slate-400 dark:text-tppdarkwhite/40">
              ({ratingInfo.count})
            </span>
          )}
        </div>

        <div className="mb-2 md:mb-3">
          {isOutOfStock ? (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-red-600 dark:text-red-400">
                Currently Unavailable
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-2xl font-bold text-tpppink dark:text-tppdarkwhite">
                  ₹{product.price}
                </span>
                <span className="text-[9px] md:text-xs font-medium text-green-600 dark:text-green-400">
                  • In Stock
                </span>
              </div>
              
              {isLowStock && (
                <div className="mt-1 md:mt-1.5 flex items-center gap-0.5 md:gap-1 text-[9px] md:text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                  <AlertTriangle size={10} className="md:w-3 md:h-3 flex-shrink-0" />
                  <span className="font-medium">Only {stockLimit} left!</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {!isInCart ? (
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1 md:gap-1.5 py-1.5 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all ${
                isOutOfStock
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-not-allowed border border-red-300 dark:border-red-700'
                  : adding
                  ? 'bg-tpppink/70 dark:bg-tppdarkwhite/70 text-white dark:text-tppdark cursor-wait'
                  : 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <XCircle size={10} className="md:w-3.5 md:h-3.5" />
                  <span className="hidden md:inline">Out of Stock</span>
                  <span className="md:hidden">Out of Stock</span>
                </>
              ) : adding ? (
                <>
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 border-2 border-white dark:border-tppdark border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] md:text-xs">Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={10} className="md:w-3.5 md:h-3.5" />
                  <span className="hidden md:inline">Add to Cart</span>
                  <span className="md:hidden">Add to Cart</span>
                </>
              )}
            </button>

            {!isOutOfStock && (
              <button
                onClick={handleQuickView}
                className="md:hidden flex items-center justify-center w-8 py-1.5 rounded-lg border border-tpppink dark:border-tppdarkwhite text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/10 dark:hover:bg-tppdarkwhite/10 transition-colors"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-1 md:gap-1.5 relative">
              {updating && (
                <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 bg-tppslate dark:bg-tppdarkgray text-white dark:text-tppdarkwhite text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap z-10">
                  Syncing...
                </div>
              )}

              <button
                onClick={handleDecrement}
                disabled={updating || localQuantity <= 0}
                className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded border transition-all ${
                  updating || localQuantity <= 0
                    ? 'border-tppgrey dark:border-tppdarkwhite/20 text-tppslate/40 dark:text-tppdarkwhite/20 cursor-not-allowed'
                    : 'border-tpppink dark:border-tppdarkwhite text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/10 dark:hover:bg-tppdarkwhite/10 active:scale-95'
                }`}
              >
                <Minus size={10} className="md:w-3.5 md:h-3.5" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1 md:gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-600 dark:border-green-500 rounded py-1 md:py-1.5 px-1.5 md:px-2 relative">
                <Check size={10} className="md:w-3 md:h-3 stroke-[3] text-green-700 dark:text-green-400" />
                <span className="text-[10px] md:text-xs font-semibold text-green-700 dark:text-green-400">
                  {localQuantity}
                </span>
                {pendingQuantity !== null && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

              <button
                onClick={handleIncrement}
                disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded border transition-all ${
                  updating || (stockLimit && localQuantity >= stockLimit)
                    ? 'border-tppgrey dark:border-tppdarkwhite/20 text-tppslate/40 dark:text-tppdarkwhite/20 cursor-not-allowed'
                    : 'border-tpppink dark:border-tppdarkwhite text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/10 dark:hover:bg-tppdarkwhite/10 active:scale-95'
                }`}
              >
                <Plus size={10} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>

            {!showRemoveConfirm ? (
              <div className='flex items-center gap-1 md:gap-2'>
                <button
                  onClick={handleRemoveClick}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-1 md:gap-1.5 py-1 md:py-1.5 rounded border font-medium text-[9px] md:text-xs transition-all ${
                    updating
                      ? 'border-tppgrey dark:border-tppdarkwhite/20 text-tppslate/40 dark:text-tppdarkwhite/20 cursor-not-allowed'
                      : 'border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95'
                  }`}
                >
                  <Trash2 size={9} className="md:w-3 md:h-3" />
                  Remove
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className={`w-full flex items-center justify-center gap-1 md:gap-1.5 py-1 md:py-1.5 rounded border font-medium text-[9px] md:text-xs transition-all ${
                    updating
                      ? 'border-tppgrey dark:border-tppdarkwhite/20 bg-slate-100 dark:bg-tppdarkgray text-tppslate/40 dark:text-tppdarkwhite/20 cursor-not-allowed'
                      : 'border-tpppink dark:border-tppdarkwhite bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 active:scale-95'
                  }`}
                >
                  Checkout
                  <ArrowBigRightDash size={12} className="md:w-4 md:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={handleConfirmRemove}
                  disabled={updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[9px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded transition-all disabled:opacity-40"
                >
                  {updating ? (
                    <Loader size={10} className="md:w-3.5 md:h-3.5 animate-spin mx-auto" />
                  ) : (
                    'Confirm'
                  )}
                </button>
                <button
                  onClick={handleCancelRemove}
                  disabled={updating}
                  className="px-2 md:px-3 py-1 md:py-1.5 text-slate-500 dark:text-tppdarkwhite/50 hover:text-slate-700 dark:hover:text-tppdarkwhite text-[9px] md:text-xs font-medium disabled:opacity-40"
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