// frontend/src/services/adminCouponService.js
/**
 * Admin Coupon Service
 * API calls for admin coupon management
 */

import adminApi from './adminApi'; 

/**
 * Get all coupons with filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Coupons list
 */
export const getAllCoupons = async (params = {}) => {
  try {
    const { page = 1, limit = 20, status = null, search = null } = params;

    console.log('📋 [AdminCouponService] Fetching coupons:', params);

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    const response = await adminApi.get(`/api/admin/coupons?${queryParams}`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Coupons fetched:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to fetch coupons'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Fetch error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch coupons'
    };
  }
};

/**
 * Get single coupon by ID
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Coupon data
 */
export const getCouponById = async (id) => {
  try {
    console.log('🔍 [AdminCouponService] Fetching coupon:', id);

    const response = await adminApi.get(`/api/admin/coupons/${id}`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Coupon fetched:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to fetch coupon'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Fetch error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch coupon'
    };
  }
};

/**
 * Get eligible products and categories for a coupon
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Eligible items data
 */
export const getEligibleItems = async (id) => {
  try {
    console.log('🔍 [AdminCouponService] Fetching eligible items:', id);

    const response = await adminApi.get(`/api/admin/coupons/${id}/eligible-items`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Eligible items fetched:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to fetch eligible items'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Fetch eligible items error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch eligible items'
    };
  }
};

/**
 * Create new coupon
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} Created coupon
 */
export const createCoupon = async (couponData) => {
  try {
    console.log('➕ [AdminCouponService] Creating coupon:', couponData.code);

    const response = await adminApi.post('/api/admin/coupons', couponData);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Coupon created:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to create coupon'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Create error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create coupon'
    };
  }
};

/**
 * Update existing coupon
 * @param {string} id - Coupon ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated coupon
 */
export const updateCoupon = async (id, updates) => {
  try {
    console.log('✏️ [AdminCouponService] Updating coupon:', id);

    const response = await adminApi.put(`/api/admin/coupons/${id}`, updates);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Coupon updated:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to update coupon'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Update error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update coupon'
    };
  }
};

/**
 * Delete coupon
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Success status
 */
export const deleteCoupon = async (id) => {
  try {
    console.log('🗑️ [AdminCouponService] Deleting coupon:', id);

    const response = await adminApi.delete(`/api/admin/coupons/${id}`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Coupon deleted');
      return {
        success: true,
        message: response.data.message
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to delete coupon'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Delete error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete coupon'
    };
  }
};

/**
 * Toggle coupon active status
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Updated coupon
 */
export const toggleCouponStatus = async (id) => {
  try {
    console.log('🔄 [AdminCouponService] Toggling coupon status:', id);

    const response = await adminApi.patch(`/api/admin/coupons/${id}/toggle`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Status toggled:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to toggle status'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Toggle error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to toggle status'
    };
  }
};

/**
 * Get coupon statistics
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Stats data
 */
export const getCouponStats = async (id) => {
  try {
    console.log('📊 [AdminCouponService] Fetching stats:', id);

    const response = await adminApi.get(`/api/admin/coupons/${id}/stats`);

    if (response.data.success) {
      console.log('✅ [AdminCouponService] Stats fetched:', response.data.data);
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      error: response.data.message || 'Failed to fetch stats'
    };

  } catch (error) {
    console.error('❌ [AdminCouponService] Stats error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stats'
    };
  }
};

export default {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats,
  getEligibleItems 
};