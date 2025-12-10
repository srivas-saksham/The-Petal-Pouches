// frontend/src/components/checkout/CheckoutSummary.jsx - WITH LOCALSTORAGE AUTO-LOAD FIX

import React, { useState, useEffect } from 'react';
import { Lock, Truck, Gift, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';
import { getDeliveryData, saveDeliveryData, getStoredAddressId } from '../../utils/deliveryStorage';
import api from '../../services/api';
import DeliveryDetailsCard from './DeliveryDetailsCard';

/**
 * CheckoutSummary Component
 * Displays price breakdown, applies promo codes, shows order total
 * Sticky on desktop, scrolls on mobile
 * ⭐ Dynamically calculates totals from cart items
 * ⭐ Place Order integration
 * ✅ Auto-loads stored address from localStorage on mount
 */
const CheckoutSummary = ({
  cartItems = [],
  bundles = {},
  cartTotals = {},
  promoCode = '',
  onPromoCodeChange,
  discount = 0,
  onDiscountChange,
  selectedAddress = null,
  onAddressSelect = null,
  addresses = [],
  currentStep = 'review',
  onStepChange,
  user = null,
  onPlaceOrder = null,
  placingOrder = false,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // ✅ CRITICAL FIX: Load and auto-select address from localStorage FIRST
  useEffect(() => {
    const loadStoredAddress = () => {
      if (addresses.length === 0 || !onAddressSelect) {
        return;
      }

      // Only run once when addresses are first loaded
      if (initialLoadComplete) {
        return;
      }

      console.log('🔍 [CheckoutSummary] Loading stored address from localStorage');
      
      // Get stored address ID
      const storedAddressId = getStoredAddressId();
      
      if (storedAddressId) {
        // Try to find the stored address
        const storedAddress = addresses.find(a => a.id === storedAddressId);
        if (storedAddress) {
          console.log('✅ [CheckoutSummary] Found stored address, auto-selecting:', storedAddress);
          onAddressSelect(storedAddress);
          setInitialLoadComplete(true);
          return;
        } else {
          console.log('⚠️ [CheckoutSummary] Stored address ID not found in address list');
        }
      }

      // Fallback: Select default or first address
      if (!selectedAddress) {
        const defaultAddr = addresses.find(a => a.is_default);
        if (defaultAddr) {
          console.log('✅ [CheckoutSummary] Auto-selecting default address:', defaultAddr);
          onAddressSelect(defaultAddr);
        } else if (addresses.length > 0) {
          console.log('✅ [CheckoutSummary] Auto-selecting first address:', addresses[0]);
          onAddressSelect(addresses[0]);
        }
      }
      
      setInitialLoadComplete(true);
    };

    loadStoredAddress();
  }, [addresses.length, initialLoadComplete]);

  // ✅ Load delivery data from localStorage
  useEffect(() => {
    const loadStoredDeliveryData = () => {
      const storedData = getDeliveryData();
      if (!storedData) {
        console.log('📭 [CheckoutSummary] No stored delivery data');
        return;
      }

      console.log('📦 [CheckoutSummary] Found stored delivery data:', storedData);

      // Load delivery check data
      if (storedData.deliveryCheck) {
        setDeliveryInfo(storedData.deliveryCheck);
      }
    };

    loadStoredDeliveryData();
  }, []);

  // ✅ Handle delivery updates from DeliveryDetailsCard
  const handleDeliveryUpdate = (updatedDeliveryData) => {
    console.log('🔄 [CheckoutSummary] Delivery data updated:', updatedDeliveryData);
    setDeliveryInfo(updatedDeliveryData);
    
    // Update localStorage with fresh data
    const currentStoredData = getDeliveryData() || {};
    saveDeliveryData({
      ...currentStoredData,
      deliveryCheck: updatedDeliveryData,
      timestamp: Date.now()
    });
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const bundle = bundles[item.bundle_id];
    return total + (bundle?.price || 0) * item.quantity;
  }, 0);

  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = 50; // Fixed shipping
  const discountAmount = discount;
  const total = subtotal + tax + shipping - discountAmount;

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
    <div className="sticky top-20 space-y-4">
      {/* ✅ Delivery Details Card - Shows TAT, verification AND address selector */}
      <DeliveryDetailsCard 
        selectedAddress={selectedAddress}
        onAddressSelect={onAddressSelect}
        addresses={addresses}
        onDeliveryUpdate={handleDeliveryUpdate}
        onStepChange={onStepChange}
      />

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Order Summary</h2>
        </div>

        {/* Price Breakdown */}
        <div className="p-6 space-y-4">
          {/* Breakdown Toggle */}
          <button
            onClick={() => setPriceBreakdownOpen(!priceBreakdownOpen)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2 px-3 hover:bg-gray-50 rounded-lg"
          >
            <span>Price Breakdown</span>
            {priceBreakdownOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {priceBreakdownOpen && (
            <div className="space-y-3 pb-4 border-b">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatBundlePrice(subtotal)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span className="font-medium text-gray-900">
                  {formatBundlePrice(tax)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Truck size={14} className="text-gray-400" />
                  <span className="text-gray-600">Shipping</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatBundlePrice(shipping)}
                </span>
              </div>

              {/* Discount */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Gift size={14} className="text-green-600" />
                    <span className="text-green-600 font-medium">Discount</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    -{formatBundlePrice(discountAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-tpppink">
              {formatBundlePrice(total)}
            </span>
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

      {/* ⭐ PLACE ORDER BUTTON - Shows on payment step */}
      {currentStep === 'payment' && onPlaceOrder && (
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
            {placingOrder ? 'Placing Order...' : `Place Order - ${formatBundlePrice(total)}`}
          </button>

          {!selectedAddress && (
            <p className="text-sm text-yellow-300 mt-2 text-center">
              Please select a delivery address
            </p>
          )}
        </div>
      )}

      {/* Payment Section - Shows before payment step */}
      {currentStep !== 'payment' && (
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
            onClick={() => onStepChange('payment')}
            disabled={!selectedAddress}
            className="w-full px-4 py-3 bg-white text-tppslate rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!selectedAddress ? 'Select Address First' : 'Proceed to Payment'}
          </button>
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