// frontend/src/pages/admin/Dashboard.jsx

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import ProductStats from '../../components/admin/products/ProductStats';
import { SkeletonStats, SkeletonCard } from '../../components/admin/ui/LoadingSkeleton';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { 
  formatCurrency, 
  formatDate, 
  calculatePercentage 
} from '../../utils/adminHelpers';
import { 
  mockDashboardStats, 
  mockRecentOrders, 
  mockTopProducts 
} from '../../utils/mockData';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockDashboardStats);
      setRecentOrders(mockRecentOrders);
      setTopProducts(mockTopProducts.slice(0, 5));
      setLoading(false);
    }, 1000);
  }, []);

  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

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
          {Object.entries(stats).map(([key, data]) => {
            const change = calculateChange(data.current, data.previous);
            const isPositive = change > 0;

            return (
              <div key={key} className="card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-text-secondary capitalize">
                    {key === 'revenue' ? 'Total Revenue' : `Total ${key}`}
                  </div>
                  {change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(change)}%
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1">
                  {key === 'revenue' ? formatCurrency(data.current) : data.current.toLocaleString()}
                </div>
                <div className="text-sm text-text-muted">
                  vs {key === 'revenue' ? formatCurrency(data.previous) : data.previous.toLocaleString()} last month
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
                      <span className="font-semibold text-text-primary">
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-text-secondary">
                      {order.customer_name}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {formatDate(order.created_at, 'short')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {order.items} item{order.items > 1 ? 's' : ''}
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
              No sales data yet
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
                      {product.sales} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {formatCurrency(product.revenue)}
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

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products/create"
            className="btn btn-outline flex flex-col items-center gap-2 py-6"
          >
            <span className="text-2xl">📦</span>
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/bundles/create"
            className="btn btn-outline flex flex-col items-center gap-2 py-6"
          >
            <span className="text-2xl">🎁</span>
            <span>Create Bundle</span>
          </Link>
          <Link
            to="/admin/orders"
            className="btn btn-outline flex flex-col items-center gap-2 py-6"
          >
            <span className="text-2xl">🛒</span>
            <span>View Orders</span>
          </Link>
          <Link
            to="/admin/customers"
            className="btn btn-outline flex flex-col items-center gap-2 py-6"
          >
            <span className="text-2xl">👥</span>
            <span>Customers</span>
          </Link>
        </div>
      </div>
    </div>
  );
}