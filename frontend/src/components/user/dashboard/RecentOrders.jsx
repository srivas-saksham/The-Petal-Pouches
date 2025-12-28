// frontend/src/components/user/dashboard/RecentOrders.jsx - BALANCED COMPACT DESIGN

import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Get status configuration with colors (matching OrderCard)
 */
const getStatusConfig = (status) => {
  const configs = {
    pending: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-700', 
      label: 'Pending',
      icon: Clock
    },
    confirmed: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      label: 'Confirmed',
      icon: CheckCircle
    },
    processing: { 
      bg: 'bg-tpppink/10', 
      text: 'text-tpppink', 
      label: 'Processing',
      icon: Package
    },
    picked_up: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      label: 'Picked Up',
      icon: Truck
    },
    in_transit: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      label: 'In Transit',
      icon: Truck
    },
    out_for_delivery: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      label: 'Out for Delivery',
      icon: Truck
    },
    shipped: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-700', 
      label: 'Shipped',
      icon: Truck
    },
    delivered: { 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      label: 'Delivered',
      icon: CheckCircle
    },
    cancelled: { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      label: 'Cancelled',
      icon: XCircle
    },
    failed: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      label: 'Delivery Failed',
      icon: XCircle
    },
    rto_initiated: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      label: 'Return Initiated',
      icon: XCircle
    },
    rto_delivered: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      label: 'Returned',
      icon: Package
    }
  };
  return configs[status] || { 
    bg: 'bg-yellow-50', 
    text: 'text-yellow-700', 
    label: status || 'Pending', 
    icon: Clock 
  };
};

/**
 * Format date to short format
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
};

/**
 * Parse shipping address
 */
const parseShippingAddress = (shipping_address) => {
  if (!shipping_address) return null;
  if (typeof shipping_address === 'object') return shipping_address;
  if (typeof shipping_address === 'string') {
    try {
      return JSON.parse(shipping_address);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Get estimated delivery date
 */
const getEstimatedDelivery = (order) => {
  if (order.shipment?.estimated_delivery) {
    return formatDate(order.shipment.estimated_delivery);
  }
  if (order.delivery_metadata?.expected_delivery_date) {
    return formatDate(order.delivery_metadata.expected_delivery_date);
  }
  if (order.delivery_metadata?.estimated_days) {
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + order.delivery_metadata.estimated_days);
    return formatDate(estimatedDate);
  }
  return 'Within 7 days';
};

/**
 * Balanced Compact RecentOrders Component
 */
const RecentOrders = ({ orders = [], loading = false, onViewAll }) => {
  const [displayOrders, setDisplayOrders] = useState([]);

  useEffect(() => {
    console.log('📦 Recent Orders received:', orders);
    if (orders && Array.isArray(orders)) {
      setDisplayOrders(orders.slice(0, 5));
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-tppslate/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-tppslate/10 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-tppslate/10 rounded w-16 animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 border border-tppslate/10 rounded-lg animate-pulse">
              <div className="w-16 h-16 bg-tppslate/10 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-tppslate/10 rounded w-3/4"></div>
                <div className="h-3 bg-tppslate/10 rounded w-1/2"></div>
                <div className="h-3 bg-tppslate/10 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-tppslate/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-tppslate flex items-center gap-2">
            <Package className="w-4 h-4" />
            Recent Orders
          </h2>
        </div>

        <div className="text-center py-12">
          <Package className="w-12 h-12 text-tppslate/20 mx-auto mb-3" />
          <p className="text-sm text-tppslate/60 mb-4">No orders yet</p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-tppslate text-white text-sm font-semibold rounded-lg hover:bg-tppslate/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-tppslate/10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-tppslate flex items-center gap-2">
          <Package className="w-4 h-4" />
          Recent Orders
        </h2>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-tppslate/60 hover:text-tpppink font-medium transition-colors"
          >
            View All →
          </button>
        )}
      </div>

      {/* Orders List - Balanced Compact */}
      <div className="space-y-3">
        {displayOrders.map((order) => {
          console.log('📦 Order status:', order.status, 'for order:', order.id);
          
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          
          const firstItem = order.items_preview?.[0] || order.items?.[0];
          const itemCount = order.items?.length || order.items_preview?.length || order.item_count || 0;
          
          const shippingAddress = parseShippingAddress(order.shipping_address);
          const city = shippingAddress?.city || 'N/A';
          const orderId = order.id?.substring(0, 8).toUpperCase() || 'N/A';
          
          return (
            <Link
              key={order.id}
              to={`/user/orders/${order.id}`}
              className="flex gap-3 p-3 border border-tppslate/30 rounded-lg hover:border-tpppink/90 hover:bg-tppslate/[0.02] transition-all group"
            >
              {/* Image */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-tppslate/5">
                  {firstItem?.bundle_img ? (
                    <img
                      src={firstItem.bundle_img}
                      alt={firstItem.bundle_title || 'Order'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-tppslate/20" />
                    </div>
                  )}
                </div>
                {itemCount > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-tppslate text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {itemCount}
                  </div>
                )}
              </div>

              {/* Details - Two Lines */}
              <div className="flex-1 min-w-0">
                {/* Line 1: Title + Status */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-tppslate truncate">
                      {firstItem?.bundle_title || 'Order Bundle'}
                    </h3>
                    <p className="text-xs text-tppslate/60 font-mono">
                      #{orderId}
                      {itemCount > 1 && <span className="text-tppslate/50"> • {itemCount} items</span>}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 ${statusConfig.bg} rounded text-xs font-semibold ${statusConfig.text} whitespace-nowrap`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </div>
                </div>

                {/* Line 2: Location + Date + Amount */}
                <div className="flex items-center gap-3 text-xs text-tppslate/70">
                  {/* Location */}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{city}</span>
                  </div>
                  
                  <span className="text-tppslate/30">•</span>
                  
                  {/* Date/Status Info */}
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
                  
                  <span className="text-tppslate/30">•</span>
                  
                  {/* Amount */}
                  <span className="font-semibold text-tppslate ml-auto">
                    {formatCurrency(order.final_total || order.total)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrders;