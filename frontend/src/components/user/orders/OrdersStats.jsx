// frontend/src/components/user/orders/OrdersStats.jsx

import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

/**
 * Quick stats cards showing order counts by status
 */
const OrdersStats = ({ stats, loading }) => {
  const statCards = [
    {
      label: 'In Transit',
      value: stats?.shipped || 0,
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Out for Delivery',
      value: stats?.processing || 0,
      icon: Package,
      color: 'text-tpppink',
      bg: 'bg-tpppink/10'
    },
    {
      label: 'Delivered',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg border border-tppslate/10 p-4 animate-pulse">
            <div className="h-4 w-20 bg-tppslate/10 rounded mb-2"></div>
            <div className="h-8 w-12 bg-tppslate/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-tppslate/10 p-4 hover:border-tpppink/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-tppslate">{stat.value}</p>
            <p className="text-xs text-tppslate/60 mt-0.5">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersStats;