// frontend/src/pages/BundleDetailPage.jsx - UNIFIED FOR PRODUCTS & BUNDLES
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, AlertCircle, Package } from 'lucide-react';
import useBundleDetail from '../hooks/useBundleDetail';
import BundleImageGallery from '../components/bundle-detail/BundleImageGallery';
import BundleKeyDetails from '../components/bundle-detail/BundleKeyDetails';
import FloatingSidebar from '../components/bundle-detail/FloatingSidebar/FloatingSidebar';
import BundleHeader from '../components/bundle-detail/BundleHeader';
import BundleReviews from '../components/bundle-detail/BundleReviews';
import BundleSkeleton from '../components/bundle-detail/ui/BundleSkeleton';
import { addBundleToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../hooks/useCart';
import { getDisplayRating, formatRating, formatTimeAgo } from '../utils/reviewHelpers';
import shopService from '../services/shopService';
import SEO from '../components/seo/SEO';

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
  
  const [currentBundleWeight, setCurrentBundleWeight] = useState(199);
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

  // ✅ NEW: Initialize weight when item loads
  useEffect(() => {
    if (item) {
      // Use bundle.weight or product.weight directly
      const itemWeight = item.weight || 100;
      const totalWeight = itemWeight * localQuantity;
      
      console.log(`📦 [BundleDetail] Item loaded: ${item.title}`);
      console.log(`   Weight: ${itemWeight}g × ${localQuantity} = ${totalWeight}g`);
      
      setCurrentBundleWeight(totalWeight);
    }
  }, [item]); // Only run when item changes, not localQuantity

  const stockLimit = item?.stock_limit || item?.stock;
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const items = item?.items || [];
  const reviews = item?.reviews || [];
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

  useEffect(() => {
  if (!loading && item) {
    // Wait one frame for layout + images
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }
}, [loading, item]);


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

  // ✅ NEW: Update weight when quantity changes
  useEffect(() => {
    if (!item) return;
    
    const itemWeight = item.weight || 100;
    const totalWeight = itemWeight * localQuantity;
    
    console.log(`📦 [BundleDetail] Quantity changed: ${localQuantity} units`);
    console.log(`   Total weight: ${totalWeight}g (${totalWeight/1000}kg)`);
    
    // Call the delivery update callback (with debounce)
    handleQuantityChangeForDelivery(localQuantity, totalWeight);
  }, [localQuantity, item, handleQuantityChangeForDelivery]);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return <BundleSkeleton />;
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
    <>
    {item && (
      <SEO
        title={item.title}
        description={item.description || `Buy ${item.title} by Rizara Luxe. Premium jewelry bundle crafted for unforgettable moments.`}
        canonical={`https://www.rizara.in/shop/bundles/${id}`}
        image={item.images?.[0]?.image_url}
        type="product"
        keywords={item.tags?.join(', ')}
      />
    )}
    
    <div className="min-h-screen"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <BundleHeader />

      {/* MOBILE: Single column | DESKTOP: 2-column with sidebar */}
      <div className="max-w-9xl mx-auto md:px-6 md:py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-12">
          
          {/* Main Content - Wrapper for mobile spacing */}
          <div className="space-y-4 md:space-y-0">
            
            {/* CONTAINER 1: Product Details */}
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

            </div>

            {/* CONTAINER 2: MOBILE ONLY - Delivery Section (separate container) */}
            <div className="md:hidden bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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

            {/* CONTAINER 3: Reviews Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <BundleReviews bundle={item} />
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
    </>
);
};

export default BundleDetailPage;