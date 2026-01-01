// frontend/src/components/admin/dashboard/QuickStats.jsx - FIXED ORDER COUNT

import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Layers,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import StatsCard from './StatsCard';

export default function QuickStats({ stats = null, loading = false }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border-2 border-tppslate/10 p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
              <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  // ✅ DEBUG: Log the stats to see what we're receiving
  console.log('📊 QuickStats received stats:', {
    orders: stats.orders,
    orderBreakdown: stats.orderBreakdown,
    fullStats: stats
  });

  // ✅ FIX: Use orderBreakdown for individual status counts
  const totalOrdersFromBreakdown = Object.values(stats.orderBreakdown || {})
    .filter(val => typeof val === 'number')
    .reduce((sum, val) => sum + val, 0);

  console.log('📊 Calculated total from breakdown:', totalOrdersFromBreakdown);

  const allStats = [
    // Revenue
    {
      label: 'Total Revenue',
      value: stats.revenue?.current || 0,
      change: stats.revenue?.change || 0,
      icon: DollarSign,
      prefix: '₹',
      color: 'green',
    },
    // Orders - ✅ FIXED: Use the correct field
    {
      label: 'Total Orders',
      value: stats.orders?.current || stats.orderBreakdown?.total_orders || 0,
      change: stats.orders?.change || 0,
      icon: ShoppingCart,
      color: 'blue',
    },
    // Products
    {
      label: 'Total Products',
      value: stats.products?.current || stats.productBreakdown?.total || 0,
      change: stats.products?.change || 0,
      icon: Package,
      color: 'purple',
    },
    // Bundles
    {
      label: 'Active Bundles',
      value: stats.bundleBreakdown?.active || 0,
      change: 0,
      icon: Layers,
      color: 'tpppink',
    },
    // Customers
    {
      label: 'Total Customers',
      value: stats.customers?.current || 0,
      change: stats.customers?.change || 0,
      icon: Users,
      color: 'amber',
    },
    // Pending Orders
    {
      label: 'Pending Orders',
      value: stats.orderBreakdown?.pending || 0,
      change: 0,
      icon: AlertTriangle,
      color: 'amber',
    },
    // Shipped Orders (In Transit + Shipped)
    {
      label: 'In Transit',
      value: (stats.orderBreakdown?.in_transit || 0) + (stats.orderBreakdown?.shipped || 0),
      change: 0,
      icon: Truck,
      color: 'blue',
    },
    // Delivered
    {
      label: 'Delivered',
      value: stats.orderBreakdown?.delivered || 0,
      change: 0,
      icon: TrendingUp,
      color: 'green',
    },
    // Low Stock
    {
      label: 'Low Stock Items',
      value: stats.productBreakdown?.low_stock || 0,
      change: 0,
      icon: AlertTriangle,
      color: 'amber',
    },
    // Out of Stock
    {
      label: 'Out of Stock',
      value: stats.productBreakdown?.out_of_stock || 0,
      change: 0,
      icon: TrendingDown,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {allStats.map((stat) => (
        <StatsCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          prefix={stat.prefix}
          suffix={stat.suffix}
          color={stat.color}
        />
      ))}
    </div>
  );
}