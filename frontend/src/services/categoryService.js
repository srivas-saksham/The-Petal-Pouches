// frontend/src/services/categoryService.js - PUBLIC ONLY (Customer/Guest)

import api, { apiRequest } from './api';

// ==================== PUBLIC CATEGORY METHODS ====================

/**
 * Get all categories (PUBLIC)
 */
export const getCategories = async () => {
  return apiRequest(() => 
    api.get('/api/categories')
  );
};

/**
 * Get single category by ID (PUBLIC)
 */
export const getCategoryById = async (categoryId) => {
  return apiRequest(() => 
    api.get(`/api/categories/${categoryId}`)
  );
};

/**
 * Search categories (PUBLIC)
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
 * Get categories alphabetically (PUBLIC)
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
 * Get categories for dropdown/select (PUBLIC)
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

// ==================== DEFAULT EXPORT ====================

export default {
  getCategories,
  getCategoryById,
  searchCategories,
  getCategoriesAlphabetically,
  getCategoriesForSelect,
};