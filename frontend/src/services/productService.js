// frontend/src/services/productService.js - PUBLIC ONLY (Customer/Guest)

import api, { apiRequest } from './api';

// ==================== PUBLIC PRODUCT METHODS ====================

/**
 * Get all products with filters and pagination (PUBLIC)
 */
export const getProducts = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/products', { params })
  );
};

/**
 * Get single product by ID (PUBLIC)
 */
export const getProductById = async (productId) => {
  return apiRequest(() => 
    api.get(`/api/products/${productId}`)
  );
};

/**
 * Search products (PUBLIC)
 */
export const searchProducts = async (searchTerm, filters = {}) => {
  return apiRequest(() => 
    api.get('/api/products', {
      params: {
        search: searchTerm,
        ...filters,
      },
    })
  );
};

/**
 * Get products by category (PUBLIC)
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  return apiRequest(() => 
    api.get('/api/products', {
      params: {
        category_id: categoryId,
        ...params,
      },
    })
  );
};

// ==================== VARIANT METHODS (PUBLIC) ====================

/**
 * Get variants for a product (PUBLIC)
 */
export const getProductVariants = async (productId) => {
  return apiRequest(() => 
    api.get(`/api/variants/products/${productId}/variants`)
  );
};

/**
 * Get single variant by ID (PUBLIC)
 */
export const getVariantById = async (variantId) => {
  return apiRequest(() => 
    api.get(`/api/variants/${variantId}`)
  );
};

// ==================== DEFAULT EXPORT ====================

export default {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductVariants,
  getVariantById,
};