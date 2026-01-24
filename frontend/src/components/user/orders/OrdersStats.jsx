import { Package, Truck, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

/**
 * Quick stats cards showing order counts by status
 * Cards are clickable and act as filters
 */
const OrdersStats = ({ stats, loading, activeFilter, onFilterClick }) => {
  console.log('📊 Stats received:', stats);

  const statCards = [
    {
      label: 'Confirmed',
      value: stats?.confirmed_orders || stats?.confirmed || 0,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      filterValue: 'confirmed'
    },
    {
      label: 'Processing',
      value: stats?.processing_orders || stats?.processing || 0,
      icon: Package,
      color: 'text-tpppink',
      bg: 'bg-tpppink/10',
      filterValue: 'processing'
    },
    {
      label: 'In Transit',
      value: (stats?.in_transit_orders || stats?.in_transit || 0) + (stats?.shipped_orders || stats?.shipped || 0),
      icon: Truck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      filterValue: 'in_transit'
    },
    {
      label: 'Out for Delivery',
      value: stats?.out_for_delivery_orders || stats?.out_for_delivery || 0,
      icon: Truck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      filterValue: 'out_for_delivery'
    },
    {
      label: 'Delivered',
      value: stats?.delivered_orders || stats?.delivered || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      filterValue: 'delivered'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg border border-tppslate/10 p-2 md:p-4 animate-pulse">
            <div className="w-full aspect-[2/1] md:aspect-[3/1] bg-tppslate/10 rounded-lg mb-1.5 md:mb-3"></div>
            <div className="h-5 md:h-8 w-7 md:w-12 bg-tppslate/10 rounded"></div>
            <div className="h-2 md:h-3 w-14 md:w-20 bg-tppslate/10 rounded mt-1 md:mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeFilter === stat.filterValue;
        
        return (
          <button
            key={stat.label}
            onClick={() => onFilterClick(stat.filterValue)}
            className={`bg-white rounded-lg border-2 p-2 md:p-4 transition-all text-left hover:shadow-md ${
              isActive 
                ? 'border-tpppink shadow-md ring-2 ring-tpppink/20' 
                : 'border-tppslate/10 hover:border-tpppink/30'
            }`}
          >
            {/* Icon Background - 2:1 aspect on mobile, 3:1 on desktop */}
            <div className={`w-full aspect-[2/1] md:aspect-[3/1] ${stat.bg} rounded-lg flex items-center justify-center mb-1.5 md:mb-3 ${
              isActive ? 'ring-2 ring-tpppink/30' : ''
            }`}>
              <Icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} strokeWidth={1} />
            </div>
            
            {/* Stats Value */}
            <p className="text-base md:text-2xl font-bold text-tppslate leading-none">{stat.value}</p>
            
            {/* Label */}
            <p className="text-[9px] md:text-xs text-tppslate/60 mt-0.5 leading-tight line-clamp-1">{stat.label}</p>
            
            {/* Active Filter Indicator */}
            {isActive && (
              <div className="mt-0.5 md:mt-2 text-[8px] md:text-[10px] text-tpppink font-semibold uppercase tracking-wide">
                Active
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OrdersStats;