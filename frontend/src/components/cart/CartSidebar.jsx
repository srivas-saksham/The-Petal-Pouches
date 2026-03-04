// frontend/src/components/cart/CartSidebar.jsx
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

const CartSidebar = () => {
  const { isOpen, closeCart } = useCartSidebar();
  const { cartItems, cartTotals, loading, refreshCart } = useCart();
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refreshCart();
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, refreshCart]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= 800) setSidebarWidth(newWidth);
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

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleClearCartClick = () => setShowClearConfirm(true);

  const handleConfirmClearCart = async () => {
    setClearing(true);
    try {
      const removePromises = cartItems.map(item => removeFromCart(item.id));
      const results = await Promise.all(removePromises);
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

  const handleCancelClearCart = () => setShowClearConfirm(false);

  const handleCheckout = () => {
    closeCart();
    if (isAuthenticated) navigate('/checkout');
    else navigate('/login', { state: { from: '/checkout' } });
  };

  const handleContinueShopping = () => closeCart();

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 will-change-opacity transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white dark:bg-tppdarkgray shadow-2xl z-50 flex flex-col will-change-transform
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
        style={{ width: window.innerWidth < 640 ? '100%' : `${sidebarWidth}px` }}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Resize Handle */}
        {window.innerWidth >= 640 && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute left-0 top-0 h-full w-1 cursor-ew-resize group transition-colors ${
              isResizing ? 'bg-tpppink dark:bg-tppdarkwhite' : 'hover:bg-tpppink/30 dark:hover:bg-tppdarkwhite/20'
            }`}
            style={{ zIndex: 60 }}
          >
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 
              bg-white dark:bg-tppdarkgray rounded-full p-1 shadow-md border transition-all duration-200 ${
              isResizing
                ? 'text-tpppink dark:text-tppdarkwhite scale-110 border-tpppink dark:border-tppdarkwhite'
                : 'text-slate-400 dark:text-tppdarkwhite/40 border-slate-200 dark:border-tppdarkwhite/10 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite group-hover:scale-105 group-hover:border-tpppink dark:group-hover:border-tppdarkwhite'
            }`}>
              <GripVertical size={16} />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tpppink to-tpppeach dark:from-tppdarkwhite/20 dark:to-tppdarkwhite/10 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingBag size={20} className="text-white dark:text-tppdarkwhite" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-tppdarkwhite">Shopping Cart</h2>
              {!loading && cartItems.length > 0 && (
                <p className="text-xs text-slate-600 dark:text-tppdarkwhite/50">
                  {cartTotals?.item_count || 0} {cartTotals?.item_count === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Cart */}
            {!loading && cartItems.length > 0 && (
              <div>
                {!showClearConfirm ? (
                  <button
                    onClick={handleClearCartClick}
                    disabled={clearing}
                    className="text-xs font-medium text-slate-500 dark:text-tppdarkwhite/40 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1"
                    aria-label="Clear cart"
                  >
                    Clear Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmClearCart}
                      disabled={clearing}
                      className="bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      aria-label="Confirm clear cart"
                    >
                      {clearing ? <Loader size={14} className="animate-spin" /> : 'Confirm'}
                    </button>
                    <button
                      onClick={handleCancelClearCart}
                      disabled={clearing}
                      className="text-slate-500 dark:text-tppdarkwhite/50 hover:text-slate-700 dark:hover:text-tppdarkwhite text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Cancel clear cart"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Close */}
            <button
              onClick={closeCart}
              className="p-2 hover:bg-slate-100 dark:hover:bg-tppdarkwhite/10 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X size={20} className="text-slate-600 dark:text-tppdarkwhite/70" />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 border-b border-slate-100 dark:border-tppdarkwhite/10 animate-pulse">
                  <div className="flex-shrink-0 w-20 h-20 bg-slate-200 dark:bg-tppdark rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-tppdark rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-tppdark rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-200 dark:bg-tppdark rounded w-24" />
                      <div className="h-8 bg-slate-200 dark:bg-tppdark rounded w-8" />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-4 bg-slate-200 dark:bg-tppdark rounded w-16" />
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdark p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 dark:bg-tppdarkgray rounded w-20 animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-tppdarkgray rounded w-16 animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 dark:bg-tppdarkgray rounded w-24 animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-tppdarkgray rounded w-12 animate-pulse" />
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-tppdarkwhite/10 flex justify-between items-center">
                  <div className="h-5 bg-slate-200 dark:bg-tppdarkgray rounded w-16 animate-pulse" />
                  <div className="h-6 bg-slate-200 dark:bg-tppdarkgray rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && cartItems.length > 0 && (
          <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0">
            <CartSummary totals={cartTotals} />

            <div className="p-4 space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full py-3 border-2 border-slate-200 dark:border-tppdarkwhite/10 hover:border-slate-300 dark:hover:border-tppdarkwhite/20 text-slate-700 dark:text-tppdarkwhite/70 rounded-lg font-medium transition-all hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5"
              >
                Continue Shopping
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-tppdarkwhite/30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isResizing && <div className="fixed inset-0 z-[60] cursor-ew-resize" />}
    </>
  );
};

export default CartSidebar;