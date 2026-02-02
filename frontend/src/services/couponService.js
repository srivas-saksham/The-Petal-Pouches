// frontend/src/services/couponService.js
/**
 * Coupon Service
 * Handles all coupon-related API calls
 */

import api from './api';

/**
 * Validate coupon code
 * ⭐ ENHANCED: Now passes cart_items for product-specific/BOGO validation
 * @param {string} code - Coupon code
 * @param {number} cartTotal - Current cart total
 * @param {Array} cartItems - Cart items array (optional)
 * @returns {Promise<Object>} Validation result
 */
export const validateCoupon = async (code, cartTotal, cartItems = []) => {
  try {
    console.log('🎟️ [CouponService] Validating:', code, 'Cart total:', cartTotal, 'Items:', cartItems.length);

    const response = await api.post('/api/coupons/validate', {
      code: code.trim().toUpperCase(),
      cart_total: cartTotal,
      cart_items: cartItems // ⭐ NEW: Pass cart items array
    });

    if (response.data.success) {
      console.log('✅ [CouponService] Coupon valid:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: response.data.message || 'Invalid coupon'
    };

  } catch (error) {
    // Don't log validation errors (400 = business logic, not system error)
    if (error.response?.status !== 400) {
      console.error('❌ [CouponService] Validation error:', error);
    }

    // Return exact error message from backend
    const errorMessage = error.response?.data?.message || 'Unable to validate coupon. Please try again.';
    const errorCode = error.response?.data?.code;
    const shortfall = error.response?.data?.shortfall;

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      shortfall: shortfall
    };
  }
};

/**
 * Get all active coupons
 * @param {number} cartTotal - Current cart total (optional)
 * @returns {Promise<Object>} Active coupons list
 */
export const getActiveCoupons = async (cartTotal = null) => {
  try {
    console.log('📋 [CouponService] Fetching active coupons');

    const params = cartTotal ? { cart_total: cartTotal } : {};

    const response = await api.get('/api/coupons/active', { params });

    if (response.data.success) {
      console.log('✅ [CouponService] Fetched coupons:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to fetch coupons'
    };

  } catch (error) {
    console.error('❌ [CouponService] Fetch error:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch coupons'
    };
  }
};

/**
 * Check user's usage of specific coupon
 * @param {string} code - Coupon code
 * @returns {Promise<Object>} Usage info
 */
export const checkCouponUsage = async (code) => {
  try {
    console.log('🔍 [CouponService] Checking usage for:', code);

    const response = await api.get(`/api/coupons/${code}/check-usage`);

    if (response.data.success) {
      console.log('✅ [CouponService] Usage info:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: 'Failed to check usage'
    };

  } catch (error) {
    console.error('❌ [CouponService] Check usage error:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to check coupon usage'
    };
  }
};

export default {
  validateCoupon,
  getActiveCoupons,
  checkCouponUsage
};