// frontend/src/components/user/dashboard/StatsCard.jsx

import React, { useState } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, ChevronDown } from 'lucide-react';

const StatsCard = ({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor = 'text-tpppink',
  loading = false,
  dropdown = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const numericValue = typeof value === 'string' && value.includes('₹')
    ? value.replace(/[^\d]/g, '').length
    : String(value).length;
  const needsMoreSpace = numericValue >= 2;

  if (loading) {
    return (
      <div className="bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg p-2 md:p-3 animate-pulse">
        <div className="flex flex-col items-center gap-1 md:hidden">
          <div className="w-4 h-4 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
          <div className="w-20 h-2.5 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
          <div className="w-12 h-6 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
        </div>
        <div className="hidden md:flex items-center justify-between h-full">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-4 h-4 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
            <div className="w-20 h-3 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
          </div>
          <div className={`flex items-center justify-center border-l-2 border-dashed border-tppslate/10 dark:border-tppdarkwhite/10 pl-3 ${needsMoreSpace ? 'w-[30%]' : 'w-[20%]'}`}>
            <div className="w-full h-8 bg-tppslate/10 dark:bg-tppdarkwhite/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg p-2 md:p-3 hover:border-tppslate/30 dark:hover:border-tppdarkwhite/20 transition-colors">
      {/* MOBILE LAYOUT */}
      <div className="flex flex-col items-center justify-between gap-1 min-h-[100px] md:hidden">
        <Icon className="w-4 h-4 text-tpppink dark:text-tppdarkwhite flex-shrink-0" />
        <p className="text-sm text-tppslate/60 dark:text-tppdarkwhite/70 font-medium text-center leading-tight">{label}</p>

        {dropdown && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-[10px] font-semibold text-tppslate/50 dark:text-tppdarkwhite/50 hover:text-tppslate dark:hover:text-tppdarkwhite transition-colors py-0.5 px-1.5"
            >
              {dropdown.selected}
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                  {dropdown.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { dropdown.onChange(option.value); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        dropdown.selected === option.label
                          ? 'bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite font-semibold'
                          : 'text-tppslate/80 dark:text-tppdarkwhite/70 hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <p className="text-xl font-bold text-tppslate dark:text-tppdarkwhite leading-none">{value}</p>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex items-center justify-between h-full gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <Icon className="w-4 h-4 text-tpppink dark:text-tppdarkwhite flex-shrink-0" />
          </div>
          <p className="text-md text-tppslate/60 dark:text-tppdarkwhite/70 font-medium truncate">{label}</p>
        </div>

        <div className={`${needsMoreSpace ? 'w-[30%]' : 'w-[20%]'} flex flex-col items-center justify-center flex-shrink-0 border-l-2 border-dashed border-tppslate/20 dark:border-tppdarkwhite/10 pl-3 gap-1`}>
          {dropdown && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-tppslate/50 dark:text-tppdarkwhite/50 hover:text-tppslate dark:hover:text-tppdarkwhite transition-colors"
              >
                {dropdown.selected}
                <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                    {dropdown.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { dropdown.onChange(option.value); setDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          dropdown.selected === option.label
                            ? 'bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite font-semibold'
                            : 'text-tppslate/80 dark:text-tppdarkwhite/70 hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-2xl font-bold text-tppslate dark:text-tppdarkwhite leading-none text-right truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

export const DashboardStats = ({ stats, loading = false }) => {
  const [spendTimeline, setSpendTimeline] = useState('lifetime');

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const pendingCount = (
    (stats?.pending || 0) + (stats?.confirmed || 0) + (stats?.processing || 0) +
    (stats?.picked_up || 0) + (stats?.in_transit || 0) + (stats?.out_for_delivery || 0) + (stats?.shipped || 0)
  );

  const calculateSpending = () => {
    if (!stats?.recent_orders || stats.recent_orders.length === 0) return 0;
    const now = new Date();
    let startDate;

    switch (spendTimeline) {
      case '1_hour': startDate = new Date(now); startDate.setHours(now.getHours() - 1); break;
      case 'today': startDate = new Date(now); startDate.setHours(0, 0, 0, 0); break;
      case 'this_week': startDate = new Date(now); startDate.setDate(now.getDate() - now.getDay()); startDate.setHours(0, 0, 0, 0); break;
      case 'last_week': {
        startDate = new Date(now); startDate.setDate(now.getDate() - now.getDay() - 7);
        const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23, 59, 59, 999);
        return stats.recent_orders.filter(o => { const d = new Date(o.created_at); return d >= startDate && d <= endDate && o.status !== 'cancelled'; }).reduce((s, o) => s + (o.final_total || 0), 0);
      }
      case 'this_month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return stats.recent_orders.filter(o => { const d = new Date(o.created_at); return d >= startDate && d <= lastMonthEnd && o.status !== 'cancelled'; }).reduce((s, o) => s + (o.final_total || 0), 0);
      }
      case '3_months': startDate = new Date(now); startDate.setMonth(now.getMonth() - 3); break;
      case '6_months': startDate = new Date(now); startDate.setMonth(now.getMonth() - 6); break;
      case 'this_year': startDate = new Date(now.getFullYear(), 0, 1); break;
      case 'lifetime': default: return stats?.total_spent || 0;
    }

    return stats.recent_orders.filter(o => new Date(o.created_at) >= startDate && o.status !== 'cancelled').reduce((s, o) => s + (o.final_total || 0), 0);
  };

  const timelineOptions = [
    { label: 'Last Hour', value: '1_hour' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: '3_months' },
    { label: 'Last 6 Months', value: '6_months' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Lifetime', value: 'lifetime' }
  ];

  const selectedTimelineLabel = timelineOptions.find(opt => opt.value === spendTimeline)?.label || 'Lifetime';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <StatsCard icon={Package} label="Total Orders" value={stats?.total_orders || 0} loading={loading} />
      <StatsCard
        icon={TrendingUp} label="Total Spent" value={formatCurrency(calculateSpending())}
        dropdown={{ options: timelineOptions, selected: selectedTimelineLabel, onChange: setSpendTimeline }}
        loading={loading}
      />
      <StatsCard icon={Clock} label="Pending Orders" value={pendingCount} loading={loading} />
      <StatsCard icon={CheckCircle} label="Delivered" value={stats?.delivered || 0} loading={loading} />
    </div>
  );
};

export default StatsCard;