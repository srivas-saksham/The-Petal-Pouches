// frontend/src/components/admin/products/ProductsGrid.jsx

import { Edit, Trash2, Copy, Package, Check } from 'lucide-react';

export default function ProductsGrid({
  products = [],
  loading = false,
  selectedIds = [],
  onSelectOne,
  onEdit,
  onDelete,
  onDuplicate,
  onManageVariants
}) {
  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-tpppeach/20 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-tppgrey">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const inStock = product.stock_quantity > 0;
          const imageUrl = product.images?.[0] || '/placeholder-product.png';

          return (
            <div
              key={product.id}
              className={`
                group relative bg-white rounded-lg border-2 transition-all duration-200
                hover:shadow-lg
                ${isSelected 
                  ? 'border-tppmint shadow-md' 
                  : 'border-tppgrey/30 hover:border-tppgrey'
                }
              `}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <label className="flex items-center justify-center w-6 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectOne(product.id, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-tppmint border-tppmint' 
                      : 'bg-white border-tppgrey group-hover:border-tppslate'
                    }
                  `}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </label>
              </div>

              {/* Stock Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${inStock 
                    ? 'bg-tppmint/20 text-tppmint' 
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  {inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Product Image */}
              <div className="aspect-square bg-tpppeach/20 rounded-t-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Title & SKU */}
                <div>
                  <h3 className="font-semibold text-tppslate text-sm line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-tppgrey">SKU: {product.sku}</p>
                  )}
                </div>

                {/* Price & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-tppslate">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.category?.name && (
                    <span className="px-2 py-1 bg-tpppeach/40 text-tppslate text-xs rounded">
                      {product.category.name}
                    </span>
                  )}
                </div>

                {/* Variants Info */}
                {product.variants && product.variants.length > 0 && (
                  <div className="text-xs text-tppgrey">
                    {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-tppgrey/20">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                             bg-tppmint/10 text-tppmint rounded-lg hover:bg-tppmint/20 
                             transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onManageVariants(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                             bg-tpppeach/40 text-tppslate rounded-lg hover:bg-tpppeach/60 
                             transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Variants
                  </button>
                  
                  <button
                    onClick={() => onDuplicate(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                             bg-tpppeach/40 text-tppslate rounded-lg hover:bg-tpppeach/60 
                             transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  
                  <button
                    onClick={() => onDelete(product.id, product.title)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                             bg-red-50 text-red-600 rounded-lg hover:bg-red-100 
                             transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}