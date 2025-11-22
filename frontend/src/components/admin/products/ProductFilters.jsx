// frontend/src/components/admin/products/ProductFilters.jsx

import { X } from 'lucide-react';

export default function ProductFilters({
  categories = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  className = '',
}) {
  const activeCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== '' && activeFilters[key] !== null
  ).length;

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  const handleClear = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-admin-pink hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Category
        </label>
        <select
          value={activeFilters.category_id || ''}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
          className="form-input w-full text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Status
        </label>
        <select
          value={activeFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="form-input w-full text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Stock
        </label>
        <select
          value={activeFilters.stock || ''}
          onChange={(e) => handleFilterChange('stock', e.target.value)}
          className="form-input w-full text-sm"
        >
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock (&lt; 10)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={activeFilters.min_price || ''}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            className="form-input w-full text-sm"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={activeFilters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            className="form-input w-full text-sm"
            min="0"
          />
        </div>
      </div>

      {/* Has Variants Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeFilters.has_variants === 'true'}
            onChange={(e) =>
              handleFilterChange('has_variants', e.target.checked ? 'true' : '')
            }
            className="w-4 h-4 text-admin-pink rounded focus:ring-admin-pink"
          />
          <span className="text-sm text-text-primary">Has Variants</span>
        </label>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Sort By
        </label>
        <select
          value={activeFilters.sort || 'created_at'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="form-input w-full text-sm"
        >
          <option value="created_at">Newest First</option>
          <option value="title_asc">Name: A to Z</option>
          <option value="title_desc">Name: Z to A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="stock_asc">Stock: Low to High</option>
          <option value="stock_desc">Stock: High to Low</option>
        </select>
      </div>
    </div>
  );
}