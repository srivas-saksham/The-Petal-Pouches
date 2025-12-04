// frontend/src/components/cart/CartSidebar.jsx
// FIXED SLIDE ANIMATION + PROPER LOADING STATE + CLEAR CART + FIXED GRIP

import React, { useEffect, useState, useRef } from 'react';
import { X, ShoppingBag, Loader, ArrowRight, GripVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useCartSidebar } from '../../hooks/useCartSidebar';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { removeFromCart } from '../../services/cartService';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';

/**
 * CartSidebar Component
 * Professional sliding cart sidebar with resizable width
 * 
 * Features:
 * - ✅ Smooth slide-in animation from right
 * - ✅ Resizable width by dragging left edge
 * - ✅ Clear entire cart option
 * - ✅ Loading skeleton effect
 * - ✅ Shows all cart items with controls
 * - ✅ Price breakdown summary (no GST)
 * - ✅ Checkout button
 * - ✅ Responsive design
 */
const CartSidebar = () => {
  const { isOpen, closeCart } = useCartSidebar();
  const { cartItems, cartTotals, loading, refreshCart } = useCart();
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Resizable width state
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Clear cart state
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Animation state - separate from isOpen for proper slide animation
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle render and animation state
  useEffect(() => {
    if (isOpen) {
      // Refresh cart BEFORE showing sidebar
      refreshCart();
      
      // Start rendering
      setShouldRender(true);
      
      // Trigger animation immediately after DOM paint
      // Using double RAF for smoother animation start
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      // Start closing animation
      setIsAnimating(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, refreshCart]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      
      const newWidth = window.innerWidth - e.clientX;
      
      // Constrain width between 320px and 800px
      if (newWidth >= 320 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Start resizing
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle clear cart click
  const handleClearCartClick = () => {
    setShowClearConfirm(true);
  };

  // Handle confirmed clear cart
  const handleConfirmClearCart = async () => {
    setClearing(true);
    try {
      // Remove all items one by one
      const removePromises = cartItems.map(item => removeFromCart(item.id));
      const results = await Promise.all(removePromises);
      
      // Check if all removals were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        await refreshCart();
        toast.success('Cart cleared successfully');
      } else {
        toast.error('Some items could not be removed');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  // Handle cancel clear cart
  const handleCancelClearCart = () => {
    setShowClearConfirm(false);
  };

  // Handle checkout
  const handleCheckout = () => {
    closeCart();
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    closeCart();
  };

  // Don't render if not should render
  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop with fade-in */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 will-change-opacity
          transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar with slide-in animation */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50
          flex flex-col will-change-transform
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
        style={{ width: window.innerWidth < 640 ? '100%' : `${sidebarWidth}px` }}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Resize Handle - Left Edge */}
        {window.innerWidth >= 640 && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute left-0 top-0 h-full w-1 cursor-ew-resize group transition-colors ${
              isResizing ? 'bg-tpppink' : 'hover:bg-tpppink/30'
            }`}
            style={{ zIndex: 60 }}
          >
            {/* Grip Icon - Centered on the edge */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 
              bg-white rounded-full p-1 shadow-md border border-slate-200
              transition-all duration-200 ${
              isResizing ? 'text-tpppink scale-110 border-tpppink' : 'text-slate-400 group-hover:text-tpppink group-hover:scale-105 group-hover:border-tpppink'
            }`}>
              <GripVertical size={16} />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tpppink to-tpppeach rounded-lg
              flex items-center justify-center shadow-md">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shopping Cart</h2>
              {!loading && cartItems.length > 0 && (
                <p className="text-xs text-slate-600">
                  {cartTotals?.item_count || 0} {cartTotals?.item_count === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Cart Button */}
            {!loading && cartItems.length > 0 && (
              <div>
                {!showClearConfirm ? (
                  <button
                    onClick={handleClearCartClick}
                    disabled={clearing}
                    className="text-xs font-medium text-slate-500 hover:text-red-600 
                      transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                    aria-label="Clear cart"
                  >
                    Clear Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmClearCart}
                      disabled={clearing}
                      className="bg-tpppink hover:bg-tpppink/90 text-white text-xs font-semibold 
                        px-3 py-1.5 rounded transition-colors disabled:opacity-40 
                        disabled:cursor-not-allowed whitespace-nowrap"
                      aria-label="Confirm clear cart"
                    >
                      {clearing ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                    <button
                      onClick={handleCancelClearCart}
                      disabled={clearing}
                      className="text-slate-500 hover:text-slate-700 text-xs font-medium
                        disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Cancel clear cart"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={closeCart}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // ✅ Loading Skeleton - Only shows when actually loading
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 border-b border-slate-100 animate-pulse">
                  {/* Image skeleton */}
                  <div className="flex-shrink-0 w-20 h-20 bg-slate-200 rounded-lg" />
                  
                  {/* Content skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-200 rounded w-24" />
                      <div className="h-8 bg-slate-200 rounded w-8" />
                    </div>
                  </div>
                  
                  {/* Price skeleton */}
                  <div className="flex-shrink-0">
                    <div className="h-4 bg-slate-200 rounded w-16" />
                  </div>
                </div>
              ))}

              {/* Summary Skeleton */}
              <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div className="h-5 bg-slate-200 rounded w-16 animate-pulse" />
                  <div className="h-6 bg-slate-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            // Empty State
            <EmptyCart />
          ) : (
            // Cart Items
            <div>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {!loading && cartItems.length > 0 && (
          <div className="border-t border-slate-200 bg-white flex-shrink-0">
            {/* Price Summary */}
            <CartSummary totals={cartTotals} />

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-tpppink hover:bg-tpppink/90 text-white rounded-lg
                  font-semibold transition-all shadow-md hover:shadow-lg
                  flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight 
                  size={18} 
                  className="group-hover:translate-x-1 transition-transform" 
                />
              </button>

              {/* Continue Shopping */}
              <button
                onClick={handleContinueShopping}
                className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 
                  text-slate-700 rounded-lg font-medium transition-all hover:bg-slate-50"
              >
                Continue Shopping
              </button>
            </div>

            {/* Security Badge */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize cursor overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-[60] cursor-ew-resize" />
      )}
    </>
  );
};

export default CartSidebar;