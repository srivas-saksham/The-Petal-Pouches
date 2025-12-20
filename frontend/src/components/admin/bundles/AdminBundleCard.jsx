// frontend/src/components/admin/bundles/AdminBundleCard.jsx
/**
 * Admin Bundle Card - Full Width Horizontal Layout
 * Clean, compact design with all information organized horizontally
 */

import { 
  Edit, Copy, Power, Trash2, Package, Tag, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Archive, Calendar, Clock, Hash, DollarSign
} from 'lucide-react';
import React from 'react';

export default function AdminBundleCard({ bundle, onEdit, onDelete, onToggle, onDuplicate }) {
  
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
    const stock = bundle.stock_limit || 0;
    
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
    } else if (stock <= 3) {
      return {
        label: `LOW STOCK`,
        shortLabel: 'Low',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertCircle,
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

  const getPricingType = () => {
    if (bundle.discount_percent) {
      return {
        type: 'DISCOUNT',
        value: bundle.discount_percent,
        label: 'OFF',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: TrendingDown
      };
    } else if (bundle.markup_percent) {
      return {
        type: 'MARKUP',
        value: bundle.markup_percent,
        label: 'MARGIN',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: TrendingUp
      };
    }
    return null;
  };

  const getSavings = () => {
    return bundle.original_price - bundle.price;
  };

  // ==================== COMPONENT DATA ====================
  
  const stockStatus = getStockStatus();
  const pricingType = getPricingType();
  const savings = getSavings();
  const bundleId = bundle.id?.substring(0, 8).toUpperCase() || '#N/A';
  const itemCount = bundle.Bundle_items?.length || 0;
  const isActive = bundle.is_active;
  const StockIcon = stockStatus.icon;
  const PricingIcon = pricingType?.icon;

  // Parse tags
  const tags = Array.isArray(bundle.tags) ? bundle.tags : 
              (typeof bundle.tags === 'string' ? JSON.parse(bundle.tags || '[]') : []);
  const primaryTag = bundle.primary_tag || tags[0] || 'general';

  // ==================== RENDER ====================

  return (
    <div className={`bg-white rounded-lg border overflow-hidden group transition-all ${
      !isActive ? 'border-gray-300' : 
      !stockStatus.available ? 'border-red-300 hover:border-red-400' : 
      'border-tppslate/10 hover:border-tpppink/30 hover:shadow-md'
    }`}>
      <div className="flex items-stretch">
        
        {/* ==================== IMAGE SECTION (Fixed Width 1:1 Ratio) ==================== */}
        <div className={`w-32 h-32 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ${
          !isActive ? 'opacity-60' : ''
        }`}>
          {bundle.img_url ? (
            <>
              <img
                src={bundle.img_url}
                alt={bundle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Pricing Badge */}
              {pricingType && (
                <div className={`absolute top-2 right-2 ${pricingType.bgColor} ${pricingType.color} px-1.5 py-0.5 rounded text-[12px] font-bold uppercase shadow-lg flex items-center gap-0.5`}>
                  <PricingIcon className="w-2.5 h-2.5" />
                  {pricingType.value}%
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
        <div className={`flex-1 flex items-center gap-4 p-4 ${
          !isActive ? 'opacity-60' : ''
        }`}>
          
          {/* LEFT: Bundle Info */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center gap-3 mb-2">
              {/* Bundle ID */}
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-tppslate/70" />
                <span className="text-xs font-bold text-tppslate">{bundleId}</span>
              </div>
              
              {/* Separator */}
              <span className="text-tppslate/30">•</span>
              
              {/* Created Date */}
              <div className="flex items-center gap-1 text-[10px] text-tppslate/70">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(bundle.created_at)}</span>
              </div>

              {/* Updated Date (if different) */}
              {bundle.updated_at && bundle.updated_at !== bundle.created_at && (
                <>
                  <span className="text-tppslate/30">•</span>
                  <div className="flex items-center gap-1 text-[10px] text-tppslate/70">
                    <Clock className="w-3 h-3" />
                    <span>Updated {formatDate(bundle.updated_at)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-tppslate mb-1 line-clamp-1">
              {bundle.title}
            </h2>

            {/* Description */}
            {bundle.description && (
              <p className="text-xs text-tppslate/70 mb-2 line-clamp-1">
                {bundle.description}
              </p>
            )}

            {/* Tags & Products */}
            <div className="flex items-center gap-3">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-tppslate/70" />
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className={`font-inter text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          tag === primaryTag
                            ? 'bg-tpppink text-white'
                            : 'bg-tppslate/10 text-tppslate'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-[10px] text-tppslate/70">+{tags.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Separator */}
              {tags.length > 0 && <span className="text-tppslate/30">•</span>}

              {/* Products Count */}
              <div className="flex items-center gap-1 text-xs text-tppslate/70">
                <Package className="w-3 h-3" />
                <span className="font-semibold">{itemCount}</span>
                <span>products</span>
              </div>
            </div>
          </div>

          {/* CENTER: Pricing Info */}
          <div className="flex items-center gap-3 px-4 border-l border-r border-tppslate/10">
            {/* Original Price */}
            <div className="text-center">
              <div className="text-[10px] text-tppslate/70 uppercase tracking-wide mb-0.5">Original</div>
              <div className="text-sm font-bold text-tppslate line-through">{formatCurrency(bundle.original_price)}</div>
            </div>

            {/* Arrow */}
            <div className="text-tpppink">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Bundle Price */}
            <div className="text-center">
              <div className="text-[10px] text-tpppink uppercase tracking-wide mb-0.5">Bundle Price</div>
              <div className="text-lg font-bold text-tpppink">{formatCurrency(bundle.price)}</div>
            </div>

            {/* Savings/Margin */}
            {pricingType && (
              <>
                <div className="text-tppslate/30">•</div>
                <div className="text-center">
                  <div className={`text-[10px] uppercase tracking-wide mb-0.5 ${pricingType.color}`}>
                    {pricingType.type === 'DISCOUNT' ? 'Discount' : 'Margin'}
                  </div>
                  <div className={`text-sm font-bold ${pricingType.color}`}>
                    {formatCurrency(Math.abs(savings))}
                  </div>
                </div>
              </>
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
                {bundle.stock_limit || 0}
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
            onClick={() => onEdit(bundle.id)}
            className="w-full px-3 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Bundle
          </button>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Toggle Active */}
            <button
              onClick={() => onToggle(bundle.id)}
              className={`px-2 py-1.5 text-[10px] rounded font-semibold transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title={isActive ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-3 h-3" />
              {isActive ? 'Off' : 'On'}
            </button>

            {/* Duplicate */}
            <button
              onClick={() => onDuplicate(bundle.id)}
              className="px-2 py-1.5 bg-blue-100 text-blue-700 text-[10px] rounded hover:bg-blue-200 font-semibold transition-all flex items-center justify-center gap-1"
              title="Duplicate Bundle"
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
                  onDelete(bundle.id, bundle.title);
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

      {/* ==================== EXPANDABLE PRODUCTS SECTION (Optional) ==================== */}
      {itemCount > 0 && (
        <details className="group/details border-t border-tppslate/10">
          <summary className="px-4 py-2 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer transition-colors flex items-center justify-between text-xs font-semibold text-tppslate">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              <span>View {itemCount} Products in Bundle</span>
            </div>
            <svg className="w-4 h-4 transition-transform group-open/details:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 py-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {bundle.Bundle_items?.map((item, idx) => {
                const product = item.Products;
                const variant = item.Product_variants;
                const itemPrice = variant?.price || product?.price || 0;
                const productImage = variant?.img_urls?.[0] || product?.img_urls?.[0] || product?.img_url;
                
                return (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-tppslate/10 rounded-lg p-2 hover:border-tpppink/30 transition-all">
                    {/* Small Product Image */}
                    <div className="w-12 h-12 flex-shrink-0 rounded bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product?.title || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-tppslate/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-tppslate truncate">
                        {product?.title || 'Unknown Product'}
                      </div>
                      {variant?.color && (
                        <div className="text-[10px] text-tppslate/70 truncate">
                          {variant.color}
                        </div>
                      )}
                      <div className="text-[10px] text-tppslate/70 mt-0.5">
                        Qty: <span className="font-semibold text-tppslate">{item.quantity}</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-tppslate">
                        {formatCurrency(itemPrice * item.quantity)}
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