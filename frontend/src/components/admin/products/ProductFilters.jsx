// frontend/src/components/admin/products/ProductFilters.jsx
/**
 * Product Filters Component
 * Maintains all existing filter functionality with enhanced styling
 */

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
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Horizontal Filters Grid - 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Category
          </label>
          <select
            value={activeFilters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 cursor-pointer
                     appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                     bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
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
          <label className="block text-xs font-medium text-slate-700">
            Min Price
          </label>
          <input
            type="number"
            value={activeFilters.min_price || ''}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Max Price Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Max Price
          </label>
          <input
            type="number"
            value={activeFilters.max_price || ''}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            placeholder="999.99"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Stock Level Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Stock Level
          </label>
          <select
            value={activeFilters.stock_level || ''}
            onChange={(e) => onFilterChange('stock_level', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 cursor-pointer
                     appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                     bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            {PRODUCT_FILTERS.stock_level.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Has Variants Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Product Type
          </label>
          <select
            value={activeFilters.has_variants || ''}
            onChange={(e) => onFilterChange('has_variants', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 cursor-pointer
                     appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                     bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            {PRODUCT_FILTERS.has_variants.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter with all 8 options */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Sort By
          </label>
          <select
            value={activeFilters.sort || 'created_at'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                     hover:border-pink-400 hover:shadow-sm hover:bg-pink-50/50
                     transition-all duration-200 text-slate-700 cursor-pointer
                     appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                     bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Pills with better labels */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-300">
          <span className="text-xs text-slate-600 font-medium">Active:</span>
          
          {activeFilters.category_id && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
              {categories.find(c => c.id === parseInt(activeFilters.category_id))?.name || 'Category'}
              <button
                onClick={() => onFilterChange('category_id', '')}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.min_price && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
              Min: ₹{activeFilters.min_price}
              <button
                onClick={() => onFilterChange('min_price', '')}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.max_price && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
              Max: ₹{activeFilters.max_price}
              <button
                onClick={() => onFilterChange('max_price', '')}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.stock_level && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
              {PRODUCT_FILTERS.stock_level.find(opt => opt.value === activeFilters.stock_level)?.label || 'Stock Filter'}
              <button
                onClick={() => onFilterChange('stock_level', '')}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.has_variants && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
              {PRODUCT_FILTERS.has_variants.find(opt => opt.value === activeFilters.has_variants)?.label || 'Type Filter'}
              <button
                onClick={() => onFilterChange('has_variants', '')}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.sort && activeFilters.sort !== 'created_at' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-300">
              {PRODUCT_SORT_OPTIONS.find(opt => opt.value === activeFilters.sort)?.label || 'Custom Sort'}
              <button
                onClick={() => onFilterChange('sort', 'created_at')}
                className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
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