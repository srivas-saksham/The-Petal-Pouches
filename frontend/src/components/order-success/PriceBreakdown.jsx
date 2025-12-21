// frontend/src/components/order-success/PriceBreakdown.jsx

import { DollarSign, Plane, Tag } from 'lucide-react';

const PriceBreakdown = ({ subtotal = 0, expressCharge = 0, discount = 0, finalTotal = 0 }) => {
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-tppslate px-4 py-3 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-white" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Price Details</h3>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-tppslate">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Shipping (Standard)</span>
          <span className="font-semibold text-green-600">FREE</span>
        </div>

        {expressCharge > 0 && (
          <div className="flex justify-between text-sm text-amber-700 bg-amber-50 -mx-4 px-4 py-2">
            <div className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5" />
              <span>Express Delivery</span>
            </div>
            <span className="font-semibold">+{formatCurrency(expressCharge)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-700 bg-green-50 -mx-4 px-4 py-2">
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Discount</span>
            </div>
            <span className="font-semibold">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
          <span className="text-base font-bold text-tppslate">Total Amount</span>
          <span className="text-2xl font-bold text-tpppink">{formatCurrency(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;