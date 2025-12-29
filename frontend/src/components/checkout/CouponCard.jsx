// frontend/src/components/checkout/CouponCard.jsx
/**
 * CouponCard Component
 * Allows users to apply coupon codes at checkout
 * Shows available coupons with unlock status
 * ⭐ UPDATED: Refreshes coupon list after apply/remove
 */

import React, { useState, useEffect } from 'react';
import { Gift, Check, X, AlertCircle, Loader, Tag, Lock, Unlock } from 'lucide-react';
import { validateCoupon, getActiveCoupons } from '../../services/couponService';
import {
  formatDiscountText,
  formatCouponCode,
  validateCouponFormat,
  getUnlockMessage,
  isCouponUnlocked,
  formatSavingsText,
  getCouponErrorMessage
} from '../../utils/couponHelpers';

const CouponCard = ({ 
  cartTotal = 0,
  onCouponApply,
  onCouponRemove,
  appliedCoupon = null,
  disabled = false
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Load available coupons on mount and when cart total changes
  useEffect(() => {
    if (cartTotal > 0) {
      fetchAvailableCoupons();
    }
  }, [cartTotal]);

  /**
   * Fetch available coupons from API
   * ⭐ Now automatically filters out exhausted coupons for logged-in users
   */
  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const result = await getActiveCoupons(cartTotal);
      if (result.success) {
        setAvailableCoupons(result.data.all_coupons || []);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  /**
   * Handle coupon input change
   */
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCouponInput(value);
    setError(null);
  };

  /**
   * Apply coupon code
   * ⭐ UPDATED: Refreshes coupon list after successful application
   */
  const handleApplyCoupon = async () => {
    // Clear previous error
    setError(null);

    // Validate format
    const formatValidation = validateCouponFormat(couponInput);
    if (!formatValidation.valid) {
      setError(formatValidation.error);
      return;
    }

    // Check cart total
    if (cartTotal <= 0) {
      setError('Cart is empty');
      return;
    }

    setValidating(true);

    try {
      const result = await validateCoupon(couponInput, cartTotal);

      if (result.success) {
        // Coupon is valid - notify parent
        const couponData = {
          code: result.data.coupon.code,
          discount: result.data.discount,
          description: result.data.coupon.description,
          savings_text: result.data.savings_text
        };

        if (onCouponApply) {
          onCouponApply(couponData);
        }

        // Clear input
        setCouponInput('');
        setError(null);

        // ⭐ Refresh available coupons list
        fetchAvailableCoupons();

        console.log('✅ Coupon applied:', couponData);
      } else {
        // Show error
        const errorMessage = result.code 
          ? getCouponErrorMessage(result.code, { shortfall: result.shortfall })
          : result.error;
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setError('Failed to validate coupon. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  /**
   * Remove applied coupon
   * ⭐ UPDATED: Refreshes coupon list after removal
   */
  const handleRemoveCoupon = () => {
    if (onCouponRemove) {
      onCouponRemove();
    }
    setCouponInput('');
    setError(null);

    // ⭐ Refresh available coupons list
    fetchAvailableCoupons();
  };

  /**
 * Apply coupon from available list
 * ⭐ UPDATED: Directly validates coupon without relying on state update
 */
const handleApplyCouponFromList = async (coupon) => {
  // Check if unlocked
  if (!isCouponUnlocked(coupon, cartTotal)) {
    setError(`Add ₹${Math.ceil(coupon.unlock_amount)} more to unlock this coupon`);
    setShowAvailableCoupons(false);
    return;
  }

  // Set input for visual feedback
  setCouponInput(coupon.code);
  setShowAvailableCoupons(false);
  setError(null);
  
  // Check cart total
  if (cartTotal <= 0) {
    setError('Cart is empty');
    return;
  }

  setValidating(true);

  try {
    // ⭐ Directly use coupon.code instead of waiting for state update
    const result = await validateCoupon(coupon.code, cartTotal);

    if (result.success) {
      // Coupon is valid - notify parent
      const couponData = {
        code: result.data.coupon.code,
        discount: result.data.discount,
        description: result.data.coupon.description,
        savings_text: result.data.savings_text
      };

      if (onCouponApply) {
        onCouponApply(couponData);
      }

      // Clear input
      setCouponInput('');
      setError(null);

      // Refresh available coupons list
      fetchAvailableCoupons();

      console.log('✅ Coupon applied:', couponData);
    } else {
      // Show error
      const errorMessage = result.code 
        ? getCouponErrorMessage(result.code, { shortfall: result.shortfall })
        : result.error;
      
      setError(errorMessage);
    }
  } catch (err) {
    console.error('Coupon validation error:', err);
    setError('Failed to validate coupon. Please try again.');
  } finally {
    setValidating(false);
  }
};

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Gift size={20} />
          Have a Coupon Code?
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        
        {/* Applied Coupon State */}
        {appliedCoupon ? (
          <div className="space-y-3">
            {/* Success Message */}
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900 mb-1">
                      Coupon Applied!
                    </p>
                    <p className="text-lg font-bold text-green-700 mb-1">
                      {appliedCoupon.code}
                    </p>
                    {appliedCoupon.description && (
                      <p className="text-xs text-green-700 mb-2">
                        {appliedCoupon.description}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-green-800">
                      {formatSavingsText(appliedCoupon.discount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  disabled={disabled}
                  className="text-green-700 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Remove coupon"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Input State */
          <div className="space-y-3">
            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={handleInputChange}
                disabled={validating || disabled}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 uppercase font-mono text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || validating || disabled}
                className="px-6 py-3 bg-tpppink text-white rounded-lg font-bold hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {validating ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Tag size={18} />
                    Apply
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Available Coupons Toggle */}
            {availableCoupons.length > 0 && (
              <div>
                <button
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="text-sm text-tpppink hover:text-tpppink/80 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Gift size={14} />
                  {showAvailableCoupons ? 'Hide' : 'View'} Available Coupons ({availableCoupons.length})
                </button>

                {/* Available Coupons List */}
                {showAvailableCoupons && (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {loadingCoupons ? (
                      <div className="p-4 text-center">
                        <Loader size={20} className="animate-spin mx-auto text-slate-400" />
                        <p className="text-sm text-slate-500 mt-2">Loading coupons...</p>
                      </div>
                    ) : (
                      availableCoupons.map((coupon) => {
                        const unlocked = isCouponUnlocked(coupon, cartTotal);
                        const unlockMsg = getUnlockMessage(coupon, cartTotal);

                        return (
                          <button
                            key={coupon.id}
                            onClick={() => handleApplyCouponFromList(coupon)}
                            disabled={!unlocked}
                            className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                              unlocked
                                ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                                : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  unlocked ? 'bg-blue-100' : 'bg-slate-200'
                                }`}>
                                  {unlocked ? (
                                    <Unlock size={18} className="text-blue-600" />
                                  ) : (
                                    <Lock size={18} className="text-slate-500" />
                                  )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 mb-1">
                                    {coupon.code}
                                  </p>
                                  <p className="text-xs text-slate-600 mb-1">
                                    {coupon.description}
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    unlocked ? 'text-green-600' : 'text-amber-600'
                                  }`}>
                                    {unlockMsg}
                                  </p>
                                </div>
                              </div>

                              {/* Discount Badge */}
                              <div className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                                unlocked ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {formatDiscountText(coupon)}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCard;