// frontend/src/components/admin/products/ProductsTable.jsx

import ProductRow from './ProductRow';
import { SkeletonTable } from '../ui/LoadingSkeleton';

export default function ProductsTable({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onDuplicate,
  onManageVariants,
  currentSort = 'created_at',
  onSortChange,
}) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Handle column header click with 3-way sorting (default → asc → desc → default)
  const handleSort = (field) => {
    if (!onSortChange) return;

    let newSort;
    
    if (field === 'title') {
      if (currentSort === 'title_asc') {
        newSort = 'title_desc';
      } else if (currentSort === 'title_desc') {
        newSort = 'created_at'; // Reset to default
      } else {
        newSort = 'title_asc';
      }
    } else if (field === 'price') {
      if (currentSort === 'price_asc') {
        newSort = 'price_desc';
      } else if (currentSort === 'price_desc') {
        newSort = 'created_at'; // Reset to default
      } else {
        newSort = 'price_asc';
      }
    } else if (field === 'stock') {
      if (currentSort === 'stock_asc') {
        newSort = 'stock_desc';
      } else if (currentSort === 'stock_desc') {
        newSort = 'created_at'; // Reset to default
      } else {
        newSort = 'stock_asc';
      }
    } else if (field === 'created_at') {
      if (currentSort === 'created_at') {
        newSort = 'created_at_asc';
      } else if (currentSort === 'created_at_asc') {
        newSort = 'created_at'; // Reset to default (newest first)
      } else {
        newSort = 'created_at';
      }
    }
    
    onSortChange(newSort);
  };

  // Get sort icon for a field
  const getSortIcon = (field) => {
    if (field === 'title') {
      if (currentSort === 'title_asc') return '↑';
      if (currentSort === 'title_desc') return '↓';
    } else if (field === 'price') {
      if (currentSort === 'price_asc') return '↑';
      if (currentSort === 'price_desc') return '↓';
    } else if (field === 'stock') {
      if (currentSort === 'stock_asc') return '↑';
      if (currentSort === 'stock_desc') return '↓';
    } else if (field === 'created_at') {
      if (currentSort === 'created_at') return '↓';
      if (currentSort === 'created_at_asc') return '↑';
    }
    return '⇅';
  };

  // Check if a field is currently sorted
  const isSorted = (field) => {
    if (field === 'title') return currentSort === 'title_asc' || currentSort === 'title_desc';
    if (field === 'price') return currentSort === 'price_asc' || currentSort === 'price_desc';
    if (field === 'stock') return currentSort === 'stock_asc' || currentSort === 'stock_desc';
    if (field === 'created_at') return currentSort === 'created_at' || currentSort === 'created_at_asc';
    return false;
  };

  if (loading) {
    return <SkeletonTable rows={10} columns={9} />;
  }

  if (products.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
        <p className="text-text-secondary text-sm">
          Try adjusting your filters or create a new product
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {/* Select All Checkbox */}
            <th className="w-12">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-admin-pink rounded focus:ring-admin-pink cursor-pointer"
              />
            </th>

            {/* Image */}
            <th className="w-20">Image</th>

            {/* Product Info - Sortable */}
            <th 
              className={`cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors ${
                isSorted('title') ? 'bg-admin-peach bg-opacity-20' : ''
              }`}
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center justify-between">
                <span>Product</span>
                <span className={`${isSorted('title') ? 'text-admin-pink' : 'text-text-muted'}`}>
                  {getSortIcon('title')}
                </span>
              </div>
            </th>

            {/* Category */}
            <th>Category</th>

            {/* Price - Sortable */}
            <th 
              className={`cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors text-right ${
                isSorted('price') ? 'bg-admin-peach bg-opacity-20' : ''
              }`}
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end gap-2">
                <span>Price</span>
                <span className={`${isSorted('price') ? 'text-admin-pink' : 'text-text-muted'}`}>
                  {getSortIcon('price')}
                </span>
              </div>
            </th>

            {/* Stock - Sortable */}
            <th 
              className={`cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors text-center ${
                isSorted('stock') ? 'bg-admin-peach bg-opacity-20' : ''
              }`}
              onClick={() => handleSort('stock')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Stock</span>
                <span className={`${isSorted('stock') ? 'text-admin-pink' : 'text-text-muted'}`}>
                  {getSortIcon('stock')}
                </span>
              </div>
            </th>

            {/* Status */}
            <th>Status</th>

            {/* Created - Sortable */}
            <th 
              className={`cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors ${
                isSorted('created_at') ? 'bg-admin-peach bg-opacity-20' : ''
              }`}
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className={`${isSorted('created_at') ? 'text-admin-pink' : 'text-text-muted'}`}>
                  {getSortIcon('created_at')}
                </span>
              </div>
            </th>

            {/* Actions */}
            <th className="w-16 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isSelected={selectedIds.includes(product.id)}
              onSelect={onSelectOne}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onManageVariants={onManageVariants}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}