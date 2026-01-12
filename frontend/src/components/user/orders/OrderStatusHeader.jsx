// frontend/src/components/user/orders/OrderStatusHeader.jsx

import { Clock, CheckCircle, Package, Truck, XCircle, ArrowLeft, Calendar } from 'lucide-react';

/**
 * Order Status Header Component - Compact & Professional
 * Shows order ID, status, and payment information
 */
const OrderStatusHeader = ({ order }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      processing: {
        bg: 'bg-tpppink/10',
        border: 'border-tpppink/20',
        text: 'text-tpppink',
        dot: 'bg-tpppink',
        icon: Package,
        label: 'Processing'
      },
      shipped: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
        icon: Truck,
        label: 'Shipped'
      },
      in_transit: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
        icon: Truck,
        label: 'In Transit'
      },
      out_for_delivery: {
        bg: 'bg-tpppink/10',
        border: 'border-tpppink/20',
        text: 'text-tpppink',
        dot: 'bg-tpppink',
        icon: Truck,
        label: 'Out for Delivery'
      },
      delivered: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        dot: 'bg-green-500',
        icon: CheckCircle,
        label: 'Delivered'
      },
      cancelled: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        dot: 'bg-red-500',
        icon: XCircle,
        label: 'Cancelled'
      },
      failed: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        icon: XCircle,
        label: 'Failed'
      },
      rto_initiated: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        icon: ArrowLeft,
        label: 'RTO Initiated'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  const orderId8 = order.id?.substring(0, 8).toUpperCase();
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-xl shadow-sm overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Order Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 ${statusConfig.bg} border ${statusConfig.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-tppslate">
                  #{orderId8}
                </h2>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 ${statusConfig.bg} border ${statusConfig.border} rounded-md`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                  <span className={`text-xs font-semibold ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <p className="text-xs text-tppslate/60 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Right: Payment & Amount */}
          <div className="flex items-center gap-3">
            {/* Payment Status */}
            <div className="text-right">
              <p className="text-xs text-tppslate/60 uppercase tracking-wide font-medium mb-0.5">
                Payment
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  order.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700'
                    : order.payment_status === 'refunded'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : 
                   order.payment_status === 'refunded' ? 'Refunded' : 'Pending'}
                </span>
                <span className="text-xs text-tppslate/50">
                  {order.payment_method?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-tppslate/20"></div>

            {/* Total Amount */}
            <div className="text-right">
              <p className="text-xs text-tppslate/60 uppercase tracking-wide font-medium mb-0.5">
                Total
              </p>
              <p className="text-xl font-bold text-tppslate">
                {formatCurrency(order.final_total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusHeader;