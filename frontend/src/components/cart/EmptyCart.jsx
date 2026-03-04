// frontend/src/components/cart/EmptyCart.jsx
import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartSidebar } from '../../hooks/useCartSidebar';

const EmptyCart = () => {
  const navigate = useNavigate();
  const { closeCart } = useCartSidebar();

  const handleShopNow = () => {
    closeCart();
    navigate('/shop');
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 bg-slate-100 dark:bg-tppdark rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={48} className="text-slate-300 dark:text-tppdarkwhite/20" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-tppdarkwhite mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm text-slate-600 dark:text-tppdarkwhite/50 mb-6 max-w-xs">
        Looks like you haven't added any bundles yet. Start shopping to fill your cart!
      </p>

      <button
        onClick={handleShopNow}
        className="flex items-center gap-2 px-6 py-3 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark rounded-lg font-semibold transition-all shadow-md hover:shadow-lg group"
      >
        <span>Start Shopping</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default EmptyCart;