// frontend/src/components/bundle-detail/BundleKeyDetails.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check, Trash2, Loader, AlertTriangle, Package, ChevronDown, ArrowBigRightDash } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { useUserAuth } from '../../context/UserAuthContext';

const BundleKeyDetails = ({
  bundle, items = [], stockLimit, isOutOfStock, isLowStock,
  cartItem, localQuantity, setLocalQuantity,
  onAddToCart, onIncrement, onDecrement,
  adding, updating, showRemoveConfirm,
  onRemoveClick, onConfirmRemove, onCancelRemove,
  pendingQuantity, onQuantityChangeForDelivery
}) => {
  const [productsExpanded, setProductsExpanded] = useState(true);
  const isInCart = !!cartItem;
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const showMaxLimitMessage = stockLimit && localQuantity >= stockLimit;

  useEffect(() => {
    if (onQuantityChangeForDelivery) onQuantityChangeForDelivery(localQuantity, localQuantity * 1000);
  }, [localQuantity, onQuantityChangeForDelivery]);

  const handleCheckout = () => {
    if (isAuthenticated) navigate('/checkout');
    else navigate('/login', { state: { from: '/checkout' } });
  };

  return (
    <div className="space-y-6 py-4">
      
      <div>
        <h1 className="md:text-3xl text-2xl font-bold text-tppslate dark:text-tppdarkwhite bg-tpppink/10 dark:bg-tppdarkwhite/10 p-2 m-0 rounded-lg leading-tight">{bundle.title}</h1>
      </div>

      {bundle.description && (
        <div>
          <p className="text-md text-slate-700 dark:text-tppdarkwhite/70 leading-relaxed whitespace-pre-line">{bundle.description}</p>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4">
        <div className="flex items-end gap-2 mb-2">
          <p className="text-4xl font-bold text-tpppink dark:text-tppdarkwhite">{formatBundlePrice(bundle.price)}</p>
          {bundle.original_price && bundle.original_price > bundle.price && (
            <p className="text-sm text-slate-400 dark:text-tppdarkwhite/30 line-through mb-1">{formatBundlePrice(bundle.original_price)}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isOutOfStock ? (
            <><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-600 dark:text-red-400 font-bold">Sold Out</span></>
          ) : (
            <><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-green-600 dark:text-green-400 font-bold">In Stock</span></>
          )}
        </div>
        <p className="text-md text-tppslate/50 dark:text-tppdarkwhite/30 leading-relaxed mb-3">*inclusive of all tax, and shipping charges.</p>
        {!!isLowStock && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-500/30 mb-3">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="font-bold">Only {stockLimit} left in stock!</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4">
        {!isInCart ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-tppslate dark:text-tppdarkwhite mb-2 uppercase tracking-wide">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                  disabled={localQuantity <= 1}
                  className="w-9 h-9 border border-slate-300 dark:border-tppdarkwhite/10 rounded-md hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 hover:border-tpppink dark:hover:border-tppdarkwhite transition-all font-bold text-tppslate dark:text-tppdarkwhite disabled:opacity-40 flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number" value={localQuantity}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    if (stockLimit && val > stockLimit) { alert(`Maximum ${stockLimit} units allowed`); return; }
                    setLocalQuantity(val);
                  }}
                  className="w-16 h-9 text-center text-sm font-bold border border-slate-300 dark:border-tppdarkwhite/10 rounded-md focus:ring-1 focus:ring-tpppink dark:focus:ring-tppdarkwhite focus:border-tpppink dark:focus:border-tppdarkwhite bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite"
                  min="1" max={stockLimit || undefined}
                />
                <button
                  onClick={() => {
                    if (stockLimit && localQuantity >= stockLimit) { alert(`Maximum ${stockLimit} units allowed`); return; }
                    setLocalQuantity(localQuantity + 1);
                  }}
                  disabled={stockLimit && localQuantity >= stockLimit}
                  className="w-9 h-9 border border-slate-300 dark:border-tppdarkwhite/10 rounded-md hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 hover:border-tpppink dark:hover:border-tppdarkwhite transition-all font-bold text-tppslate dark:text-tppdarkwhite disabled:opacity-40 flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              {!!showMaxLimitMessage && <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">Maximum {stockLimit} units allowed</p>}
            </div>
            <button
              onClick={onAddToCart} disabled={adding || isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-md ${
                isOutOfStock || adding
                  ? 'bg-slate-200 dark:bg-tppdarkwhite/10 text-slate-400 dark:text-tppdarkwhite/30 cursor-not-allowed border border-slate-300 dark:border-tppdarkwhite/10'
                  : 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark hover:bg-tppslate dark:hover:bg-tppdarkwhite/90 hover:shadow-lg active:scale-[0.98] border border-tpppink dark:border-tppdarkwhite hover:border-tppslate dark:hover:border-tppdarkwhite/90'
              }`}
            >
              {adding ? <>
              <div className="w-4 h-4 border-2 border-white dark:border-tppdark border-t-transparent rounded-full animate-spin" />
                Adding...
              </> 
              : 
              <>
                <ShoppingCart size={16} />
                  {isOutOfStock ? 'Sold Out - Out of Stock' : 'Add to Cart'}
              </>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-500 dark:border-green-500/50 rounded-lg p-3 relative">
              {updating && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-tppslate dark:bg-tppdarkwhite dark:text-tppdark text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">Syncing...</div>
              )}
              <div className="flex items-center gap-1 mb-2">
                <Check size={14} className="text-green-600 dark:text-green-400 stroke-[3]" />
                <span className="text-green-600 dark:text-green-400 font-bold text-xs">In Cart ({localQuantity})</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onDecrement} disabled={updating || localQuantity <= 1} className="w-9 h-9 border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-40 flex items-center justify-center font-bold"><Minus size={16} /></button>
                <div className="flex-1 text-center relative bg-white dark:bg-tppdarkgray rounded-md py-2 border border-green-600 dark:border-green-500">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{localQuantity}</span>
                  {pendingQuantity !== null && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                </div>
                <button onClick={onIncrement} disabled={updating || (stockLimit && localQuantity >= stockLimit)} className="w-9 h-9 border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-40 flex items-center justify-center font-bold"><Plus size={16} /></button>
              </div>
              {showMaxLimitMessage && <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 text-center">Maximum {stockLimit} units allowed</p>}
            </div>

            {!showRemoveConfirm ? (
              <div className="flex items-center justify-center gap-3">
                <button onClick={onRemoveClick} disabled={updating} className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50">
                  <Trash2 size={14} />Remove from Cart
                </button>
                <button onClick={handleCheckout} disabled={updating}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded border font-medium text-xs transition-all ${
                    updating
                      ? 'border-tppgrey bg-slate-100 dark:bg-tppdarkwhite/5 text-tppslate/40 dark:text-tppdarkwhite/20 cursor-not-allowed'
                      : 'border-tpppink dark:border-tppdarkwhite bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 active:scale-95'
                  }`}
                >
                  Checkout<ArrowBigRightDash size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onConfirmRemove} disabled={updating} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-40">
                  {updating ? <Loader size={14} className="animate-spin mx-auto" /> : 'Confirm'}
                </button>
                <button onClick={onCancelRemove} disabled={updating} className="px-3 py-2 text-slate-500 dark:text-tppdarkwhite/50 hover:text-slate-700 dark:hover:text-tppdarkwhite text-xs font-medium disabled:opacity-40">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 pt-4">
          <button
            onClick={() => setProductsExpanded(!productsExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-tppslate dark:text-tppdarkwhite mb-3 uppercase tracking-wide hover:text-tpppink dark:hover:text-tppdarkwhite/70 transition-colors"
          >
            <span className="flex items-center gap-2"><Package size={14} />Products Included ({items.length})</span>
            <div className={`transition-transform duration-300 ${productsExpanded ? 'rotate-180' : 'rotate-0'}`}><ChevronDown size={16} /></div>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${productsExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-2">
              {items.map((item, index) => {
                const product = item.Products || item.product;
                const variant = item.Product_variants || item.variant;
                const imageUrl = variant?.img_url || product?.img_url || '/placeholder-product.png';
                const title = product?.title || 'Unknown Product';
                return (
                  <div key={item.id || index}
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-tppdarkwhite/5 rounded-lg border border-slate-200 dark:border-tppdarkwhite/10 hover:border-tpppink/30 dark:hover:border-tppdarkwhite/30 transition-all duration-200 hover:shadow-sm"
                    style={{ animation: productsExpanded ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none' }}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-white dark:bg-tppdarkgray border border-slate-200 dark:border-tppdarkwhite/10 flex-shrink-0">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={(e) => e.target.src = '/placeholder-product.png'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-tppslate dark:text-tppdarkwhite line-clamp-2">{title}</p>
                    </div>
                    <div className="bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite px-2 py-0.5 rounded text-xs font-bold border border-tpppink/20 dark:border-tppdarkwhite/20">
                      ×{item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default BundleKeyDetails;