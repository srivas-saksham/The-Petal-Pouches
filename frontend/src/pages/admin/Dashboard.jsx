// frontend/src/pages/admin/Dashboard.jsx - UPDATED WITH MODULAR COMPONENTS

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import { useToast } from '../../hooks/useToast';

// Import modular dashboard components
import QuickStats from '../../components/admin/dashboard/QuickStats';
import RecentOrdersList from '../../components/admin/dashboard/RecentOrdersList';
import TopProductsList from '../../components/admin/dashboard/TopProductsList';
import MonthlyRevenueChart from '../../components/admin/dashboard/MonthlyRevenueChart';
import {
  SkeletonStats,
  SkeletonOrdersList,
  SkeletonProductsList,
  SkeletonRevenueChart,
} from '../../components/admin/dashboard/DashboardSkeleton';

// Import services
import {
  getDashboardStats,
  getMonthlyRevenue,
  getTopProducts,
} from '../../services/statsService';
import { getRecentOrders } from '../../services/orderService';

export default function Dashboard() {
  // ==================== STATE ====================
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==================== HANDLERS ====================
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Fetch all dashboard data in parallel
      const [
        statsResult,
        ordersResult,
        productsResult,
        revenueResult,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(10), // Last 10 orders
        getTopProducts(5),    // Top 5 products
        getMonthlyRevenue(),  // Last 6 months
      ]);

      // Handle stats response
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Handle orders response
      if (ordersResult.success) {
        const ordersData = Array.isArray(ordersResult.data)
          ? ordersResult.data
          : ordersResult.data.data || [];
        setRecentOrders(ordersData);
        console.log('✅ Recent orders loaded:', ordersData.length);
      }

      // Handle products response
      if (productsResult.success) {
        const productsData = Array.isArray(productsResult.data)
          ? productsResult.data
          : productsResult.data.data || productsResult.data || [];
        setTopProducts(productsData);
        console.log('✅ Top products loaded:', productsData.length);
      }

      // Handle revenue response
      if (revenueResult.success) {
        const revenueData = Array.isArray(revenueResult.data)
          ? revenueResult.data
          : revenueResult.data.data || revenueResult.data || [];
        setMonthlyRevenue(revenueData);
        console.log('✅ Monthly revenue loaded:', revenueData.length);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store."
      />

      {/* Quick Stats Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <QuickStats stats={stats} loading={loading} />
      )}

      {/* Two Column Layout - Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-4 border-2 border-tppslate/10 transition-all duration-200 hover:border-tpppink hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-tppslate">Recent Orders</h3>
            <button
              onClick={() => window.location.href = '/admin/orders'}
              className="text-xs text-tppslate hover:text-tpppink flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <SkeletonOrdersList />
          ) : (
            <RecentOrdersList orders={recentOrders} loading={loading} />
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-4 border-2 border-tppslate/10 transition-all duration-200 hover:border-tpppink hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-tppslate">Top Products</h3>
            <button
              onClick={() => window.location.href = '/admin/products'}
              className="text-xs text-tppslate hover:text-tpppink flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <SkeletonProductsList />
          ) : (
            <TopProductsList products={topProducts} loading={loading} />
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg p-4 border-2 border-tppslate/10 transition-all duration-200 hover:border-tpppink hover:shadow-sm">
        <h3 className="text-sm font-bold text-tppslate mb-4">Monthly Revenue</h3>
        
        {loading ? (
          <SkeletonRevenueChart />
        ) : (
          <MonthlyRevenueChart data={monthlyRevenue} loading={loading} />
        )}
      </div>
    </div>
  );
}