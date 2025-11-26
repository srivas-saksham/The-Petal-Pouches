// frontend/src/pages/user/Orders.jsx

import { useState, useEffect } from 'react';
import { Package, Eye, Truck, ChevronRight, Filter, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== SKELETON COMPONENTS ====================

const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-tppslate/10 p-3 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="space-y-1.5">
        <div className="h-4 w-24 bg-tppslate/10 rounded skeleton-shimmer"></div>
        <div className="h-3 w-32 bg-tppslate/10 rounded skeleton-shimmer"></div>
      </div>
      <div className="h-5 w-20 bg-tppslate/10 rounded-full skeleton-shimmer"></div>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div className="space-y-1">
        <div className="h-3 w-12 bg-tppslate/10 rounded skeleton-shimmer"></div>
        <div className="h-4 w-8 bg-tppslate/10 rounded skeleton-shimmer"></div>
      </div>
      <div className="space-y-1">
        <div className="h-3 w-12 bg-tppslate/10 rounded skeleton-shimmer"></div>
        <div className="h-4 w-16 bg-tppslate/10 rounded skeleton-shimmer"></div>
      </div>
      <div className="space-y-1">
        <div className="h-3 w-16 bg-tppslate/10 rounded skeleton-shimmer"></div>
        <div className="h-4 w-12 bg-tppslate/10 rounded skeleton-shimmer"></div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-8 bg-tppslate/10 rounded skeleton-shimmer"></div>
      <div className="flex-1 h-8 bg-tppslate/10 rounded skeleton-shimmer"></div>
    </div>
  </div>
);

const FiltersSkeleton = () => (
  <div className="bg-white rounded-lg border border-tppslate/10 p-3 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="h-9 bg-tppslate/10 rounded skeleton-shimmer"></div>
      <div className="h-9 bg-tppslate/10 rounded skeleton-shimmer"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useUserAuth();

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual API call
      // const response = await fetch(`${API_URL}/api/orders`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      // const data = await response.json();

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
        {
          id: 'ORD-004',
          date: '2024-11-12',
          status: 'pending',
          total: 1299,
          items: 1,
          payment_status: 'paid'
        },
        {
          id: 'ORD-005',
          date: '2024-11-10',
          status: 'cancelled',
          total: 2199,
          items: 2,
          payment_status: 'refunded'
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

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-tppslate/10', 
        text: 'text-tppslate', 
        label: 'Pending',
        icon: Clock
      },
      processing: { 
        bg: 'bg-tpppink/10', 
        text: 'text-tpppink', 
        label: 'Processing',
        icon: Package
      },
      shipped: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-600', 
        label: 'Shipped',
        icon: Truck
      },
      delivered: { 
        bg: 'bg-tppslate/20', 
        text: 'text-tppslate', 
        label: 'Delivered',
        icon: CheckCircle
      },
      cancelled: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        label: 'Cancelled',
        icon: XCircle
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filter by search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-tppslate flex items-center gap-2">
          <Package className="w-5 h-5 text-tpppink" />
          My Orders
        </h1>
        <p className="text-xs text-tppslate/60 mt-0.5">Track and manage your orders</p>
      </div>

      {/* Filters */}
      {loading ? (
        <FiltersSkeleton />
      ) : (
        <div className="bg-white rounded-lg border border-tppslate/10 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-tppslate/10 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white"
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
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-tppslate/10 p-8 text-center">
          <Package className="w-12 h-12 text-tppslate/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-tppslate mb-1">
            {searchTerm ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-xs text-tppslate/60 mb-4">
            {searchTerm 
              ? `No orders match "${searchTerm}"`
              : "You haven't placed any orders yet"
            }
          </p>
          {!searchTerm && (
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tpppink text-white text-sm rounded-lg hover:bg-tpppink/90 transition-colors font-medium"
            >
              Start Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-tppslate/10 p-3 hover:border-tpppink/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-tppslate flex items-center gap-1.5">
                      Order {order.id}
                    </h3>
                    <p className="text-xs text-tppslate/60 mt-0.5">{formatDate(order.date)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 py-2 border-y border-tppslate/5">
                  <div>
                    <p className="text-xs text-tppslate/60 mb-0.5">Items</p>
                    <p className="text-sm font-semibold text-tppslate">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-tppslate/60 mb-0.5">Total</p>
                    <p className="text-sm font-semibold text-tpppink">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-tppslate/60 mb-0.5">Payment</p>
                    <p className={`text-sm font-semibold ${
                      order.payment_status === 'paid' 
                        ? 'text-tppslate' 
                        : order.payment_status === 'refunded'
                        ? 'text-blue-600'
                        : 'text-tppslate/50'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/user/orders/${order.id}`}
                    className="flex-1 px-3 py-2 bg-tppslate/5 text-tppslate text-sm rounded-lg hover:bg-tppslate/10 font-medium transition-colors flex items-center justify-center gap-1.5 group-hover:bg-tppslate/10"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                  {(order.status === 'shipped' || order.status === 'processing') && (
                    <Link
                      to={`/user/orders/${order.id}/track`}
                      className="flex-1 px-3 py-2 bg-tpppink/10 text-tpppink text-sm rounded-lg hover:bg-tpppink/20 font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredOrders.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-tppslate/60">
            Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;