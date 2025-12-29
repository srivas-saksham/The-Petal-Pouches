// frontend/src/utils/deliveryStorage.js

/**
 * Delivery Data Storage Helper
 * Manages localStorage for delivery information (address + TAT)
 * ⭐ UPDATED: Now includes coupon data persistence
 * Persists forever - no expiry on delivery data
 */

const STORAGE_KEY = 'tpp_delivery_data';
const COUPON_STORAGE_KEY = 'tpp_applied_coupon'; // ⭐ NEW

/**
 * Save delivery data to localStorage
 * @param {Object} data - Delivery information
 * @param {string} data.selectedAddressId - UUID of selected address (authenticated users)
 * @param {string} data.guestPinCode - PIN code for guests
 * @param {Object} data.deliveryCheck - Full TAT check result from Delhivery
 */
export const saveDeliveryData = (data) => {
  try {
    const storageData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    console.log('💾 [DeliveryStorage] Saved:', storageData);
    return true;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Save failed:', error);
    return false;
  }
};

/**
 * Get delivery data from localStorage
 * @returns {Object|null} Stored delivery data or null
 */
export const getDeliveryData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('📭 [DeliveryStorage] No data found');
      return null;
    }
    
    const data = JSON.parse(stored);
    console.log('📬 [DeliveryStorage] Retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Retrieve failed:', error);
    return null;
  }
};

/**
 * Clear delivery data from localStorage
 */
export const clearDeliveryData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ [DeliveryStorage] Cleared');
    return true;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Clear failed:', error);
    return false;
  }
};

/**
 * Update specific field in delivery data
 * @param {string} field - Field to update
 * @param {any} value - New value
 */
export const updateDeliveryField = (field, value) => {
  try {
    const current = getDeliveryData() || {};
    current[field] = value;
    current.timestamp = Date.now();
    
    return saveDeliveryData(current);
  } catch (error) {
    console.error('❌ [DeliveryStorage] Update failed:', error);
    return false;
  }
};

/**
 * Check if delivery check data is recent (within 24 hours)
 * Used to decide if re-verification is needed
 * @returns {boolean} True if data is recent
 */
export const isDeliveryCheckRecent = () => {
  try {
    const data = getDeliveryData();
    if (!data || !data.timestamp) return false;
    
    const hoursSinceCheck = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    return hoursSinceCheck < 24;
  } catch (error) {
    return false;
  }
};

/**
 * Get stored PIN code (for guests or last checked)
 * @returns {string|null} PIN code or null
 */
export const getStoredPinCode = () => {
  const data = getDeliveryData();
  return data?.guestPinCode || data?.deliveryCheck?.pinCode || null;
};

/**
 * Get stored address ID (for authenticated users)
 * @returns {string|null} Address UUID or null
 */
export const getStoredAddressId = () => {
  const data = getDeliveryData();
  return data?.selectedAddressId || null;
};

/**
 * Get stored delivery check result
 * @returns {Object|null} Delivery check result or null
 */
export const getStoredDeliveryCheck = () => {
  const data = getDeliveryData();
  return data?.deliveryCheck || null;
};

// ==================== ⭐ NEW: COUPON STORAGE FUNCTIONS ====================

/**
 * Save applied coupon to localStorage
 * @param {Object} couponData - Coupon information
 * @param {string} couponData.code - Coupon code
 * @param {number} couponData.discount - Discount amount
 * @param {string} couponData.description - Coupon description
 */
export const saveCouponData = (couponData) => {
  try {
    const storageData = {
      ...couponData,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(storageData));
    console.log('🎟️ [DeliveryStorage] Coupon saved:', storageData);
    return true;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Coupon save failed:', error);
    return false;
  }
};

/**
 * Get applied coupon from localStorage
 * @returns {Object|null} Stored coupon data or null
 */
export const getCouponData = () => {
  try {
    const stored = localStorage.getItem(COUPON_STORAGE_KEY);
    if (!stored) {
      console.log('📭 [DeliveryStorage] No coupon found');
      return null;
    }
    
    const data = JSON.parse(stored);
    
    // Check if coupon is expired (24 hours)
    const hoursSinceSaved = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    if (hoursSinceSaved > 24) {
      console.log('⏰ [DeliveryStorage] Coupon expired (>24h), clearing');
      clearCouponData();
      return null;
    }
    
    console.log('🎟️ [DeliveryStorage] Coupon retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Coupon retrieve failed:', error);
    return null;
  }
};

/**
 * Clear coupon data from localStorage
 */
export const clearCouponData = () => {
  try {
    localStorage.removeItem(COUPON_STORAGE_KEY);
    console.log('🗑️ [DeliveryStorage] Coupon cleared');
    return true;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Coupon clear failed:', error);
    return false;
  }
};

/**
 * Check if stored coupon is still valid (within 24 hours)
 * @returns {boolean} True if coupon is recent
 */
export const isCouponRecent = () => {
  try {
    const data = getCouponData();
    if (!data || !data.timestamp) return false;
    
    const hoursSinceSaved = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    return hoursSinceSaved < 24;
  } catch (error) {
    return false;
  }
};

/**
 * Clear all checkout-related data (delivery + coupon)
 * Use this after successful order completion
 */
export const clearAllCheckoutData = () => {
  try {
    clearDeliveryData();
    clearCouponData();
    console.log('🧹 [DeliveryStorage] All checkout data cleared');
    return true;
  } catch (error) {
    console.error('❌ [DeliveryStorage] Clear all failed:', error);
    return false;
  }
};

export default {
  // Delivery storage
  saveDeliveryData,
  getDeliveryData,
  clearDeliveryData,
  updateDeliveryField,
  isDeliveryCheckRecent,
  getStoredPinCode,
  getStoredAddressId,
  getStoredDeliveryCheck,
  
  // ⭐ NEW: Coupon storage
  saveCouponData,
  getCouponData,
  clearCouponData,
  isCouponRecent,
  
  // ⭐ NEW: Combined cleanup
  clearAllCheckoutData
};