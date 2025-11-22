// frontend/src/components/admin/products/ProductRow.jsx

import { Edit, Trash2, Copy, MoreVertical, AlertTriangle, AlertCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import ActionMenu from '../ui/ActionMenu';
import { formatCurrency, getRelativeTime } from '../../../utils/adminHelpers';
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
  // ✅ ENHANCED: More comprehensive status logic
  const getProductStatus = () => {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock <= STOCK_THRESHOLDS.LOW_STOCK) return 'low_stock';
    return 'active';
  };

  // ✅ ENHANCED: Get stock level info for display
  const getStockInfo = () => {
    if (product.stock === 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Out of Stock'
      };
    }
    if (product.stock <= STOCK_THRESHOLDS.LOW_STOCK) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Low Stock'
      };
    }
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: null,
      label: 'In Stock'
    };
  };

  const stockInfo = getStockInfo();

  const actions = [
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => onEdit(product.id),
    },
    {
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => onDuplicate(product.id),
    },
  ];

  if (product.has_variants) {
    actions.push({
      label: 'Manage Variants',
      icon: <MoreVertical className="w-4 h-4" />,
      onClick: () => onManageVariants(product.id),
    });
  }

  actions.push({ divider: true });
  actions.push({
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: () => onDelete(product.id, product.title),
    danger: true,
  });

  const displayImage = product.has_variants && product.variants?.length > 0
    ? product.variants.find(v => v.is_default)?.img_url || product.variants[0]?.img_url || product.img_url
    : product.img_url;

  return (
    <tr 
      className={`
        border-b border-border hover:bg-surface transition-colors
        ${isSelected ? 'bg-admin-peach bg-opacity-20' : ''}
      `}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="w-4 h-4 text-admin-pink rounded focus:ring-admin-pink cursor-pointer"
        />
      </td>

      {/* Image */}
      <td className="px-4 py-3">
        <div className="relative">
          <img
            src={displayImage}
            alt={product.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
          {product.has_variants && (
            <div className="absolute -bottom-1 -right-1 bg-admin-pink text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
              V
            </div>
          )}
          {/* ✅ NEW: Low stock indicator on image */}
          {product.stock > 0 && product.stock <= STOCK_THRESHOLDS.LOW_STOCK && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
          {/* ✅ NEW: Out of stock indicator on image */}
          {product.stock === 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </td>

      {/* Product Info */}
      <td className="px-4 py-3">
        <div className="min-w-0">
          <div className="font-medium text-text-primary truncate" title={product.title}>
            {product.title}
          </div>
          <div className="text-xs text-text-muted mt-1">
            SKU: {product.sku}
          </div>
          {product.has_variants && product.variants && (
            <div className="text-xs text-admin-pink mt-1">
              {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-sm text-text-secondary">
          {product.Categories?.name || 'Uncategorized'}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-text-primary">
          {formatCurrency(product.price)}
        </span>
      </td>

      {/* ✅ ENHANCED: Stock with visual indicators and tooltips */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {/* Stock number with color and icon */}
          <div className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded-full
            ${stockInfo.bgColor}
          `}>
            {stockInfo.icon && (
              <span className={stockInfo.color}>
                {stockInfo.icon}
              </span>
            )}
            <span className={`font-semibold text-sm ${stockInfo.color}`}>
              {product.stock}
            </span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={getProductStatus()} />
      </td>

      {/* Created */}
      <td className="px-4 py-3">
        <span className="text-sm text-text-muted">
          {getRelativeTime(product.created_at)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end">
          <ActionMenu actions={actions} position="bottom-right" />
        </div>
      </td>
    </tr>
  );
}