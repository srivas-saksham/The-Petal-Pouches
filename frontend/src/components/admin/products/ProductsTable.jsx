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
        newSort = 'created_at';
      } else {
        newSort = 'title_asc';
      }
    } else if (field === 'price') {
      if (currentSort === 'price_asc') {
        newSort = 'price_desc';
      } else if (currentSort === 'price_desc') {
        newSort = 'created_at';
      } else {
        newSort = 'price_asc';
      }
    } else if (field === 'stock') {
      if (currentSort === 'stock_asc') {
        newSort = 'stock_desc';
      } else if (currentSort === 'stock_desc') {
        newSort = 'created_at';
      } else {
        newSort = 'stock_asc';
      }
    } else if (field === 'created_at') {
      if (currentSort === 'created_at') {
        newSort = 'created_at_asc';
      } else if (currentSort === 'created_at_asc') {
        newSort = 'created_at';
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

  // Format date for mobile view
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format price
  const formatPrice = (price) => {
    return price ? `₹${parseFloat(price).toFixed(2)}` : 'N/A';
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
    <>
      {/* Desktop/Tablet Table View - Hidden on mobile, SCROLLABLE on smaller screens */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="admin-table w-full">
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
                    className="w-4 h-4 rounded border-gray-300 text-tpppeach focus:ring-tpppeach focus:ring-offset-0 cursor-pointer checked:bg-tpppeach checked:border-tpppeach hover:border-tpppink transition-colors"
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
      </div>

      {/* Mobile 2-Column View ONLY - Shows on mobile screens */}
      <div className="md:hidden grid grid-cols-2 gap-3 p-3">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          // Match the same image logic as ProductRow
          const displayImage = product.has_variants && product.variants?.length > 0
            ? product.variants.find(v => v.is_default)?.img_url || product.variants[0]?.img_url || product.img_url
            : product.img_url;
          const imageUrl = displayImage || '/placeholder-product.png';
          
          return (
            <div
              key={product.id}
              className={`
                relative bg-white rounded-lg border transition-all
                ${isSelected 
                  ? 'border-tpppeach border-2 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectOne(product.id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-tpppeach focus:ring-tpppeach cursor-pointer"
                />
              </div>

              {/* Product Image */}
              <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.title || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`
                      inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full
                      ${product.is_active
                        ? 'bg-tppmint/20 text-tppmint'
                        : 'bg-gray-100 text-gray-500'
                      }
                    `}
                  >
                    {product.is_active ? '●' : '○'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-sm text-text-primary line-clamp-2 min-h-[2.5rem]">
                  {product.title}
                </h3>

                {/* Category */}
                {product.Categories && (
                  <div className="text-xs text-text-secondary truncate">
                    {product.Categories.name}
                  </div>
                )}

                {/* Price & Stock */}
                <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-text-secondary">Price</div>
                    <div className="font-bold text-tppslate">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-secondary">Stock</div>
                    <div className={`font-bold ${
                      product.stock === 0 
                        ? 'text-red-600' 
                        : product.stock < 10 
                        ? 'text-orange-600' 
                        : 'text-tppmint'
                    }`}>
                      {product.stock || 0}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-tppslate bg-tpppeach/20 hover:bg-tpppeach/30 rounded transition-colors"
                  >
                    Edit
                  </button>
                  
                  {product.has_variants && (
                    <button
                      onClick={() => onManageVariants(product.id)}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-tppslate bg-tppmint/20 hover:bg-tppmint/30 rounded transition-colors"
                      title="Manage Variants"
                    >
                      Var
                    </button>
                  )}

                  {/* More Actions */}
                  <div className="relative group">
                    <button className="p-1.5 text-text-secondary hover:text-tppslate hover:bg-gray-100 rounded transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      <button
                        onClick={() => onDuplicate(product.id)}
                        className="w-full px-3 py-2 text-left text-xs text-text-primary hover:bg-tpppeach/20 rounded-t-lg transition-colors"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => onDelete(product.id, product.title)}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}