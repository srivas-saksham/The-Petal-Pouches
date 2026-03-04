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
import shopService from '../services/shopService';
import SEO from '../components/seo/SEO';
import { useBrand } from '../context/BrandContext';

const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { brandMode } = useBrand();

  const isProductView = location.pathname.includes('/shop/products/');
  const itemType = isProductView ? 'product' : 'bundle';

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bundleHook = useBundleDetail(isProductView ? null : id);

  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId, getProductQuantityInCart, getCartItemByProductId } = useCart();

  const cartItem = isProductView ? getCartItemByProductId(id) : getCartItemByBundleId(id);
  const quantityInCart = isProductView ? getProductQuantityInCart(id) : getBundleQuantityInCart(id);

  const [localQuantity, setLocalQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const debounceTimerRef = useRef(null);

  const [currentBundleWeight, setCurrentBundleWeight] = useState(199);
  const [pendingWeight, setPendingWeight] = useState(null);
  const deliveryDebounceTimerRef = useRef(null);

  useEffect(() => {
    if (isProductView) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await shopService.getProductById(id);
          if (result.success && result.data) setItem(result.data);
          else setError('Product not found');
        } catch (err) {
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setItem(bundleHook.bundle);
      setLoading(bundleHook.loading);
      setError(bundleHook.error);
    }
  }, [id, isProductView, bundleHook.bundle, bundleHook.loading, bundleHook.error]);

  useEffect(() => {
    if (item) {
      const totalWeight = (item.weight || 100) * localQuantity;
      setCurrentBundleWeight(totalWeight);
    }
  }, [item]);

  const stockLimit = item?.stock_limit || item?.stock;
  const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
  const isOutOfStock = stockLimit === 0 || stockLimit === null;
  const items = item?.items || [];
  const stockStatus = isProductView ? { available: !isOutOfStock } : bundleHook.stockStatus;

  useEffect(() => {
    if (cartItem) setLocalQuantity(cartItem.quantity);
    else setLocalQuantity(1);
  }, [cartItem]);

  useEffect(() => {
    if (pendingQuantity === null || !cartItem) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setUpdating(true);
      try {
        if (pendingQuantity === 0) {
          const result = await removeFromCart(cartItem.id);
          if (result.success) refreshCart();
          else { alert(result.error || 'Failed to remove item'); setLocalQuantity(cartItem.quantity); }
        } else {
          const result = await updateCartItem(cartItem.id, pendingQuantity, stockLimit);
          if (result.success) refreshCart();
          else { alert(result.error || 'Failed to update quantity'); setLocalQuantity(cartItem.quantity); }
        }
      } catch (error) {
        alert('Failed to update quantity');
        setLocalQuantity(cartItem.quantity);
      } finally {
        setUpdating(false);
        setPendingQuantity(null);
      }
    }, 800);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [pendingQuantity, cartItem, stockLimit, refreshCart]);

  useEffect(() => {
    if (!loading && item) {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    }
  }, [loading, item]);

  const handleAddToCart = async () => {
    if (!stockStatus?.available) { alert(`This ${itemType} is currently out of stock`); return; }
    setAdding(true);
    try {
      let result;
      if (isProductView) {
        const cartService = (await import('../services/cartService')).default;
        result = await cartService.addProductToCart(id, localQuantity);
      } else {
        result = await addBundleToCart(id, localQuantity, stockLimit, quantityInCart);
      }
      if (result.success) refreshCart();
      else alert(result.error || 'Failed to add to cart');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = () => { if (stockLimit && localQuantity >= stockLimit) { alert(`Maximum ${stockLimit} units allowed`); return; } setLocalQuantity(prev => prev + 1); };
  const handleDecrement = () => { if (localQuantity > 1) setLocalQuantity(prev => prev - 1); };
  const handleCartIncrement = () => { const n = localQuantity + 1; if (stockLimit && n > stockLimit) { alert(`Maximum ${stockLimit} units allowed`); return; } setLocalQuantity(n); setPendingQuantity(n); };
  const handleCartDecrement = () => { if (localQuantity <= 1) return; const n = localQuantity - 1; setLocalQuantity(n); setPendingQuantity(n); };
  const handleRemoveClick = () => setShowRemoveConfirm(true);
  const handleConfirmRemove = async () => {
    if (!cartItem) return;
    setUpdating(true);
    try {
      const result = await removeFromCart(cartItem.id);
      if (result.success) { setLocalQuantity(1); refreshCart(); setShowRemoveConfirm(false); }
      else alert(result.error || 'Failed to remove item');
    } catch (error) { alert('Failed to remove item'); }
    finally { setUpdating(false); }
  };
  const handleCancelRemove = () => setShowRemoveConfirm(false);

  const handleQuantityChangeForDelivery = useCallback((quantity, weight) => {
    setPendingWeight(weight);
    if (deliveryDebounceTimerRef.current) clearTimeout(deliveryDebounceTimerRef.current);
    deliveryDebounceTimerRef.current = setTimeout(() => {
      setCurrentBundleWeight(weight);
      setPendingWeight(null);
    }, 800);
  }, []);

  useEffect(() => {
    return () => { if (deliveryDebounceTimerRef.current) clearTimeout(deliveryDebounceTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!item) return;
    const totalWeight = (item.weight || 100) * localQuantity;
    handleQuantityChangeForDelivery(localQuantity, totalWeight);
  }, [localQuantity, item, handleQuantityChangeForDelivery]);

  const handleSearch = (searchTerm) => {
    if (searchTerm) navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  if (loading) return <BundleSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-tppdark flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white dark:bg-tppdarkgray rounded-xl p-6 shadow-xl border border-red-200 dark:border-red-500/30">
          <AlertCircle size={48} className="mx-auto mb-3 text-red-500" />
          <h2 className="text-xl font-bold text-tppslate dark:text-tppdarkwhite mb-2">Failed to Load {itemType === 'product' ? 'Product' : 'Bundle'}</h2>
          <p className="text-sm text-slate-600 dark:text-tppdarkwhite/50 mb-4">{error}</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-all text-sm font-semibold"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const sidebarProps = {
    bundle: item, stockLimit, isOutOfStock, isLowStock,
    cartItem, localQuantity, setLocalQuantity,
    onAddToCart: handleAddToCart,
    onIncrement: cartItem ? handleCartIncrement : handleIncrement,
    onDecrement: cartItem ? handleCartDecrement : handleDecrement,
    adding, updating, showRemoveConfirm,
    onRemoveClick: handleRemoveClick,
    onConfirmRemove: handleConfirmRemove,
    onCancelRemove: handleCancelRemove,
    pendingQuantity,
    bundleWeight: currentBundleWeight,
    pendingWeight
  };

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
        style={{ backgroundImage: brandMode === 'feminine' ? 'url(/assets/doodle_bg.png)' : 'url(/assets/dark_leaf.jpg)', 
          backgroundRepeat: 'repeat', backgroundSize: 'auto' }}
      >
        <BundleHeader />

        <div className="max-w-9xl mx-auto md:px-6 md:py-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-12">

            <div className="space-y-4 md:space-y-0">

              {/* CONTAINER 1: Product Details */}
              <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
                <div className="grid md:grid-cols-1 lg:grid-cols-[45%_55%]">
                  <BundleImageGallery bundle={item} isOutOfStock={isOutOfStock} />
                  <div className="p-3 md:p-6 md:border-l border-slate-200 dark:border-tppdarkwhite/10">
                    <BundleKeyDetails
                      bundle={item} items={items} stockLimit={stockLimit}
                      isOutOfStock={isOutOfStock} isLowStock={isLowStock}
                      cartItem={cartItem} localQuantity={localQuantity} setLocalQuantity={setLocalQuantity}
                      onAddToCart={handleAddToCart}
                      onIncrement={cartItem ? handleCartIncrement : handleIncrement}
                      onDecrement={cartItem ? handleCartDecrement : handleDecrement}
                      adding={adding} updating={updating} showRemoveConfirm={showRemoveConfirm}
                      onRemoveClick={handleRemoveClick} onConfirmRemove={handleConfirmRemove} onCancelRemove={handleCancelRemove}
                      pendingQuantity={pendingQuantity} onQuantityChangeForDelivery={handleQuantityChangeForDelivery}
                    />
                  </div>
                </div>

                {item.description && (
                  <>
                    <div className="border-t border-slate-200 dark:border-tppdarkwhite/10"></div>
                    <div className="p-3 md:p-6">
                      <h2 className="text-base md:text-lg font-bold text-tppslate dark:text-tppdarkwhite mb-2 md:mb-3">
                        About This {itemType === 'product' ? 'Product' : 'Bundle'}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-700 dark:text-tppdarkwhite/70 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* CONTAINER 2: MOBILE Sidebar */}
              <div className="md:hidden bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
                <FloatingSidebar {...sidebarProps} />
              </div>

              {/* CONTAINER 3: Reviews */}
              <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm overflow-hidden">
                <BundleReviews bundle={item} />
              </div>
            </div>

            {/* DESKTOP Sidebar */}
            <div className="hidden lg:block lg:relative lg:self-start">
              <FloatingSidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BundleDetailPage;