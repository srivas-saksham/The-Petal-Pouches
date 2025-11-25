// frontend/src/components/user/ui/StatsCard.jsx

import React from 'react';
import { Package, ShoppingCart, Heart, Clock } from 'lucide-react';

/**
 * StatsCard Component
 * Display dashboard statistics with icon and trend
 * 
 * @param {string} title - Card title
 * @param {number|string} value - Stat value to display
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Color theme (pink, slate, mint, amber)
 * @param {Object} trend - Optional trend data { value: number, isPositive: boolean }
 * @param {boolean} loading - Loading state
 */
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'pink', 
  trend, 
  loading = false 
}) => {
  const colorClasses = {
    pink: 'bg-pink-50 text-pink-600',
    slate: 'bg-slate-50 text-slate-600',
    mint: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  const iconBgColor = {
    pink: 'bg-pink-100',
    slate: 'bg-slate-100',
    mint: 'bg-emerald-100',
    amber: 'bg-amber-100'
  };

  const borderColor = {
    pink: 'border-pink-200',
    slate: 'border-slate-200',
    mint: 'border-emerald-200',
    amber: 'border-amber-200'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
          <div className={`w-12 h-12 rounded-lg ${iconBgColor[color]}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${borderColor[color]} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {value}
          </h3>
          
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className="font-medium">
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-slate-500 ml-1">vs last month</span>
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-lg ${iconBgColor[color]} ${colorClasses[color]} flex items-center justify-center`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

/**
 * Pre-configured stat card variants for common use cases
 */
export const OrdersStatsCard = ({ value, trend, loading }) => (
  <StatsCard
    title="Total Orders"
    value={value}
    icon={Package}
    color="pink"
    trend={trend}
    loading={loading}
  />
);

export const PendingOrdersCard = ({ value, loading }) => (
  <StatsCard
    title="Pending Orders"
    value={value}
    icon={Clock}
    color="amber"
    loading={loading}
  />
);

export const WishlistCard = ({ value, loading }) => (
  <StatsCard
    title="Wishlist Items"
    value={value}
    icon={Heart}
    color="pink"
    loading={loading}
  />
);

export const CartCard = ({ value, loading }) => (
  <StatsCard
    title="Cart Items"
    value={value}
    icon={ShoppingCart}
    color="mint"
    loading={loading}
  />
);

export default StatsCard;