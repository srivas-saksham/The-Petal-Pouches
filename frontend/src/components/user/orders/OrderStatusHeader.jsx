// frontend/src/components/user/orders/OrderStatusHeader.jsx

import { Clock, CheckCircle, Package, Truck, XCircle, ArrowLeft, Calendar } from 'lucide-react';

const OrderStatusHeader = ({ order }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', icon: Clock, label: 'Pending' },
      confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: CheckCircle, label: 'Confirmed' },
      processing: { bg: 'bg-tpppink/10 dark:bg-tppdarkwhite/5', border: 'border-tpppink/20 dark:border-tppdarkwhite/10', text: 'text-tpppink dark:text-tppdarkwhite', dot: 'bg-tpppink dark:bg-tppdarkwhite', icon: Package, label: 'Processing' },
      shipped: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: Truck, label: 'Shipped' },
      in_transit: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', icon: Truck, label: 'In Transit' },
      out_for_delivery: { bg: 'bg-tpppink/10 dark:bg-tppdarkwhite/5', border: 'border-tpppink/20 dark:border-tppdarkwhite/10', text: 'text-tpppink dark:text-tppdarkwhite', dot: 'bg-tpppink dark:bg-tppdarkwhite', icon: Truck, label: 'Out for Delivery' },
      delivered: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-500/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', icon: CheckCircle, label: 'Delivered' },
      cancelled: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', icon: XCircle, label: 'Cancelled' },
      failed: { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: XCircle, label: 'Failed' },
      rto_initiated: { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', icon: ArrowLeft, label: 'RTO Initiated' },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

  const orderId8 = order.id?.substring(0, 8).toUpperCase();
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-xl shadow-sm overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 ${statusConfig.bg} border ${statusConfig.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite">#{orderId8}</h2>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 ${statusConfig.bg} border ${statusConfig.border} rounded-md`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                  <span className={`text-xs font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                </div>
              </div>
              <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/50 flex items-center gap-1">
                <Calendar className="w-3 h-3" />{formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/40 uppercase tracking-wide font-medium mb-0.5">Payment</p>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  order.payment_status === 'paid' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                  order.payment_status === 'refunded' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                  'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'refunded' ? 'Refunded' : 'Pending'}
                </span>
                <span className="text-xs text-tppslate/50 dark:text-tppdarkwhite/30">{order.payment_method?.toUpperCase()}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-tppslate/20 dark:bg-tppdarkwhite/10"></div>
            <div className="text-right">
              <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/40 uppercase tracking-wide font-medium mb-0.5">Total</p>
              <p className="text-xl font-bold text-tppslate dark:text-tppdarkwhite">{formatCurrency(order.final_total)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusHeader;