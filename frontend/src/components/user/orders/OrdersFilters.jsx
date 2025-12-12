// frontend/src/components/user/orders/OrdersFilters.jsx

import { useState } from 'react';
import { Search, Filter, Calendar, X, ChevronDown } from 'lucide-react';

/**
 * Advanced filters for orders with search, status, date range, payment status
 */
const OrdersFilters = ({ filters, onFilterChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = !!(
    filters.search ||
    filters.status !== 'all' ||
    filters.payment_status ||
    filters.from_date ||
    filters.to_date
  );

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-4 space-y-4">
      {/* Basic Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 pointer-events-none" />
        </div>

        {/* Advanced Toggle + Reset */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
              showAdvanced
                ? 'bg-tpppink text-white border-tpppink'
                : 'bg-white text-tppslate border-tppslate/20 hover:border-tpppink'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Advanced
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2 text-sm font-medium text-tpppink hover:bg-tpppink/10 rounded-lg border border-tpppink/20 transition-all"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-3 border-t border-tppslate/10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={filters.from_date || ''}
                onChange={(e) => onFilterChange('from_date', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={filters.to_date || ''}
                onChange={(e) => onFilterChange('to_date', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                Payment Status
              </label>
              <select
                value={filters.payment_status || 'all'}
                onChange={(e) => onFilterChange('payment_status', e.target.value === 'all' ? '' : e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-tppslate/10">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-tppslate/60">Active:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Search: {filters.search}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70"
                  onClick={() => onFilterChange('search', '')}
                />
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Status: {filters.status}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70"
                  onClick={() => onFilterChange('status', 'all')}
                />
              </span>
            )}
            {filters.payment_status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Payment: {filters.payment_status}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70"
                  onClick={() => onFilterChange('payment_status', '')}
                />
              </span>
            )}
            {(filters.from_date || filters.to_date) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Date Range
                <X
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70"
                  onClick={() => {
                    onFilterChange('from_date', '');
                    onFilterChange('to_date', '');
                  }}
                />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;