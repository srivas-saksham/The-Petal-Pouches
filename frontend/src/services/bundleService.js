// frontend/src/services/bundleService.js - FINAL COMPLETE VERSION
// This file combines BOTH public shop functions AND admin functions

import api, { createFormDataRequest, apiRequest } from './api';

// ==================== ADMIN BUNDLE METHODS ====================

/**
 * Get all bundles with filters and pagination (ADMIN)
 */
export const getBundles = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/bundles', { params })
  );
};

/**
 * Get single bundle by ID
 */
export const getBundleById = async (bundleId) => {
  return apiRequest(() => 
    api.get(`/api/bundles/${bundleId}`)
  );
};

/**
 * Get bundle with all items and product details (for detail pages)
 */
export const getBundleDetails = async (bundleId) => {
  return apiRequest(() => 
    api.get(`/api/bundles/${bundleId}/details`)
  );
};

/**
 * Create new bundle (ADMIN)
 */
export const createBundle = async (bundleData) => {
  const formData = createFormDataRequest(bundleData, 'image');
  
  return apiRequest(() => 
    api.post('/api/bundles/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Update existing bundle (ADMIN)
 */
export const updateBundle = async (bundleId, bundleData) => {
  const formData = createFormDataRequest(bundleData, 'image');
  
  return apiRequest(() => 
    api.put(`/api/bundles/admin/${bundleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Delete bundle (ADMIN)
 */
export const deleteBundle = async (bundleId) => {
  return apiRequest(() => 
    api.delete(`/api/bundles/admin/${bundleId}`)
  );
};

/**
 * Toggle bundle active status (ADMIN)
 */
export const toggleBundleStatus = async (bundleId) => {
  return apiRequest(() => 
    api.patch(`/api/bundles/admin/${bundleId}/toggle`)
  );
};

/**
 * Duplicate bundle (ADMIN)
 */
export const duplicateBundle = async (bundleId) => {
  return apiRequest(() => 
    api.post(`/api/bundles/admin/${bundleId}/duplicate`)
  );
};

/**
 * Check bundle stock availability
 */
export const checkBundleStock = async (bundleId) => {
  return apiRequest(() => 
    api.get(`/api/bundles/${bundleId}/stock`)
  );
};

/**
 * Get bundle statistics (ADMIN)
 */
export const getBundleStats = async () => {
  const result = await apiRequest(() => 
    api.get('/api/bundles', { 
      params: { limit: 1000 } // Get all for stats calculation
    })
  );

  if (!result.success) {
    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        total_value: 0,
        avg_discount: 0,
      },
    };
  }

  const bundles = result.data.data || [];
  
  const stats = {
    total: bundles.length,
    active: bundles.filter(b => b.is_active).length,
    inactive: bundles.filter(b => !b.is_active).length,
    total_value: bundles.reduce((sum, b) => sum + (b.price || 0), 0),
    avg_discount: bundles.length > 0 
      ? Math.round(
          bundles.reduce((sum, b) => sum + (b.discount_percent || 0), 0) / bundles.length
        )
      : 0,
  };

  return {
    success: true,
    data: stats,
  };
};

// ==================== PUBLIC SHOP METHODS ====================

/**
 * Get all bundles for shop (public - only active bundles)
 * @param {Object} params - { page, limit, sort, search, min_price, max_price }
 * @returns {Promise<Object>} { bundles, metadata }
 */
export const getAllBundles = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.search) queryParams.append('search', params.search);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    queryParams.append('active', 'true'); // Only active bundles

    const response = await api.get(`/bundles?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get bundles error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Search bundles (public)
 * @param {string} query - Search term
 * @param {Object} params - { page, limit }
 * @returns {Promise<Object>} Search results
 */
export const searchBundles = async (query, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      search: query,
      page: params.page || 1,
      limit: params.limit || 12,
      active: 'true'
    });

    const response = await api.get(`/bundles?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Search bundles error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get bundles by price range (public)
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {Object} params - { page, limit }
 * @returns {Promise<Object>} Filtered bundles
 */
export const getBundlesByPrice = async (minPrice, maxPrice, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 12,
      active: 'true'
    });

    if (minPrice) queryParams.append('min_price', minPrice);
    if (maxPrice) queryParams.append('max_price', maxPrice);

    const response = await api.get(`/bundles?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get bundles by price error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Add bundle to cart
 * @param {string} bundleId - Bundle UUID
 * @param {number} quantity - Quantity (default: 1)
 * @returns {Promise<Object>} Updated cart
 */
export const addBundleToCart = async (bundleId, quantity = 1) => {
  try {
    // First, get bundle details to add all items
    const bundleDetails = await getBundleDetails(bundleId);
    
    // Add each item from bundle to cart with bundle metadata
    const cartPromises = bundleDetails.data.items.map(item => {
      return api.post('/cart/items', {
        product_variant_id: item.product_variant_id,
        quantity: item.quantity * quantity,
        bundle_origin: 'brand_bundle',
        bundle_id: bundleId
      });
    });

    await Promise.all(cartPromises);

    // Return updated cart
    const cartResponse = await api.get('/cart');
    return cartResponse.data;
  } catch (error) {
    console.error('❌ Add bundle to cart error:', error);
    throw error.response?.data || error;
  }
};

// ==================== UTILITY METHODS ====================

/**
 * Get active bundles only
 */
export const getActiveBundles = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/bundles', { 
      params: { 
        active: 'true',
        ...params,
      } 
    })
  );
};

/**
 * Validate bundle items stock
 */
export const validateBundleItems = async (items) => {
  return apiRequest(() => 
    api.post('/api/bundles/validate-stock', { items })
  );
};

/**
 * Calculate bundle pricing
 */
export const calculateBundlePrice = (items, bundlePrice) => {
  const originalPrice = items.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return total + (price * item.quantity);
  }, 0);

  const savings = originalPrice - bundlePrice;
  const discountPercent = originalPrice > 0 
    ? Math.round((savings / originalPrice) * 100) 
    : 0;

  return {
    originalPrice,
    bundlePrice,
    savings,
    discountPercent,
  };
};

/**
 * Get bundles by discount range
 */
export const getBundlesByDiscount = async (minDiscount, maxDiscount) => {
  const result = await getBundles();
  
  if (!result.success) {
    return result;
  }

  const bundles = result.data.data || [];
  const filtered = bundles.filter(b => {
    const discount = b.discount_percent || 0;
    return discount >= minDiscount && discount <= maxDiscount;
  });

  return {
    success: true,
    data: {
      data: filtered,
      count: filtered.length,
    },
  };
};

/**
 * Get top selling bundles
 */
export const getTopBundles = async (limit = 10) => {
  const result = await getActiveBundles();
  
  if (!result.success) {
    return result;
  }

  const bundles = result.data.data || [];
  const sorted = bundles
    .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
    .slice(0, limit);

  return {
    success: true,
    data: {
      data: sorted,
      count: sorted.length,
    },
  };
};

/**
 * Bulk activate bundles (ADMIN)
 */
export const bulkActivateBundles = async (bundleIds) => {
  const results = await Promise.all(
    bundleIds.map(id => toggleBundleStatus(id))
  );
  
  return {
    success: results.every(r => r.success),
    data: results,
  };
};

/**
 * Bulk deactivate bundles (ADMIN)
 */
export const bulkDeactivateBundles = async (bundleIds) => {
  const results = await Promise.all(
    bundleIds.map(id => toggleBundleStatus(id))
  );
  
  return {
    success: results.every(r => r.success),
    data: results,
  };
};

/**
 * Bulk delete bundles (ADMIN)
 */
export const bulkDeleteBundles = async (bundleIds) => {
  const results = await Promise.all(
    bundleIds.map(id => deleteBundle(id))
  );
  
  return {
    success: results.every(r => r.success),
    data: results,
    deleted: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  };
};

/**
 * Get bundles with low stock items (ADMIN)
 */
export const getBundlesWithLowStock = async () => {
  const result = await getBundles();
  
  if (!result.success) {
    return result;
  }

  const bundles = result.data.data || [];
  const withLowStock = [];

  for (const bundle of bundles) {
    const stockCheck = await checkBundleStock(bundle.id);
    if (stockCheck.success && !stockCheck.data.available) {
      withLowStock.push({
        ...bundle,
        stockIssues: stockCheck.data.out_of_stock,
      });
    }
  }

  return {
    success: true,
    data: {
      data: withLowStock,
      count: withLowStock.length,
    },
  };
};

// Default export with all functions
export default {
  // Admin functions
  getBundles,
  getBundleById,
  getBundleDetails,
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  getBundleStats,
  
  // Public shop functions
  getAllBundles,
  searchBundles,
  getBundlesByPrice,
  addBundleToCart,
  checkBundleStock,
  
  // Utility functions
  getActiveBundles,
  validateBundleItems,
  calculateBundlePrice,
  getBundlesByDiscount,
  getTopBundles,
  bulkActivateBundles,
  bulkDeactivateBundles,
  bulkDeleteBundles,
  getBundlesWithLowStock,
};