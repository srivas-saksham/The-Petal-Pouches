// frontend/src/components/admin/customers/AdminCustomersFilters.jsx
/**
 * Admin Customers Filters Component
 * Search, sort, and filter controls
 */

import { Search, Filter, X, RefreshCw } from 'lucide-react';

export default function AdminCustomersFilters({ 
  filters, 
  onFilterChange, 
  onReset,
  onRefresh,
  hasActiveFilters 
}) {
  
  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-4 space-y-4">
      {/* Main Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Search Input - Takes 6 columns */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all"
          />
        </div>

        {/* Status Filter - 2 columns */}
        <div className="md:col-span-2">
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Sort Dropdown - 2 columns */}
        <div className="md:col-span-2">
          <select
            value={filters.sort || 'created_at'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-tppslate/20 rounded-lg focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="created_at">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="last_login">Recently Active</option>
            <option value="total_spent">Highest Spender</option>
          </select>
        </div>

        {/* Action Buttons - 2 columns */}
        <div className="md:col-span-2 flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex-1 px-3 py-2 text-sm font-medium text-tpppink hover:bg-tpppink/10 rounded-lg border border-tpppink/20 transition-all flex items-center justify-center gap-1.5"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="flex-1 px-3 py-2 text-sm font-medium text-tppslate hover:bg-tppslate/10 rounded-lg border border-tppslate/20 transition-all flex items-center justify-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-tppslate/10">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-tppslate/60">Active Filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Search: {filters.search}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70" 
                  onClick={() => onFilterChange('search', '')} 
                />
              </span>
            )}
            
            {filters.status && filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-tpppink/10 text-tpppink text-xs rounded-full font-medium">
                Status: {filters.status}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-tpppink/70" 
                  onClick={() => onFilterChange('status', 'all')} 
                />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}