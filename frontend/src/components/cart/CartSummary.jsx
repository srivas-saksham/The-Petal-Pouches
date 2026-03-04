// frontend/src/components/cart/CartSummary.jsx
import React from 'react';
import { Package, Truck, Loader } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const CartSummary = ({ totals }) => {
  const { refreshingTotals } = useCart();
  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdark">
      <div className="p-4 space-y-3">

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-tppdarkwhite/60">
            <Package size={16} />
            <span>Subtotal</span>
          </div>
          {refreshingTotals ? (
            <Loader size={16} className="animate-spin text-tpppink dark:text-tppdarkwhite" />
          ) : (
            <span className="font-semibold text-slate-900 dark:text-tppdarkwhite">
              {formatPrice(totals?.subtotal || 0)}
            </span>
          )}
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-tppdarkwhite/60">
            <Truck size={16} />
            <span>Delivery</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-tppdarkwhite/30 line-through text-xs">₹99</span>
              <span className="font-bold text-tpppink dark:text-tppdarkwhite">FREE</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-tppdarkwhite/30 font-medium leading-tight">
              for limited time
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-2 border-t border-slate-200 dark:border-tppdarkwhite/10">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900 dark:text-tppdarkwhite">Total</span>
            {refreshingTotals ? (
              <Loader size={18} className="animate-spin text-tpppink dark:text-tppdarkwhite" />
            ) : (
              <span className="text-lg font-bold text-tpppink dark:text-tppdarkwhite">
                {formatPrice(totals?.total || 0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;