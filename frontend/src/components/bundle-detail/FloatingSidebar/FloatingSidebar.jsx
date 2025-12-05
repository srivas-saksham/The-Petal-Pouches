// frontend/src/components/bundle-detail/FloatingSidebar/FloatingSidebar.jsx
import React from 'react';
import PriceSection from './PriceSection';
import DeliverySection from './DeliverySection';
import TrustBadges from './TrustBadges';

/**
 * FloatingSidebar - Sticky sidebar container
 * Sticks to top on scroll, compact design
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
  onRemove,
  adding,
  updating,
  showRemoveConfirm,
  onRemoveClick,
  onConfirmRemove,
  onCancelRemove,
  pendingQuantity
}) => {
  return (
    <div className="sticky top-20 space-y-4">
      {/* Price & Cart Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <PriceSection
          bundle={bundle}
          stockLimit={stockLimit}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          cartItem={cartItem}
          localQuantity={localQuantity}
          setLocalQuantity={setLocalQuantity}
          onAddToCart={onAddToCart}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onRemove={onRemove}
          adding={adding}
          updating={updating}
          showRemoveConfirm={showRemoveConfirm}
          onRemoveClick={onRemoveClick}
          onConfirmRemove={onConfirmRemove}
          onCancelRemove={onCancelRemove}
          pendingQuantity={pendingQuantity}
        />
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <DeliverySection />
      </div>

      {/* Trust Badges */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <TrustBadges />
      </div>
    </div>
  );
};

export default FloatingSidebar;