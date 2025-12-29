// backend/src/utils/couponHelpers.js
/**
 * Coupon Helper Functions
 * Utilities for coupon validation and discount calculations
 */

/**
 * Calculate discount amount based on coupon rules
 * @param {Object} coupon - Coupon object from database
 * @param {number} cartSubtotal - Cart subtotal amount
 * @returns {number} Calculated discount amount (rounded)
 */
const calculateDiscount = (coupon, cartSubtotal) => {
  if (!coupon || !cartSubtotal) {
    return 0;
  }

  let discount = 0;

  if (coupon.discount_type === 'Percent') {
    // Calculate percentage discount
    const rawDiscount = cartSubtotal * (coupon.discount_value / 100);
    
    // Apply max_discount cap if specified
    discount = coupon.max_discount 
      ? Math.min(rawDiscount, coupon.max_discount)
      : rawDiscount;
  } else if (coupon.discount_type === 'Fixed') {
    // Fixed amount discount (cannot exceed cart total)
    discount = Math.min(coupon.discount_value, cartSubtotal);
  }

  // Round to nearest rupee
  return Math.round(discount);
};

/**
 * Check if coupon is currently valid (date and active status)
 * @param {Object} coupon - Coupon object
 * @returns {Object} { valid: boolean, reason: string }
 */
const isCouponValid = (coupon) => {
  if (!coupon) {
    return { valid: false, reason: 'Coupon not found' };
  }

  // Check if coupon is active
  if (!coupon.is_active) {
    return { valid: false, reason: 'This coupon is not active' };
  }

  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const endDate = new Date(coupon.end_date);

  // Check if coupon has started
  if (now < startDate) {
    return { 
      valid: false, 
      reason: `This coupon will be valid from ${startDate.toLocaleDateString('en-IN')}` 
    };
  }

  // Check if coupon has expired
  if (now > endDate) {
    return { valid: false, reason: 'This coupon has expired' };
  }

  return { valid: true };
};

/**
 * Check if cart meets minimum order value requirement
 * @param {Object} coupon - Coupon object
 * @param {number} cartSubtotal - Cart subtotal
 * @returns {Object} { valid: boolean, reason: string, shortfall: number }
 */
const checkMinimumOrderValue = (coupon, cartSubtotal) => {
  if (!coupon.min_order_value || cartSubtotal >= coupon.min_order_value) {
    return { valid: true };
  }

  const shortfall = coupon.min_order_value - cartSubtotal;

  return {
    valid: false,
    reason: `Minimum order value of ₹${coupon.min_order_value} required`,
    shortfall: Math.round(shortfall)
  };
};

/**
 * Check if coupon has reached usage limit
 * @param {Object} coupon - Coupon object
 * @returns {Object} { valid: boolean, reason: string }
 */
const checkUsageLimit = (coupon) => {
  // If no usage_limit set, unlimited usage allowed
  if (!coupon.usage_limit) {
    return { valid: true };
  }

  const usageCount = coupon.usage_count || 0;

  if (usageCount >= coupon.usage_limit) {
    return { 
      valid: false, 
      reason: 'This coupon has reached its usage limit' 
    };
  }

  return { valid: true };
};

/**
 * Format coupon for API response
 * @param {Object} coupon - Raw coupon from database
 * @param {number} cartSubtotal - Current cart subtotal (optional)
 * @returns {Object} Formatted coupon data
 */
const formatCouponResponse = (coupon, cartSubtotal = null) => {
  const formatted = {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_value: coupon.min_order_value,
    max_discount: coupon.max_discount,
    start_date: coupon.start_date,
    end_date: coupon.end_date,
    is_active: coupon.is_active,
    usage_limit: coupon.usage_limit,
    usage_per_user: coupon.usage_per_user,
    usage_count: coupon.usage_count || 0,
    remaining_uses: coupon.usage_limit 
      ? Math.max(0, coupon.usage_limit - (coupon.usage_count || 0))
      : null
  };

  // Add calculated discount if cart subtotal provided
  if (cartSubtotal !== null) {
    formatted.calculated_discount = calculateDiscount(coupon, cartSubtotal);
  }

  // Add unlock status if cart subtotal provided
  if (cartSubtotal !== null && coupon.min_order_value) {
    formatted.is_unlocked = cartSubtotal >= coupon.min_order_value;
    formatted.unlock_amount = Math.max(0, coupon.min_order_value - cartSubtotal);
  }

  return formatted;
};

/**
 * Get user-friendly discount display text
 * @param {Object} coupon - Coupon object
 * @returns {string} Display text (e.g., "10% OFF" or "₹100 OFF")
 */
const getDiscountDisplayText = (coupon) => {
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
 * Validate coupon code format (basic check before DB query)
 * @param {string} code - Coupon code
 * @returns {Object} { valid: boolean, reason: string }
 */
const validateCouponFormat = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, reason: 'Please enter a coupon code' };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < 3) {
    return { valid: false, reason: 'Coupon code too short' };
  }

  if (trimmedCode.length > 50) {
    return { valid: false, reason: 'Coupon code too long' };
  }

  // Allow alphanumeric and hyphens only
  if (!/^[A-Z0-9-]+$/.test(trimmedCode)) {
    return { 
      valid: false, 
      reason: 'Coupon code can only contain letters, numbers, and hyphens' 
    };
  }

  return { valid: true, code: trimmedCode };
};

/**
 * Get coupon status badge info
 * @param {Object} coupon - Coupon object
 * @returns {Object} { status: string, color: string, label: string }
 */
const getCouponStatus = (coupon) => {
  if (!coupon.is_active) {
    return { status: 'inactive', color: 'gray', label: 'Inactive' };
  }

  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const endDate = new Date(coupon.end_date);

  if (now < startDate) {
    return { status: 'scheduled', color: 'blue', label: 'Scheduled' };
  }

  if (now > endDate) {
    return { status: 'expired', color: 'red', label: 'Expired' };
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { status: 'exhausted', color: 'orange', label: 'Limit Reached' };
  }

  return { status: 'active', color: 'green', label: 'Active' };
};

module.exports = {
  calculateDiscount,
  isCouponValid,
  checkMinimumOrderValue,
  checkUsageLimit,
  formatCouponResponse,
  getDiscountDisplayText,
  validateCouponFormat,
  getCouponStatus
};