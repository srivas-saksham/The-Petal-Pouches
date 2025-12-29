// frontend/src/components/user/dashboard/StatsCard.jsx

import React, { useState } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, ChevronDown } from 'lucide-react';

/**
 * StatsCard Component - Matches Dashboard.jsx UI exactly
 * Compact design with icon, label, and value
 * ✅ Supports dropdown for timeline selection
 */
const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  badge,
  badgeColor = 'text-tpppink',
  loading = false,
  dropdown = null, // { options: [], selected, onChange }
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Determine if value needs more space (2+ digits)
  const numericValue = typeof value === 'string' && value.includes('₹') 
    ? value.replace(/[^\d]/g, '').length 
    : String(value).length;
  const needsMoreSpace = numericValue >= 2;

  if (loading) {
    return (
      <div className="bg-white border border-tppslate/10 rounded-lg p-3 animate-pulse">
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-4 h-4 bg-tppslate/10 rounded"></div>
            <div className="w-20 h-3 bg-tppslate/10 rounded"></div>
          </div>
          <div className={`flex items-center justify-center border-l-2 border-dashed border-tppslate/10 pl-3 ${needsMoreSpace ? 'w-[30%]' : 'w-[20%]'}`}>
            <div className="w-full h-8 bg-tppslate/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-tppslate/10 rounded-lg p-3 hover:border-tppslate/30 transition-colors">
      <div className="flex items-center justify-between h-full gap-3">
        {/* Left Column - Icon + Label (80%) */}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <Icon className="w-4 h-4 text-tpppink flex-shrink-0" />
          </div>
          
          <p className="text-md text-tppslate/60 font-medium truncate">{label}</p>
        </div>

        {/* Right Column - Dropdown + Large Value (20-30%) */}
        <div className={`${needsMoreSpace ? 'w-[30%]' : 'w-[20%]'} flex flex-col items-center justify-center flex-shrink-0 border-l-2 border-dashed border-tppslate/20 pl-3 gap-1`}>
          {/* Dropdown only (no badge) */}
          {dropdown && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-tppslate/50 hover:text-tppslate transition-colors"
              >
                {dropdown.selected}
                <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 bg-white border border-tppslate/10 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                    {dropdown.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          dropdown.onChange(option.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          dropdown.selected === option.label
                            ? 'bg-tpppink/10 text-tpppink font-semibold'
                            : 'text-tppslate/80 hover:bg-tppslate/5'
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
          
          <p className="text-2xl font-bold text-tppslate leading-none text-right truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * DashboardStats Component - Grid of 4 stat cards
 * Shows: Total Orders, Total Spent, Pending Orders, Delivered Orders
 * ✅ Total Spent now has timeline dropdown
 */
export const DashboardStats = ({ stats, loading = false }) => {
  const [spendTimeline, setSpendTimeline] = useState('lifetime');

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // ✅ Calculate pending orders (all orders that are NOT delivered or cancelled)
  const pendingCount = (
    (stats?.pending || 0) +
    (stats?.confirmed || 0) +
    (stats?.processing || 0) +
    (stats?.picked_up || 0) +
    (stats?.in_transit || 0) +
    (stats?.out_for_delivery || 0) +
    (stats?.shipped || 0)
  );

  // ✅ Calculate spending based on timeline
  const calculateSpending = () => {
    if (!stats?.recent_orders || stats.recent_orders.length === 0) {
      return 0;
    }

    const now = new Date();
    let startDate;

    switch (spendTimeline) {
      case '15_minutes':
        startDate = new Date(now);
        startDate.setMinutes(now.getMinutes() - 15);
        break;
      
      case '30_minutes':
        startDate = new Date(now);
        startDate.setMinutes(now.getMinutes() - 30);
        break;
      
      case '1_hour':
        startDate = new Date(now);
        startDate.setHours(now.getHours() - 1);
        break;
      
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      
      case 'this_week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      
      case 'last_week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() - 7); // Start of last week
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of last week
        endDate.setHours(23, 59, 59, 999);
        
        return stats.recent_orders
          .filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate && order.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + (order.final_total || 0), 0);
      
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        
        return stats.recent_orders
          .filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= lastMonthEnd && order.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + (order.final_total || 0), 0);
      
      case '3_months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      
      case '6_months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      
      case 'lifetime':
      default:
        return stats?.total_spent || 0;
    }

    // Filter orders by date range
    return stats.recent_orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && order.status !== 'cancelled';
      })
      .reduce((sum, order) => sum + (order.final_total || 0), 0);
  };

  // Timeline options
  const timelineOptions = [
    // { label: 'Last 15 Minutes', value: '15_minutes' },
    // { label: 'Last 30 Minutes', value: '30_minutes' },
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Orders */}
      <StatsCard
        icon={Package}
        label="Total Orders"
        value={stats?.total_orders || 0}
        loading={loading}
      />

      {/* Total Spent - With Timeline Dropdown */}
      <StatsCard
        icon={TrendingUp}
        label="Total Spent"
        value={formatCurrency(calculateSpending())}
        dropdown={{
          options: timelineOptions,
          selected: selectedTimelineLabel,
          onChange: setSpendTimeline
        }}
        loading={loading}
      />

      {/* Pending Orders (All non-delivered/cancelled) */}
      <StatsCard
        icon={Clock}
        label="Pending Orders"
        value={pendingCount}
        loading={loading}
      />

      {/* Delivered Orders */}
      <StatsCard
        icon={CheckCircle}
        label="Delivered"
        value={stats?.delivered || 0}
        loading={loading}
      />
    </div>
  );
};

export default StatsCard;