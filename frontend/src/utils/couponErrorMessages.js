// frontend/src/utils/couponErrorMessages.js
/**
 * Coupon Error Messages
 * Centralized error message mapping for better UX
 */

export const COUPON_ERROR_CODES = {
  // Not Found Errors
  COUPON_NOT_FOUND: 'COUPON_NOT_FOUND',
  
  // Validation Errors
  COUPON_INVALID: 'COUPON_INVALID',
  INVALID_FORMAT: 'INVALID_FORMAT',
  MISSING_CODE: 'MISSING_CODE',
  
  // Usage Limit Errors
  USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',
  USER_LIMIT_REACHED: 'USER_LIMIT_REACHED',
  
  // Order Requirements
  MIN_ORDER_NOT_MET: 'MIN_ORDER_NOT_MET',
  INVALID_CART_TOTAL: 'INVALID_CART_TOTAL',
  
  // Auth Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  
  // Server Errors
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED'
};

/**
 * Get user-friendly error message for coupon errors
 * @param {string} errorCode - Error code from API
 * @param {Object} errorData - Additional error data (shortfall, etc.)
 * @param {string} originalMessage - Original error message from API
 * @returns {string} User-friendly error message
 */
export const getCouponErrorMessage = (errorCode, errorData = {}, originalMessage = '') => {
  // If we have a shortfall, use it for MIN_ORDER_NOT_MET
  if (errorCode === COUPON_ERROR_CODES.MIN_ORDER_NOT_MET && errorData.shortfall) {
    return `Add ₹${Math.ceil(errorData.shortfall)} more to your cart to use this coupon`;
  }

  // Map error codes to user-friendly messages
  const errorMessages = {
    [COUPON_ERROR_CODES.COUPON_NOT_FOUND]: 
      'Invalid coupon code. Please check and try again.',
    
    [COUPON_ERROR_CODES.COUPON_INVALID]: 
      'This coupon is not valid or has expired.',
    
    [COUPON_ERROR_CODES.INVALID_FORMAT]: 
      'Please enter a valid coupon code.',
    
    [COUPON_ERROR_CODES.MISSING_CODE]: 
      'Please enter a coupon code.',
    
    [COUPON_ERROR_CODES.USAGE_LIMIT_REACHED]: 
      'This coupon has reached its maximum usage limit.',
    
    [COUPON_ERROR_CODES.USER_LIMIT_REACHED]: 
      originalMessage || 'You have already used this coupon the maximum number of times.',
    
    [COUPON_ERROR_CODES.MIN_ORDER_NOT_MET]: 
      originalMessage || 'Your cart total does not meet the minimum order value.',
    
    [COUPON_ERROR_CODES.INVALID_CART_TOTAL]: 
      'Invalid cart total. Please refresh and try again.',
    
    [COUPON_ERROR_CODES.AUTH_REQUIRED]: 
      'Please log in to use coupons.',
    
    [COUPON_ERROR_CODES.SERVER_ERROR]: 
      'Unable to validate coupon. Please try again.',
    
    [COUPON_ERROR_CODES.VALIDATION_FAILED]: 
      originalMessage || 'Unable to apply coupon. Please try again.'
  };

  // Return mapped message or original message or fallback
  return errorMessages[errorCode] || originalMessage || 'Unable to apply coupon. Please try again.';
};

/**
 * Get toast variant based on error code
 * @param {string} errorCode - Error code
 * @returns {string} Toast variant ('error', 'warning', 'info')
 */
export const getCouponErrorVariant = (errorCode) => {
  const warningCodes = [
    COUPON_ERROR_CODES.MIN_ORDER_NOT_MET,
    COUPON_ERROR_CODES.USER_LIMIT_REACHED,
    COUPON_ERROR_CODES.USAGE_LIMIT_REACHED
  ];

  return warningCodes.includes(errorCode) ? 'warning' : 'error';
};

/**
 * Check if error is user-fixable
 * @param {string} errorCode - Error code
 * @returns {boolean} True if user can fix the error
 */
export const isUserFixableError = (errorCode) => {
  const fixableCodes = [
    COUPON_ERROR_CODES.MIN_ORDER_NOT_MET,
    COUPON_ERROR_CODES.INVALID_FORMAT,
    COUPON_ERROR_CODES.MISSING_CODE,
    COUPON_ERROR_CODES.COUPON_NOT_FOUND
  ];

  return fixableCodes.includes(errorCode);
};

export default {
  COUPON_ERROR_CODES,
  getCouponErrorMessage,
  getCouponErrorVariant,
  isUserFixableError
};