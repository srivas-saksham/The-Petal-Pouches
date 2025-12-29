// frontend/src/utils/couponHelpers.js
/**
 * Coupon Helper Functions (Frontend)
 * Utilities for coupon formatting and validation
 */

/**
 * Format discount text for display
 * @param {Object} coupon - Coupon object
 * @returns {string} Formatted discount text
 */
export const formatDiscountText = (coupon) => {
  if (!coupon) return '';

  if (coupon.discount_type === 'Percent') {
    let text = `${coupon.discount_value}% OFF`;
    if (coupon.max_discount) {
      text += ` (up to ₹${coupon.max_discount})`;
    }
    return text;
  } else {
    return `₹${coupon.discount_value} OFF`;
  }
};

/**
 * Format coupon code for display (uppercase, trimmed)
 * @param {string} code - Raw coupon code
 * @returns {string} Formatted code
 */
export const formatCouponCode = (code) => {
  if (!code) return '';
  return code.trim().toUpperCase();
};

/**
 * Validate coupon code format (client-side)
 * @param {string} code - Coupon code to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateCouponFormat = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Please enter a coupon code' };
  }

  const trimmedCode = code.trim();

  if (trimmedCode.length === 0) {
    return { valid: false, error: 'Please enter a coupon code' };
  }

  if (trimmedCode.length < 3) {
    return { valid: false, error: 'Coupon code is too short' };
  }

  if (trimmedCode.length > 50) {
    return { valid: false, error: 'Coupon code is too long' };
  }

  // Allow alphanumeric and hyphens only
  if (!/^[A-Za-z0-9-]+$/.test(trimmedCode)) {
    return { 
      valid: false, 
      error: 'Coupon code can only contain letters, numbers, and hyphens' 
    };
  }

  return { valid: true };
};

/**
 * Get unlock message for locked coupons
 * @param {Object} coupon - Coupon object
 * @param {number} currentTotal - Current cart total
 * @returns {string} Unlock message
 */
export const getUnlockMessage = (coupon, currentTotal) => {
  if (!coupon.min_order_value) {
    return 'Available now';
  }

  if (currentTotal >= coupon.min_order_value) {
    return 'Unlocked!';
  }

  const shortfall = coupon.min_order_value - currentTotal;
  return `Add ₹${Math.ceil(shortfall)} more to unlock`;
};

/**
 * Check if coupon is unlocked
 * @param {Object} coupon - Coupon object
 * @param {number} currentTotal - Current cart total
 * @returns {boolean} True if unlocked
 */
export const isCouponUnlocked = (coupon, currentTotal) => {
  if (!coupon.min_order_value) return true;
  return currentTotal >= coupon.min_order_value;
};

/**
 * Get coupon status color
 * @param {boolean} isUnlocked - Whether coupon is unlocked
 * @param {boolean} isApplied - Whether coupon is applied
 * @returns {string} Tailwind color class
 */
export const getCouponStatusColor = (isUnlocked, isApplied) => {
  if (isApplied) return 'bg-green-100 text-green-700 border-green-300';
  if (isUnlocked) return 'bg-blue-100 text-blue-700 border-blue-300';
  return 'bg-gray-100 text-gray-600 border-gray-300';
};

/**
 * Format savings text
 * @param {number} discount - Discount amount
 * @returns {string} Formatted savings text
 */
export const formatSavingsText = (discount) => {
  if (!discount || discount <= 0) return '';
  return `You saved ₹${Math.round(discount)}!`;
};

/**
 * Get error message based on error code
 * @param {string} code - Error code from API
 * @param {Object} data - Additional error data (shortfall, etc.)
 * @returns {string} User-friendly error message
 */
export const getCouponErrorMessage = (code, data = {}) => {
  switch (code) {
    case 'COUPON_NOT_FOUND':
      return 'Invalid coupon code';
    
    case 'COUPON_INVALID':
      return 'This coupon is not valid';
    
    case 'MIN_ORDER_NOT_MET':
      if (data.shortfall) {
        return `Add ₹${Math.ceil(data.shortfall)} more to use this coupon`;
      }
      return 'Minimum order value not met';
    
    case 'USAGE_LIMIT_REACHED':
      return 'This coupon has reached its usage limit';
    
    case 'USER_LIMIT_REACHED':
      return 'You have already used this coupon maximum times';
    
    default:
      return 'Unable to apply coupon';
  }
};

/**
 * Calculate estimated savings
 * @param {Object} coupon - Coupon object
 * @param {number} cartTotal - Current cart total
 * @returns {number} Estimated discount amount
 */
export const calculateEstimatedSavings = (coupon, cartTotal) => {
  if (!coupon || !cartTotal) return 0;

  let discount = 0;

  if (coupon.discount_type === 'Percent') {
    discount = cartTotal * (coupon.discount_value / 100);
    if (coupon.max_discount) {
      discount = Math.min(discount, coupon.max_discount);
    }
  } else {
    discount = Math.min(coupon.discount_value, cartTotal);
  }

  return Math.round(discount);
};

/**
 * Sort coupons by best value
 * @param {Array} coupons - Array of coupons
 * @param {number} cartTotal - Current cart total
 * @returns {Array} Sorted coupons (best first)
 */
export const sortCouponsByValue = (coupons, cartTotal) => {
  return [...coupons].sort((a, b) => {
    const savingsA = calculateEstimatedSavings(a, cartTotal);
    const savingsB = calculateEstimatedSavings(b, cartTotal);
    return savingsB - savingsA; // Descending order
  });
};

export default {
  formatDiscountText,
  formatCouponCode,
  validateCouponFormat,
  getUnlockMessage,
  isCouponUnlocked,
  getCouponStatusColor,
  formatSavingsText,
  getCouponErrorMessage,
  calculateEstimatedSavings,
  sortCouponsByValue
};