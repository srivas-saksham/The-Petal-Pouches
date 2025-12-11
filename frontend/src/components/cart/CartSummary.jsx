// frontend/src/components/cart/CartSummary.jsx
import React from 'react';
import { Package, Truck, Loader } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const CartSummary = ({ totals }) => {
  const { refreshingTotals } = useCart(); // ✅ Get refreshing state

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="p-4 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Package size={16} />
            <span>Subtotal</span>
          </div>
          {refreshingTotals ? (
            <Loader size={16} className="animate-spin text-tpppink" />
          ) : (
            <span className="font-semibold text-slate-900">
              {formatPrice(totals?.subtotal || 0)}
            </span>
          )}
        </div>

        {/* Shipping - Always Free */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Truck size={16}/>
            <span>Delivery</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 line-through text-xs">
                ₹99
              </span>
              <span className="font-bold text-tpppink">
                FREE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              for limited time
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">Total</span>
            {refreshingTotals ? (
              <Loader size={18} className="animate-spin text-tpppink" />
            ) : (
              <span className="text-lg font-bold text-tpppink">
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