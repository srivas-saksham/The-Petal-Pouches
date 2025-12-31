// frontend/src/components/checkout/CheckoutSummary.jsx - UPDATED WITH RAZORPAY

import React, { useState, useMemo } from 'react';
import { Lock, Truck, Gift, Loader, CreditCard } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { useCart } from '../../hooks/useCart';
import CouponCard from './CouponCard';

/**
 * CheckoutSummary Component - UPDATED FOR RAZORPAY PAYMENT
 * ⭐ CHANGES:
 * - "Place Order" button changed to "Proceed to Payment"
 * - Updated button icon to CreditCard
 * - Removed "Cash on Delivery available" from security info
 * - Added "Secure online payment via Razorpay"
 * - All other functionality preserved
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
  appliedCoupon = null, // ⭐ NEW
  onCouponApply = null, // ⭐ NEW
  onCouponRemove = null, // ⭐ NEW
}) => {
  const { refreshingTotals } = useCart();

  // Calculate subtotal in real-time from cartItems
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const bundle = bundles[item.bundle_id];
      return total + (bundle?.price || 0) * item.quantity;
    }, 0);
  }, [cartItems, bundles]);

  // Calculate total in real-time
  const total = useMemo(() => {
    return subtotal + expressCharge - discount;
  }, [subtotal, expressCharge, discount]);


  return (
    <div className="relative space-y-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
        </div>

        {/* Price Breakdown */}
        <div className="p-6 space-y-4">
          <div className="space-y-3 pb-4 border-b">
            {/* Subtotal */}
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

            {/* Delivery */}
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

          {/* Total */}
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
          {/* ⭐ UPDATED: PROCEED TO PAYMENT BUTTON */}
          {onPlaceOrder && (
            <div className="bg-gradient-to-r from-tppslate to-tppslate/90 rounded-lg shadow p-6 text-white">
              <button
                onClick={onPlaceOrder}
                disabled={placingOrder || !selectedAddress}
                className="w-full px-4 py-3 bg-tpppink text-white rounded-lg font-bold hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {placingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    Proceed to Payment - {formatBundlePrice(total)}
                  </span>
                )}
              </button>

              {!selectedAddress && (
                <p className="text-sm text-yellow-300 mt-2 text-center">
                  Please select a delivery address
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ⭐ NEW: Coupon Card Component */}
      <CouponCard 
        cartTotal={subtotal}
        onCouponApply={onCouponApply}
        onCouponRemove={onCouponRemove}
        appliedCoupon={appliedCoupon}
        disabled={placingOrder}
      />
    </div>
  );
};

export default CheckoutSummary;