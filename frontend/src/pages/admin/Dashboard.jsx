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
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      current: stats.revenue.current,
      previous: stats.revenue.previous,
      change: calculateChange(stats.revenue.current, stats.revenue.previous),
    },
    {
      id: 'orders',
      label: 'Total Orders',
      icon: ShoppingCart,
      color: 'bg-admin-mint',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      current: stats.orders.current,
      previous: stats.orders.previous,
      change: calculateChange(stats.orders.current, stats.orders.previous),
    },
    {
      id: 'products',
      label: 'Total Products',
      icon: Package,
      color: 'bg-admin-pink',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      current: stats.products.current,
      previous: stats.products.previous,
      change: calculateChange(stats.products.current, stats.products.previous),
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      current: stats.customers.current,
      previous: stats.customers.previous,
      change: calculateChange(stats.customers.current, stats.customers.previous),
    },
  ] : [];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your store today."
        />
        <div className="card p-12 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Error Loading Dashboard</h3>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change > 0;

            return (
              <div key={stat.id} className="card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1">
                  {stat.id === 'revenue' ? formatCurrency(stat.current) : stat.current.toLocaleString()}
                </div>
                <div className="text-sm text-text-muted">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Recent Orders</h3>
            <Link 
              to="/admin/orders"
              className="text-sm text-admin-pink hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No recent orders
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-surface rounded-lg hover:shadow-soft transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-text-primary text-sm">
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-text-secondary">
                      {order.customer_name || 'Guest'}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {getRelativeTime(order.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {formatCurrency(order.final_total || order.total)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {order.order_items?.length || order.items || 0} item(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Top Products</h3>
            <Link 
              to="/admin/products"
              className="text-sm text-admin-pink hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No products available
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-surface rounded-lg hover:shadow-soft transition-shadow"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-admin-pink text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={product.img_url}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {product.title}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {product.sales || 0} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {formatCurrency(product.revenue || 0)}
                    </div>
                    <div className="text-xs text-text-muted">
                      revenue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart (Simple Display) */}
      {!loading && monthlyRevenue.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6">Monthly Revenue</h3>
          <div className="grid grid-cols-6 gap-4">
            {monthlyRevenue.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-text-muted mb-2">{data.month}</div>
                <div className="font-bold text-text-primary">{formatCurrency(data.revenue, false)}</div>
                <div className="text-xs text-text-secondary mt-1">{data.orders} orders</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {!loading && categoryDist.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6">Products by Category</h3>
          <div className="space-y-3">
            {categoryDist.slice(0, 5).map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                    <span className="text-sm text-text-muted">{cat.count} products ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div 
                      className="bg-admin-pink h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products"
            className="btn btn-outline flex flex-col items-center gap-2 py-6 hover:border-admin-pink"
          >
            <span className="text-2xl">📦</span>
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/bundles"
            className="btn btn-outline flex flex-col items-center gap-2 py-6 hover:border-admin-pink"
          >
            <span className="text-2xl">🎁</span>
            <span>Manage Bundles</span>
          </Link>
          <Link
            to="/admin/orders"
            className="btn btn-outline flex flex-col items-center gap-2 py-6 hover:border-admin-pink"
          >
            <span className="text-2xl">🛒</span>
            <span>View Orders</span>
          </Link>
          <Link
            to="/admin/categories"
            className="btn btn-outline flex flex-col items-center gap-2 py-6 hover:border-admin-pink"
          >
            <span className="text-2xl">📂</span>
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* Inventory Alerts */}
      {!loading && stats && (stats.productBreakdown.low_stock > 0 || stats.productBreakdown.out_of_stock > 0) && (
        <div className="card p-6 border-l-4 border-yellow-500">
          <div className="flex items-start gap-4">
            <div className="text-yellow-500 text-2xl">⚠️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary mb-2">Inventory Alerts</h4>
              <div className="space-y-1 text-sm text-text-secondary">
                {stats.productBreakdown.low_stock > 0 && (
                  <div>• {stats.productBreakdown.low_stock} product(s) running low on stock</div>
                )}
                {stats.productBreakdown.out_of_stock > 0 && (
                  <div>• {stats.productBreakdown.out_of_stock} product(s) out of stock</div>
                )}
              </div>
              <Link to="/admin/products" className="text-admin-pink text-sm mt-2 inline-block hover:underline">
                View inventory →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}