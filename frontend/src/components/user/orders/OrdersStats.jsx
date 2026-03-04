import { Package, Truck, CheckCircle, ShieldCheck } from 'lucide-react';

const OrdersStats = ({ stats, loading, activeFilter, onFilterClick }) => {
  console.log('📊 Stats received:', stats);

  const statCards = [
    { label: 'Confirmed', value: stats?.confirmed_orders || stats?.confirmed || 0, icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10', filterValue: 'confirmed' },
    { label: 'Processing', value: stats?.processing_orders || stats?.processing || 0, icon: Package, color: 'text-tpppink dark:text-tppdarkwhite', bg: 'bg-tpppink/10 dark:bg-tppdarkwhite/5', filterValue: 'processing' },
    { label: 'In Transit', value: (stats?.in_transit_orders || stats?.in_transit || 0) + (stats?.shipped_orders || stats?.shipped || 0), icon: Truck, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/10', filterValue: 'in_transit' },
    { label: 'Out for Delivery', value: stats?.out_for_delivery_orders || stats?.out_for_delivery || 0, icon: Truck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/10', filterValue: 'out_for_delivery' },
    { label: 'Delivered', value: stats?.delivered_orders || stats?.delivered || 0, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10', filterValue: 'delivered' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white dark:bg-tppdarkgray rounded-lg border border-tppslate/10 dark:border-tppdarkwhite/10 p-2 md:p-4 animate-pulse">
            <div className="w-full aspect-[2/1] md:aspect-[3/1] bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded-lg mb-1.5 md:mb-3"></div>
            <div className="h-5 md:h-8 w-7 md:w-12 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
            <div className="h-2 md:h-3 w-14 md:w-20 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded mt-1 md:mt-2"></div>
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
            className={`bg-white dark:bg-tppdarkgray rounded-lg border-2 p-2 md:p-4 transition-all text-left hover:shadow-md ${
              isActive
                ? 'border-tpppink dark:border-tppdarkwhite shadow-md ring-2 ring-tpppink/20 dark:ring-tppdarkwhite/10'
                : 'border-tppslate/10 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/20'
            }`}
          >
            <div className={`w-full aspect-[2/1] md:aspect-[3/1] ${stat.bg} rounded-lg flex items-center justify-center mb-1.5 md:mb-3 ${isActive ? 'ring-2 ring-tpppink/30 dark:ring-tppdarkwhite/20' : ''}`}>
              <Icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} strokeWidth={1} />
            </div>
            <p className="text-base md:text-2xl font-bold text-tppslate dark:text-tppdarkwhite leading-none">{stat.value}</p>
            <p className="text-[9px] md:text-xs text-tppslate/60 dark:text-tppdarkwhite/50 mt-0.5 leading-tight line-clamp-1">{stat.label}</p>
            {isActive && <div className="mt-0.5 md:mt-2 text-[8px] md:text-[10px] text-tpppink dark:text-tppdarkwhite font-semibold uppercase tracking-wide">Active</div>}
          </button>
        );
      })}
    </div>
  );
};

export default OrdersStats;