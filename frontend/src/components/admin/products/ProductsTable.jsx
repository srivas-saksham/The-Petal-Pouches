// frontend/src/components/admin/products/ProductsTable.jsx

import { useState } from 'react';
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
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '⇅';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

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

            {/* Product Info */}
            <th 
              className="cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center justify-between">
                <span>Product</span>
                <span className="text-text-muted">{getSortIcon('title')}</span>
              </div>
            </th>

            {/* Category */}
            <th>Category</th>

            {/* Price */}
            <th 
              className="cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors text-right"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end gap-2">
                <span>Price</span>
                <span className="text-text-muted">{getSortIcon('price')}</span>
              </div>
            </th>

            {/* Stock */}
            <th 
              className="cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors text-center"
              onClick={() => handleSort('stock')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Stock</span>
                <span className="text-text-muted">{getSortIcon('stock')}</span>
              </div>
            </th>

            {/* Status */}
            <th>Status</th>

            {/* Created */}
            <th 
              className="cursor-pointer hover:bg-admin-peach hover:bg-opacity-30 transition-colors"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className="text-text-muted">{getSortIcon('created_at')}</span>
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