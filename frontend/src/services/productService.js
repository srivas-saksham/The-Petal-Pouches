// frontend/src/services/productService.js

import api, { createFormDataRequest, apiRequest } from './api';

/**
 * Get all products with filters and pagination
 */
export const getProducts = async (params = {}) => {
  return apiRequest(() => 
    api.get('/api/products', { params })
  );
};

/**
 * Get single product by ID
 */
export const getProductById = async (productId) => {
  return apiRequest(() => 
    api.get(`/api/products/${productId}`)
  );
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  const formData = createFormDataRequest(productData, 'image');
  
  return apiRequest(() => 
    api.post('/api/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Update existing product
 */
export const updateProduct = async (productId, productData) => {
  const formData = createFormDataRequest(productData, 'image');
  
  return apiRequest(() => 
    api.put(`/api/admin/products/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  return apiRequest(() => 
    api.delete(`/api/admin/products/${productId}`)
  );
};

/**
 * Get product statistics
 */
export const getProductStats = async () => {
  const result = await apiRequest(() => 
    api.get('/api/products', { 
      params: { limit: 1000 } // Get all for stats calculation
    })
  );

  if (!result.success) {
    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        low_stock: 0,
        out_of_stock: 0,
      },
    };
  }

  const products = result.data.data || [];
  
  const stats = {
    total: products.length,
    active: products.filter(p => p.stock > 10).length,
    low_stock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    out_of_stock: products.filter(p => p.stock === 0).length,
  };

  return {
    success: true,
    data: stats,
  };
};

/**
 * Bulk update products
 */
export const bulkUpdateProducts = async (productIds, updateData) => {
  // Note: Backend endpoint needs to be created for this
  return apiRequest(() => 
    api.post('/api/admin/products/bulk-update', {
      product_ids: productIds,
      update_data: updateData,
    })
  );
};

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (productIds) => {
  // Note: Backend endpoint needs to be created for this
  return apiRequest(() => 
    api.post('/api/admin/products/bulk-delete', {
      product_ids: productIds,
    })
  );
};

/**
 * Duplicate product - Server-side duplication
 */
export const duplicateProduct = async (productId) => {
  return apiRequest(() => 
    api.post(`/api/products/admin/${productId}/duplicate`)
  );
};

/**
 * Search products
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
 * Get products by category
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

/**
 * Update product stock
 */
export const updateProductStock = async (productId, stock) => {
  return updateProduct(productId, { stock });
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (threshold = 10) => {
  const result = await getProducts({ in_stock: 'true' });
  
  if (!result.success) {
    return result;
  }

  const products = result.data.data || [];
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= threshold);

  return {
    success: true,
    data: {
      data: lowStock,
      count: lowStock.length,
    },
  };
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = async () => {
  const result = await getProducts();
  
  if (!result.success) {
    return result;
  }

  const products = result.data.data || [];
  const outOfStock = products.filter(p => p.stock === 0);

  return {
    success: true,
    data: {
      data: outOfStock,
      count: outOfStock.length,
    },
  };
};

// ===== VARIANT MANAGEMENT =====

/**
 * Get variants for a product
 */
export const getProductVariants = async (productId) => {
  return apiRequest(() => 
    api.get(`/api/variants/products/${productId}/variants`)
  );
};

/**
 * Get single variant by ID
 */
export const getVariantById = async (variantId) => {
  return apiRequest(() => 
    api.get(`/api/variants/${variantId}`)
  );
};

/**
 * Create variant for product
 */
export const createVariant = async (productId, variantData) => {
  return apiRequest(() => 
    api.post(`/api/variants/admin/products/${productId}/variants`, variantData)
  );
};

/**
 * Update variant
 */
export const updateVariant = async (variantId, variantData) => {
  return apiRequest(() => 
    api.put(`/api/variants/admin/${variantId}`, variantData)
  );
};

/**
 * Delete variant
 */
export const deleteVariant = async (variantId) => {
  return apiRequest(() => 
    api.delete(`/api/variants/admin/${variantId}`)
  );
};

/**
 * Upload variant image
 */
export const uploadVariantImage = async (variantId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return apiRequest(() => 
    api.post(`/api/variants/admin/${variantId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Update variant stock
 */
export const updateVariantStock = async (variantId, stock) => {
  return apiRequest(() => 
    api.patch(`/api/variants/admin/${variantId}/stock`, { stock })
  );
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  bulkUpdateProducts,
  bulkDeleteProducts,
  duplicateProduct,
  searchProducts,
  getProductsByCategory,
  updateProductStock,
  getLowStockProducts,
  getOutOfStockProducts,
  // Variants
  getProductVariants,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  uploadVariantImage,
  updateVariantStock,
};