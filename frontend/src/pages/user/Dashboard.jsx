// frontend/src/pages/user/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, ShoppingBag, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  const { user, token } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (token) {
      fetchAllDashboardData();
    }
  }, [token]);

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch Orders
      const ordersRes = await fetch(`${API_URL}/api/orders`, { headers });
      const ordersData = await ordersRes.json();
      
      if (ordersData.success && ordersData.data) {
        const orders = Array.isArray(ordersData.data) ? ordersData.data : [];
        
        const totalOrders = orders.length;
        const totalSpent = orders
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + (o.final_total || o.total || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

        setStats({
          totalOrders,
          totalSpent,
          pendingOrders,
          deliveredOrders,
        });

        const recent = orders.slice(0, 5).map(order => ({
          id: order.id || '#N/A',
          date: order.created_at || new Date().toISOString(),
          total: order.final_total || order.total || 0,
          status: order.status || 'pending',
          items: order.order_items?.length || 0,
        }));
        setRecentOrders(recent);
      }

      // Fetch Addresses
      const addressRes = await fetch(`${API_URL}/api/addresses`, { headers });
      const addressData = await addressRes.json();
      if (addressData.success && Array.isArray(addressData.data)) {
        setAddressCount(addressData.data.length);
      }

      // Fetch Wishlist
      const wishlistRes = await fetch(`${API_URL}/api/wishlist`, { headers });
      const wishlistData = await wishlistRes.json();
      if (wishlistData.success && Array.isArray(wishlistData.data)) {
        setWishlistCount(wishlistData.data.length);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      delivered: { bg: 'bg-tppmint/10', text: 'text-tppmint', label: 'Delivered' },
      pending: { bg: 'bg-tppslate/10', text: 'text-tppslate', label: 'Pending' },
      processing: { bg: 'bg-tpppink/10', text: 'text-tpppink', label: 'Processing' },
      shipped: { bg: 'bg-tppslate/5', text: 'text-tppslate', label: 'Shipped' },
      cancelled: { bg: 'bg-tppslate/20', text: 'text-tppslate', label: 'Cancelled' },
    };
    return styles[status] || styles.pending;
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tppslate/20 border-t-tpppink mx-auto mb-3"></div>
          <p className="text-xs text-tppslate/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-tppslate">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-xs text-tppslate/60 mt-1">Here's your account overview</p>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tppslate/30 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <Package className="w-4 h-4 text-tpppink" />
            <span className="text-xs font-semibold text-tpppink">{stats.totalOrders}</span>
          </div>
          <p className="text-xs text-tppslate/60 font-medium">Total Orders</p>
          <p className="text-sm font-bold text-tppslate mt-1">{stats.totalOrders}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tppslate/30 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <TrendingUp className="w-4 h-4 text-tpppink" />
            <span className="text-xs text-tppslate/50">Lifetime</span>
          </div>
          <p className="text-xs text-tppslate/60 font-medium">Total Spent</p>
          <p className="text-sm font-bold text-tppslate mt-1">{formatCurrency(stats.totalSpent)}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tppslate/30 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <Clock className="w-4 h-4 text-tpppink" />
            <span className="text-xs font-semibold text-tpppink">{stats.pendingOrders}</span>
          </div>
          <p className="text-xs text-tppslate/60 font-medium">Pending Orders</p>
          <p className="text-sm font-bold text-tppslate mt-1">{stats.pendingOrders}</p>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tppslate/30 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <CheckCircle className="w-4 h-4 text-tpppink" />
            <span className="text-xs font-semibold text-tpppink">{stats.deliveredOrders}</span>
          </div>
          <p className="text-xs text-tppslate/60 font-medium">Delivered</p>
          <p className="text-sm font-bold text-tppslate mt-1">{stats.deliveredOrders}</p>
        </div>
      </div>

      {/* Main Content - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders - Wider */}
        <div className="lg:col-span-2 bg-white border border-tppslate/10 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-tppslate/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-tppslate">Recent Orders</h2>
            <button
              onClick={() => navigate('/user/orders')}
              className="text-xs text-tpppink hover:text-tpppink/80 font-medium transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="w-8 h-8 text-tppslate/20 mx-auto mb-2" />
              <p className="text-xs text-tppslate/60">No orders yet</p>
              <button
                onClick={() => navigate('/shop')}
                className="text-xs text-tpppink hover:text-tpppink/80 font-medium mt-2 transition-colors"
              >
                Start shopping →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-tppslate/5 max-h-64 overflow-y-auto">
              {recentOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/user/orders/${order.id}`)}
                    className="p-3 hover:bg-tppslate/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-tppslate truncate">{order.id}</p>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded inline-block flex-shrink-0 ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-tppslate/60">{order.items} item{order.items !== 1 ? 's' : ''} • {formatDate(order.date)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-tppslate">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-tppslate/40 group-hover:text-tpppink transition-colors">View</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links - Sidebar */}
        <div className="space-y-3">
          {/* Addresses */}
          <div
            onClick={() => navigate('/user/addresses')}
            className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tpppink/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <MapPin className="w-4 h-4 text-tpppink" />
              <span className="text-sm font-bold text-tppslate">{addressCount}</span>
            </div>
            <p className="text-xs font-medium text-tppslate mb-1">Saved Addresses</p>
            <p className="text-xs text-tppslate/60 group-hover:text-tpppink transition-colors">Manage →</p>
          </div>

          {/* Wishlist */}
          <div
            onClick={() => navigate('/user/wishlist')}
            className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tpppink/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <Heart className="w-4 h-4 text-tpppink" />
              <span className="text-sm font-bold text-tppslate">{wishlistCount}</span>
            </div>
            <p className="text-xs font-medium text-tppslate mb-1">Saved Items</p>
            <p className="text-xs text-tppslate/60 group-hover:text-tpppink transition-colors">View →</p>
          </div>

          {/* Continue Shopping */}
          <div
            onClick={() => navigate('/shop')}
            className="bg-tpppink/5 border border-tpppink/20 rounded-lg p-3 hover:bg-tpppink/10 hover:border-tpppink/40 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <ShoppingBag className="w-4 h-4 text-tpppink" />
              <ArrowRight className="w-4 h-4 text-tpppink/60 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs font-medium text-tppslate mb-1">Continue Shopping</p>
            <p className="text-xs text-tppslate/60 group-hover:text-tpppink transition-colors">Explore →</p>
          </div>
        </div>
      </div>
    </div>
  );
}