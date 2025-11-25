// frontend/src/pages/user/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, ShoppingBag, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const { user, token } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // ✅ Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // For now using placeholder data
      
      setStats({
        totalOrders: 8,
        totalSpent: 4850,
        pendingOrders: 1,
        deliveredOrders: 6,
      });

      setRecentOrders([
        {
          id: '#ORD-001',
          date: '2024-11-20',
          total: 1299,
          status: 'delivered',
          items: 3,
        },
        {
          id: '#ORD-002',
          date: '2024-11-15',
          total: 899,
          status: 'delivered',
          items: 2,
        },
        {
          id: '#ORD-003',
          date: '2024-11-10',
          total: 1450,
          status: 'pending',
          items: 4,
        },
      ]);

      setWishlistCount(5);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-tppmint/20', text: 'text-tppmint', label: 'Delivered' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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
          <p className="text-tppslate font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-tpppink/10 to-tpppeach/10 border-2 border-tppslate/10 rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-tppslate mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-tppslate/70 text-lg">
          Check your orders, manage addresses, and explore more at The Petal Pouches
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-tpppeach/30 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-tppslate" />
            </div>
            <span className="text-xs font-semibold text-tppmint bg-tppmint/20 px-2 py-1 rounded-full">
              +{stats?.totalOrders}
            </span>
          </div>
          <p className="text-tppslate/70 text-sm font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-tppslate mt-1">{stats?.totalOrders || 0}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-tpppeach/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-tppslate" />
            </div>
            <span className="text-xs font-semibold text-tppslate/60">Lifetime</span>
          </div>
          <p className="text-tppslate/70 text-sm font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-tppslate mt-1">{formatCurrency(stats?.totalSpent || 0)}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
              {stats?.pendingOrders}
            </span>
          </div>
          <p className="text-tppslate/70 text-sm font-medium">Pending Orders</p>
          <p className="text-2xl font-bold text-tppslate mt-1">{stats?.pendingOrders || 0}</p>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-tppmint/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-tppmint" />
            </div>
            <span className="text-xs font-semibold text-tppmint bg-tppmint/20 px-2 py-1 rounded-full">
              {stats?.deliveredOrders}
            </span>
          </div>
          <p className="text-tppslate/70 text-sm font-medium">Delivered Orders</p>
          <p className="text-2xl font-bold text-tppslate mt-1">{stats?.deliveredOrders || 0}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border-2 border-tppslate/10 overflow-hidden">
          <div className="p-6 border-b-2 border-tppslate/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-tppslate">Recent Orders</h2>
            <button
              onClick={() => navigate('/user/orders')}
              className="text-sm text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
            >
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-tppslate/30 mx-auto mb-3" />
              <p className="text-tppslate/60">No orders yet. Start shopping now!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order, index) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div
                    key={index}
                    onClick={() => navigate(`/user/orders/${order.id}`)}
                    className="p-4 hover:bg-tpppeach/10 transition-colors cursor-pointer border-b-2 border-tppslate/5 last:border-b-0 group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-tppslate">{order.id}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </div>
                        <p className="text-sm text-tppslate/60">{order.items} items • {formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-tppslate">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-tppslate/60 group-hover:text-tpppink transition-colors">View →</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Wishlist Card */}
          <div className="bg-gradient-to-br from-tpppink/10 to-tpppeach/10 rounded-xl border-2 border-tppslate/10 p-6 hover:border-tpppink hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/user/wishlist')}
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-tpppink" />
              <span className="text-2xl font-bold text-tpppink">{wishlistCount}</span>
            </div>
            <h3 className="font-semibold text-tppslate mb-1">My Wishlist</h3>
            <p className="text-sm text-tppslate/70">Items saved for later</p>
            <p className="text-xs text-tpppink font-semibold mt-3 group-hover:translate-x-1 transition-transform">View Wishlist →</p>
          </div>

          {/* Addresses Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200/50 p-6 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/user/addresses')}
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-tppslate mb-1">Saved Addresses</h3>
            <p className="text-sm text-tppslate/70">Manage delivery addresses</p>
            <p className="text-xs text-blue-600 font-semibold mt-3 group-hover:translate-x-1 transition-transform">Manage →</p>
          </div>

          {/* Continue Shopping Card */}
          <div className="bg-gradient-to-br from-tppmint/20 to-tppmint/10 rounded-xl border-2 border-tppmint/30 p-6 hover:border-tppmint hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/shop')}
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-tppmint" />
              <span className="text-lg font-bold text-tppmint">→</span>
            </div>
            <h3 className="font-semibold text-tppslate mb-1">Continue Shopping</h3>
            <p className="text-sm text-tppslate/70">Explore new collections</p>
            <p className="text-xs text-tppmint font-semibold mt-3 group-hover:translate-x-1 transition-transform">Shop Now →</p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl border-2 border-tppslate/10 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-tppslate mb-2">Need Help?</h3>
            <p className="text-sm text-tppslate/70 mb-4">
              Have questions about your orders or need assistance? Our customer support team is here to help.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/contact"
                className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium text-sm hover:bg-tpppink/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="px-4 py-2 border-2 border-tppslate/20 text-tppslate rounded-lg font-medium text-sm hover:border-tppslate/40 transition-colors"
              >
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}