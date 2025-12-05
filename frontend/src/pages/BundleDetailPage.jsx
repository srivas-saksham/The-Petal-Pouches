// frontend/src/pages/BundleDetailPage.jsx - COMPACT PROFESSIONAL UI

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Check, AlertCircle, Package, Plus, Minus, 
  ShoppingCart, AlertTriangle, Trash2, Star, ShieldCheck,
  Truck, RotateCcw, Info, Sparkles
} from 'lucide-react';
import { formatBundlePrice } from '../utils/bundleHelpers';
import { getDisplayRating, formatRating } from '../utils/reviewHelpers';
import BundleProducts from '../components/shop/BundleProducts';
import bundleService from '../services/bundleService';
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';

/**
 * BundleDetailPage - COMPACT PROFESSIONAL UI
 * Ultra-compact design with small text and minimal spacing
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bundle, setBundle] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);
  
  const stockLimit = bundle?.stock_limit;
  const isLowStock = stockLimit && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  
  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  const cartItem = getCartItemByBundleId(id);
  const quantityInCart = getBundleQuantityInCart(id);
  const isInCart = quantityInCart > 0;

  const ratingInfo = bundle ? getDisplayRating(bundle.reviews, bundle.average_rating) : { rating: 0, count: 0 };

  useEffect(() => {
    const fetchBundle = async () => {
      setLoading(true);
      setError(null);

      try {
        const [bundleResponse, stockResponse] = await Promise.all([
          bundleService.getBundleDetails(id),
          bundleService.checkBundleStock(id)
        ]);

        const bundleData = bundleResponse.data;
        const stockData = stockResponse.data;
        const items = bundleData.Bundle_items || bundleData.items || [];
        
        setBundle({ ...bundleData, items });
        setStockStatus(stockData);
      } catch (err) {
        console.error('❌ Failed to fetch bundle:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load bundle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBundle();
  }, [id]);

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(1);
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
        console.error('❌ Update error:', error);
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
  }, [pendingQuantity, cartItem, stockLimit, refreshCart, isInCart]);

  const items = bundle?.items || [];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-tpppeach/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-tppslate text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tpppeach/10 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-tpppeach/10">
      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-tppgrey shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-1.5 text-tppslate hover:text-tpppink transition-colors text-sm font-medium group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-1.5 border border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 transition-all text-slate-600 hover:text-tpppink"
                title="Share"
              >
                <Share2 size={14} />
              </button>
              <button
                className="p-1.5 border border-slate-200 rounded-lg hover:border-tpppink hover:bg-tpppink/5 transition-all text-slate-600 hover:text-tpppink"
                title="Wishlist"
              >
                <Heart size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareModal && (
        <div className="fixed top-16 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-top">
          <Check size={14} />
          <span className="font-medium">Link copied!</span>
        </div>
      )}

      {/* Compact Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT - Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden border border-tppgrey shadow-md aspect-square group">
              {bundle.img_url ? (
                <img
                  src={bundle.img_url}
                  alt={bundle.title}
                  className={`w-full h-full object-cover transition-all ${
                    isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'
                  }`}
                  onError={(e) => e.target.src = '/placeholder-bundle.png'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-tpppeach/20">
                  <Package size={48} className="text-tppslate/40" />
                </div>
              )}

              {/* Compact Badges */}
              {isOutOfStock && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg flex items-center gap-1">
                  <AlertCircle size={12} />
                  OUT OF STOCK
                </div>
              )}

              {!isOutOfStock && bundle.discount_percent > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
                  {bundle.discount_percent}% OFF
                </div>
              )}

              {!isOutOfStock && items.length > 0 && (
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-tppslate border border-tppgrey text-xs font-semibold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                  <Package size={10} />
                  {items.length}
                </div>
              )}
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2.5 border border-tppgrey shadow-sm">
                <p className="text-[10px] text-slate-500 mb-0.5 font-medium uppercase">Products</p>
                <p className="text-lg font-bold text-tpppink">{items.length}</p>
              </div>
              
              {bundle.discount_percent > 0 && (
                <div className="bg-green-50 rounded-lg p-2.5 border border-green-200 shadow-sm">
                  <p className="text-[10px] text-green-600 mb-0.5 font-medium uppercase">Discount</p>
                  <p className="text-lg font-bold text-green-600">{bundle.discount_percent}%</p>
                </div>
              )}
              
              {bundle.savings > 0 && (
                <div className="bg-green-50 rounded-lg p-2.5 border border-green-200 shadow-sm">
                  <p className="text-[10px] text-green-600 mb-0.5 font-medium uppercase">Save</p>
                  <p className="text-sm font-bold text-green-600">{formatBundlePrice(bundle.savings)}</p>
                </div>
              )}
            </div>

            {/* Compact Trust Badges */}
            <div className="bg-white rounded-lg p-3 border border-tppgrey shadow-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1">
                    <ShieldCheck size={14} className="text-green-600" />
                  </div>
                  <p className="text-[10px] font-semibold text-tppslate">Authentic</p>
                </div>
                <div className="text-center">
                  <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1">
                    <Truck size={14} className="text-blue-600" />
                  </div>
                  <p className="text-[10px] font-semibold text-tppslate">Fast Ship</p>
                </div>
                <div className="text-center">
                  <div className="w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-1">
                    <RotateCcw size={14} className="text-purple-600" />
                  </div>
                  <p className="text-[10px] font-semibold text-tppslate">Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Compact Details */}
          <div className="space-y-4">
            {/* Compact Title & Rating */}
            <div>
              <h1 className="text-2xl font-bold text-tppslate leading-tight mb-2">
                {bundle.title}
              </h1>

              {/* Compact Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={`${
                        star <= Math.floor(ratingInfo.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : star === Math.ceil(ratingInfo.rating) && ratingInfo.rating % 1 !== 0
                          ? 'fill-amber-400/50 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-tppslate">
                  {formatRating(ratingInfo.rating)}
                </span>
                {ratingInfo.count > 0 && (
                  <span className="text-xs text-slate-500">
                    ({ratingInfo.count})
                  </span>
                )}
              </div>

              {/* Compact Description */}
              {bundle.description && (
                <p className="text-sm text-slate-600 leading-snug">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Compact Price */}
            <div className="bg-gradient-to-br from-tpppink/5 to-tpppeach/30 rounded-xl p-4 border border-tpppink/20">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-3xl font-bold text-tpppink">
                  {formatBundlePrice(bundle.price)}
                </p>
                {bundle.original_price && bundle.original_price > bundle.price && (
                  <p className="text-base text-slate-400 line-through">
                    {formatBundlePrice(bundle.original_price)}
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Tax included • Free shipping
              </p>
            </div>

            {/* Compact Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                {stockStatus?.available ? (
                  <>
                    <Check size={16} className="text-green-600 stroke-[3]" />
                    <span className="text-green-600 font-bold text-sm">In Stock</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-red-600 font-bold text-sm">Out of Stock</span>
                  </>
                )}
              </div>

              {isLowStock && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span className="font-bold">Only {stockLimit} left!</span>
                </div>
              )}
            </div>

            {/* Compact Cart Controls */}
            {!isInCart ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-tppslate mb-1.5 uppercase tracking-wide">
                    Quantity
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleDecrement}
                      disabled={localQuantity <= 1}
                      className="w-8 h-8 border border-tppgrey rounded-md hover:bg-tpppeach/30 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={localQuantity}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        if (stockLimit && val > stockLimit) {
                          alert(`Maximum ${stockLimit} units allowed`);
                          return;
                        }
                        setLocalQuantity(val);
                      }}
                      className="w-14 h-8 text-center text-sm font-bold border border-tppgrey rounded-md focus:ring-1 focus:ring-tpppink focus:border-tpppink text-tppslate"
                      min="1"
                      max={stockLimit || undefined}
                    />
                    <button
                      onClick={handleIncrement}
                      disabled={stockLimit && localQuantity >= stockLimit}
                      className="w-8 h-8 border border-tppgrey rounded-md hover:bg-tpppeach/30 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                    {stockLimit && (
                      <span className="text-[10px] text-slate-500 font-medium ml-0.5">
                        (Max: {stockLimit})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding || !stockStatus?.available || stockLimit === 0}
                  className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md ${
                    !stockStatus?.available || stockLimit === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : adding
                      ? 'bg-tpppink/70 text-white cursor-wait'
                      : 'bg-tpppink text-white hover:bg-tppslate hover:shadow-lg active:scale-[0.98] border border-tpppink hover:border-tppslate'
                  }`}
                >
                  {adding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-500 rounded-lg p-3 relative">
                  {updating && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tppslate text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                      Syncing...
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Check size={14} className="text-green-600 stroke-[3]" />
                    <span className="text-green-600 font-bold text-xs">
                      In Cart ({quantityInCart})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCartDecrement}
                      disabled={updating || localQuantity <= 1}
                      className="w-8 h-8 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                    >
                      <Minus size={14} />
                    </button>

                    <div className="flex-1 text-center relative bg-white rounded-md py-1.5 border border-green-600">
                      <span className="text-lg font-bold text-green-600">{localQuantity}</span>
                      {pendingQuantity !== null && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    <button
                      onClick={handleCartIncrement}
                      disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                      className="w-8 h-8 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Remove Button with Inline Confirmation */}
                {!showRemoveConfirm ? (
                  <button
                    onClick={handleRemoveClick}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-red-500 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmRemove}
                      disabled={updating}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Removing...' : 'Confirm Remove'}
                    </button>
                    <button
                      onClick={handleCancelRemove}
                      disabled={updating}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Compact Info */}
            <div className="bg-white rounded-lg p-3 border border-tppgrey shadow-sm">
              <div className="flex items-start gap-2 text-xs">
                <Info size={14} className="text-tpppink flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-tppslate mb-0.5">Bundle Info</p>
                  <p className="text-slate-600 leading-snug">{items.length} products at a special bundled price. Ready to ship.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Products List */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-md border border-tppgrey overflow-hidden">
            <div className="bg-gradient-to-r from-tpppink to-tpppeach px-4 py-3 border-b border-tppgrey">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} />
                What's Included ({items.length})
              </h2>
            </div>
            
            <div className="p-4">
              {items.length > 0 ? (
                <BundleProducts items={items} />
              ) : (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto mb-2 text-tppslate/40" />
                  <p className="text-sm text-slate-600 font-medium">No products</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;