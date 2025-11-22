// frontend/src/components/admin/products/ProductFilters.jsx

import { X, SlidersHorizontal } from 'lucide-react';
import { PRODUCT_SORT_OPTIONS, PRODUCT_FILTERS } from '../../../utils/constants';

export default function ProductFilters({
  categories = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters
}) {
  return (
    <div className="space-y-3">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-tppslate">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-tppmint/20 text-tppmint rounded-full text-xs font-medium">
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-tppgrey hover:text-tppslate transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Horizontal Filters Grid - ✅ UPDATED: 6 columns for new filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Category
          </label>
          <select
            value={activeFilters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Min Price
          </label>
          <input
            type="number"
            value={activeFilters.min_price || ''}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate placeholder:text-tppgrey/50"
          />
        </div>

        {/* Max Price Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Max Price
          </label>
          <input
            type="number"
            value={activeFilters.max_price || ''}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            placeholder="999.99"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate placeholder:text-tppgrey/50"
          />
        </div>

        {/* ✅ UPDATED: Stock Level Filter (comprehensive with low stock option) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Stock Level
          </label>
          <select
            value={activeFilters.stock_level || ''}
            onChange={(e) => onFilterChange('stock_level', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            {PRODUCT_FILTERS.stock_level.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ NEW: Has Variants Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Product Type
          </label>
          <select
            value={activeFilters.has_variants || ''}
            onChange={(e) => onFilterChange('has_variants', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            {PRODUCT_FILTERS.has_variants.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ UPDATED: Sort Filter with all 8 options */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Sort By
          </label>
          <select
            value={activeFilters.sort || 'created_at'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ UPDATED: Active Filters Pills with better labels */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-tppgrey/30">
          <span className="text-xs text-tppgrey">Active:</span>
          
          {activeFilters.category_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              {categories.find(c => c.id === parseInt(activeFilters.category_id))?.name || 'Category'}
              <button
                onClick={() => onFilterChange('category_id', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.min_price && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              Min: ₹{activeFilters.min_price}
              <button
                onClick={() => onFilterChange('min_price', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.max_price && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              Max: ₹{activeFilters.max_price}
              <button
                onClick={() => onFilterChange('max_price', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {/* ✅ UPDATED: Stock level pill with better labels */}
          {activeFilters.stock_level && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              {PRODUCT_FILTERS.stock_level.find(opt => opt.value === activeFilters.stock_level)?.label || 'Stock Filter'}
              <button
                onClick={() => onFilterChange('stock_level', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* ✅ NEW: Has variants pill */}
          {activeFilters.has_variants && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              {PRODUCT_FILTERS.has_variants.find(opt => opt.value === activeFilters.has_variants)?.label || 'Type Filter'}
              <button
                onClick={() => onFilterChange('has_variants', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* ✅ UPDATED: Sort pill with better label */}
          {activeFilters.sort && activeFilters.sort !== 'created_at' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppslate/10 text-tppslate rounded-full text-xs">
              {PRODUCT_SORT_OPTIONS.find(opt => opt.value === activeFilters.sort)?.label || 'Custom Sort'}
              <button
                onClick={() => onFilterChange('sort', 'created_at')}
                className="hover:bg-tppslate/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}