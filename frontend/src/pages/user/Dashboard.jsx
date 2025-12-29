// frontend/src/pages/user/Dashboard.jsx - UPDATED WITH STATSCARD COMPONENT

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, ShoppingBag, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { getOrderStats } from '../../services/orderService';
import RecentOrders from '../../components/user/dashboard/RecentOrders';
import { DashboardStats } from '../../components/user/dashboard/StatsCard';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== SKELETON COMPONENTS ====================

const QuickLinkSkeleton = () => (
  <div className="bg-white border border-tppslate/10 rounded-lg p-3 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="w-4 h-4 bg-tppslate/10 rounded skeleton-shimmer"></div>
      <div className="w-8 h-5 bg-tppslate/10 rounded skeleton-shimmer"></div>
    </div>
    <div className="w-16 h-3 bg-tppslate/10 rounded mb-1 skeleton-shimmer"></div>
    <div className="w-20 h-3 bg-tppslate/10 rounded skeleton-shimmer"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    picked_up: 0,
    in_transit: 0,
    out_for_delivery: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total_spent: 0,
    recent_orders: []
  });
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

      // ✅ Fetch order statistics from API endpoint
      try {
        const statsResponse = await getOrderStats();
        console.log('📊 Stats Response:', statsResponse);
        
        if (statsResponse.success && statsResponse.stats) {
          const statsData = statsResponse.stats;
          
          setStats({
            total_orders: statsData.total_orders || 0,
            pending: statsData.pending || 0,
            confirmed: statsData.confirmed || 0,
            processing: statsData.processing || 0,
            picked_up: statsData.picked_up || 0,
            in_transit: statsData.in_transit || 0,
            out_for_delivery: statsData.out_for_delivery || 0,
            shipped: statsData.shipped || 0,
            delivered: statsData.delivered || 0,
            cancelled: statsData.cancelled || 0,
            total_spent: statsData.total_spent || 0,
            avg_order_value: statsData.avg_order_value || 0,
            recent_orders: statsData.recent_orders || []
          });
          
          console.log('✅ Stats loaded with recent orders:', statsData.recent_orders?.length || 0);
        } else {
          console.warn('⚠️ Stats response invalid:', statsResponse);
        }
      } catch (err) {
        console.error('❌ Error loading order stats:', err);
      }

      // Fetch address count
      try {
        const addressRes = await fetch(`${API_URL}/api/addresses`, { headers });
        const addressData = await addressRes.json();
        if (addressData.success && Array.isArray(addressData.data)) {
          setAddressCount(addressData.data.length);
        }
      } catch (err) {
        console.error('❌ Error loading addresses:', err);
      }

      // Fetch wishlist count
      try {
        const wishlistRes = await fetch(`${API_URL}/api/wishlist`, { headers });
        const wishlistData = await wishlistRes.json();
        if (wishlistData.success && Array.isArray(wishlistData.data)) {
          setWishlistCount(wishlistData.data.length);
        }
      } catch (err) {
        console.error('❌ Error loading wishlist:', err);
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tppslate flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-tpppink" />
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-tppslate/80 mt-1">
          Here's your account overview
        </p>
      </div>

      {/* ✅ Stats Grid - Now using DashboardStats component */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Main Content - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Recent Orders - Wider (2 columns) */}
        <div className="lg:col-span-2">
          <RecentOrders 
            orders={stats.recent_orders || []} 
            loading={loading}
            onViewAll={() => navigate('/user/orders')}
          />
        </div>

        {/* Quick Links - Sidebar */}
        <div className="space-y-3">
          {loading ? (
            <>
              <QuickLinkSkeleton />
              <QuickLinkSkeleton />
              <QuickLinkSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}