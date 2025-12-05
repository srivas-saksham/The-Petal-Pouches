// frontend/src/pages/BundleDetailPage.jsx - COMPLETE IMPLEMENTATION

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Check, AlertCircle, Package, 
  Sparkles, Info
} from 'lucide-react';
import { formatBundlePrice } from '../utils/bundleHelpers';
import useBundleDetail from '../hooks/useBundleDetail';
import BundleHeader from '../components/bundle-detail/BundleHeader';
import BundleImageGallery from '../components/bundle-detail/BundleImageGallery';
import BundleInfo from '../components/bundle-detail/BundleInfo';
import BundleProducts from '../components/bundle-detail/BundleProducts';
import BundleReviews from '../components/bundle-detail/BundleReviews';
import FloatingSidebar from '../components/bundle-detail/FloatingSidebar/FloatingSidebar';
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';

/**
 * BundleDetailPage - COMPLETE COMPACT UI
 * Uses all created components with full integration
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data fetching with custom hook
  const { bundle, loading, error, stockStatus } = useBundleDetail(id);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Cart integration
  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();
  const cartItem = getCartItemByBundleId(id);
  const quantityInCart = getBundleQuantityInCart(id);
  
  // Local state for cart operations
  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const debounceTimerRef = useRef(null);
  
  // Extract stock info
  const stockLimit = bundle?.stock_limit;
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const items = bundle?.items || [];

  // Sync local quantity with cart
  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(1);
    }
  }, [cartItem]);

  // Debounced cart update
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
  }, [pendingQuantity, cartItem, stockLimit, refreshCart]);

  // Cart handlers
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

  // Share handler
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
    // TODO: Implement wishlist
    alert('Wishlist feature coming soon!');
  };

  // Loading state
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

  // Error state
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Component */}
      <BundleHeader
        bundle={bundle}
        onShare={handleShare}
        onWishlist={handleWishlist}
      />

      {/* Share Toast */}
      {showShareModal && (
        <div className="fixed top-16 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-top">
          <Check size={14} />
          <span className="font-medium">Link copied!</span>
        </div>
      )}

      {/* Main Content - 70/30 Layout */}
      <div className="max-w-9xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          
          {/* LEFT COLUMN - Main Content (70%) */}
          <div className="space-y-6">
            
            {/* Image Gallery */}
            <BundleImageGallery 
              bundle={bundle} 
              isOutOfStock={isOutOfStock} 
            />

            {/* Bundle Info */}
            <BundleInfo 
              bundle={bundle} 
              isOutOfStock={isOutOfStock} 
            />

            {/* Products Included */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-tpppink to-tppslate px-4 py-3 border-b border-slate-200">
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
                    <Package size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">No products</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <BundleReviews bundle={bundle} />

            {/* Additional Info Card */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="flex items-start gap-2 text-xs">
                <Info size={14} className="text-tpppink flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-tppslate mb-1">Bundle Information</p>
                  <p className="text-slate-600 leading-snug">
                    This curated bundle contains {items.length} premium {items.length === 1 ? 'product' : 'products'} 
                    at a special bundled price. All items are in stock and ready to ship. 
                    Free shipping included on all orders.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Floating Sidebar (30%) */}
          <div>
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