// frontend/src/components/user/orders/BuyAgainSidebar.jsx

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ShoppingCart, Package, Loader, Plus, Minus, Check, Trash2 } from 'lucide-react';
import { getOrders } from '../../../services/orderService';
import { getBundleById } from '../../../services/bundleService';
import { getProductById } from '../../../services/productService';
import { addBundleToCart, addProductToCart, updateCartItem, removeFromCart } from '../../../services/cartService';
import { useCart } from '../../../hooks/useCart';

/**
 * Buy Again sidebar - Shows unique bundles AND products from all orders (except cancelled)
 * ✅ UNIFIED: Handles both bundles and products with in-cart controls
 * ✅ Same debounced update logic as BundleKeyDetails and ProductCard
 */
const BuyAgainSidebar = ({ onReorder }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingItemId, setAddingItemId] = useState(null);
  
  // Track individual item states (works for both bundles and products)
  const [itemStates, setItemStates] = useState({});
  const debounceTimersRef = useRef({});

  const { 
    refreshCart, 
    getBundleQuantityInCart, 
    getProductQuantityInCart,
    getCartItemByBundleId,
    getCartItemByProductId 
  } = useCart();

  useEffect(() => {
    loadPurchasedItems();
  }, []);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const loadPurchasedItems = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders (filter out cancelled ones)
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
        const productMap = new Map();
        
        activeOrders.forEach(order => {
          const orderItems = order.order_items || order.items_preview || [];
          
          orderItems.forEach(item => {
            const itemCreatedAt = item.created_at || order.created_at;
            
            // Handle BUNDLES
            if (item.bundle_id) {
              const bundleId = item.bundle_id;
              
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
                  type: 'bundle',
                  title: item.bundle_title || 'Bundle',
                  img_url: item.bundle_img || item.img_url,
                  price: item.price || 0,
                  lastOrderDate: itemCreatedAt,
                  orderId: order.id,
                  orderItemId: item.id
                });
              }
            }
            
            // Handle PRODUCTS
            if (item.product_id) {
              const productId = item.product_id;
              
              if (productMap.has(productId)) {
                const existing = productMap.get(productId);
                const existingDate = new Date(existing.lastOrderDate);
                const currentDate = new Date(itemCreatedAt);
                
                if (currentDate > existingDate) {
                  productMap.set(productId, {
                    ...existing,
                    lastOrderDate: itemCreatedAt,
                    orderId: order.id,
                    orderItemId: item.id
                  });
                }
              } else {
                productMap.set(productId, {
                  id: productId,
                  type: 'product',
                  title: item.product_title || item.title || 'Product',
                  img_url: item.product_img || item.img_url,
                  price: item.price || 0,
                  lastOrderDate: itemCreatedAt,
                  orderId: order.id,
                  orderItemId: item.id
                });
              }
            }
          });
        });

        // Combine bundles and products, sort by most recent, take top 5
        const allItems = [
          ...Array.from(bundleMap.values()),
          ...Array.from(productMap.values())
        ]
          .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
          .slice(0, 5);

        // Fetch full details for each item
        const itemsWithDetails = await Promise.all(
          allItems.map(async (item) => {
            try {
              if (item.type === 'bundle') {
                const detailsResponse = await getBundleById(item.id);
                if (detailsResponse.success) {
                  return {
                    ...item,
                    title: detailsResponse.data.title || item.title,
                    img_url: detailsResponse.data.img_url || item.img_url,
                    price: detailsResponse.data.price || item.price,
                    is_active: detailsResponse.data.is_active,
                    discount_percent: detailsResponse.data.discount_percent,
                    original_price: detailsResponse.data.original_price,
                    stock_limit: detailsResponse.data.stock_limit
                  };
                }
              } else if (item.type === 'product') {
                const detailsResponse = await getProductById(item.id);
                if (detailsResponse.success) {
                  return {
                    ...item,
                    title: detailsResponse.data.title || item.title,
                    img_url: detailsResponse.data.img_url || item.img_url,
                    price: detailsResponse.data.price || item.price,
                    is_active: true, // Products don't have is_active in your schema
                    stock_limit: detailsResponse.data.stock
                  };
                }
              }
              return item;
            } catch (error) {
              console.error(`Failed to fetch ${item.type} ${item.id}:`, error);
              return item;
            }
          })
        );

        setItems(itemsWithDetails);
        
        // Initialize item states
        const initialStates = {};
        itemsWithDetails.forEach(item => {
          const cartItem = item.type === 'bundle' 
            ? getCartItemByBundleId(item.id)
            : getCartItemByProductId(item.id);
            
          initialStates[item.id] = {
            localQuantity: cartItem ? cartItem.quantity : 1,
            updating: false,
            pendingQuantity: null,
            showRemoveConfirm: false
          };
        });
        setItemStates(initialStates);
      }
    } catch (error) {
      console.error('Error loading purchased items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update item state
  const updateItemState = (itemId, updates) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...updates }
    }));
  };

  // Get cart item helper
  const getCartItem = (item) => {
    return item.type === 'bundle'
      ? getCartItemByBundleId(item.id)
      : getCartItemByProductId(item.id);
  };

  // Debounced cart update effect for each item
  useEffect(() => {
    Object.entries(itemStates).forEach(([itemId, state]) => {
      if (state.pendingQuantity === null) return;

      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const cartItem = getCartItem(item);
      if (!cartItem) return;

      // Clear existing timer for this item
      if (debounceTimersRef.current[itemId]) {
        clearTimeout(debounceTimersRef.current[itemId]);
      }

      // Set new timer
      debounceTimersRef.current[itemId] = setTimeout(async () => {
        updateItemState(itemId, { updating: true });

        try {
          if (state.pendingQuantity === 0) {
            const result = await removeFromCart(cartItem.id);
            if (result.success) {
              refreshCart();
              updateItemState(itemId, { 
                localQuantity: 1, 
                showRemoveConfirm: false 
              });
            } else {
              alert(result.error || 'Failed to remove item');
              updateItemState(itemId, { localQuantity: cartItem.quantity });
            }
          } else {
            const stockLimit = item.stock_limit;
            const result = await updateCartItem(cartItem.id, state.pendingQuantity, stockLimit);
            if (result.success) {
              refreshCart();
            } else {
              alert(result.error || 'Failed to update quantity');
              updateItemState(itemId, { localQuantity: cartItem.quantity });
            }
          }
        } catch (error) {
          console.error('Update error:', error);
          alert('Failed to update quantity');
          updateItemState(itemId, { localQuantity: cartItem.quantity });
        } finally {
          updateItemState(itemId, { 
            updating: false, 
            pendingQuantity: null 
          });
        }
      }, 800);
    });
  }, [itemStates, items, refreshCart]);

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

  const handleAddToCart = async (item) => {
    // Check availability
    if (item.type === 'bundle' && !item.is_active) {
      alert('This bundle is no longer available');
      return;
    }

    const stockLimit = item.stock_limit;
    const isOutOfStock = stockLimit === 0 || stockLimit === null;
    
    if (isOutOfStock) {
      alert(`This ${item.type} is currently out of stock`);
      return;
    }

    setAddingItemId(item.id);
    
    try {
      let result;
      
      if (item.type === 'bundle') {
        const quantityInCart = getBundleQuantityInCart(item.id);
        result = await addBundleToCart(item.id, 1, stockLimit, quantityInCart);
      } else {
        result = await addProductToCart(item.id, 1);
      }
      
      if (result.success) {
        refreshCart();
        updateItemState(item.id, { localQuantity: 1 });
        
        if (onReorder) {
          onReorder(item.id, item.type);
        }
      } else {
        alert(result.error || `Failed to add ${item.type} to cart`);
      }
    } catch (error) {
      console.error(`Error adding ${item.type} to cart:`, error);
      alert(`Failed to add ${item.type} to cart`);
    } finally {
      setAddingItemId(null);
    }
  };

  const handleIncrement = (item) => {
    const state = itemStates[item.id] || {};
    const currentQuantity = state.localQuantity || 1;
    const newQuantity = currentQuantity + 1;

    if (item.stock_limit && newQuantity > item.stock_limit) {
      alert(`Maximum ${item.stock_limit} units allowed`);
      return;
    }

    updateItemState(item.id, {
      localQuantity: newQuantity,
      pendingQuantity: newQuantity
    });
  };

  const handleDecrement = (item) => {
    const state = itemStates[item.id] || {};
    const currentQuantity = state.localQuantity || 1;
    
    if (currentQuantity <= 1) return;
    
    const newQuantity = currentQuantity - 1;
    updateItemState(item.id, {
      localQuantity: newQuantity,
      pendingQuantity: newQuantity
    });
  };

  const handleRemoveClick = (itemId) => {
    updateItemState(itemId, { showRemoveConfirm: true });
  };

  const handleConfirmRemove = async (item) => {
    const cartItem = getCartItem(item);
    if (!cartItem) return;

    updateItemState(item.id, { updating: true });
    
    try {
      const result = await removeFromCart(cartItem.id);
      if (result.success) {
        refreshCart();
        updateItemState(item.id, {
          localQuantity: 1,
          showRemoveConfirm: false
        });
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      alert('Failed to remove item');
    } finally {
      updateItemState(item.id, { updating: false });
    }
  };

  const handleCancelRemove = (itemId) => {
    updateItemState(itemId, { showRemoveConfirm: false });
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

  if (!items || items.length === 0) {
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
            Your ordered items will appear here
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
        {items.map((item) => {
          const hasDiscount = item.discount_percent && item.discount_percent > 0;
          const isAdding = addingItemId === item.id;
          const isOutOfStock = item.stock_limit === 0 || item.stock_limit === null;
          const isUnavailable = (item.type === 'bundle' && !item.is_active) || isOutOfStock;
          const cartItem = getCartItem(item);
          const isInCart = !!cartItem;
          
          const state = itemStates[item.id] || {
            localQuantity: 1,
            updating: false,
            pendingQuantity: null,
            showRemoveConfirm: false
          };
          
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="border border-tppslate/10 rounded-lg p-3 hover:border-tpppink/30 hover:shadow-sm transition-all group"
            >
              <div className="flex gap-3 mb-3">
                {/* Item Image */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-tppslate/10 overflow-hidden bg-gray-50 relative">
                  <img
                    src={item.img_url || '/placeholder.png'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  {hasDiscount && (
                    <div className="absolute top-1 right-1 bg-tpppink text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {item.discount_percent}%
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">OUT OF STOCK</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-tppslate mb-1 truncate" title={item.title}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-tppslate">
                      {formatCurrency(item.price)}
                    </p>
                    {hasDiscount && item.original_price && (
                      <p className="text-xs text-tppslate/80 line-through">
                        {formatCurrency(item.original_price)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-tppslate/80">
                    Ordered: {formatDate(item.lastOrderDate)}
                  </p>
                </div>
              </div>

              {/* Cart Controls */}
              {!isInCart ? (
                // Add to Cart Button
                <button
                  onClick={() => handleAddToCart(item)}
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
                  ) : isUnavailable ? (
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
                        onClick={() => handleDecrement(item)}
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
                        onClick={() => handleIncrement(item)}
                        disabled={state.updating || (item.stock_limit && state.localQuantity >= item.stock_limit)}
                        className="w-7 h-7 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold text-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {!state.showRemoveConfirm ? (
                    <button
                      onClick={() => handleRemoveClick(item.id)}
                      disabled={state.updating}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border border-red-500 text-red-600 rounded text-[11px] font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleConfirmRemove(item)}
                        disabled={state.updating}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-2 py-1.5 rounded transition-all disabled:opacity-40"
                      >
                        {state.updating ? <Loader size={11} className="animate-spin mx-auto" /> : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleCancelRemove(item.id)}
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
      {items.length >= 5 && (
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