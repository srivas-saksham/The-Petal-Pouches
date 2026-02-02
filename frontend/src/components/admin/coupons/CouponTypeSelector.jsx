// frontend/src/components/admin/coupons/CouponTypeSelector.jsx
/**
 * Coupon Type Selector Component
 * Radio buttons for selecting coupon type with descriptions
 */

import React from 'react';
import { ShoppingCart, Package, Tag, Users, Star } from 'lucide-react';

const COUPON_TYPES = [
  {
    value: 'cart_wide',
    label: 'Cart-Wide Discount',
    description: 'Apply discount to entire cart total',
    icon: ShoppingCart,
    color: 'blue'
  },
  {
    value: 'product_specific',
    label: 'Product-Specific',
    description: 'Discount only on selected products',
    icon: Package,
    color: 'purple'
  },
  {
    value: 'bogo',
    label: 'BOGO (Buy X Get Y)',
    description: 'Buy X items, get Y items at discount',
    icon: Tag,
    color: 'green'
  },
  {
    value: 'category_based',
    label: 'Category-Based',
    description: 'Discount on entire category',
    icon: Tag,
    color: 'orange'
  },
  {
    value: 'first_order_only',
    label: 'First Order Only',
    description: 'Only for first-time customers',
    icon: Star,
    color: 'yellow'
  }
];

const CouponTypeSelector = ({ value, onChange, disabled = false }) => {
  const selectedType = COUPON_TYPES.find(type => type.value === value);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-tppslate mb-2">
        Coupon Type *
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COUPON_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;

          const colorClasses = {
            blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-blue-50/50',
            purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:bg-purple-50/50',
            green: isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:bg-green-50/50',
            orange: isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:bg-orange-50/50',
            yellow: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 hover:bg-yellow-50/50'
          };

          const iconColorClasses = {
            blue: isSelected ? 'text-blue-600' : 'text-slate-400',
            purple: isSelected ? 'text-purple-600' : 'text-slate-400',
            green: isSelected ? 'text-green-600' : 'text-slate-400',
            orange: isSelected ? 'text-orange-600' : 'text-slate-400',
            yellow: isSelected ? 'text-yellow-600' : 'text-slate-400'
          };

          return (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                colorClasses[type.color]
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="coupon_type"
                value={type.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-4 h-4 mt-1 flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${iconColorClasses[type.color]}`} />
                  <span className="text-sm font-bold text-slate-800">
                    {type.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {type.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Info Message Based on Selection */}
      {selectedType && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            {selectedType.value === 'cart_wide' && (
              <>Standard discount applied to total cart value. No additional configuration needed.</>
            )}
            {selectedType.value === 'product_specific' && (
              <>You'll need to select which products are eligible for this discount.</>
            )}
            {selectedType.value === 'bogo' && (
              <>You'll need to select eligible products and configure Buy X Get Y quantities.</>
            )}
            {selectedType.value === 'category_based' && (
              <>You'll need to select which categories are eligible for this discount.</>
            )}
            {selectedType.value === 'first_order_only' && (
              <>This coupon will only work for customers placing their first order.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponTypeSelector;