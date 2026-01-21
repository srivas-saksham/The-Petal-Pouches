// frontend/src/pages/BundleDetailPage.jsx - UNIFIED FOR PRODUCTS & BUNDLES
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, AlertCircle, Package, Star } from 'lucide-react';
import useBundleDetail from '../hooks/useBundleDetail';
import BundleImageGallery from '../components/bundle-detail/BundleImageGallery';
import BundleKeyDetails from '../components/bundle-detail/BundleKeyDetails';
import FloatingSidebar from '../components/bundle-detail/FloatingSidebar/FloatingSidebar';
import BundleHeader from '../components/bundle-detail/BundleHeader';
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';
import { getDisplayRating, formatRating, formatTimeAgo } from '../utils/reviewHelpers';
import shopService from '../services/shopService';

/**
 * BundleDetailPage - UNIFIED for Products AND Bundles
 * Detects item type from URL path and fetches accordingly
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if viewing product or bundle from URL
  const isProductView = location.pathname.includes('/shop/products/');
  const itemType = isProductView ? 'product' : 'bundle';
  
  // State for product fetching
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use bundle hook only for bundles
  const bundleHook = useBundleDetail(isProductView ? null : id);
  
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { 
    refreshCart, 
    getBundleQuantityInCart, 
    getCartItemByBundleId,
    getProductQuantityInCart,
    getCartItemByProductId 
  } = useCart();
  
  const cartItem = isProductView 
    ? getCartItemByProductId(id)
    : getCartItemByBundleId(id);
    
  const quantityInCart = isProductView
    ? getProductQuantityInCart(id)
    : getBundleQuantityInCart(id);
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const debounceTimerRef = useRef(null);
  
  const [currentBundleWeight, setCurrentBundleWeight] = useState(1000);
  const [pendingWeight, setPendingWeight] = useState(null);
  const deliveryDebounceTimerRef = useRef(null);

  // Fetch product data if viewing product
  useEffect(() => {
    if (isProductView) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const result = await shopService.getProductById(id);
          
          if (result.success && result.data) {
            setItem(result.data);
          } else {
            setError('Product not found');
          }
        } catch (err) {
          console.error('Failed to fetch product:', err);
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    } else {
      // Use bundle hook data
      setItem(bundleHook.bundle);
      setLoading(bundleHook.loading);
      setError(bundleHook.error);
    }
  }, [id, isProductView, bundleHook.bundle, bundleHook.loading, bundleHook.error]);

  const stockLimit = item?.stock_limit || item?.stock;
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const items = item?.items || [];
  const reviews = item?.reviews || [];
  const ratingInfo = item ? getDisplayRating(item.reviews, item.average_rating) : { rating: 0, count: 0 };
  const stockStatus = isProductView ? { available: !isOutOfStock } : bundleHook.stockStatus;

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(1);
    }
  }, [cartItem]);

  useEffect(() => {
    if (pendingQuantity === null || !cartItem) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setUpdating(true);

      try {
        if (pendingQuantity === 0) {
          const result = await removeFromCart(cartItem.id);
          if (result.success) {
            refreshCart();
          } else {
            alert(result.error || 'Failed to remove item');
            setLocalQuantity(cartItem.quantity);
          }
        } else {
          const result = await updateCartItem(cartItem.id, pendingQuantity, stockLimit);
          if (result.success) {
            refreshCart();
          } else {
            alert(result.error || 'Failed to update quantity');
            setLocalQuantity(cartItem.quantity);
          }
        }
      } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update quantity');
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

  const handleAddToCart = async () => {
    if (!stockStatus?.available) {
      alert(`This ${itemType} is currently out of stock`);
      return;
    }

    setAdding(true);
    try {
      let result;
      
      if (isProductView) {
        const cartService = (await import('../services/cartService')).default;
        result = await cartService.addProductToCart(id, localQuantity);
      } else {
        result = await addBundleToCart(id, localQuantity, stockLimit, quantityInCart);
      }
      
      if (result.success) {
        refreshCart();
      } else {
        alert(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = () => {
    if (stockLimit && localQuantity >= stockLimit) {
      alert(`Maximum ${stockLimit} units allowed`);
      return;
    }
    setLocalQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) setLocalQuantity(prev => prev - 1);
  };

  const handleCartIncrement = () => {
    const newQuantity = localQuantity + 1;
    if (stockLimit && newQuantity > stockLimit) {
      alert(`Maximum ${stockLimit} units allowed`);
      return;
    }
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleCartDecrement = () => {
    if (localQuantity <= 1) return;
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!cartItem) return;

    setUpdating(true);
    try {
      const result = await removeFromCart(cartItem.id);
      if (result.success) {
        setLocalQuantity(1);
        refreshCart();
        setShowRemoveConfirm(false);
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirm(false);
  };

  const handleQuantityChangeForDelivery = useCallback((quantity, weight) => {
    console.log(`📦 Quantity changed: ${quantity} units (${weight}g) - debouncing...`);
    
    setPendingWeight(weight);
    
    if (deliveryDebounceTimerRef.current) {
      clearTimeout(deliveryDebounceTimerRef.current);
    }
    
    deliveryDebounceTimerRef.current = setTimeout(() => {
      console.log(`✅ Delivery weight synced: ${weight}g`);
      setCurrentBundleWeight(weight);
      setPendingWeight(null);
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (deliveryDebounceTimerRef.current) {
        clearTimeout(deliveryDebounceTimerRef.current);
      }
    };
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
      navigator.clipboard.writeText(window.location.href);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  const handleWishlist = () => {
    alert('Wishlist feature coming soon!');
  };

  const distribution = reviews.length > 0 ? {
    5: Math.floor(reviews.length * 0.6),
    4: Math.floor(reviews.length * 0.25),
    3: Math.floor(reviews.length * 0.1),
    2: Math.floor(reviews.length * 0.03),
    1: Math.floor(reviews.length * 0.02)
  } : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-tppslate text-sm font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl p-6 shadow-xl border border-red-200">
          <AlertCircle size={48} className="mx-auto mb-3 text-red-500" />
          <h2 className="text-xl font-bold text-tppslate mb-2">Failed to Load {itemType === 'product' ? 'Product' : 'Bundle'}</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-2 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-all text-sm font-semibold"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <BundleHeader
        bundle={item}
        onShare={handleShare}
        onWishlist={handleWishlist}
        onSearchChange={handleSearch}
      />

      {showShareModal && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-4 duration-200">
          <Check size={14} />
          <span className="font-medium">Link copied!</span>
        </div>
      )}

      {/* MOBILE: Single column | DESKTOP: 2-column with sidebar */}
      <div className="max-w-9xl mx-auto px-3 py-3 md:px-6 md:py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-12">
          
          {/* Main Content */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Image + Details Section */}
            <div className="grid md:grid-cols-1 lg:grid-cols-[45%_55%]">
              <BundleImageGallery bundle={item} isOutOfStock={isOutOfStock} />
              
              <div className="p-3 md:p-6 md:border-l border-slate-200">
                <BundleKeyDetails
                  bundle={item}
                  items={items}
                  stockLimit={stockLimit}
                  isOutOfStock={isOutOfStock}
                  isLowStock={isLowStock}
                  cartItem={cartItem}
                  localQuantity={localQuantity}
                  setLocalQuantity={setLocalQuantity}
                  onAddToCart={handleAddToCart}
                  onIncrement={cartItem ? handleCartIncrement : handleIncrement}
                  onDecrement={cartItem ? handleCartDecrement : handleDecrement}
                  adding={adding}
                  updating={updating}
                  showRemoveConfirm={showRemoveConfirm}
                  onRemoveClick={handleRemoveClick}
                  onConfirmRemove={handleConfirmRemove}
                  onCancelRemove={handleCancelRemove}
                  pendingQuantity={pendingQuantity}
                  onQuantityChangeForDelivery={handleQuantityChangeForDelivery}
                />
              </div>
            </div>

            {/* MOBILE ONLY: Delivery Section (inline after details) */}
            <div className="md:hidden border-t border-slate-200">
              <FloatingSidebar
                bundle={item}
                stockLimit={stockLimit}
                isOutOfStock={isOutOfStock}
                isLowStock={isLowStock}
                cartItem={cartItem}
                localQuantity={localQuantity}
                setLocalQuantity={setLocalQuantity}
                onAddToCart={handleAddToCart}
                onIncrement={cartItem ? handleCartIncrement : handleIncrement}
                onDecrement={cartItem ? handleCartDecrement : handleDecrement}
                adding={adding}
                updating={updating}
                showRemoveConfirm={showRemoveConfirm}
                onRemoveClick={handleRemoveClick}
                onConfirmRemove={handleConfirmRemove}
                onCancelRemove={handleCancelRemove}
                pendingQuantity={pendingQuantity}
                bundleWeight={currentBundleWeight}
                pendingWeight={pendingWeight}
              />
            </div>

            {item.description && (
              <>
                <div className="border-t border-slate-200"></div>
                
                <div className="p-3 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-tppslate mb-2 md:mb-3">
                    About This {itemType === 'product' ? 'Product' : 'Bundle'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </>
            )}

            {/* Reviews Section */}
            <div className="border-t border-slate-200"></div>

            <div className="p-3 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-tppslate mb-3 md:mb-4">Customer Reviews</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-100">
                <div className="text-center">
                  <p className="text-2xl md:text-4xl font-bold text-tppslate mb-1">
                    {formatRating(ratingInfo.rating)}
                  </p>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={`md:w-3.5 md:h-3.5 ${
                          star <= Math.floor(ratingInfo.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {ratingInfo.count} {ratingInfo.count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* Distribution Bars */}
                <div className="flex-1 space-y-1.5 md:space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-xs w-2 md:w-3">{rating}</span>
                      <Star size={8} className="md:w-2.5 md:h-2.5 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width: `${reviews.length > 0 ? (distribution[rating] / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-6 md:w-8 text-right">
                        {distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="pb-3 md:pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {review.user_name ? review.user_name.charAt(0) : 'A'}
                        </div>
                        <div>
                          <span className="text-xs md:text-sm font-semibold text-tppslate">
                            {review.user_name || 'Anonymous'}
                          </span>
                          <p className="text-xs text-slate-400">
                            {formatTimeAgo(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            className={`md:w-3 md:h-3 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 md:py-6">
                  <p className="text-xs md:text-sm text-slate-500 mb-2">No reviews yet</p>
                  <button className="text-xs font-semibold text-tpppink hover:underline">
                    Be the first to review
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* DESKTOP ONLY: Sidebar */}
          <div className="hidden lg:block lg:relative lg:self-start">
            <FloatingSidebar
              bundle={item}
              stockLimit={stockLimit}
              isOutOfStock={isOutOfStock}
              isLowStock={isLowStock}
              cartItem={cartItem}
              localQuantity={localQuantity}
              setLocalQuantity={setLocalQuantity}
              onAddToCart={handleAddToCart}
              onIncrement={cartItem ? handleCartIncrement : handleIncrement}
              onDecrement={cartItem ? handleCartDecrement : handleDecrement}
              adding={adding}
              updating={updating}
              showRemoveConfirm={showRemoveConfirm}
              onRemoveClick={handleRemoveClick}
              onConfirmRemove={handleConfirmRemove}
              onCancelRemove={handleCancelRemove}
              pendingQuantity={pendingQuantity}
              bundleWeight={currentBundleWeight}
              pendingWeight={pendingWeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;