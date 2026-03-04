// frontend/src/components/cart/CartItem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Trash2, Loader, ShoppingBag } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../../services/cartService';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

const CartItem = ({ item }) => {
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { refreshCart } = useCart();
  const toast = useToast();

  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    if (pendingQuantity === null) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setUpdating(true);
      try {
        if (pendingQuantity === 0) {
          const result = await removeFromCart(item.id);
          if (result.success) {
            await refreshCart(true);
            toast.success('Item removed from cart');
          } else {
            setLocalQuantity(item.quantity);
            toast.error(result.error || 'Failed to remove item');
          }
        } else {
          const result = await updateCartItem(item.id, pendingQuantity, item.stock_limit);
          if (result.success) {
            await refreshCart(true);
          } else {
            setLocalQuantity(item.quantity);
            toast.error(result.error || 'Failed to update quantity');
          }
        }
      } catch (error) {
        console.error('Update quantity error:', error);
        setLocalQuantity(item.quantity);
        toast.error('Failed to update quantity');
      } finally {
        setUpdating(false);
        setPendingQuantity(null);
      }
    }, 800);

    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [pendingQuantity, item.id, item.quantity, item.stock_limit, refreshCart, toast]);

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  const handleIncrement = () => {
    if (item.stock_limit && localQuantity >= item.stock_limit) {
      alert(`Maximum ${item.stock_limit} units allowed per bundle`);
      return;
    }
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleDecrement = () => {
    if (localQuantity <= 0) return;
    const newQuantity = localQuantity - 1;
    setLocalQuantity(newQuantity);
    setPendingQuantity(newQuantity);
  };

  const handleRemoveClick = () => setShowConfirm(true);

  const handleConfirmRemove = async () => {
    setRemoving(true);
    try {
      const result = await removeFromCart(item.id);
      if (result.success) {
        await refreshCart();
        toast.success('Item removed from cart');
      } else {
        toast.error(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(false);
      setShowConfirm(false);
    }
  };

  const handleCancelRemove = () => setShowConfirm(false);

  return (
    <div className={`p-4 border-b border-slate-100 dark:border-tppdarkwhite/10 transition-opacity ${
      removing ? 'opacity-50' : 'opacity-100'
    }`}>
      <div className="flex gap-3">

        {/* Image */}
        <div className="flex-shrink-0 w-20 h-20 bg-slate-100 dark:bg-tppdark rounded-lg overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover dark:opacity-90"
              onError={(e) => { e.target.src = '/placeholder-bundle.png'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-tppdarkwhite/30">
              <ShoppingBag size={24} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-tppdarkwhite mb-1 line-clamp-2">
            {item.title}
          </h4>

          {item.item_type === 'product' && (
            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded mb-1">
              Individual Product
            </span>
          )}

          <p className="text-sm font-bold text-tpppink dark:text-tppdarkwhite mb-2">
            {formatPrice(item.price)}
            <span className="text-xs text-slate-500 dark:text-tppdarkwhite/40 font-normal ml-1">
              × {localQuantity}
            </span>
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-tppdark rounded-lg p-1 relative">

              {updating && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-tppdarkgray text-white dark:text-tppdarkwhite text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                  Syncing...
                </div>
              )}

              <button
                onClick={handleDecrement}
                disabled={updating || localQuantity <= 0}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-tppdarkgray transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="text-slate-600 dark:text-tppdarkwhite/70" />
              </button>

              <div className="relative min-w-[32px] text-center">
                <span className="text-sm font-semibold text-slate-900 dark:text-tppdarkwhite">
                  {updating ? (
                    <Loader size={14} className="animate-spin mx-auto text-tpppink dark:text-tppdarkwhite" />
                  ) : (
                    localQuantity
                  )}
                </span>
                {pendingQuantity !== null && !updating && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>

              <button
                onClick={handleIncrement}
                disabled={updating || (item.stock_limit && localQuantity >= item.stock_limit)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-tppdarkgray transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="text-slate-600 dark:text-tppdarkwhite/70" />
              </button>
            </div>

            {/* Remove / Confirm */}
            {!showConfirm ? (
              <button
                onClick={handleRemoveClick}
                disabled={removing || updating}
                className="text-slate-400 dark:text-tppdarkwhite/30 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Remove item"
                title="Remove from cart"
              >
                {removing ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmRemove}
                  disabled={removing}
                  className="bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  aria-label="Confirm removal"
                >
                  {removing ? <Loader size={14} className="animate-spin" /> : 'Confirm'}
                </button>
                <button
                  onClick={handleCancelRemove}
                  disabled={removing}
                  className="text-slate-500 dark:text-tppdarkwhite/50 hover:text-slate-700 dark:hover:text-tppdarkwhite text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Cancel removal"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {item.stock_limit && localQuantity >= item.stock_limit && (
            <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40 mt-1.5">
              Only {item.stock_limit} items in stock
            </p>
          )}
        </div>

        {/* Item Total */}
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold text-slate-900 dark:text-tppdarkwhite">
            {formatPrice(item.price * localQuantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;