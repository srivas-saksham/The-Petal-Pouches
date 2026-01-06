// frontend/src/components/admin/products/ProductsTable.jsx
/**
 * Products Table - Uses ProductRow components in vertical stack (like bundles)
 * No traditional table, just stacked horizontal cards
 */

import ProductRow from './ProductRow';
import { Package } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
            <div className="flex items-stretch">
              <div className="w-32 h-32 bg-slate-200"></div>
              <div className="flex-1 p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="w-48 bg-slate-100 p-3 space-y-2">
                <div className="h-8 bg-slate-200 rounded"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
                <div className="h-6 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No products found</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your filters or create a new product
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {/* Select All Header */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someSelected;
              }
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-tpppeach focus:ring-tpppeach focus:ring-offset-0 cursor-pointer checked:bg-tpppeach checked:border-tpppeach hover:border-tpppink transition-colors"
          />
          <span className="text-sm font-medium text-slate-700">
            {allSelected 
              ? `All ${products.length} products selected` 
              : someSelected 
              ? `${selectedIds.length} of ${products.length} products selected`
              : `Select all ${products.length} products`
            }
          </span>
        </div>
      )}

      {/* Product Cards */}
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
    </div>
  );
}