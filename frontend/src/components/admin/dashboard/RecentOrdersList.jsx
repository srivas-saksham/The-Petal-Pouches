// frontend/src/components/admin/dashboard/RecentOrdersList.jsx

import { ArrowRight, Package } from 'lucide-react';
import { formatCurrency, getRelativeTime } from '../../../utils/adminHelpers';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Processing' },
    in_transit: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Transit' },
    out_for_delivery: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Out for Delivery' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      ${config.bg} ${config.text}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
};

export default function RecentOrdersList({ orders = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-tppslate/30 mx-auto mb-3" />
        <p className="text-sm text-tppslate/60">No recent orders</p>
      </div>
    );
  }

  const handleOrderClick = (orderId) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => handleOrderClick(order.id)}
          className="
            flex items-center justify-between p-3 
            bg-white rounded-md border-2 border-tppslate/10
            transition-all duration-200
            hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm
            cursor-pointer group
          "
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-tppslate text-xs truncate">
                #{order.id.substring(0, 8).toUpperCase()}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-xs text-tppslate/70">
              {order.customer_name || order.shipping_address?.line1 || 'Guest'}
            </div>
            <div className="text-[10px] text-tppslate/50 mt-0.5">
              {getRelativeTime(order.created_at)}
            </div>
          </div>
          
          <div className="text-right flex items-center gap-2">
            <div>
              <div className="font-bold text-tppslate text-sm">
                {formatCurrency(order.final_total)}
              </div>
              <div className="text-[10px] text-tppslate/60">
                {order.item_count || order.items?.length || 0} item(s)
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-tppslate/30 group-hover:text-tpppink transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}