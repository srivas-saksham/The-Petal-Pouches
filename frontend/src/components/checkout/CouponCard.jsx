// frontend/src/components/checkout/CouponCard.jsx
/**
 * CouponCard Component - Professional Clean Edition
 * Intelligent coupon suggestions with real-time eligibility checking
 * ⭐ CLEAN UI: Uses only tpppink and slate color scheme
 * ⭐ SMART DISPLAY: BOGO shows "Buy X Get Y" instead of percentage
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Gift, Check, X, AlertCircle, Loader, Tag, Lock, ShoppingBag, Package, Sparkles } from 'lucide-react';
import { validateCoupon, getActiveCoupons } from '../../services/couponService';
import {
  formatDiscountText,
  validateCouponFormat,
  formatSavingsText,
  getCouponErrorMessage
} from '../../utils/couponHelpers';

const CouponCard = ({ 
  cartTotal = 0,
  cartItems = [],
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

  useEffect(() => {
    if (cartTotal > 0) {
      fetchAvailableCoupons();
    }
  }, [cartTotal, cartItems.length]);

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
   * ⭐ Calculate coupon eligibility
   */
  const calculateCouponEligibility = (coupon) => {
    const couponType = coupon.coupon_type || 'cart_wide';
    
    // Check minimum order value first
    const minOrderValue = coupon.min_order_value || 0;
    if (cartTotal < minOrderValue) {
      const shortfall = minOrderValue - cartTotal;
      return {
        eligible: false,
        reason: 'min_order',
        message: `Add ₹${Math.ceil(shortfall)} more to unlock`,
        shortfall
      };
    }

    // Cart-wide coupons
    if (couponType === 'cart_wide') {
      return {
        eligible: true,
        reason: 'eligible',
        message: 'Ready to apply'
      };
    }

    // Product-specific and BOGO coupons
    if (couponType === 'product_specific' || couponType === 'bogo') {
      const eligibleProductIds = coupon.eligible_product_ids || [];
      
      if (eligibleProductIds.length === 0) {
        return {
          eligible: false,
          reason: 'no_eligible_products',
          message: 'No products configured'
        };
      }

      const eligibleItemsInCart = cartItems.filter(item => {
        const itemProductId = item.product_id || item.id;
        return eligibleProductIds.includes(itemProductId);
      });

      const eligibleQuantity = eligibleItemsInCart.reduce(
        (sum, item) => sum + (item.quantity || 0), 
        0
      );

      if (couponType === 'bogo') {
        const buyQuantity = coupon.bogo_buy_quantity || 1;
        const getQuantity = coupon.bogo_get_quantity || 1;
        const totalRequired = buyQuantity + getQuantity;

        if (eligibleQuantity < totalRequired) {
          const itemsNeeded = totalRequired - eligibleQuantity;
          
          let itemName = 'item';
          if (eligibleItemsInCart.length > 0) {
            const title = eligibleItemsInCart[0].title?.toLowerCase() || '';
            if (title.includes('ring')) itemName = 'ring';
            else if (title.includes('bracelet')) itemName = 'bracelet';
            else if (title.includes('necklace')) itemName = 'necklace';
            else if (title.includes('earring')) itemName = 'earring';
          }

          return {
            eligible: false,
            reason: 'bogo_insufficient',
            message: `Add ${itemsNeeded} ${itemName}${itemsNeeded !== 1 ? 's' : ''} more`,
            itemsNeeded,
            totalRequired,
            currentItems: eligibleQuantity
          };
        }

        return {
          eligible: true,
          reason: 'eligible',
          message: 'Offer available'
        };
      }

      if (eligibleQuantity === 0) {
        return {
          eligible: false,
          reason: 'no_eligible_in_cart',
          message: 'Add eligible products'
        };
      }

      return {
        eligible: true,
        reason: 'eligible',
        message: 'Ready to apply'
      };
    }

    // Category-based coupons
    if (couponType === 'category_based') {
      const eligibleCategoryIds = coupon.eligible_category_ids || [];
      
      if (eligibleCategoryIds.length === 0) {
        return {
          eligible: true,
          reason: 'eligible',
          message: 'Ready to apply'
        };
      }

      const eligibleItemsInCart = cartItems.filter(item => 
        eligibleCategoryIds.includes(item.category_id)
      );

      if (eligibleItemsInCart.length === 0) {
        return {
          eligible: false,
          reason: 'no_eligible_in_cart',
          message: 'Add eligible items'
        };
      }

      return {
        eligible: true,
        reason: 'eligible',
        message: 'Ready to apply'
      };
    }

    return {
      eligible: true,
      reason: 'eligible',
      message: 'Ready to apply'
    };
  };

  /**
   * ⭐ Get coupon display value (special handling for BOGO)
   */
  const getCouponDisplayValue = (coupon) => {
    if (coupon.coupon_type === 'bogo') {
      return `Buy ${coupon.bogo_buy_quantity} Get ${coupon.bogo_get_quantity}`;
    }
    return formatDiscountText(coupon);
  };

  const categorizedCoupons = useMemo(() => {
    const couponsWithEligibility = availableCoupons.map(coupon => ({
      ...coupon,
      eligibility: calculateCouponEligibility(coupon)
    }));

    const eligible = couponsWithEligibility.filter(c => c.eligibility.eligible);
    const notEligible = couponsWithEligibility.filter(c => !c.eligibility.eligible);

    eligible.sort((a, b) => {
      const savingsA = a.discount_type === 'Percent' 
        ? Math.min((cartTotal * a.discount_value / 100), a.max_discount || Infinity)
        : a.discount_value;
      const savingsB = b.discount_type === 'Percent' 
        ? Math.min((cartTotal * b.discount_value / 100), b.max_discount || Infinity)
        : b.discount_value;
      return savingsB - savingsA;
    });

    notEligible.sort((a, b) => {
      const shortfallA = a.eligibility.shortfall || a.eligibility.itemsNeeded || 999999;
      const shortfallB = b.eligibility.shortfall || b.eligibility.itemsNeeded || 999999;
      return shortfallA - shortfallB;
    });

    return { eligible, notEligible, total: couponsWithEligibility.length };
  }, [availableCoupons, cartTotal, cartItems]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCouponInput(value);
    setError(null);
  };

  const handleApplyCoupon = async () => {
    setError(null);

    const formatValidation = validateCouponFormat(couponInput);
    if (!formatValidation.valid) {
      setError(formatValidation.error);
      return;
    }

    if (cartTotal <= 0) {
      setError('Your cart is empty');
      return;
    }

    setValidating(true);

    try {
      const result = await validateCoupon(couponInput, cartTotal, cartItems);

      if (result.success) {
        const couponData = {
          code: result.data.coupon.code,
          discount: result.data.discount,
          description: result.data.coupon.description,
          savings_text: result.data.savings_text,
          coupon_type: result.data.coupon.coupon_type || 'cart_wide'
        };

        if (onCouponApply) {
          onCouponApply(couponData);
        }

        setCouponInput('');
        setError(null);
        fetchAvailableCoupons();
      } else {
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

  const handleRemoveCoupon = () => {
    if (onCouponRemove) {
      onCouponRemove();
    }
    setCouponInput('');
    setError(null);
    fetchAvailableCoupons();
  };

  const handleApplyCouponFromList = async (coupon) => {
    const eligibility = calculateCouponEligibility(coupon);
    
    if (!eligibility.eligible) {
      setError(eligibility.message);
      setShowAvailableCoupons(false);
      return;
    }

    setCouponInput(coupon.code);
    setShowAvailableCoupons(false);
    setError(null);

    if (cartTotal <= 0) {
      setError('Your cart is empty');
      return;
    }

    setValidating(true);

    try {
      const result = await validateCoupon(coupon.code, cartTotal, cartItems);

      if (result.success) {
        const couponData = {
          code: result.data.coupon.code,
          discount: result.data.discount,
          description: result.data.coupon.description,
          savings_text: result.data.savings_text,
          coupon_type: result.data.coupon.coupon_type || 'cart_wide'
        };

        if (onCouponApply) {
          onCouponApply(couponData);
        }

        setCouponInput('');
        setError(null);
        fetchAvailableCoupons();
      } else {
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
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-tpppink px-5 py-3.5 border-b-2 border-tpppink/20">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-white" strokeWidth={2.5} />
          <h3 className="text-base font-bold text-white">Apply Coupon</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* Applied Coupon State */}
        {appliedCoupon ? (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check size={20} className="text-white" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-0.5">
                  Coupon Applied
                </p>
                <p className="text-lg font-bold text-green-800 font-mono mb-1">
                  {appliedCoupon.code}
                </p>
                {appliedCoupon.description && (
                  <p className="text-sm text-green-700 mb-2">
                    {appliedCoupon.description}
                  </p>
                )}
                <p className="text-base font-bold text-green-800">
                  {formatSavingsText(appliedCoupon.discount)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                disabled={disabled}
                className="text-green-700 hover:text-red-600 transition-colors disabled:opacity-50 p-1.5 hover:bg-red-50 rounded-lg flex-shrink-0"
                title="Remove coupon"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          /* Input State */
          <div className="space-y-4">
            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={couponInput}
                onChange={handleInputChange}
                disabled={validating || disabled}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink disabled:bg-slate-50 disabled:text-slate-400 uppercase font-mono text-sm font-bold placeholder:normal-case placeholder:font-normal transition-all"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || validating || disabled}
                className="px-5 py-2.5 bg-tpppink text-white rounded-lg font-bold hover:bg-tpppink/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap active:scale-95"
              >
                {validating ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span className="hidden sm:inline">Applying</span>
                  </>
                ) : (
                  <>
                    <Tag size={16} />
                    <span className="hidden sm:inline">Apply</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Available Coupons Toggle */}
            {categorizedCoupons.total > 0 && (
              <div>
                <button
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-lg hover:border-tpppink/50 hover:bg-slate-100 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-tpppink" />
                    <span className="text-sm font-bold text-slate-700">
                      {categorizedCoupons.eligible.length > 0 
                        ? `${categorizedCoupons.eligible.length} Offer${categorizedCoupons.eligible.length !== 1 ? 's' : ''} Available`
                        : `${categorizedCoupons.total} Offer${categorizedCoupons.total !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {categorizedCoupons.eligible.length > 0 && (
                      <span className="px-2 py-0.5 bg-tpppink text-white rounded-full text-xs font-bold">
                        {categorizedCoupons.eligible.length}
                      </span>
                    )}
                    <svg 
                      className={`w-4 h-4 text-slate-600 transition-transform ${showAvailableCoupons ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Coupons List */}
                {showAvailableCoupons && (
                  <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {loadingCoupons ? (
                      <div className="p-8 text-center">
                        <Loader size={24} className="animate-spin mx-auto text-tpppink mb-2" />
                        <p className="text-sm text-slate-500">Loading offers...</p>
                      </div>
                    ) : (
                      <>
                        {/* Available Coupons */}
                        {categorizedCoupons.eligible.map((coupon) => {
                          const eligibility = coupon.eligibility;

                          return (
                            <button
                              key={coupon.id}
                              onClick={() => handleApplyCouponFromList(coupon)}
                              disabled={disabled}
                              className="w-full p-3.5 border-2 border-tpppink/30 bg-white hover:bg-tpppink/5 hover:border-tpppink rounded-lg text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-tpppink font-mono uppercase">
                                      {coupon.code}
                                    </p>
                                    {coupon.coupon_type === 'bogo' && (
                                      <span className="px-1.5 py-0.5 bg-tpppink text-white rounded text-[10px] font-bold uppercase">
                                        BOGO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 mb-1.5 line-clamp-1">
                                    {coupon.description}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                    <Check size={12} className="text-tpppink" />
                                    {eligibility.message}
                                  </p>
                                </div>

                                <div className="px-3 py-1.5 rounded-lg bg-tpppink text-white text-xs font-bold whitespace-nowrap flex-shrink-0">
                                  {getCouponDisplayValue(coupon)}
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* Locked Coupons */}
                        {categorizedCoupons.notEligible.length > 0 && (
                          <>
                            {categorizedCoupons.eligible.length > 0 && (
                              <div className="pt-2 pb-1">
                                <div className="h-px bg-slate-200" />
                              </div>
                            )}
                            
                            {categorizedCoupons.notEligible.map((coupon) => {
                              const eligibility = coupon.eligibility;

                              return (
                                <div
                                  key={coupon.id}
                                  className="p-3.5 border-2 border-slate-200 bg-slate-50 rounded-lg opacity-60 cursor-not-allowed"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Lock size={14} className="text-slate-400 flex-shrink-0" />
                                        <p className="text-sm font-bold text-slate-600 font-mono uppercase">
                                          {coupon.code}
                                        </p>
                                        {coupon.coupon_type === 'bogo' && (
                                          <span className="px-1.5 py-0.5 bg-slate-300 text-slate-600 rounded text-[10px] font-bold uppercase">
                                            BOGO
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-500 mb-1.5 line-clamp-1">
                                        {coupon.description}
                                      </p>
                                      <p className="text-xs font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">
                                        {eligibility.message}
                                      </p>
                                    </div>

                                    <div className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-bold whitespace-nowrap flex-shrink-0">
                                      {getCouponDisplayValue(coupon)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </>
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