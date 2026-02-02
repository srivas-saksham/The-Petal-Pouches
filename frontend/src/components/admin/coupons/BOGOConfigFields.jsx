// frontend/src/components/admin/coupons/BOGOConfigFields.jsx
/**
 * BOGO Configuration Fields Component
 * Input fields for Buy X Get Y quantities and discount percentage
 */

import React from 'react';
import { Gift, Percent, Info } from 'lucide-react';

const BOGOConfigFields = ({ 
  buyQuantity = 1,
  getQuantity = 1,
  discountPercent = 100,
  onBuyQuantityChange,
  onGetQuantityChange,
  onDiscountPercentChange,
  disabled = false 
}) => {
  
  // Calculate example savings
  const examplePrice = 199;
  const totalItems = buyQuantity + getQuantity;
  const regularTotal = examplePrice * totalItems;
  const discountedTotal = (examplePrice * buyQuantity) + (examplePrice * getQuantity * (100 - discountPercent) / 100);
  const savings = regularTotal - discountedTotal;
  const savingsPercent = ((savings / regularTotal) * 100).toFixed(0);

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-green-600" />
        <h3 className="text-sm font-bold text-green-800">
          BOGO Offer Configuration
        </h3>
      </div>

      {/* Buy Quantity */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Buy Quantity (X) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="99"
            value={buyQuantity}
            onChange={(e) => onBuyQuantityChange(parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm font-semibold"
            placeholder="e.g., 3"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
            items
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Customer must buy this many eligible items
        </p>
      </div>

      {/* Get Quantity */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Get Quantity (Y) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="99"
            value={getQuantity}
            onChange={(e) => onGetQuantityChange(parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm font-semibold"
            placeholder="e.g., 2"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
            items
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Customer receives this many items at discount
        </p>
      </div>

      {/* Discount Percentage Slider */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Discount on Free Items
        </label>
        
        {/* Slider */}
        <div className="relative pt-2 pb-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={discountPercent}
            onChange={(e) => onDiscountPercentChange(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-green"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${discountPercent}%, #e2e8f0 ${discountPercent}%, #e2e8f0 100%)`
            }}
          />
          
          {/* Percentage Display */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <Percent className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {discountPercent}%
            </span>
            <span className="text-sm text-slate-600">
              {discountPercent === 100 ? 'FREE' : 'OFF'}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2 mt-3 justify-center">
            {[50, 75, 100].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => onDiscountPercentChange(preset)}
                disabled={disabled}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  discountPercent === preset
                    ? 'bg-green-600 text-white'
                    : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">
          {discountPercent === 100 && "Customer gets items completely free"}
          {discountPercent > 0 && discountPercent < 100 && `Customer pays ${100 - discountPercent}% of the price`}
          {discountPercent === 0 && "No discount applied (not recommended for BOGO)"}
        </p>
      </div>

      {/* Example Calculation */}
      <div className="mt-4 p-3 bg-white border-2 border-green-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-800 mb-1">
              Example Calculation
            </p>
            <div className="space-y-1 text-xs text-slate-700">
              <p>
                <span className="font-semibold">Offer:</span> Buy {buyQuantity} Get {getQuantity} at {discountPercent}% off
              </p>
              <p>
                <span className="font-semibold">Item Price:</span> ₹{examplePrice} each
              </p>
              <p className="pt-1 border-t border-slate-200">
                <span className="font-semibold">Total Items:</span> {totalItems} ({buyQuantity} paid + {getQuantity} discounted)
              </p>
              <p>
                <span className="font-semibold">Regular Total:</span> ₹{regularTotal}
              </p>
              <p>
                <span className="font-semibold">Discounted Total:</span> ₹{Math.round(discountedTotal)}
              </p>
              <p className="pt-1 border-t border-green-200">
                <span className="font-bold text-green-700">Customer Saves:</span>{' '}
                <span className="font-bold text-green-700">
                  ₹{Math.round(savings)} ({savingsPercent}% off)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 How it works:</span> Customer adds {buyQuantity + getQuantity} or more eligible items to cart. 
          The {getQuantity} cheapest item(s) will receive {discountPercent}% discount automatically.
        </p>
      </div>
    </div>
  );
};

export default BOGOConfigFields;