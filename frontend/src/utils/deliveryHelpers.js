// frontend/src/utils/deliveryHelpers.js

/**
 * Delivery Helper Functions
 * Calculate and format delivery information
 */

/**
 * Estimate delivery date based on ZIP code
 * @param {string} zipCode - Delivery ZIP code (optional)
 * @returns {Object} { minDate, maxDate, daysMin, daysMax }
 */
export const estimateDeliveryDate = (zipCode = null) => {
  const today = new Date();
  
  // Default: 5-7 business days
  let daysMin = 5;
  let daysMax = 7;
  
  // Adjust based on ZIP (mock logic - replace with real data)
  if (zipCode) {
    const firstDigit = parseInt(zipCode[0]);
    if (firstDigit >= 1 && firstDigit <= 3) {
      daysMin = 3;
      daysMax = 5;
    } else if (firstDigit >= 7) {
      daysMin = 7;
      daysMax = 10;
    }
  }
  
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + daysMin);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + daysMax);
  
  return {
    minDate,
    maxDate,
    daysMin,
    daysMax
  };
};

/**
 * Format date for delivery display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "Dec 10")
 */
export const formatDeliveryDate = (date) => {
  if (!date) return '';
  
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get delivery date range string
 * @param {string} zipCode - Optional ZIP code
 * @returns {string} Date range (e.g., "Dec 10 - Dec 12")
 */
export const getDeliveryDateRange = (zipCode = null) => {
  const { minDate, maxDate } = estimateDeliveryDate(zipCode);
  return `${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
};

/**
 * Calculate shipping cost based on cart total
 * @param {number} cartTotal - Cart subtotal
 * @returns {number} Shipping cost (0 if free)
 */
export const calculateShippingCost = (cartTotal) => {
  // Free shipping for orders above ₹499
  if (cartTotal >= 499) return 0;
  
  // Standard shipping
  return 50;
};

/**
 * Check if eligible for free shipping
 * @param {number} cartTotal - Cart subtotal
 * @returns {Object} { isFree, amountNeeded }
 */
export const checkFreeShippingEligibility = (cartTotal) => {
  const freeShippingThreshold = 499;
  const isFree = cartTotal >= freeShippingThreshold;
  const amountNeeded = isFree ? 0 : freeShippingThreshold - cartTotal;
  
  return {
    isFree,
    amountNeeded,
    threshold: freeShippingThreshold
  };
};

/**
 * Get free shipping progress percentage
 * @param {number} cartTotal - Cart subtotal
 * @returns {number} Progress percentage (0-100)
 */
export const getFreeShippingProgress = (cartTotal) => {
  const threshold = 499;
  const progress = Math.min(100, (cartTotal / threshold) * 100);
  return Math.round(progress);
};

/**
 * Format shipping message
 * @param {number} cartTotal - Cart subtotal
 * @returns {string} Shipping message
 */
export const getShippingMessage = (cartTotal) => {
  const { isFree, amountNeeded } = checkFreeShippingEligibility(cartTotal);
  
  if (isFree) {
    return 'FREE SHIPPING';
  }
  
  return `Add ₹${amountNeeded} more for FREE shipping`;
};

/**
 * Get delivery speed text
 * @param {number} days - Delivery days
 * @returns {string} Speed text
 */
export const getDeliverySpeed = (days) => {
  if (days <= 2) return 'Express Delivery';
  if (days <= 5) return 'Fast Delivery';
  return 'Standard Delivery';
};

/**
 * Check if delivery is available for ZIP
 * @param {string} zipCode - ZIP code to check
 * @returns {boolean} True if serviceable
 */
export const isDeliveryAvailable = (zipCode) => {
  if (!zipCode || zipCode.length !== 6) return false;
  
  // Mock: All 6-digit Indian PIN codes are serviceable
  return /^\d{6}$/.test(zipCode);
};

export default {
  estimateDeliveryDate,
  formatDeliveryDate,
  getDeliveryDateRange,
  calculateShippingCost,
  checkFreeShippingEligibility,
  getFreeShippingProgress,
  getShippingMessage,
  getDeliverySpeed,
  isDeliveryAvailable
};