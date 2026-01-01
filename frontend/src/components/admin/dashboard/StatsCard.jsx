// frontend/src/components/admin/dashboard/StatsCard.jsx - FIXED

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  prefix = '', 
  suffix = '',
  color = 'tppslate'
}) {
  const isPositive = change > 0;
  const hasChange = change !== 0 && change !== null && change !== undefined;

  // Color variations
  const colorClasses = {
    tppslate: 'bg-tppslate/10 border-tppslate/20',
    tpppink: 'bg-tpppink/10 border-tpppink/20',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  };

  const iconColorClasses = {
    tppslate: 'bg-tppslate/20 text-tppslate',
    tpppink: 'bg-tpppink/20 text-tpppink',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border-2 transition-all duration-200
        hover:border-tpppink hover:shadow-md
        ${colorClasses[color] || colorClasses.tppslate}
        p-4
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center
          ${iconColorClasses[color] || iconColorClasses.tppslate}
        `}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        
        {hasChange && (
          <div className={`
            flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
            ${isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
            }
          `}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <div className="text-2xl font-bold text-tppslate">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </div>
        <div className="text-sm text-tppslate/70 font-medium mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}