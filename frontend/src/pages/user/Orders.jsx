// frontend/src/pages/user/Orders.jsx

import React, { useState, useEffect } from 'react';
import { Package, Eye, Truck, ChevronRight, AlertCircle, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch from API
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockOrders = [
        {
          id: 'ORD-001',
          date: '2024-11-20',
          status: 'delivered',
          total: 2499,
          items: 2,
          payment_status: 'paid'
        },
        {
          id: 'ORD-002',
          date: '2024-11-18',
          status: 'shipped',
          total: 1899,
          items: 1,
          payment_status: 'paid'
        },
        {
          id: 'ORD-003',
          date: '2024-11-15',
          status: 'processing',
          total: 3499,
          items: 3,
          payment_status: 'paid'
        },
      ];
      
      const filtered = statusFilter === 'all' 
        ? mockOrders 
        : mockOrders.filter(o => o.status === statusFilter);
      
      setOrders(filtered);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-tpppeach border-t-tppslate mx-auto mb-4"></div>
          <p className="text-tppslate font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
          <Package className="w-8 h-8 text-tpppink" />
          My Orders
        </h1>
        <p className="text-tppslate/70">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-tppslate/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-tppslate/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-tppslate/10 p-12 text-center">
          <Package className="w-16 h-16 text-tppslate/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-tppslate mb-2">No orders found</h3>
          <p className="text-tppslate/60 mb-4">You haven't placed any orders yet</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors"
          >
            Start Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-tppslate">Order {order.id}</h3>
                  <p className="text-sm text-tppslate/60">{formatDate(order.date)}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-tppslate/60 mb-1">Items</p>
                  <p className="text-lg font-semibold text-tppslate">{order.items}</p>
                </div>
                <div>
                  <p className="text-xs text-tppslate/60 mb-1">Total</p>
                  <p className="text-lg font-semibold text-tpppink">₹{order.total.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-tppslate/60 mb-1">Payment</p>
                  <p className={`text-lg font-semibold ${order.payment_status === 'paid' ? 'text-tppmint' : 'text-yellow-600'}`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/user/orders/${order.id}`}
                  className="flex-1 px-4 py-2 bg-tpppeach/20 text-tppslate rounded-lg hover:bg-tpppeach/40 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {(order.status === 'shipped' || order.status === 'processing') && (
                  <Link
                    to={`/user/orders/${order.id}/track`}
                    className="flex-1 px-4 py-2 bg-tpppink/20 text-tpppink rounded-lg hover:bg-tpppink/30 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Track
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;