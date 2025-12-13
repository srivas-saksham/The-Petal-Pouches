// frontend/src/components/admin/orders/AdminOrdersFilters.jsx
import { Search, Filter, Calendar, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrdersFilters({ 
  filters, 
  onFilterChange, 
  onReset,
  hasActiveFilters 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-4 space-y-4">
      {/* Basic Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
          <input
            type="text"
            placeholder="Search by order ID, user, or bundle..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
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
            More
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                Payment Status
              </label>
              <select
                value={filters.payment_status || ''}
                onChange={(e) => onFilterChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                Payment Method
              </label>
              <select
                value={filters.payment_method || ''}
                onChange={(e) => onFilterChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">All Methods</option>
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {/* Delivery Mode */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                Delivery Mode
              </label>
              <select
                value={filters.delivery_mode || ''}
                onChange={(e) => onFilterChange('delivery_mode', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">All Modes</option>
                <option value="surface">Surface</option>
                <option value="express">Express</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-semibold text-tppslate/70 mb-1.5">
                Date Range
              </label>
              <div className="flex gap-1">
                <input
                  type="date"
                  value={filters.from_date || ''}
                  onChange={(e) => onFilterChange('from_date', e.target.value)}
                  className="flex-1 px-2 py-2 text-xs border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink"
                />
                <input
                  type="date"
                  value={filters.to_date || ''}
                  onChange={(e) => onFilterChange('to_date', e.target.value)}
                  className="flex-1 px-2 py-2 text-xs border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-tppslate/10">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-tppslate/60">Active:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Search: {filters.search}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('search', '')} />
              </span>
            )}
            
            {filters.status && filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Status: {filters.status}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('status', 'all')} />
              </span>
            )}
            
            {filters.payment_status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Payment: {filters.payment_status}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('payment_status', '')} />
              </span>
            )}

            {filters.payment_method && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Method: {filters.payment_method}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('payment_method', '')} />
              </span>
            )}

            {filters.delivery_mode && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Delivery: {filters.delivery_mode}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('delivery_mode', '')} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}