// frontend/src/services/categoryService.js

import api, { apiRequest } from './api';

/**
 * Get all categories
 */
export const getCategories = async () => {
  return apiRequest(() => 
    api.get('/api/categories')
  );
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (categoryId) => {
  return apiRequest(() => 
    api.get(`/api/categories/${categoryId}`)
  );
};

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  return apiRequest(() => 
    api.post('/api/categories/admin', categoryData)
  );
};

/**
 * Update existing category
 */
export const updateCategory = async (categoryId, categoryData) => {
  return apiRequest(() => 
    api.put(`/api/categories/admin/${categoryId}`, categoryData)
  );
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId) => {
  return apiRequest(() => 
    api.delete(`/api/categories/admin/${categoryId}`)
  );
};

/**
 * Get category statistics
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
    // Note: Would need product count per category from backend
    withProducts: 0,
    empty: 0,
  };

  return {
    success: true,
    data: stats,
  };
};

/**
 * Search categories
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
 * Get category with product count
 */
export const getCategoryWithProductCount = async (categoryId) => {
  // Note: Backend would need to provide product count
  // For now, we fetch category and products separately
  const categoryResult = await getCategoryById(categoryId);
  
  if (!categoryResult.success) {
    return categoryResult;
  }

  // Would need to import productService here or call products endpoint
  // This is a placeholder
  return {
    success: true,
    data: {
      ...categoryResult.data.data,
      productCount: 0, // Placeholder
    },
  };
};

/**
 * Validate category name uniqueness
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
 * Sort categories alphabetically
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
 * Get recently created categories
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
 * Bulk delete categories
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
 * Get categories for dropdown/select
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
 * Check if category has products (before deletion)
 */
export const checkCategoryProducts = async (categoryId) => {
  // Note: Backend should provide this endpoint
  // For now, return a placeholder
  return apiRequest(() => 
    api.get(`/api/categories/${categoryId}/products/count`)
  );
};

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