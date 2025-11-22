// frontend/src/components/admin/products/ProductFilters.jsx

import { X, SlidersHorizontal } from 'lucide-react';

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

      {/* Horizontal Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Category
          </label>
          <select
            value={activeFilters.category_id}
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
            value={activeFilters.min_price}
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
            value={activeFilters.max_price}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            placeholder="999.99"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate placeholder:text-tppgrey/50"
          />
        </div>

        {/* Stock Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Stock Status
          </label>
          <select
            value={activeFilters.in_stock}
            onChange={(e) => onFilterChange('in_stock', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            <option value="">All Products</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-tppslate">
            Sort By
          </label>
          <select
            value={activeFilters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-tppgrey rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-tppmint focus:border-transparent
                     transition-all text-tppslate"
          >
            <option value="created_at">Newest First</option>
            <option value="-created_at">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="price">Price Low-High</option>
            <option value="-price">Price High-Low</option>
            <option value="stock_quantity">Stock Low-High</option>
            <option value="-stock_quantity">Stock High-Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters Pills */}
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
              Min: ${activeFilters.min_price}
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
              Max: ${activeFilters.max_price}
              <button
                onClick={() => onFilterChange('max_price', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFilters.in_stock !== '' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tppmint/10 text-tppmint rounded-full text-xs">
              {activeFilters.in_stock === 'true' ? 'In Stock' : 'Out of Stock'}
              <button
                onClick={() => onFilterChange('in_stock', '')}
                className="hover:bg-tppmint/20 rounded-full p-0.5 transition-colors"
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