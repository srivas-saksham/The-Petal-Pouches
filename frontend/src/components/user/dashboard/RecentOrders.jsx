// frontend/src/components/user/dashboard/RecentOrders.jsx

import React, { useState, useEffect } from 'react';
import { Package, Eye, Truck, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Get status badge color classes
 */
const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    returned: 'bg-slate-100 text-slate-800 border-slate-200'
  };
  
  return statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
};

/**
 * Format order date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0.00';
  return `₹${parseFloat(amount).toFixed(2)}`;
};

/**
 * RecentOrders Component
 * Display last 5 orders with quick actions
 * 
 * @param {Array} orders - Array of order objects
 * @param {boolean} loading - Loading state
 * @param {Function} onViewAll - Callback for "View All" button
 */
const RecentOrders = ({ orders = [], loading = false, onViewAll }) => {
  const [displayOrders, setDisplayOrders] = useState([]);

  useEffect(() => {
    if (orders && Array.isArray(orders)) {
      // Show only last 5 orders
      setDisplayOrders(orders.slice(0, 5));
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-40"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            Recent Orders
          </h2>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 mb-2">No orders yet</p>
          <p className="text-sm text-slate-500 mb-4">
            Start shopping to see your orders here
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Browse Products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-pink-500" />
          Recent Orders
        </h2>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayOrders.map((order) => (
          <div
            key={order.id}
            className="border border-slate-200 rounded-lg p-4 hover:border-pink-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <Link
                  to={`/customer/orders/${order.id}`}
                  className="text-sm font-medium text-slate-900 hover:text-pink-500 transition-colors"
                >
                  Order #{order.id?.slice(0, 8)}
                </Link>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(order.created_at)}
                </p>
              </div>

              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600">
                  {order.item_count || order.order_items?.length || 0} item(s)
                </p>
                <p className="text-base font-semibold text-pink-500 mt-1">
                  {formatCurrency(order.final_total || order.total)}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/customer/orders/${order.id}`}
                  className="p-2 text-slate-600 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                {(order.status === 'shipped' || order.status === 'processing') && (
                  <Link
                    to={`/customer/orders/${order.id}/track`}
                    className="p-2 text-slate-600 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                    title="Track Order"
                  >
                    <Truck className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {order.payment_status === 'failed' && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Payment failed - Please retry</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;