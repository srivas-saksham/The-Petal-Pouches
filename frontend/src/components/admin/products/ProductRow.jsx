// frontend/src/components/admin/products/ProductRow.jsx
/**
 * Product Row - Full Width Horizontal Layout with Multi-Image Support
 * Now displays primary image from Product_images table
 */

import { 
  Edit, Copy, Trash2, Package, Hash, Calendar, Clock,
  AlertCircle, CheckCircle, AlertTriangle
} from 'lucide-react';
import React from 'react';
import { STOCK_THRESHOLDS } from '../../../utils/constants';

export default function ProductRow({ 
  product, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onManageVariants 
}) {
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  // ==================== UTILITY FUNCTIONS ====================
  
  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStockStatus = () => {
    const stock = product.stock || 0;
    
    if (stock === 0) {
      return {
        label: 'OUT OF STOCK',
        shortLabel: 'Out',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertCircle,
        available: false
      };
    } else if (stock <= STOCK_THRESHOLDS.LOW_STOCK) {
      return {
        label: `LOW STOCK`,
        shortLabel: 'Low',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        available: true
      };
    } else {
      return {
        label: `IN STOCK`,
        shortLabel: 'Stock',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        available: true
      };
    }
  };

  // ✅ NEW: Calculate margin info
  const getMarginInfo = () => {
    const costPrice = product.cost_price || 0;
    const sellingPrice = product.price || 0;
    
    if (costPrice === 0 || sellingPrice === 0) {
      return null;
    }
    
    const profit = sellingPrice - costPrice;
    const margin = ((profit / sellingPrice) * 100).toFixed(1);
    
    return {
      costPrice,
      sellingPrice,
      profit,
      margin,
      hasMargin: true
    };
  };

  // ✅ NEW: Get display image with primary image priority
  const getDisplayImage = () => {
    // Priority 1: Primary image from Product_images table
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary);
      if (primaryImage && primaryImage.img_url) {
        return primaryImage.img_url;
      }
      // Fallback to first image if no primary is set
      if (product.images[0] && product.images[0].img_url) {
        return product.images[0].img_url;
      }
    }

    // Priority 2: For variant products, use default variant image
    if (hasVariants && product.variants?.length > 0) {
      const defaultVariant = product.variants.find(v => v.is_default);
      if (defaultVariant && defaultVariant.img_url) {
        return defaultVariant.img_url;
      }
      // Fallback to first variant image
      if (product.variants[0] && product.variants[0].img_url) {
        return product.variants[0].img_url;
      }
    }

    // Priority 3: Legacy img_url field
    if (product.img_url) {
      return product.img_url;
    }

    // No image available
    return null;
  };

  // ==================== COMPONENT DATA ====================
  
  const stockStatus = getStockStatus();
  const marginInfo = getMarginInfo();
  const productId = product.id?.substring(0, 8).toUpperCase() || '#N/A';
  const StockIcon = stockStatus.icon;
  const hasVariants = product.has_variants;
  const variantCount = product.variants?.length || 0;
  const displayImage = getDisplayImage();

  // ✅ NEW: Get total image count
  const imageCount = product.images?.length || 0;

  // ==================== RENDER ====================

  return (
    <div className={`bg-white rounded-lg border overflow-hidden group transition-all ${
      !stockStatus.available ? 'border-red-300 hover:border-red-400' : 
      isSelected ? 'border-tpppink border-2 shadow-md' :
      'border-tppslate/10 hover:border-tpppink/30 hover:shadow-md'
    }`}>
      <div className="flex items-stretch">
        
        {/* ==================== IMAGE SECTION (Fixed Width 1:1 Ratio) ==================== */}
        <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
              
              {/* ✅ NEW: Image Count Badge (if multiple images) */}
              {imageCount > 1 && (
                <div className="absolute top-2 left-2 bg-tppslate/90 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-lg backdrop-blur-sm">
                  {imageCount} photos
                </div>
              )}

              {/* Variant Badge */}
              {hasVariants && variantCount > 0 && (
                <div className="absolute top-2 right-2 bg-tppslate text-white px-1.5 py-0.5 rounded text-[11px] font-bold uppercase shadow-lg flex items-center gap-0.5">
                  <Package className="w-2.5 h-2.5" />
                  {variantCount}
                </div>
              )}

              {/* Stock Warning Badge */}
              {!stockStatus.available && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold text-center">
                    {stockStatus.label}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-tppslate/20" />
            </div>
          )}
        </div>

        {/* ==================== MAIN CONTENT (Flexible Width) ==================== */}
        <div className="flex-1 flex items-center gap-4 p-4">
          
          {/* LEFT: Product Info */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center gap-3 mb-2">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(product.id, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-tpppeach focus:ring-tpppeach focus:ring-offset-0 cursor-pointer checked:bg-tpppeach checked:border-tpppeach hover:border-tpppink transition-colors"
              />

              {/* Product ID */}
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-tppslate/70" />
                <span className="text-xs font-bold text-tppslate">{productId}</span>
              </div>
              
              {/* Separator */}
              <span className="text-tppslate/30">•</span>
              
              {/* Created Date */}
              <div className="flex items-center gap-1 text-[10px] text-tppslate/70">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(product.created_at)}</span>
              </div>

              {/* Updated Date (if different) */}
              {product.updated_at && product.updated_at !== product.created_at && (
                <>
                  <span className="text-tppslate/30">•</span>
                  <div className="flex items-center gap-1 text-[10px] text-tppslate/70">
                    <Clock className="w-3 h-3" />
                    <span>Updated {formatDate(product.updated_at)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-tppslate mb-1 line-clamp-1">
              {product.title}
            </h2>

            {/* Description or SKU */}
            <div className="flex items-center gap-3 text-xs text-tppslate/70">
              <span>SKU: {product.sku}</span>
              
              {product.Categories?.name && (
                <>
                  <span className="text-tppslate/30">•</span>
                  <span className="px-1.5 py-0.5 rounded font-semibold bg-tppslate/10 text-tppslate">
                    {product.Categories.name}
                  </span>
                </>
              )}

              {hasVariants && variantCount > 0 && (
                <>
                  <span className="text-tppslate/30">•</span>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span className="font-semibold">{variantCount}</span>
                    <span>variant{variantCount !== 1 ? 's' : ''}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CENTER: Pricing Info */}
          <div className="flex items-center gap-3 px-4 border-l border-r border-tppslate/10">
            {marginInfo ? (
              <>
                {/* Cost Price */}
                <div className="text-center">
                  <div className="text-[10px] text-tppslate/70 uppercase tracking-wide mb-0.5">Cost Price</div>
                  <div className="text-sm font-bold text-tppslate line-through">{formatCurrency(marginInfo.costPrice)}</div>
                </div>

                {/* Arrow */}
                <div className="text-tpppink">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Selling Price */}
                <div className="text-center">
                  <div className="text-[10px] text-tpppink uppercase tracking-wide mb-0.5">Selling Price</div>
                  <div className="text-lg font-bold text-tpppink">{formatCurrency(marginInfo.sellingPrice)}</div>
                </div>

                {/* Margin */}
                <div className="text-tppslate/30">•</div>
                <div className="text-center">
                  <div className="text-[10px] text-green-600 uppercase tracking-wide mb-0.5">Margin</div>
                  <div className="text-sm font-bold text-green-600">
                    {marginInfo.margin}%
                  </div>
                </div>

                {/* Profit */}
                <div className="text-tppslate/30">•</div>
                <div className="text-center">
                  <div className="text-[10px] text-tppslate/70 uppercase tracking-wide mb-0.5">Profit</div>
                  <div className="text-sm font-bold text-tppslate">
                    {formatCurrency(marginInfo.profit)}
                  </div>
                </div>
              </>
            ) : (
              /* No cost price - just show selling price */
              <div className="text-center">
                <div className="text-[10px] text-tppslate/70 uppercase tracking-wide mb-0.5">Price</div>
                <div className="text-lg font-bold text-tppslate">{formatCurrency(product.price)}</div>
              </div>
            )}
          </div>

          {/* RIGHT: Stock & Status */}
          <div className="flex items-center gap-2 px-4 border-r border-tppslate/10">
            {/* Stock Status */}
            <div className={`${stockStatus.bgColor} rounded px-3 py-2 border ${stockStatus.borderColor} min-w-[100px] text-center`}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <StockIcon className={`w-3.5 h-3.5 ${stockStatus.textColor}`} />
                <span className={`text-[10px] uppercase tracking-wide font-bold ${stockStatus.textColor}`}>
                  {stockStatus.label}
                </span>
              </div>
              <div className={`text-lg font-bold ${stockStatus.textColor}`}>
                {product.stock || 0}
              </div>
              <div className={`text-[9px] ${stockStatus.textColor} opacity-80`}>
                units
              </div>
            </div>
          </div>
        </div>

        {/* ==================== ACTIONS SECTION (Fixed Width) ==================== */}
        <div className="w-48 flex-shrink-0 bg-gradient-to-br from-gray-50 to-white border-l border-tppslate/10 p-3 flex flex-col justify-center gap-1.5">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(product.id)}
            className="w-full px-3 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Product
          </button>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Variants or Duplicate */}
            {hasVariants ? (
              <button
                onClick={() => onManageVariants(product.id)}
                className="px-2 py-1.5 bg-blue-100 text-blue-700 text-[10px] rounded hover:bg-blue-200 font-semibold transition-all flex items-center justify-center gap-1"
                title="Manage Variants"
              >
                <Package className="w-3 h-3" />
                Variants
              </button>
            ) : (
              <button
                disabled
                className="px-2 py-1.5 bg-gray-100 text-gray-400 text-[10px] rounded cursor-not-allowed font-semibold flex items-center justify-center gap-1"
                title="No Variants"
              >
                <Package className="w-3 h-3" />
                No Var
              </button>
            )}

            {/* Duplicate */}
            <button
              onClick={() => onDuplicate(product.id)}
              className="px-2 py-1.5 bg-blue-100 text-blue-700 text-[10px] rounded hover:bg-blue-200 font-semibold transition-all flex items-center justify-center gap-1"
              title="Duplicate Product"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-3 py-1.5 bg-white border border-red-300 text-red-600 text-[10px] rounded hover:bg-red-50 font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onDelete(product.id, product.title);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-[10px] font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== EXPANDABLE VARIANTS SECTION (Optional) ==================== */}
      {hasVariants && variantCount > 0 && (
        <details className="group/details border-t border-tppslate/10">
          <summary className="px-4 py-2 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer transition-colors flex items-center justify-between text-xs font-semibold text-tppslate">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              <span>View {variantCount} Variant{variantCount !== 1 ? 's' : ''}</span>
            </div>
            <svg className="w-4 h-4 transition-transform group-open/details:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 py-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {product.variants?.map((variant, idx) => {
                const variantImage = variant.img_url || displayImage;
                
                return (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-tppslate/10 rounded-lg p-2 hover:border-tpppink/30 transition-all">
                    {/* Small Variant Image */}
                    <div className="w-12 h-12 flex-shrink-0 rounded bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                      {variantImage ? (
                        <img
                          src={variantImage}
                          alt={variant.color || 'Variant'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-tppslate/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Variant Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-tppslate truncate">
                        {variant.color || 'Default'}
                      </div>
                      {variant.sku && (
                        <div className="text-[10px] text-tppslate/70 truncate">
                          SKU: {variant.sku}
                        </div>
                      )}
                      <div className="text-[10px] text-tppslate/70 mt-0.5">
                        Stock: <span className="font-semibold text-tppslate">{variant.stock || 0}</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-tppslate">
                        {formatCurrency(variant.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}