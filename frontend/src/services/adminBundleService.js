// frontend/src/services/adminBundleService.js - ADMIN ONLY

import adminApi from './adminApi';
import { apiRequest, createFormDataRequest } from './api';

// ==================== ADMIN BUNDLE METHODS ====================

/**
 * Get all bundles with filters and pagination (ADMIN)
 */
export const getBundles = async (params = {}) => {
  return apiRequest(() => 
    adminApi.get('/api/bundles', { params })
  );
};

/**
 * Get single bundle by ID (ADMIN)
 */
export const getBundleById = async (bundleId) => {
  return apiRequest(() => 
    adminApi.get(`/api/bundles/${bundleId}`)
  );
};

/**
 * Create new bundle (ADMIN)
 */
export const createBundle = async (bundleData) => {
  const formData = createFormDataRequest(bundleData, 'image');
  
  return apiRequest(() => 
    adminApi.post('/api/bundles/admin', formData, {
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
    adminApi.put(`/api/bundles/admin/${bundleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Delete bundle (ADMIN)
 */
export const deleteBundle = async (bundleId) => {
  return apiRequest(() => 
    adminApi.delete(`/api/bundles/admin/${bundleId}`)
  );
};

/**
 * Toggle bundle active status (ADMIN)
 */
export const toggleBundleStatus = async (bundleId) => {
  return apiRequest(() => 
    adminApi.patch(`/api/bundles/admin/${bundleId}/toggle`)
  );
};

/**
 * Duplicate bundle (ADMIN)
 */
export const duplicateBundle = async (bundleId) => {
  return apiRequest(() => 
    adminApi.post(`/api/bundles/admin/${bundleId}/duplicate`)
  );
};

/**
 * Get bundle statistics (ADMIN)
 */
export const getBundleStats = async () => {
  const result = await apiRequest(() => 
    adminApi.get('/api/bundles', { 
      params: { limit: 1000 }
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

/**
 * Get bundles by discount range (ADMIN)
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
 * Get top selling bundles (ADMIN)
 */
export const getTopBundles = async (limit = 10) => {
  const result = await getBundles();
  
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
    const stockCheck = await apiRequest(() =>
      adminApi.get(`/api/bundles/${bundle.id}/stock`)
    );
    
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

// ==================== DEFAULT EXPORT ====================

// ==================== ALIAS FOR COMPATIBILITY ====================

/**
 * Alias for getBundles (for statsService compatibility)
 */
export const getAllBundles = getBundles;

// ==================== DEFAULT EXPORT ====================

export default {
  getBundles,
  getAllBundles, // ✅ ADDED
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  getBundleStats,
  getBundlesByDiscount,
  getTopBundles,
  bulkActivateBundles,
  bulkDeactivateBundles,
  bulkDeleteBundles,
  getBundlesWithLowStock,
};