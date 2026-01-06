// frontend/src/components/checkout/CheckoutSummary.jsx - UNIFIED FOR PRODUCTS & BUNDLES

import React, { useMemo } from 'react';
import { Lock, Truck, Gift, Loader, CreditCard, ShieldCheck } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { useCart } from '../../hooks/useCart';
import CouponCard from './CouponCard';

// ⭐ Import simple-icons data
import { siVisa, siMastercard, siAmericanexpress, siPaytm, siGooglepay, siPhonepe } from 'simple-icons';

/**
 * Simple Icon Wrapper Component
 */
const SimpleIcon = ({ icon, size = 20 }) => {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
};

/**
 * Payment Method Icons - Minimal & Clean
 */
const PaymentMethodIcons = () => {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap pt-3 pb-2">
      <SimpleIcon icon={siVisa} size={28} />
      <SimpleIcon icon={siMastercard} size={28} />
      <SimpleIcon icon={siAmericanexpress} size={28} />
      <SimpleIcon icon={siPaytm} size={24} />
      <SimpleIcon icon={siGooglepay} size={24} />
      <SimpleIcon icon={siPhonepe} size={24} />
    </div>
  );
};

/**
 * CheckoutSummary Component - UNIFIED FOR PRODUCTS & BUNDLES
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
  appliedCoupon = null,
  onCouponApply = null,
  onCouponRemove = null,
}) => {
  const { refreshingTotals } = useCart();

  // ⭐ Calculate subtotal - SUPPORTS BOTH PRODUCTS AND BUNDLES
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      // ⭐ For bundles: look up in bundles map
      if (item.type === 'bundle' && item.bundle_id) {
        const bundle = bundles[item.bundle_id];
        return total + (bundle?.price || 0) * item.quantity;
      }
      
      // ⭐ For products: price is already in cartItem
      if (item.type === 'product') {
        return total + (item.price || 0) * item.quantity;
      }

      return total;
    }, 0);
  }, [cartItems, bundles]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + expressCharge - discount;
  }, [subtotal, expressCharge, discount]);

  return (
    <div className="space-y-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow border border-slate-200">
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
        </div>

        {/* Price Breakdown */}
        <div className="px-6 py-4 space-y-2.5">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            {refreshingTotals ? (
              <Loader size={14} className="animate-spin text-tpppink" />
            ) : (
              <span className="font-semibold text-slate-900">
                {formatBundlePrice(subtotal)}
              </span>
            )}
          </div>

          {/* Delivery */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Truck size={14} className={deliveryMode === 'express' ? "text-amber-600" : "text-green-600"} />
              <span className="text-slate-600">
                {deliveryMode === 'express' ? "Express" : "Standard"} Delivery
              </span>
            </div>
            {expressCharge > 0 ? (
              <span className="font-semibold text-slate-900">
                {formatBundlePrice(expressCharge)}
              </span>
            ) : (
              <span className="font-semibold text-green-600">FREE</span>
            )}
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

          {/* Divider */}
          <div className="border-t border-slate-200 pt-2.5 mt-2.5"></div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-900">Total</span>
            {refreshingTotals ? (
              <Loader size={18} className="animate-spin text-tpppink" />
            ) : (
              <span className="text-xl font-bold text-tpppink">
                {formatBundlePrice(total)}
              </span>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="px-6 pb-6 space-y-3">
          {/* Payment Button */}
          <button
            onClick={onPlaceOrder}
            disabled={placingOrder || !selectedAddress}
            className={`
              w-full px-6 py-3.5 rounded-lg font-semibold text-white
              transition-all duration-200
              flex items-center justify-center gap-2
              ${placingOrder || !selectedAddress
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-tpppink hover:bg-tpppink/90 shadow-md hover:shadow-lg active:scale-[0.98]'
              }
            `}
          >
            {placingOrder ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard size={18} />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>

          {/* Address Warning */}
          {!selectedAddress && (
            <p className="text-xs text-amber-600 text-center">
              Please select a delivery address
            </p>
          )}

          {/* Payment Methods */}
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-500 text-center mb-1">We Accept</p>
            <PaymentMethodIcons />
          </div>

          {/* Security */}
          <div className="font-inter flex items-center justify-center gap-1.5 text-xs text-green-600">
            <span>Secure payment via Razorpay</span>
          </div>
        </div>
      </div>

      {/* Coupon Card */}
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