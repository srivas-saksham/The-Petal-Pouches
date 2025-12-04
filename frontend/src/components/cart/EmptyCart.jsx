// ============================================
// FILE 2: frontend/src/components/cart/EmptyCart.jsx
// EMPTY CART STATE
// ============================================

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartSidebar } from '../../hooks/useCartSidebar';

/**
 * EmptyCart Component
 * Shows when cart has no items
 */
const EmptyCart = () => {
  const navigate = useNavigate();
  const { closeCart } = useCartSidebar();

  const handleShopNow = () => {
    closeCart();
    navigate('/shop');
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Empty Cart Icon */}
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={48} className="text-slate-300" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-xs">
        Looks like you haven't added any bundles yet. Start shopping to fill your cart!
      </p>

      {/* Shop Now Button */}
      <button
        onClick={handleShopNow}
        className="flex items-center gap-2 px-6 py-3 bg-tpppink hover:bg-tpppink/90 
          text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg
          group"
      >
        <span>Start Shopping</span>
        <ArrowRight 
          size={18} 
          className="group-hover:translate-x-1 transition-transform" 
        />
      </button>
    </div>
  );
};

export default EmptyCart;