// frontend/src/components/admin/dashboard/MonthlyRevenueChart.jsx

import { formatCurrency } from '../../../utils/adminHelpers';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MonthlyRevenueChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-md animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-tppslate/60">No revenue data available</p>
      </div>
    );
  }

  // Calculate max revenue for scaling bars
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  // Calculate growth percentage for each month
  const dataWithGrowth = data.map((item, index) => {
    if (index === 0) {
      return { ...item, growth: 0 };
    }
    const prevRevenue = data[index - 1].revenue;
    const growth = prevRevenue > 0 
      ? Math.round(((item.revenue - prevRevenue) / prevRevenue) * 100)
      : 0;
    return { ...item, growth };
  });

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {dataWithGrowth.map((item, index) => {
        const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
        const isPositive = item.growth > 0;
        const hasGrowth = item.growth !== 0 && index > 0;

        return (
          <div
            key={index}
            className="
              text-center p-3 
              bg-white rounded-md border-2 border-tppslate/10
              transition-all duration-200
              hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm
              group
            "
          >
            {/* Month Label */}
            <div className="text-[10px] text-tppslate/60 mb-2 font-medium">
              {item.month}
            </div>

            {/* Revenue Bar */}
            <div className="h-16 mb-2 flex items-end justify-center">
              <div
                className="w-full bg-gradient-to-t from-tpppink to-tpppink/60 rounded-t transition-all duration-300 group-hover:from-tpppink group-hover:to-tpppink/80"
                style={{ height: `${barHeight}%`, minHeight: '4px' }}
              />
            </div>

            {/* Revenue Amount */}
            <div className="font-bold text-tppslate text-xs mb-1">
              {formatCurrency(item.revenue, false)}
            </div>

            {/* Orders Count */}
            <div className="text-[10px] text-tppslate/50">
              {item.orders} orders
            </div>

            {/* Growth Badge */}
            {hasGrowth && (
              <div className={`
                inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold
                ${isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {Math.abs(item.growth)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}