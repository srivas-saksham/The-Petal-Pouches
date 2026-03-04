// frontend/src/components/user/dashboard/RecentOrders.jsx

import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';

const getStatusConfig = (status) => {
  const configs = {
    pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending', icon: Clock },
    confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-700 dark:text-blue-400', label: 'Confirmed', icon: CheckCircle },
    processing: { bg: 'bg-tpppink/10 dark:bg-tppdarkwhite/10', text: 'text-tpppink dark:text-tppdarkwhite', label: 'Processing', icon: Package },
    picked_up: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-700 dark:text-indigo-400', label: 'Picked Up', icon: Truck },
    in_transit: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-700 dark:text-indigo-400', label: 'In Transit', icon: Truck },
    out_for_delivery: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-700 dark:text-purple-400', label: 'Out for Delivery', icon: Truck },
    shipped: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-700 dark:text-indigo-400', label: 'Shipped', icon: Truck },
    delivered: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-400', label: 'Delivered', icon: CheckCircle },
    cancelled: { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600 dark:text-red-400', label: 'Cancelled', icon: XCircle },
    failed: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', label: 'Delivery Failed', icon: XCircle },
    rto_initiated: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', label: 'Return Initiated', icon: XCircle },
    rto_delivered: { bg: 'bg-gray-50 dark:bg-tppdark', text: 'text-gray-700 dark:text-tppdarkwhite/70', label: 'Returned', icon: Package },
  };
  return configs[status] || { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-400', label: status || 'Pending', icon: Clock };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch { return 'N/A'; }
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
};

const parseShippingAddress = (shipping_address) => {
  if (!shipping_address) return null;
  if (typeof shipping_address === 'object') return shipping_address;
  if (typeof shipping_address === 'string') {
    try { return JSON.parse(shipping_address); } catch { return null; }
  }
  return null;
};

const getEstimatedDelivery = (order) => {
  if (order.shipment?.estimated_delivery) return formatDate(order.shipment.estimated_delivery);
  if (order.delivery_metadata?.expected_delivery_date) return formatDate(order.delivery_metadata.expected_delivery_date);
  if (order.delivery_metadata?.estimated_days) {
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + order.delivery_metadata.estimated_days);
    return formatDate(estimatedDate);
  }
  return 'Within 7 days';
};

const RecentOrders = ({ orders = [], loading = false, onViewAll }) => {
  const [displayOrders, setDisplayOrders] = useState([]);

  useEffect(() => {
    if (orders && Array.isArray(orders)) setDisplayOrders(orders.slice(0, 3));
  }, [orders]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-tppdarkgray rounded-xl border border-tppslate/10 dark:border-tppdarkwhite/10 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg p-3 animate-pulse">
              <div className="flex flex-col gap-3 md:hidden">
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-20 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-3/4"></div>
                    <div className="h-3 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-3">
                <div className="w-16 h-16 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-3/4"></div>
                  <div className="h-3 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-1/2"></div>
                  <div className="h-3 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <div className="bg-white dark:bg-tppdarkgray rounded-xl border border-tppslate/10 dark:border-tppdarkwhite/10 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-tppslate dark:text-tppdarkwhite flex items-center gap-2">
            <Package className="w-4 h-4" />
            Recent Orders
          </h2>
        </div>
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-tppslate/20 dark:text-tppdarkwhite/30 mx-auto mb-3" />
          <p className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 mb-4">No orders yet</p>
          <a href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-tppslate dark:bg-tppdarkwhite text-white dark:text-tppdark text-sm font-semibold rounded-lg hover:bg-tppslate/90 dark:hover:bg-tppdarkwhite/90 transition-colors">
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-xl border border-tppslate/10 dark:border-tppdarkwhite/10 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-tppslate dark:text-tppdarkwhite flex items-center gap-2">
          <Package className="w-4 h-4" />
          Recent Orders
        </h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite font-medium transition-colors">
            View All →
          </button>
        )}
      </div>

      <div className="space-y-2 md:space-y-3">
        {displayOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const firstItem = order.items_preview?.[0] || order.items?.[0];
          const itemCount = order.items?.length || order.items_preview?.length || order.item_count || 0;
          const shippingAddress = parseShippingAddress(order.shipping_address);
          const city = shippingAddress?.city || 'N/A';
          const orderId = order.id?.substring(0, 8).toUpperCase() || 'N/A';

          return (
            <a
              key={order.id}
              href={`/user/orders/${order.id}`}
              className="block border border-tppslate/30 dark:border-tppdarkwhite/10 rounded-lg p-2.5 md:p-3 hover:border-tpppink/90 dark:hover:border-tppdarkwhite/30 hover:bg-tppslate/[0.02] dark:hover:bg-tppdarkwhite/5 transition-all"
            >
              {/* MOBILE LAYOUT */}
              <div className="flex flex-col gap-2 md:hidden">
                <div className="flex gap-2 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-tppslate/5 dark:bg-tppdark">
                      {firstItem?.bundle_img ? (
                        <img src={firstItem.bundle_img} alt={firstItem.bundle_title || 'Order'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-tppslate/20 dark:text-tppdarkwhite/30" />
                        </div>
                      )}
                    </div>
                    {itemCount > 1 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-tppslate dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-full flex items-center justify-center text-[10px] font-bold">
                        {itemCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h3 className="text-xs font-semibold text-tppslate dark:text-tppdarkwhite line-clamp-2 leading-tight">
                      {firstItem?.bundle_title || 'Order Bundle'}
                    </h3>
                    <p className="text-[10px] text-tppslate/60 dark:text-tppdarkwhite/50 font-mono">
                      #{orderId}{itemCount > 1 && <span className="text-tppslate/50 dark:text-tppdarkwhite/30"> • {itemCount} items</span>}
                    </p>
                    <div className={`inline-flex self-start items-center gap-1 px-2 py-0.5 ${statusConfig.bg} rounded text-[10px] font-semibold ${statusConfig.text}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-tppslate/70 dark:text-tppdarkwhite/50 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[80px]">{city}</span>
                  </div>
                  <span className="text-tppslate/30 dark:text-tppdarkwhite/20">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    {order.status === 'delivered' ? (
                      <span>{formatDate(order.delivered_at || order.created_at)}</span>
                    ) : order.status === 'cancelled' ? (
                      <span>{formatDate(order.created_at)}</span>
                    ) : (
                      <span>{getEstimatedDelivery(order)}</span>
                    )}
                  </div>
                  <span className="text-tppslate/30 dark:text-tppdarkwhite/20">•</span>
                  <span className="font-semibold text-xs text-tppslate dark:text-tppdarkwhite ml-auto">
                    {formatCurrency(order.final_total || order.total)}
                  </span>
                </div>
              </div>

              {/* DESKTOP LAYOUT */}
              <div className="hidden md:flex gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-tppslate/5 dark:bg-tppdark">
                    {firstItem?.bundle_img ? (
                      <img src={firstItem.bundle_img} alt={firstItem.bundle_title || 'Order'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-tppslate/20 dark:text-tppdarkwhite/30" />
                      </div>
                    )}
                  </div>
                  {itemCount > 1 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-tppslate dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-full flex items-center justify-center text-[10px] font-bold">
                      {itemCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-tppslate dark:text-tppdarkwhite truncate">
                        {firstItem?.bundle_title || 'Order Bundle'}
                      </h3>
                      <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/50 font-mono">
                        #{orderId}{itemCount > 1 && <span className="text-tppslate/50 dark:text-tppdarkwhite/30"> • {itemCount} items</span>}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 ${statusConfig.bg} rounded text-xs font-semibold ${statusConfig.text} whitespace-nowrap`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-tppslate/70 dark:text-tppdarkwhite/50">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{city}</span>
                    </div>
                    <span className="text-tppslate/30 dark:text-tppdarkwhite/20">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.status === 'delivered' ? (
                        <span>Delivered {formatDate(order.delivered_at || order.created_at)}</span>
                      ) : order.status === 'cancelled' ? (
                        <span>Cancelled {formatDate(order.created_at)}</span>
                      ) : (
                        <span>Arriving {getEstimatedDelivery(order)}</span>
                      )}
                    </div>
                    <span className="text-tppslate/30 dark:text-tppdarkwhite/20">•</span>
                    <span className="font-semibold text-tppslate dark:text-tppdarkwhite ml-auto">
                      {formatCurrency(order.final_total || order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrders;