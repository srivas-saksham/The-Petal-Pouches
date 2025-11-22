// frontend/src/services/bundleService.js

import api, { createFormDataRequest, apiRequest } from './api';

/**
 * Get all bundles with filters and pagination
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
 * Create new bundle
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
 * Update existing bundle
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
 * Delete bundle
 */
export const deleteBundle = async (bundleId) => {
  return apiRequest(() => 
    api.delete(`/api/bundles/admin/${bundleId}`)
  );
};

/**
 * Toggle bundle active status
 */
export const toggleBundleStatus = async (bundleId) => {
  return apiRequest(() => 
    api.patch(`/api/bundles/admin/${bundleId}/toggle`)
  );
};

/**
 * Duplicate bundle
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
 * Get bundle statistics
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
 * Search bundles
 */
export const searchBundles = async (searchTerm, filters = {}) => {
  return apiRequest(() => 
    api.get('/api/bundles', {
      params: {
        search: searchTerm,
        ...filters,
      },
    })
  );
};

/**
 * Validate bundle items stock
 */
export const validateBundleItems = async (items) => {
  // This would call the stock check endpoint with item details
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
 * Get top selling bundles (requires sales data)
 */
export const getTopBundles = async (limit = 10) => {
  // Note: This would require a sales tracking system
  // For now, return all active bundles sorted by discount
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
 * Bulk activate bundles
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
 * Bulk deactivate bundles
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
 * Bulk delete bundles
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
 * Get bundles with low stock items
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

export default {
  getBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  checkBundleStock,
  getBundleStats,
  getActiveBundles,
  searchBundles,
  validateBundleItems,
  calculateBundlePrice,
  getBundlesByDiscount,
  getTopBundles,
  bulkActivateBundles,
  bulkDeactivateBundles,
  bulkDeleteBundles,
  getBundlesWithLowStock,
};