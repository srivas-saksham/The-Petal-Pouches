// frontend/src/components/order-success/PaymentDetailsCard.jsx

import { CreditCard, Wallet, Banknote } from 'lucide-react';

const PaymentDetailsCard = ({ paymentMethod = 'cod', paymentStatus = 'unpaid', finalTotal = 0 }) => {
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getPaymentIcon = () => {
    switch (paymentMethod?.toLowerCase()) {
      case 'upi':
      case 'razorpay':
        return Wallet;
      case 'card':
        return CreditCard;
      default:
        return Banknote;
    }
  };

  const getStatusBadge = () => {
    const badges = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'PAID' },
      unpaid: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'PENDING' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'REFUNDED' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'FAILED' }
    };
    return badges[paymentStatus] || badges.unpaid;
  };

  const PaymentIcon = getPaymentIcon();
  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-tppslate px-4 py-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-white" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Payment</h3>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Method</span>
          <div className="flex items-center gap-1.5">
            <PaymentIcon className="w-3.5 h-3.5 text-tpppink" />
            <span className="font-semibold text-tppslate uppercase">{paymentMethod}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Status</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>

        {paymentMethod === 'cod' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-semibold mb-1">Cash on Delivery</p>
            <p className="text-xl font-bold text-amber-900">{formatCurrency(finalTotal)}</p>
            <p className="text-xs text-amber-700 mt-1">Pay when you receive</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailsCard;