// frontend/src/components/shop/ShopFilters.jsx

import React, { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

/**
 * ShopFilters Component - COMPACT VERSION
 * Minimal height sticky filter panel with search, price range, stock filter, and sort options
 * 
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback when filter changes
 * @param {Array} activeFilters - Array of active filter objects for displaying badges
 * @param {Function} onClearFilter - Callback to clear single filter
 * @param {Function} onResetAll - Callback to reset all filters
 * @param {boolean} hasActiveFilters - Whether any filters are active
 */
const ShopFilters = ({
  filters = {},
  onFilterChange,
  activeFilters = [],
  onClearFilter,
  onResetAll,
  hasActiveFilters = false
}) => {
  const [expandedMobile, setExpandedMobile] = useState(false);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    onFilterChange('search', value);
  };

  /**
   * Handle min price change
   */
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    onFilterChange('min_price', value);
  };

  /**
   * Handle max price change
   */
  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    onFilterChange('max_price', value);
  };

  /**
   * Handle stock filter change
   */
  const handleStockChange = (e) => {
    const value = e.target.checked ? 'true' : '';
    onFilterChange('in_stock', value);
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (e) => {
    const value = e.target.value;
    onFilterChange('sort', value);
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    onFilterChange('search', '');
  };

  return (
    <div className="space-y-2">
      {/* Mobile Filter Toggle Button */}
      <div className="flex lg:hidden items-center justify-between">
        <button
          onClick={() => setExpandedMobile(!expandedMobile)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all duration-200 text-sm font-medium
            ${expandedMobile
              ? 'bg-tpppink text-white border-tpppink'
              : 'bg-white text-tppslate border-slate-300 hover:border-tpppink'
            }
          `}
          title="Toggle Filters"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedMobile ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Container - Hidden on mobile unless expanded */}
      <div className={`${expandedMobile ? 'block' : 'hidden lg:block'}`}>
        {/* Compact Filter Row */}
        <div className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
          {/* Search Input - Compact */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="
                w-full pl-8 pr-8 py-1.5 border-2 border-slate-300 rounded-md
                focus:outline-none focus:border-tpppink focus:ring-0
                text-sm text-slate-900 placeholder-slate-400 transition-colors duration-200
              "
            />
            {filters.search && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price Range - Compact */}
          <div className="flex gap-1.5 lg:gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price || ''}
              onChange={handleMinPriceChange}
              className="
                w-16 px-2 py-1.5 border-2 border-slate-300 rounded-md
                focus:outline-none focus:border-tpppink focus:ring-0
                text-sm text-slate-900 placeholder-slate-400 transition-colors duration-200
              "
            />
            <span className="text-slate-400 text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price || ''}
              onChange={handleMaxPriceChange}
              className="
                w-16 px-2 py-1.5 border-2 border-slate-300 rounded-md
                focus:outline-none focus:border-tpppink focus:ring-0
                text-sm text-slate-900 placeholder-slate-400 transition-colors duration-200
              "
            />
          </div>

          {/* Stock Checkbox - Compact */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition-colors duration-200 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={filters.in_stock === 'true'}
              onChange={handleStockChange}
              className="
                w-4 h-4 rounded border-2 border-slate-300
                cursor-pointer accent-tpppink
              "
            />
            <span className="text-sm font-medium text-tppslate whitespace-nowrap">In Stock</span>
          </label>

          {/* Sort Dropdown - Compact */}
          <div className="relative flex-shrink-0">
            <select
              value={filters.sort || 'created_at'}
              onChange={handleSortChange}
              className="
                px-2.5 py-1.5 border-2 border-slate-300 rounded-md
                focus:outline-none focus:border-tpppink focus:ring-0
                text-sm text-slate-900 appearance-none transition-colors duration-200
                bg-white cursor-pointer
              "
            >
              <option value="created_at">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Button - Compact */}
          {hasActiveFilters && (
            <button
              onClick={onResetAll}
              className="
                px-2.5 py-1.5 text-xs font-semibold text-tpppink hover:text-white
                hover:bg-tpppink rounded-md transition-all duration-200 flex-shrink-0
                border-2 border-tpppink hover:border-tpppink
              "
            >
              Reset
            </button>
          )}
        </div>

        {/* Active Filter Badges - Below filters, compact */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="
                  inline-flex items-center gap-1 px-2 py-0.5 bg-tpppink/10 border border-tpppink/30
                  rounded-full text-xs font-medium text-tppslate hover:bg-tpppink/20 transition-colors duration-200
                "
              >
                <span className="truncate max-w-[150px]">{filter.label}</span>
                <button
                  onClick={() => onClearFilter(filter.key)}
                  className="ml-0.5 text-tpppink hover:text-tppslate transition-colors duration-200 flex-shrink-0"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopFilters;