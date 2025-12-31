// frontend/src/components/admin/customers/AdminCustomersStats.jsx
/**
 * Admin Customers Stats Component
 * Overview statistics cards
 */

import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function AdminCustomersStats({ stats, filters, onFilterChange }) {
  
  if (!stats) return null;

  const StatCard = ({ label, value, icon: Icon, status, isActive, onClick }) => {
    const getColors = () => {
      if (isActive) {
        return 'border-tpppink bg-tpppink/5 ring-2 ring-tpppink/20';
      }
      
      switch (status) {
        case 'all':
          return 'border-tppslate/20 bg-tppslate/5 hover:border-tppslate/40';
        case 'active':
          return 'border-tppslate/20 bg-tppslate/5 hover:border-tppslate/40';
        case 'inactive':
          return 'border-tppslate/20 bg-tppslate/10 hover:border-tppslate/40';
        case 'new':
          return 'border-tpppink/20 bg-tpppink/5 hover:border-tpppink/40';
        default:
          return 'border-tppslate/20 bg-white hover:border-tppslate/40';
      }
    };

    const getIconColor = () => {
      switch (status) {
        case 'all':
          return 'text-tppslate';
        case 'active':
          return 'text-tppslate';
        case 'inactive':
          return 'text-tppslate/50';
        case 'new':
          return 'text-tpppink';
        default:
          return 'text-tppslate';
      }
    };

    return (
      <button
        onClick={onClick}
        className={`${getColors()} border-2 rounded-lg p-4 hover:shadow-md transition-all text-left w-full`}
      >
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${getIconColor()}`} />
          <span className="text-2xl font-bold text-tppslate">{value || 0}</span>
        </div>
        <div className="text-sm font-semibold text-tppslate/70">{label}</div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Customers"
        value={stats.total}
        icon={Users}
        status="all"
        isActive={filters.status === 'all'}
        onClick={() => onFilterChange('status', 'all')}
      />
      
      <StatCard
        label="Active Customers"
        value={stats.active}
        icon={CheckCircle}
        status="active"
        isActive={filters.status === 'active'}
        onClick={() => onFilterChange('status', 'active')}
      />
      
      <StatCard
        label="Inactive Customers"
        value={stats.inactive}
        icon={XCircle}
        status="inactive"
        isActive={filters.status === 'inactive'}
        onClick={() => onFilterChange('status', 'inactive')}
      />
      
      <StatCard
        label="New This Month"
        value={stats.new_this_month}
        icon={TrendingUp}
        status="new"
        isActive={false}
        onClick={null}
      />
    </div>
  );
}