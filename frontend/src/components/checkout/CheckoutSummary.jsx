// frontend/src/components/checkout/CheckoutSummary.jsx - SINGLE PAGE FLOW

import React, { useState, useMemo } from 'react';
import { Lock, Truck, Gift, Loader } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { useCart } from '../../hooks/useCart';

/**
 * CheckoutSummary Component
 * Displays price breakdown, applies promo codes, shows order total
 * Sticky on desktop, scrolls on mobile
 * ⭐ Single-page checkout flow - no step management
 * ⭐ Dynamically calculates totals from cart items in REAL-TIME
 * ⭐ Place Order integration
 * ✅ No tax, no base shipping - only express charges apply
 * ✅ Shows loading spinner only on totals during silent refresh
 * ✅ No dropdown - always shows price breakdown
 */
const CheckoutSummary = ({
  cartItems = [],
  bundles = {},
  promoCode = '',
  onPromoCodeChange,
  discount = 0,
  onDiscountChange,
  selectedAddress = null,
  onPlaceOrder = null,
  placingOrder = false,
  expressCharge = 0,
  deliveryMode = 'surface',
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  // ✅ Get refreshingTotals from cart context
  const { refreshingTotals } = useCart();

  // ✅ Calculate subtotal in real-time from cartItems
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const bundle = bundles[item.bundle_id];
      return total + (bundle?.price || 0) * item.quantity;
    }, 0);
  }, [cartItems, bundles]);

  // ✅ Calculate total in real-time
  const total = useMemo(() => {
    return subtotal + expressCharge - discount;
  }, [subtotal, expressCharge, discount]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      alert('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    
    // TODO: Verify promo code with backend
    // For now, mock discount logic
    const mockDiscount = promoInput === 'SAVE10' ? Math.round(subtotal * 0.10) : 0;
    
    if (mockDiscount > 0) {
      onDiscountChange(mockDiscount);
      onPromoCodeChange(promoInput);
      setPromoInput('');
    } else {
      alert('Invalid or expired promo code');
      setPromoInput('');
    }

    setApplyingPromo(false);
  };

  return (
    <div className="relative space-y-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
        </div>

        {/* Price Breakdown - Always Visible */}
        <div className="p-6 space-y-4">
          <div className="space-y-3 pb-4 border-b">
            {/* Subtotal - ✅ Shows spinner during refresh */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              {refreshingTotals ? (
                <Loader size={16} className="animate-spin text-tpppink" />
              ) : (
                <span className="font-medium text-gray-900">
                  {formatBundlePrice(subtotal)}
                </span>
              )}
            </div>

            {/* ✅ Delivery - Shows based on selected delivery mode */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">
                  {deliveryMode === 'express' ? "Express Delivery" : "Standard Delivery"}
                </span>
                <Truck size={15} className={deliveryMode === 'express' ? "text-amber-600" : "text-green-600"} />
              </div>
              <div className="text-right">
                {expressCharge > 0 ? (
                  <>
                    <span className="font-medium text-gray-900">
                      {formatBundlePrice(expressCharge)}
                    </span>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Fast delivery upgrade
                    </p>
                  </>
                ) : (
                  <span className={deliveryMode === 'express' ? "font-bold text-amber-600" : "font-bold text-green-600"}>FREE</span>
                )}
              </div>
            </div>

            {/* Discount */}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Gift size={14} className="text-green-600" />
                  <span className="text-green-600 font-medium">Discount</span>
                </div>
                <span className="font-semibold text-green-600">
                  -{formatBundlePrice(discount)}
                </span>
              </div>
            )}
          </div>

          {/* Total - ✅ Shows spinner during refresh */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold text-gray-900">Total</span>
            {refreshingTotals ? (
              <Loader size={20} className="animate-spin text-tpppink" />
            ) : (
              <span className="text-2xl font-bold text-tpppink">
                {formatBundlePrice(total)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Apply Promo Code</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            disabled={applyingPromo}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={handleApplyPromo}
            disabled={applyingPromo}
            className="px-4 py-2 bg-tpppink text-white rounded-lg font-medium hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applyingPromo ? 'Applying...' : 'Apply'}
          </button>
        </div>

        {promoCode && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Promo code <span className="font-semibold">{promoCode}</span> applied
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">Try: SAVE10</p>
      </div>

      {/* ⭐ PLACE ORDER BUTTON - Single Page Flow */}
      {onPlaceOrder && (
        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 rounded-lg shadow p-6 text-white">
          <div className="flex items-start gap-3 mb-4">
            <Lock size={20} className="flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Secure Checkout</h3>
              <p className="text-sm text-white/80">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={placingOrder || !selectedAddress}
            className="w-full px-4 py-3 bg-tpppink text-white rounded-lg font-bold hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {placingOrder ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />
                Placing Order...
              </span>
            ) : (
              `Place Order - ${formatBundlePrice(total)}`
            )}
          </button>

          {!selectedAddress && (
            <p className="text-sm text-yellow-300 mt-2 text-center">
              ⚠️ Please select a delivery address above
            </p>
          )}
        </div>
      )}

      {/* Security Info */}
      <div className="space-y-2 text-xs text-gray-600 px-2">
        <div className="flex items-start gap-2">
          <span className="text-green-600 mt-1">✓</span>
          <span>100% secure and encrypted checkout</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-600 mt-1">✓</span>
          <span>Free standard delivery on all orders</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-600 mt-1">✓</span>
          <span>Easy returns and exchanges</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-600 mt-1">✓</span>
          <span>Cash on Delivery available</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;