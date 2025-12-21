// frontend/src/components/order-success/SuccessHeader.jsx

import { CheckCircle, Sparkles } from 'lucide-react';

/**
 * Success Header Component
 * Shows celebration message with order ID and status
 */
const SuccessHeader = ({ orderId, status = 'confirmed', orderDate }) => {
  const formatOrderId = (id) => {
    return id?.substring(0, 8).toUpperCase() || 'N/A';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-green-500 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-tpppink/5 opacity-60"></div>
      
      {/* Animated Sparkles */}
      <div className="absolute top-4 right-4 animate-pulse">
        <Sparkles className="w-6 h-6 text-green-500" />
      </div>
      <div className="absolute bottom-4 left-4 animate-pulse delay-300">
        <Sparkles className="w-4 h-4 text-tpppink" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Success Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce">
            <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-tppslate mb-1">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-sm text-slate-600">
              Thank you for your order. We've sent a confirmation email.
            </p>
          </div>
        </div>

        {/* Order Details Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
          {/* Order ID */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Order ID</p>
              <p className="text-sm font-mono font-bold text-tppslate">
                #{formatOrderId(orderId)}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          {/* Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide">Status</p>
              <p className="text-sm font-bold text-green-600 capitalize">{status}</p>
            </div>
          </div>

          {/* Order Date */}
          {orderDate && (
            <>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="px-4 py-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Placed On</p>
                <p className="text-xs text-slate-700 font-semibold">{formatDate(orderDate)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessHeader;