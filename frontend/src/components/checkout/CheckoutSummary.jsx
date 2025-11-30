// frontend/src/components/checkout/CheckoutSummary.jsx

import React, { useState } from 'react';
import { Lock, Truck, Gift, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { formatBundlePrice } from '../../utils/bundleHelpers';

/**
 * CheckoutSummary Component
 * Displays price breakdown, applies promo codes, shows order total
 * Sticky on desktop, scrolls on mobile
 * ⭐ Dynamically calculates totals from cart items
 * ⭐ Shows address selection dropdown with address_type
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
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(true);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

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
      // toast.success(`Promo code applied! You save ${formatBundlePrice(mockDiscount)}`);
    } else {
      alert('Invalid or expired promo code');
      setPromoInput('');
    }

    setApplyingPromo(false);
  };

  return (
    <div className="sticky top-20 space-y-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
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
            <span className="text-2xl font-bold text-purple-600">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={handleApplyPromo}
            disabled={applyingPromo}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Shipping Address Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck size={18} />
          Delivery Address
        </h3>

        {selectedAddress ? (
          <div className="space-y-3">
            {/* Selected Address Display */}
            <div className="p-4 bg-purple-50 border-2 border-purple-600 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    {selectedAddress.address_type ? 
                      selectedAddress.address_type.charAt(0).toUpperCase() + selectedAddress.address_type.slice(1)
                      : 'Address'}
                    {selectedAddress.is_default && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {selectedAddress.line1}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.line2 && <span>{selectedAddress.line2}, </span>}
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                  </p>
                </div>
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              </div>
            </div>

            {/* ⭐ CHANGE ADDRESS DROPDOWN */}
            {addresses.length > 1 && (
              <div>
                <button
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm font-medium"
                >
                  <span>Change Address</span>
                  {showAddressDropdown ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {/* Address Dropdown List */}
                {showAddressDropdown && (
                  <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          if (onAddressSelect) {
                            onAddressSelect(addr);
                          }
                          setShowAddressDropdown(false);
                        }}
                        className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                          selectedAddress.id === addr.id
                            ? 'bg-purple-100 border-l-4 border-l-purple-600'
                            : 'bg-white hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              {addr.address_type ? 
                                addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1)
                                : 'Address'}
                              {addr.is_default && (
                                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  Default
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {addr.line1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {addr.city}, {addr.state}
                            </p>
                          </div>
                          {selectedAddress.id === addr.id && (
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Please select or add a shipping address
            </p>
          </div>
        )}

        <button
          onClick={() => onStepChange('shipping')}
          className="w-full mt-4 px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        >
          {selectedAddress ? 'Change Address' : 'Add Address'}
        </button>
      </div>

      {/* Payment Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow p-6 text-white">
        <div className="flex items-start gap-3 mb-4">
          <Lock size={20} className="flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Secure Checkout</h3>
            <p className="text-sm text-purple-100">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>

        <button
          onClick={() => onStepChange('payment')}
          disabled={currentStep === 'payment'}
          className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 'payment' ? 'Processing Payment...' : 'Proceed to Payment'}
        </button>
      </div>

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