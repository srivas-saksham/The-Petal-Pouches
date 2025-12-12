// frontend/src/components/user/orders/BuyAgainSidebar.jsx

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ShoppingCart, Package, Loader, Plus, Minus, Check, Trash2 } from 'lucide-react';
import { getOrders } from '../../../services/orderService';
import { getBundleById } from '../../../services/bundleService';
import { addBundleToCart, updateCartItem, removeFromCart } from '../../../services/cartService';
import { useCart } from '../../../hooks/useCart';

/**
 * Buy Again sidebar - Shows unique bundles from all orders (except cancelled) for quick reordering
 * ✅ WITH IN-CART CONTROLS: Same debounced update functionality as BundleKeyDetails
 */
const BuyAgainSidebar = ({ onReorder }) => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingBundleId, setAddingBundleId] = useState(null);
  
  // Track individual bundle states
  const [bundleStates, setBundleStates] = useState({});
  const debounceTimersRef = useRef({});

  const { refreshCart, getBundleQuantityInCart, getCartItemByBundleId } = useCart();

  useEffect(() => {
    loadPendingBundles();
  }, []);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const loadPendingBundles = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders (we'll filter out cancelled ones)
      const response = await getOrders({
        limit: 100,
        page: 1
      });

      if (response.success && response.data) {
        const orders = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        // Filter out cancelled orders
        const activeOrders = orders.filter(order => 
          order.status && order.status.toLowerCase() !== 'cancelled'
        );
        
        const bundleMap = new Map();
        
        activeOrders.forEach(order => {
          const orderItems = order.order_items || order.items_preview || [];
          
          orderItems.forEach(item => {
            if (item.bundle_id) {
              const bundleId = item.bundle_id;
              const itemCreatedAt = item.created_at || order.created_at;
              
              if (bundleMap.has(bundleId)) {
                const existing = bundleMap.get(bundleId);
                const existingDate = new Date(existing.lastOrderDate);
                const currentDate = new Date(itemCreatedAt);
                
                if (currentDate > existingDate) {
                  bundleMap.set(bundleId, {
                    ...existing,
                    lastOrderDate: itemCreatedAt,
                    orderId: order.id,
                    orderItemId: item.id
                  });
                }
              } else {
                bundleMap.set(bundleId, {
                  id: bundleId,
                  title: item.bundle_title || 'Bundle',
                  img_url: item.bundle_img || item.img_url,
                  price: item.price || 0,
                  lastOrderDate: itemCreatedAt,
                  orderId: order.id,
                  orderItemId: item.id
                });
              }
            }
          });
        });

        const uniqueBundles = Array.from(bundleMap.values())
          .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
          .slice(0, 5);

        const bundlesWithDetails = await Promise.all(
          uniqueBundles.map(async (bundle) => {
            try {
              const detailsResponse = await getBundleById(bundle.id);
              if (detailsResponse.success) {
                return {
                  ...bundle,
                  title: detailsResponse.data.title || bundle.title,
                  img_url: detailsResponse.data.img_url || bundle.img_url,
                  price: detailsResponse.data.price || bundle.price,
                  is_active: detailsResponse.data.is_active,
                  discount_percent: detailsResponse.data.discount_percent,
                  original_price: detailsResponse.data.original_price,
                  stock_limit: detailsResponse.data.stock_limit,
                  lastOrderDate: bundle.lastOrderDate,
                  orderId: bundle.orderId,
                  orderItemId: bundle.orderItemId
                };
              }
              return bundle;
            } catch (error) {
              console.error(`Failed to fetch bundle ${bundle.id}:`, error);
              return bundle;
            }
          })
        );

        setBundles(bundlesWithDetails);
        
        // Initialize bundle states
        const initialStates = {};
        bundlesWithDetails.forEach(bundle => {
          const cartItem = getCartItemByBundleId(bundle.id);
          initialStates[bundle.id] = {
            localQuantity: cartItem ? cartItem.quantity : 1,
            updating: false,
            pendingQuantity: null,
            showRemoveConfirm: false
          };
        });
        setBundleStates(initialStates);
      }
    } catch (error) {
      console.error('Error loading pending bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update bundle state
  const updateBundleState = (bundleId, updates) => {
    setBundleStates(prev => ({
      ...prev,
      [bundleId]: { ...prev[bundleId], ...updates }
    }));
  };

  // Debounced cart update effect for each bundle
  useEffect(() => {
    Object.entries(bundleStates).forEach(([bundleId, state]) => {
      if (state.pendingQuantity === null) return;

      const cartItem = getCartItemByBundleId(bundleId);
      if (!cartItem) return;

      // Clear existing timer for this bundle
      if (debounceTimersRef.current[bundleId]) {
        clearTimeout(debounceTimersRef.current[bundleId]);
      }

      // Set new timer
      debounceTimersRef.current[bundleId] = setTimeout(async () => {
        updateBundleState(bundleId, { updating: true });

        try {
          if (state.pendingQuantity === 0) {
            const result = await removeFromCart(cartItem.id);
            if (result.success) {
              refreshCart();
              updateBundleState(bundleId, { 
                localQuantity: 1, 
                showRemoveConfirm: false 
              });
            } else {
              alert(result.error || 'Failed to remove item');
              updateBundleState(bundleId, { localQuantity: cartItem.quantity });
            }
          } else {
            const bundle = bundles.find(b => b.id === bundleId);
            const stockLimit = bundle?.stock_limit;
            const result = await updateCartItem(cartItem.id, state.pendingQuantity, stockLimit);
            if (result.success) {
              refreshCart();
            } else {
              alert(result.error || 'Failed to update quantity');
              updateBundleState(bundleId, { localQuantity: cartItem.quantity });
            }
          }
        } catch (error) {
          console.error('Update error:', error);
          alert('Failed to update quantity');
          updateBundleState(bundleId, { localQuantity: cartItem.quantity });
        } finally {
          updateBundleState(bundleId, { 
            updating: false, 
            pendingQuantity: null 
          });
        }
      }, 800);
    });
  }, [bundleStates, bundles, getCartItemByBundleId, refreshCart]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowOnly - dateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleAddToCart = async (bundle) => {
    if (!bundle.is_active) {
      alert('This bundle is no longer available');
      return;
    }

    const stockLimit = bundle.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    if (isOutOfStock) {
      alert('This bundle is currently out of stock');
      return;
    }

    setAddingBundleId(bundle.id);
    
    try {
      const quantityInCart = getBundleQuantityInCart(bundle.id);
      const result = await addBundleToCart(bundle.id, 1, stockLimit, quantityInCart);
      
      if (result.success) {
        refreshCart();
        
        // Update local state to show in-cart controls
        updateBundleState(bundle.id, { localQuantity: 1 });
        
        if (onReorder) {
          onReorder(bundle.id);
        }
      } else {
        alert(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
      alert('Failed to add bundle to cart');
    } finally {
      setAddingBundleId(null);
    }
  };

  const handleIncrement = (bundle) => {
    const state = bundleStates[bundle.id] || {};
    const currentQuantity = state.localQuantity || 1;
    const newQuantity = currentQuantity + 1;

    if (bundle.stock_limit && newQuantity > bundle.stock_limit) {
      alert(`Maximum ${bundle.stock_limit} units allowed`);
      return;
    }

    updateBundleState(bundle.id, {
      localQuantity: newQuantity,
      pendingQuantity: newQuantity
    });
  };

  const handleDecrement = (bundle) => {
    const state = bundleStates[bundle.id] || {};
    const currentQuantity = state.localQuantity || 1;
    
    if (currentQuantity <= 1) return;
    
    const newQuantity = currentQuantity - 1;
    updateBundleState(bundle.id, {
      localQuantity: newQuantity,
      pendingQuantity: newQuantity
    });
  };

  const handleRemoveClick = (bundleId) => {
    updateBundleState(bundleId, { showRemoveConfirm: true });
  };

  const handleConfirmRemove = async (bundleId) => {
    const cartItem = getCartItemByBundleId(bundleId);
    if (!cartItem) return;

    updateBundleState(bundleId, { updating: true });
    
    try {
      const result = await removeFromCart(cartItem.id);
      if (result.success) {
        refreshCart();
        updateBundleState(bundleId, {
          localQuantity: 1,
          showRemoveConfirm: false
        });
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      updateBundleState(bundleId, { updating: false });
    }
  };

  const handleCancelRemove = (bundleId) => {
    updateBundleState(bundleId, { showRemoveConfirm: false });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-tppslate/10 p-4 relative">
        <h3 className="text-lg font-bold text-tppslate mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-tpppink" />
          Buy Again
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-tppslate/10 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-tppslate/10 rounded"></div>
                  <div className="h-3 w-16 bg-tppslate/10 rounded"></div>
                  <div className="h-3 w-20 bg-tppslate/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!bundles || bundles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-tppslate/10 p-4 relative">
        <h3 className="text-lg font-bold text-tppslate mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-tpppink" />
          Buy Again
        </h3>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-tppslate/20 mx-auto mb-3" />
          <p className="text-sm text-tppslate/60">
            No orders yet
          </p>
          <p className="text-xs text-tppslate/80 mt-1">
            Your ordered bundles will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-4 relative">
      <h3 className="text-lg font-bold text-tppslate mb-4 flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-tpppink" />
        Buy Again
      </h3>
      
      <div className="space-y-3">
        {bundles.map((bundle) => {
          const hasDiscount = bundle.discount_percent && bundle.discount_percent > 0;
          const isAdding = addingBundleId === bundle.id;
          const isOutOfStock = bundle.stock_limit === 0 || bundle.stock_limit === null;
          const isUnavailable = !bundle.is_active || isOutOfStock;
          const cartItem = getCartItemByBundleId(bundle.id);
          const isInCart = !!cartItem;
          
          const state = bundleStates[bundle.id] || {
            localQuantity: 1,
            updating: false,
            pendingQuantity: null,
            showRemoveConfirm: false
          };
          
          return (
            <div
              key={bundle.id}
              className="border border-tppslate/10 rounded-lg p-3 hover:border-tpppink/30 hover:shadow-sm transition-all group"
            >
              <div className="flex gap-3 mb-3">
                {/* Bundle Image */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-tppslate/10 overflow-hidden bg-gray-50 relative">
                  <img
                    src={bundle.img_url || '/placeholder.png'}
                    alt={bundle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  {hasDiscount && (
                    <div className="absolute top-1 right-1 bg-tpppink text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {bundle.discount_percent}%
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">OUT OF STOCK</span>
                    </div>
                  )}
                </div>

                {/* Bundle Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-tppslate mb-1 truncate" title={bundle.title}>
                    {bundle.title}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-tppslate">
                      {formatCurrency(bundle.price)}
                    </p>
                    {hasDiscount && bundle.original_price && (
                      <p className="text-xs text-tppslate/80 line-through">
                        {formatCurrency(bundle.original_price)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-tppslate/80">
                    Ordered: {formatDate(bundle.lastOrderDate)}
                  </p>
                </div>
              </div>

              {/* Cart Controls */}
              {!isInCart ? (
                // Add to Cart Button
                <button
                  onClick={() => handleAddToCart(bundle)}
                  disabled={isAdding || isUnavailable}
                  className={`w-full px-3 py-2 text-sm rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isUnavailable
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isAdding
                      ? 'bg-tpppink/20 text-tpppink cursor-wait'
                      : 'bg-tpppink/10 text-tpppink hover:bg-tpppink hover:text-white'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Adding...
                    </>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : !bundle.is_active ? (
                    'Unavailable'
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </>
                  )}
                </button>
              ) : (
                // In Cart Controls
                <div className="space-y-2">
                  <div className="bg-green-50 border border-green-500 rounded-lg p-2 relative">
                    {state.updating && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tppslate text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                        Syncing...
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Check size={12} className="text-green-600 stroke-[3]" />
                      <span className="text-green-600 font-bold text-[10px]">
                        In Cart ({state.localQuantity})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDecrement(bundle)}
                        disabled={state.updating || state.localQuantity <= 1}
                        className="w-7 h-7 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold text-sm"
                      >
                        <Minus size={12} />
                      </button>

                      <div className="flex-1 text-center relative bg-white rounded py-1 border border-green-600">
                        <span className="text-sm font-bold text-green-600">{state.localQuantity}</span>
                        {state.pendingQuantity !== null && (
                          <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                        )}
                      </div>

                      <button
                        onClick={() => handleIncrement(bundle)}
                        disabled={state.updating || (bundle.stock_limit && state.localQuantity >= bundle.stock_limit)}
                        className="w-7 h-7 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold text-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {!state.showRemoveConfirm ? (
                    <button
                      onClick={() => handleRemoveClick(bundle.id)}
                      disabled={state.updating}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border border-red-500 text-red-600 rounded text-[11px] font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleConfirmRemove(bundle.id)}
                        disabled={state.updating}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-2 py-1.5 rounded transition-all disabled:opacity-40"
                      >
                        {state.updating ? <Loader size={11} className="animate-spin mx-auto" /> : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleCancelRemove(bundle.id)}
                        disabled={state.updating}
                        className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-[11px] font-medium disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {bundles.length >= 5 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full mt-3 text-sm text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
        >
          View All Orders
        </button>
      )}
    </div>
  );
};

export default BuyAgainSidebar;