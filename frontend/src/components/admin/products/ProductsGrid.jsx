// frontend/src/components/admin/products/ProductsGrid.jsx

import { Edit, Trash2, Copy, Package, Check, AlertTriangle, AlertCircle, DiamondPercent } from 'lucide-react';
import { STOCK_THRESHOLDS } from '../../../utils/constants';

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

  // ✅ ENHANCED: Get stock info for display
  const getStockInfo = (stock) => {
    if (stock === 0) {
      return {
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        label: 'Out of Stock',
        inStock: false
      };
    }
    if (stock <= STOCK_THRESHOLDS.LOW_STOCK) {
      return {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: `Low Stock (${stock})`,
        inStock: true
      };
    }
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <DiamondPercent className="w-3.5 h-3.5" />,
      label: `${stock} in stock`,
      inStock: true
    };
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          
          // ✅ FIX: Use correct field name from API (stock, not stock_quantity)
          const stock = product.stock || 0;
          const stockInfo = getStockInfo(stock);
          
          // ✅ FIX: Handle both has_variants products and regular products
          const displayImage = product.has_variants && product.variants?.length > 0
            ? product.variants.find(v => v.is_default)?.img_url || product.variants[0]?.img_url || product.img_url
            : product.img_url;

          // ✅ FIX: Get variant count from either variants array or variant_count field
          const variantCount = product.variants?.length || product.variant_count || 0;

          return (
            <div
              key={product.id}
              className={`
                group relative bg-white rounded-lg border-2 transition-all duration-200
                hover:shadow-lg border-2 transition-all duration-200 hover:border-tppslate hover:shadow-sm hover:bg-tppslate/5
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
                  {/* <div className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-tppmint border-tppmint' 
                      : 'bg-white border-tppgrey group-hover:border-tppslate'
                    }
                  `}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div> */}
                </label>
              </div>

              {/* ✅ MOVED: Warning icons to top-right */}
              {(stock === 0 || stock <= STOCK_THRESHOLDS.LOW_STOCK) && (
                <div className="absolute top-3 right-3 z-10">
                  <div className={`
                    rounded-full p-1.5 shadow-lg
                    ${stock === 0 ? 'bg-red-500' : 'bg-yellow-500'}
                  `}>
                    {stock === 0 ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Product Image */}
              <div className="relative aspect-square bg-tpppeach/20 rounded-t-lg overflow-hidden">
                <img
                  src={displayImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
                
                {/* ✅ FIXED: Variant badge on image with correct count */}
                {product.has_variants && variantCount > 0 && (
                  <div className="absolute bottom-2 left-2 bg-tppslate text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {variantCount} Variant{variantCount !== 1 ? 's' : ''}
                  </div>
                )}

                {/* ✅ NEW: Out of stock overlay on image */}
                {stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      OUT OF STOCK
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* ✅ ENHANCED: Title with Stock Status on the right */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-tppslate text-sm line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-tppslate/50">SKU: {product.sku}</p>
                    )}
                  </div>
                  
                  {/* ✅ MOVED: Stock badge next to title */}
                  <span className={`
                    flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0
                    ${stockInfo.bgColor} ${stockInfo.color}
                  `}>
                    {stockInfo.icon}
                    {stock === 0 ? 'Out' : stock <= STOCK_THRESHOLDS.LOW_STOCK ? `Low (${stock})` : `In ${stock}`}
                  </span>
                </div>

                {/* Price & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-tppslate">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                  {/* ✅ FIX: Use correct API field (Categories, not category) */}
                  {product.Categories?.name && (
                    <span className="px-2 py-1 bg-tpppeach/40 text-tppslate text-xs rounded">
                      {product.Categories.name}
                    </span>
                  )}
                </div>

                {/* ✅ FIXED: Variants Info with correct count */}
                {product.has_variants && variantCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-tppslate bg-tpppeach/20 px-2 py-1 rounded">
                    <Package className="w-3 h-3" />
                    <span>
                      {variantCount} variant{variantCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-tppgrey/20">
                  {/* ✅ CHANGED: Edit button now matches other action buttons */}
                  <button
                    onClick={() => onEdit(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                             bg-tpppeach/40 text-tppslate rounded-lg hover:bg-tpppeach/60 
                             transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  
                  {/* ✅ CHANGED: Variants/No Variants buttons with swapped styling */}
                  {product.has_variants ? (
                    <button
                      onClick={() => onManageVariants(product.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                               bg-tpppeach/40 text-tppslate rounded-lg hover:bg-tpppeach/60 
                               transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Variants
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs
                               bg-tppmint/20 text-tppslate/60 rounded-lg cursor-not-allowed"
                    >
                      <Package className="w-3.5 h-3.5" />
                      No Variants
                    </button>
                  )}
                  
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