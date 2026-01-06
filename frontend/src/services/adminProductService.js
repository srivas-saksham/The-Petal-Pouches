// frontend/src/services/adminProductService.js - ADMIN ONLY

import adminApi from './adminApi';
import { apiRequest } from './api';

// ==================== ADMIN PRODUCT METHODS ====================

/**
 * Get all products (ADMIN - includes inactive)
 */
export const getProducts = async (params = {}) => {
  return apiRequest(() => 
    adminApi.get('/api/products', { params })
  );
};

/**
 * Get single product by ID (ADMIN)
 */
export const getProductById = async (productId) => {
  return apiRequest(() => 
    adminApi.get(`/api/products/${productId}`)
  );
};

/**
 * Create new product (ADMIN)
 * ✅ UPDATED: Handles multiple images
 */
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('cost_price', productData.cost_price);
    formData.append('stock', productData.stock);
    formData.append('sku', productData.sku);
    formData.append('has_variants', productData.has_variants);
    if (productData.category_id) {
      formData.append('category_id', productData.category_id);
    }
    
    // ✅ CHANGED: Append multiple images
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach(file => {
        formData.append('images', file);
      });
    }
    
    const response = await adminApi.post('/api/products/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Update existing product (ADMIN)
 * ✅ UPDATED: Handles multiple images and image deletion
 */
export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('cost_price', productData.cost_price);
    formData.append('stock', productData.stock);
    formData.append('sku', productData.sku);
    formData.append('has_variants', productData.has_variants);
    if (productData.category_id) {
      formData.append('category_id', productData.category_id);
    }
    
    // ✅ NEW: Handle multiple images for update
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach(file => {
        formData.append('images', file);
      });
    }
    
    // ✅ NEW: Handle image deletions
    if (productData.delete_image_ids && Array.isArray(productData.delete_image_ids)) {
      formData.append('delete_image_ids', JSON.stringify(productData.delete_image_ids));
    }
    
    const response = await adminApi.put(`/api/products/admin/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Delete product (ADMIN)
 */
export const deleteProduct = async (productId) => {
  return apiRequest(() => 
    adminApi.delete(`/api/products/admin/${productId}`)
  );
};

/**
 * Get product statistics (ADMIN)
 */
export const getProductStats = async () => {
  const result = await apiRequest(() => 
    adminApi.get('/api/products', { 
      params: { limit: 1000 }
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
 * Bulk update products (ADMIN)
 */
export const bulkUpdateProducts = async (productIds, updateData) => {
  return apiRequest(() => 
    adminApi.post('/api/products/admin/bulk-update', {
      product_ids: productIds,
      update_data: updateData,
    })
  );
};

/**
 * Bulk delete products (ADMIN)
 */
export const bulkDeleteProducts = async (productIds) => {
  return apiRequest(() => 
    adminApi.post('/api/products/admin/bulk-delete', {
      product_ids: productIds,
    })
  );
};

/**
 * Duplicate product (ADMIN)
 */
export const duplicateProduct = async (productId) => {
  return apiRequest(() => 
    adminApi.post(`/api/products/admin/${productId}/duplicate`)
  );
};

/**
 * Search products (ADMIN)
 */
export const searchProducts = async (searchTerm, filters = {}) => {
  return apiRequest(() => 
    adminApi.get('/api/products', {
      params: {
        search: searchTerm,
        ...filters,
      },
    })
  );
};

/**
 * Get products by category (ADMIN)
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  return apiRequest(() => 
    adminApi.get('/api/products', {
      params: {
        category_id: categoryId,
        ...params,
      },
    })
  );
};

/**
 * Update product stock (ADMIN)
 */
export const updateProductStock = async (productId, stock) => {
  return updateProduct(productId, { stock });
};

/**
 * Get low stock products (ADMIN)
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
 * Get out of stock products (ADMIN)
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

// ==================== ADMIN VARIANT METHODS ====================

/**
 * Get variants for a product (ADMIN)
 */
export const getProductVariants = async (productId) => {
  return apiRequest(() => 
    adminApi.get(`/api/variants/products/${productId}/variants`)
  );
};

/**
 * Get single variant by ID (ADMIN)
 */
export const getVariantById = async (variantId) => {
  return apiRequest(() => 
    adminApi.get(`/api/variants/${variantId}`)
  );
};

/**
 * Create variant for product (ADMIN)
 */
export const createVariant = async (productId, variantData) => {
  return apiRequest(() => 
    adminApi.post(`/api/variants/admin/products/${productId}/variants`, variantData)
  );
};

/**
 * Update variant (ADMIN)
 */
export const updateVariant = async (variantId, variantData) => {
  return apiRequest(() => 
    adminApi.put(`/api/variants/admin/${variantId}`, variantData)
  );
};

/**
 * Delete variant (ADMIN)
 */
export const deleteVariant = async (variantId) => {
  return apiRequest(() => 
    adminApi.delete(`/api/variants/admin/${variantId}`)
  );
};

/**
 * Upload variant image (ADMIN)
 */
export const uploadVariantImage = async (variantId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return apiRequest(() => 
    adminApi.post(`/api/variants/admin/${variantId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};

/**
 * Update variant stock (ADMIN)
 */
export const updateVariantStock = async (variantId, stock) => {
  return apiRequest(() => 
    adminApi.patch(`/api/variants/admin/${variantId}/stock`, { stock })
  );
};

// ==================== DEFAULT EXPORT ====================

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