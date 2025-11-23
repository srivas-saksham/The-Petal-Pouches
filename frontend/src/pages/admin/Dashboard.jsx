// frontend/src/pages/admin/Dashboard.jsx

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { SkeletonStats, SkeletonCard } from '../../components/admin/ui/LoadingSkeleton';
import { formatCurrency, formatDate, getRelativeTime } from '../../utils/adminHelpers';

// Import services
import {
  getDashboardStats,
  getMonthlyRevenue,
  getCategoryDistribution,
  getTopProducts,
  getSalesTrends,
} from '../../services/statsService';
import { getRecentOrders } from '../../services/orderService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all dashboard data in parallel
      const [
        statsResult,
        ordersResult,
        productsResult,
        revenueResult,
        categoryResult,
        trendsResult,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getTopProducts(5),
        getMonthlyRevenue(),
        getCategoryDistribution(),
        getSalesTrends(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (ordersResult.success) {
        setRecentOrders(ordersResult.data.data || []);
      }

      if (productsResult.success) {
        setTopProducts(productsResult.data || []);
      }

      if (revenueResult.success) {
        setMonthlyRevenue(revenueResult.data || []);
      }

      if (categoryResult.success) {
        setCategoryDist(categoryResult.data || []);
      }

      if (trendsResult.success) {
        setTrends(trendsResult.data);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Main Stats Cards
  const mainStats = stats ? [
    {
      id: 'revenue',
      label: 'Total Revenue',
      icon: DollarSign,
      current: stats.revenue.current,
      previous: stats.revenue.previous,
      change: calculateChange(stats.revenue.current, stats.revenue.previous),
    },
    {
      id: 'orders',
      label: 'Total Orders',
      icon: ShoppingCart,
      current: stats.orders.current,
      previous: stats.orders.previous,
      change: calculateChange(stats.orders.current, stats.orders.previous),
    },
    {
      id: 'products',
      label: 'Total Products',
      icon: Package,
      current: stats.products.current,
      previous: stats.products.previous,
      change: calculateChange(stats.products.current, stats.products.previous),
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      current: stats.customers.current,
      previous: stats.customers.previous,
      change: calculateChange(stats.customers.current, stats.customers.previous),
    },
  ] : [];

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your store today."
        />
        <div className="bg-white rounded-lg border-2 border-slate-200 p-8 text-center transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm">
          <div className="text-red-500 mb-3 text-xl">⚠️</div>
          <h3 className="text-base font-semibold text-tppslate mb-1">Error Loading Dashboard</h3>
          <p className="text-tppslate/70 text-xs mb-3">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change > 0;

            return (
              <div 
                key={stat.id} 
                className="bg-white rounded-lg p-4 border-2 border-slate-200 animate-fade-in transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm "
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-tpppeach/30 rounded-md flex items-center justify-center shadow-sm border border-slate-200">
                    <Icon className="w-5 h-5 text-tppslate" />
                  </div>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isPositive ? 'bg-tppmint text-tppslate' : 'bg-red-100 text-red-700'
                    }`}>
                      {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-tppslate mb-0.5">
                  {stat.id === 'revenue' ? formatCurrency(stat.current) : stat.current.toLocaleString()}
                </div>
                <div className="text-xs text-tppslate/70">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-4 border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-tppslate">Recent Orders</h3>
            <Link 
              to="/admin/orders"
              className="text-xs text-tppslate hover:text-tppslate/60 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-6 text-tppslate/50 text-xs">
              No recent orders
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-white rounded-md border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm "
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-tppslate text-xs">
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-tppslate/70">
                      {order.customer_name || 'Guest'}
                    </div>
                    <div className="text-[10px] text-tppslate/50 mt-0.5">
                      {getRelativeTime(order.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-tppslate text-sm">
                      {formatCurrency(order.final_total || order.total)}
                    </div>
                    <div className="text-[10px] text-tppslate/60">
                      {order.order_items?.length || order.items || 0} item(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-4 border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-tppslate">Top Products</h3>
            <Link 
              to="/admin/products"
              className="text-xs text-tppslate hover:text-tppslate/60 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-6 text-tppslate/50 text-xs">
              No products available
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-md border-2 border-tpppeach transition-all duration-200 hover:border-tpppeach hover:bg-tpppeach/40 hover:shadow-sm "
                >
                  <img
                    src={product.img_url}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-tppslate truncate text-xs">
                      {product.title}
                    </div>
                    <div className="text-[10px] text-tppslate/60">
                      {product.sales || 0} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-tppslate text-xs">
                      {formatCurrency(product.revenue || 0)}
                    </div>
                    <div className="text-[10px] text-tppslate/50">
                      revenue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {!loading && monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-lg p-4 border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm">
          <h3 className="text-sm font-bold text-tppslate mb-4">Monthly Revenue</h3>
          <div className="grid grid-cols-6 gap-3">
            {monthlyRevenue.map((data, index) => (
              <div 
                key={index} 
                className="text-center p-3 bg-white rounded-md border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm "
              >
                <div className="text-[10px] text-tppslate/60 mb-1 font-medium">{data.month}</div>
                <div className="font-bold text-tppslate text-xs">{formatCurrency(data.revenue, false)}</div>
                <div className="text-[10px] text-tppslate/50 mt-1">{data.orders} orders</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {!loading && categoryDist.length > 0 && (
        <div className="bg-white rounded-lg p-4 border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm">
          <h3 className="text-sm font-bold text-tppslate mb-4">Products by Category</h3>
          <div className="space-y-3">
            {categoryDist.slice(0, 5).map((cat) => (
              <div 
                key={cat.name} 
                className="flex items-center gap-3 p-3 bg-white rounded-md border-2 border-slate-200 transition-all duration-200 hover:border-tppslate hover:bg-tppslate/5 hover:shadow-sm "
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-tppslate">{cat.name}</span>
                    <span className="text-[10px] text-tppslate/60">{cat.count} products ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className="bg-tppslate h-1.5 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}