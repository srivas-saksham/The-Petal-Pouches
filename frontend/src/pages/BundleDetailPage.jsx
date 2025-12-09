// frontend/src/pages/BundleDetailPage.jsx - WITH BREADCRUMBS NAVIGATION
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Package, Star, Share2, Heart } from 'lucide-react';
import useBundleDetail from '../hooks/useBundleDetail';
import BundleImageGallery from '../components/bundle-detail/BundleImageGallery';
import BundleKeyDetails from '../components/bundle-detail/BundleKeyDetails';
import BundleProducts from '../components/bundle-detail/BundleProducts';
import FloatingSidebar from '../components/bundle-detail/FloatingSidebar/FloatingSidebar';
import Breadcrumb from '../components/bundle-detail/ui/Breadcrumb'; // ✅ NEW IMPORT
import { generateBreadcrumbs } from '../utils/bundleHelpers'; // ✅ NEW IMPORT
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';
import { getDisplayRating, formatRating, formatTimeAgo } from '../utils/reviewHelpers';

/**
 * BundleDetailPage - WITH BREADCRUMBS NAVIGATION
 * 
 * REPLACED: BundleHeader component with Breadcrumb navigation
 * ✅ Shows: Home > Shop > Bundles > [Current Bundle Name]
 * ✅ Maintains sticky header with Share & Wishlist action buttons
 * ✅ Professional design matching shop aesthetic
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { bundle, loading, error, stockStatus } = useBundleDetail(id);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  const cartItem = getCartItemByBundleId(id);
  const quantityInCart = getBundleQuantityInCart(id);
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const debounceTimerRef = useRef(null);
  
  const stockLimit = bundle?.stock_limit;
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const items = bundle?.items || [];
  const reviews = bundle?.reviews || [];
  const ratingInfo = bundle ? getDisplayRating(bundle.reviews, bundle.average_rating) : { rating: 0, count: 0 };

  // ✅ Generate breadcrumbs
  const breadcrumbItems = bundle ? generateBreadcrumbs(bundle) : [];

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
      alert('This bundle is currently out of stock');
      return;
    }

    setAdding(true);
    try {
      const result = await addBundleToCart(id, localQuantity, stockLimit, quantityInCart);
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
      alert(`Maximum ${stockLimit} units allowed per bundle`);
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
      alert(`Maximum ${stockLimit} units allowed per bundle`);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bundle.title,
          text: bundle.description,
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

  // Mock rating distribution
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
          <p className="text-tppslate text-sm font-medium">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl p-6 shadow-xl border border-red-200">
          <AlertCircle size={48} className="mx-auto mb-3 text-red-500" />
          <h2 className="text-xl font-bold text-tppslate mb-2">Failed to Load Bundle</h2>
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

  if (!bundle) return null;

  return (
    <div className="min-h-screen"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {/* ✅ NEW: STICKY HEADER WITH BREADCRUMBS */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-9xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Breadcrumbs Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Right: Action Buttons (Share & Wishlist) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleShare}
                className="p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Share Bundle"
                aria-label="Share bundle"
              >
                <Share2 size={16} />
              </button>
              
              <button
                onClick={handleWishlist}
                className="p-2 border-2 border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 
                  transition-all text-slate-600 hover:text-tpppink"
                title="Add to Wishlist"
                aria-label="Add to wishlist"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Success Toast */}
      {showShareModal && (
        <div className="fixed top-16 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <Check size={14} />
          <span className="font-medium">Link copied!</span>
        </div>
      )}

      {/* UNIFIED SINGLE DOCUMENT LAYOUT */}
      <div className="max-w-9xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          
          {/* LEFT 70% - SINGLE FLOWING CONTAINER */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Top Section: Image + Key Details */}
            <div className="grid lg:grid-cols-[55%_45%]">
              <BundleImageGallery bundle={bundle} isOutOfStock={isOutOfStock} />
              
              <div className="p-6 border-l border-slate-200">
                <BundleKeyDetails
                  bundle={bundle}
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
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Full Product Details */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-tppslate mb-4 flex items-center gap-2">
                <Package size={18} className="text-tpppink" />
                Complete Product List
              </h2>
              {items.length > 0 ? (
                <BundleProducts items={items} />
              ) : (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-500 font-medium">No products</p>
                </div>
              )}
            </div>

            {/* Description Section */}
            {bundle.description && (
              <>
                <div className="border-t border-slate-200"></div>
                
                <div className="p-6">
                  <h2 className="text-lg font-bold text-tppslate mb-3">About This Bundle</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {bundle.description}
                  </p>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Reviews Section */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-tppslate mb-4">Customer Reviews</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                <div className="text-center">
                  <p className="text-4xl font-bold text-tppslate mb-1">
                    {formatRating(ratingInfo.rating)}
                  </p>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`${
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

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs w-3">{rating}</span>
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width: `${reviews.length > 0 ? (distribution[rating] / reviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">
                        {distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {review.user_name ? review.user_name.charAt(0) : 'A'}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-tppslate">
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
                            size={12}
                            className={`${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-2">No reviews yet</p>
                  <button className="text-xs font-semibold text-tpppink hover:underline">
                    Be the first to review
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 30% - Floating Sidebar */}
          <div className="lg:relative lg:self-start">
            <FloatingSidebar
              bundle={bundle}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;