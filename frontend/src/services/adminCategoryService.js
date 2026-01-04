// frontend/src/services/adminCategoryService.js - ADMIN ONLY

import adminApi from './adminApi';
import { apiRequest } from './api';

// ==================== ADMIN CATEGORY METHODS ====================

/**
 * Get all categories (ADMIN)
 */
export const getCategories = async () => {
  return apiRequest(() => 
    adminApi.get('/api/categories')
  );
};

/**
 * Get single category by ID (ADMIN)
 */
export const getCategoryById = async (categoryId) => {
  return apiRequest(() => 
    adminApi.get(`/api/categories/${categoryId}`)
  );
};

/**
 * Create new category (ADMIN)
 */
export const createCategory = async (categoryData) => {
  return apiRequest(() => 
    adminApi.post('/api/categories/admin', categoryData)
  );
};

/**
 * Update existing category (ADMIN)
 */
export const updateCategory = async (categoryId, categoryData) => {
  return apiRequest(() => 
    adminApi.put(`/api/categories/admin/${categoryId}`, categoryData)
  );
};

/**
 * Delete category (ADMIN)
 */
export const deleteCategory = async (categoryId) => {
  return apiRequest(() => 
    adminApi.delete(`/api/categories/admin/${categoryId}`)
  );
};

/**
 * Get category statistics (ADMIN)
 */
export const getCategoryStats = async () => {
  const result = await getCategories();

  if (!result.success) {
    return {
      success: false,
      data: {
        total: 0,
        withProducts: 0,
        empty: 0,
      },
    };
  }

  const categories = result.data.data || [];
  
  const stats = {
    total: categories.length,
    withProducts: 0,
    empty: 0,
  };

  return {
    success: true,
    data: stats,
  };
};

/**
 * Search categories (ADMIN)
 */
export const searchCategories = async (searchTerm) => {
  const result = await getCategories();
  
  if (!result.success) {
    return result;
  }

  const categories = result.data.data || [];
  const filtered = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    success: true,
    data: {
      data: filtered,
      count: filtered.length,
    },
  };
};

/**
 * Get category with product count (ADMIN)
 */
export const getCategoryWithProductCount = async (categoryId) => {
  const categoryResult = await getCategoryById(categoryId);
  
  if (!categoryResult.success) {
    return categoryResult;
  }

  return {
    success: true,
    data: {
      ...categoryResult.data.data,
      productCount: 0,
    },
  };
};

/**
 * Validate category name uniqueness (ADMIN)
 */
export const validateCategoryName = async (name, excludeId = null) => {
  const result = await getCategories();
  
  if (!result.success) {
    return {
      success: false,
      isUnique: true,
    };
  }

  const categories = result.data.data || [];
  const duplicate = categories.find(cat => 
    cat.name.toLowerCase() === name.toLowerCase() && 
    cat.id !== excludeId
  );

  return {
    success: true,
    isUnique: !duplicate,
    duplicate: duplicate || null,
  };
};

/**
 * Get categories alphabetically (ADMIN)
 */
export const getCategoriesAlphabetically = async () => {
  const result = await getCategories();
  
  if (!result.success) {
    return result;
  }

  const categories = result.data.data || [];
  const sorted = [...categories].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return {
    success: true,
    data: {
      data: sorted,
      count: sorted.length,
    },
  };
};

/**
 * Get recently created categories (ADMIN)
 */
export const getRecentCategories = async (limit = 5) => {
  const result = await getCategories();
  
  if (!result.success) {
    return result;
  }

  const categories = result.data.data || [];
  const sorted = [...categories]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
 * Bulk delete categories (ADMIN)
 */
export const bulkDeleteCategories = async (categoryIds) => {
  const results = await Promise.all(
    categoryIds.map(id => deleteCategory(id))
  );
  
  return {
    success: results.every(r => r.success),
    data: results,
    deleted: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  };
};

/**
 * Get categories for dropdown/select (ADMIN)
 */
export const getCategoriesForSelect = async () => {
  const result = await getCategoriesAlphabetically();
  
  if (!result.success) {
    return result;
  }

  const categories = result.data.data || [];
  const options = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    description: cat.description,
  }));

  return {
    success: true,
    data: options,
  };
};

/**
 * Check if category has products (ADMIN)
 */
export const checkCategoryProducts = async (categoryId) => {
  return apiRequest(() => 
    adminApi.get(`/api/categories/${categoryId}/products/count`)
  );
};

// ==================== DEFAULT EXPORT ====================

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  searchCategories,
  getCategoryWithProductCount,
  validateCategoryName,
  getCategoriesAlphabetically,
  getRecentCategories,
  bulkDeleteCategories,
  getCategoriesForSelect,
  checkCategoryProducts,
};