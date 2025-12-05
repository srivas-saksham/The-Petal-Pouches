// frontend/src/components/bundle-detail/FloatingSidebar/FloatingSidebar.jsx
import React from 'react';
import { ShoppingCart, Plus, Minus, Check, Trash2, Loader, AlertTriangle, Truck, MapPin, Calendar, ShieldCheck, RotateCcw, Headphones, CreditCard } from 'lucide-react';
import { formatBundlePrice } from '../../../utils/bundleHelpers';
import DeliverySection from './DeliverySection';
/**
 * FloatingSidebar - Unified Receipt-Style Sidebar
 * Single container with dotted line separators
 */
const FloatingSidebar = ({ 
  bundle, 
  stockLimit,
  isOutOfStock,
  isLowStock,
  cartItem,
  localQuantity,
  setLocalQuantity,
  onAddToCart,
  onIncrement,
  onDecrement,
  adding,
  updating,
  showRemoveConfirm,
  onRemoveClick,
  onConfirmRemove,
  onCancelRemove,
  pendingQuantity
}) => {
  const isInCart = !!cartItem;

  // Calculate estimated delivery (5-7 days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    const options = { month: 'short', day: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  // Trust badges data
  const badges = [
    { icon: ShieldCheck, title: 'Secure Checkout', color: 'text-green-600 bg-green-50' },
    { icon: RotateCcw, title: '30-Day Returns', color: 'text-blue-600 bg-blue-50' },
    { icon: Headphones, title: '24/7 Support', color: 'text-purple-600 bg-purple-50' },
    { icon: CreditCard, title: 'Safe Payments', color: 'text-tpppink bg-pink-50' }
  ];

  // Show max limit message when user tries to exceed
  const showMaxLimitMessage = stockLimit && localQuantity >= stockLimit;

  return (
    <div className="sticky top-20">
      {/* SINGLE UNIFIED CONTAINER - RECEIPT DESIGN */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
        
        {/* ==================== PRICE SECTION ==================== */}
        <div className="p-4">
          {/* Price */}
          <div className="mb-3">
            <p className="text-4xl font-bold text-tpppink mb-1">
              {formatBundlePrice(bundle.price)}
            </p>
            {bundle.original_price && bundle.original_price > bundle.price && (
              <p className="text-sm text-slate-400 line-through">
                {formatBundlePrice(bundle.original_price)} 
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-1.5 text-sm mb-3">
            {isOutOfStock ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-600 font-bold">Out of Stock</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-600 font-bold">In Stock</span>
              </>
            )}
          </div>

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 mb-3">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span className="font-bold">Only {stockLimit} left!</span>
            </div>
          )}

          {/* Cart Actions */}
          {!isInCart ? (
            <div className="space-y-2">
              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-tppslate mb-1.5 uppercase">
                  Quantity
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                    disabled={localQuantity <= 1}
                    className="w-8 h-8 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={localQuantity}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      if (stockLimit && val > stockLimit) {
                        alert(`Maximum ${stockLimit} units allowed`);
                        return;
                      }
                      setLocalQuantity(val);
                    }}
                    className="w-14 h-8 text-center text-sm font-bold border border-slate-300 rounded-md focus:ring-1 focus:ring-tpppink focus:border-tpppink text-tppslate"
                    min="1"
                    max={stockLimit || undefined}
                  />
                  <button
                    onClick={() => {
                      if (stockLimit && localQuantity >= stockLimit) {
                        alert(`Maximum ${stockLimit} units allowed`);
                        return;
                      }
                      setLocalQuantity(localQuantity + 1);
                    }}
                    disabled={stockLimit && localQuantity >= stockLimit}
                    className="w-8 h-8 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {/* Show max limit only when hit */}
                {showMaxLimitMessage && (
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Maximum {stockLimit} units allowed
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={onAddToCart}
                disabled={adding || isOutOfStock}
                className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md ${
                  isOutOfStock || adding
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-tpppink text-white hover:bg-tppslate hover:shadow-lg active:scale-[0.98] border border-tpppink hover:border-tppslate'
                }`}
              >
                {adding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* In Cart Controls */}
              <div className="bg-green-50 border border-green-500 rounded-lg p-3 relative">
                {updating && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-tppslate text-white text-xs px-2 py-0.5 rounded whitespace-nowrap z-10">
                    Syncing...
                  </div>
                )}
                
                <div className="flex items-center gap-1 mb-2">
                  <Check size={14} className="text-green-600 stroke-[3]" />
                  <span className="text-green-600 font-bold text-xs">
                    In Cart ({localQuantity})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onDecrement}
                    disabled={updating || localQuantity <= 1}
                    className="w-8 h-8 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                  >
                    <Minus size={14} />
                  </button>

                  <div className="flex-1 text-center relative bg-white rounded-md py-1.5 border border-green-600">
                    <span className="text-lg font-bold text-green-600">{localQuantity}</span>
                    {pendingQuantity !== null && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  <button
                    onClick={onIncrement}
                    disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                    className="w-8 h-8 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Show max limit message when user hits limit while in cart */}
                {showMaxLimitMessage && (
                  <p className="text-xs text-amber-600 font-medium mt-2 text-center">
                    Maximum {stockLimit} units allowed
                  </p>
                )}
              </div>

              {/* Remove Button */}
              {!showRemoveConfirm ? (
                <button
                  onClick={onRemoveClick}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-red-500 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onConfirmRemove}
                    disabled={updating}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-40"
                  >
                    {updating ? <Loader size={14} className="animate-spin mx-auto" /> : 'Confirm Remove'}
                  </button>
                  <button
                    onClick={onCancelRemove}
                    disabled={updating}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== DOTTED SEPARATOR ==================== */}
        <div className="border-t-2 border-dashed border-tpppink/50"></div>

        {/* ==================== DELIVERY SECTION ==================== */}
        <DeliverySection estimatedDate={getDeliveryDate()} />

        {/* ==================== DOTTED SEPARATOR ==================== */}
        <div className="border-t-2 border-dashed border-tpppink/50"></div>

        {/* ==================== TRUST BADGES SECTION ==================== */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide mb-3">
            Why Shop With Us
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2.5 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${badge.color}`}>
                    <Icon size={14} />
                  </div>
                  <p className="text-xs font-semibold text-tppslate leading-tight">
                    {badge.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FloatingSidebar;