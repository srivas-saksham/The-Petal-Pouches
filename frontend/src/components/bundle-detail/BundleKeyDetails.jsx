// frontend/src/components/bundle-detail/BundleKeyDetails.jsx
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, Trash2, Loader, AlertTriangle, Package, ChevronDown } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';

/**
 * BundleKeyDetails - Right side content with price, cart, description, and products
 * Flows naturally with BundleImageGallery on the left
 */
const BundleKeyDetails = ({
  bundle,
  items = [],
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
  const [productsExpanded, setProductsExpanded] = useState(true);
  const isInCart = !!cartItem;

  // Show max limit message when user tries to exceed
  const showMaxLimitMessage = stockLimit && localQuantity >= stockLimit;

  return (
    <div className="space-y-6 py-4">
      
      {/* 1. TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-tppslate leading-tight">
          {bundle.title}
        </h1>
      </div>

      {/* 2. DESCRIPTION (without heading) */}
      {bundle.description && (
        <div>
          <p className="text-md font-dancing text-slate-700 leading-relaxed">
            {bundle.description}
          </p>
        </div>
      )}

      {/* 3. PRICE SECTION */}
      <div className="border-t border-slate-200 pt-4">
        <div className="mb-2">
          <p className="text-4xl font-bold text-tpppink">
            {formatBundlePrice(bundle.price)}
          </p>
          {bundle.original_price && bundle.original_price > bundle.price && (
            <p className="text-sm text-slate-400 line-through mt-1">
              {formatBundlePrice(bundle.original_price)}
            </p>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 text-sm mb-3">
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
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 mb-3">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="font-bold">Only {stockLimit} left in stock!</span>
          </div>
        )}
      </div>

      {/* 4. QUANTITY & ADD TO CART SECTION */}
      <div className="border-t border-slate-200 pt-4">
        {/* Cart Controls */}
        {!isInCart ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-tppslate mb-2 uppercase tracking-wide">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                  disabled={localQuantity <= 1}
                  className="w-9 h-9 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                >
                  <Minus size={16} />
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
                  className="w-16 h-9 text-center text-sm font-bold border border-slate-300 rounded-md focus:ring-1 focus:ring-tpppink focus:border-tpppink text-tppslate"
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
                  className="w-9 h-9 border border-slate-300 rounded-md hover:bg-slate-50 hover:border-tpppink transition-all font-bold text-tppslate disabled:opacity-40 flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              {/* Show max limit only when hit */}
              {showMaxLimitMessage && (
                <p className="text-xs text-amber-600 font-medium mt-2">
                  Maximum {stockLimit} units allowed
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              disabled={adding || isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-md ${
                isOutOfStock || adding
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-tpppink text-white hover:bg-tppslate hover:shadow-lg active:scale-[0.98] border border-tpppink hover:border-tppslate'
              }`}
            >
              {adding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* In Cart Controls */}
            <div className="bg-green-50 border border-green-500 rounded-lg p-3 relative">
              {updating && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-tppslate text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Syncing...
                </div>
              )}
              
              <div className="flex items-center gap-1 mb-2">
                <Check size={14} className="text-green-600 stroke-[3]" />
                <span className="text-green-600 font-bold text-xs">
                  In Cart ({localQuantity})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onDecrement}
                  disabled={updating || localQuantity <= 1}
                  className="w-9 h-9 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                >
                  <Minus size={16} />
                </button>

                <div className="flex-1 text-center relative bg-white rounded-md py-2 border border-green-600">
                  <span className="text-lg font-bold text-green-600">{localQuantity}</span>
                  {pendingQuantity !== null && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>

                <button
                  onClick={onIncrement}
                  disabled={updating || (stockLimit && localQuantity >= stockLimit)}
                  className="w-9 h-9 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-all disabled:opacity-40 flex items-center justify-center font-bold"
                >
                  <Plus size={16} />
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-500 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <Trash2 size={14} />
                Remove from Cart
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onConfirmRemove}
                  disabled={updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-40"
                >
                  {updating ? <Loader size={14} className="animate-spin mx-auto" /> : 'Confirm'}
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

      {/* 5. ANIMATED PRODUCTS DROPDOWN */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setProductsExpanded(!productsExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-tppslate mb-3 uppercase tracking-wide hover:text-tpppink transition-colors"
        >
          <span className="flex items-center gap-2">
            <Package size={14} />
            Products Included ({items.length})
          </span>
          <div className={`transition-transform duration-300 ${productsExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <ChevronDown size={16} />
          </div>
        </button>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            productsExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => {
                const product = item.Products || item.product;
                const variant = item.Product_variants || item.variant;
                const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';
                const title = product?.title || 'Unknown Product';

                return (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-tpppink/30 transition-all duration-200 hover:shadow-sm"
                    style={{
                      animation: productsExpanded ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                    }}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/placeholder-product.png'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-tppslate line-clamp-2">
                        {title}
                      </p>
                    </div>
                    <div className="bg-tpppink/10 text-tpppink px-2 py-0.5 rounded text-xs font-bold border border-tpppink/20">
                      ×{item.quantity}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <Package size={24} className="mx-auto mb-1 text-slate-300" />
                <p className="text-xs text-slate-500">No products</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add keyframe animation for slide in effect */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BundleKeyDetails;