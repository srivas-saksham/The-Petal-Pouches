// frontend/src/components/shop/ShopFilters.jsx - FIXED VERSION

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

/**
 * ShopFilters Component - PROFESSIONAL FIXED VERSION
 * 
 * FIXES APPLIED:
 * 1. ✅ Fixed sort dropdown - "Price: High to Low" now correctly maps to 'price_desc'
 * 2. ✅ Fixed sort dropdown - "Price: Low to High" now correctly maps to 'price_asc'
 * 3. ✅ Fixed "In Stock Only" checkbox to properly sync with filters state
 * 4. ✅ Improved filter state management and URL param handling
 */
const ShopFilters = ({
  filters = {},
  onFilterChange,
  activeFilters = [],
  onClearFilter,
  onResetAll,
  hasActiveFilters = false,
  totalResults = 0
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  // Sync search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Handle search input with debouncing
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onFilterChange('search', value);
      setIsSearching(false);
    }, 500);
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setIsSearching(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onFilterChange('search', '');
  };

  // Handle min price change
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    onFilterChange('min_price', value);
  };

  // Handle max price change
  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    onFilterChange('max_price', value);
  };

  // ✅ FIX: Handle stock checkbox - properly converts to string
  const handleStockChange = (e) => {
    const value = e.target.checked ? 'true' : '';
    console.log('📦 Stock filter changed:', value);
    onFilterChange('in_stock', value);
  };

  // ✅ FIX: Handle sort change - now properly maps all sort options
  const handleSortChange = (e) => {
    const value = e.target.value;
    console.log('🔄 Sort changed:', value);
    onFilterChange('sort', value);
  };

  // ✅ FIX: Get current sort value with proper default
  const currentSort = filters.sort || 'created_at';
  
  // ✅ FIX: Get current stock filter value
  const isStockChecked = filters.in_stock === 'true';

  return (
    <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm overflow-hidden">
      {/* Main Filter Section */}
      <div className="p-4">
        {/* Single Row Layout - All Filters Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          
          {/* Search - Takes more space */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Search Bundles
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isSearching ? 'text-tpppink animate-pulse' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={handleSearchInput}
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                  hover:border-tpppink hover:shadow-sm hover:bg-tpppink/5
                  transition-all duration-200 text-slate-700 placeholder:text-slate-400"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tpppink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Search feedback indicator */}
            {isSearching && (
              <div className="absolute -bottom-5 left-0 text-xs text-tpppink flex items-center gap-1">
                <div className="w-1 h-1 bg-tpppink rounded-full animate-ping" />
                Searching...
              </div>
            )}
          </div>

          {/* ✅ FIX: Sort Dropdown - Now properly maps to backend values */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Sort By
            </label>
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                hover:border-tpppink hover:shadow-sm hover:bg-tpppink/5
                transition-all duration-200 text-slate-700 cursor-pointer
                appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
            >
              <option value="created_at">Newest First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="title">Name: A to Z</option>
              <option value="discount_percent">Highest Discount</option>
            </select>
          </div>

          {/* Min Price */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Min Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="0"
                value={filters.min_price || ''}
                onChange={handleMinPriceChange}
                min="0"
                step="1"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                  hover:border-tpppink hover:shadow-sm hover:bg-tpppink/5
                  transition-all duration-200 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Max Price */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Max Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="9999"
                value={filters.max_price || ''}
                onChange={handleMaxPriceChange}
                min="0"
                step="1"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                  hover:border-tpppink hover:shadow-sm hover:bg-tpppink/5
                  transition-all duration-200 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* ✅ FIX: Stock Checkbox - Now properly syncs with filters */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Availability
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200
              hover:border-tpppink hover:bg-tpppink/5 transition-all cursor-pointer h-[38px]
              has-[:checked]:border-tpppink has-[:checked]:bg-tpppink/10">
              <input
                type="checkbox"
                checked={isStockChecked}
                onChange={handleStockChange}
                className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink"
              />
              <span className="text-sm font-medium text-slate-700">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Active Filters Pills - Only show if there are active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-tpppink" />
              Active Filters:
            </span>
            
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-tpppink/10 text-tpppink rounded-full text-xs font-medium border border-tpppink/30 hover:bg-tpppink/20 transition-all"
              >
                {filter.label}
                <button
                  onClick={() => onClearFilter(filter.key)}
                  className="hover:bg-tpppink/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {hasActiveFilters && (
              <button
                onClick={onResetAll}
                className="text-xs font-semibold text-tpppink hover:text-tpppink/80 transition-colors px-2 underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopFilters;