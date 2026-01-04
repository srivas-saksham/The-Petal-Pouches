// frontend/src/services/bundleService.js - PUBLIC ONLY (Customer/Guest)

import api, { apiRequest } from './api';

// ==================== PUBLIC SHOP METHODS ====================

/**
 * Get all bundles for shop (public - only active bundles)
 * @param {Object} params - { page, limit, sort, search, min_price, max_price, in_stock, tags }
 * @returns {Promise<Object>} { bundles, metadata }
 */
export const getAllBundles = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    if (params.sort) {
      let backendSort = params.sort;
      
      switch (params.sort) {
        case 'price_asc':
          backendSort = 'price';
          queryParams.append('order', 'asc');
          break;
        case 'price_desc':
          backendSort = 'price';
          queryParams.append('order', 'desc');
          break;
        case 'created_at':
        case 'title':
        case 'discount_percent':
          backendSort = params.sort;
          break;
        default:
          backendSort = 'created_at';
      }
      
      queryParams.append('sort', backendSort);
    }
    
    if (params.search) queryParams.append('search', params.search);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    
    if (params.in_stock === 'true' || params.in_stock === true) {
      queryParams.append('in_stock', 'true');
    }
    
    if (params.tags && params.tags.trim()) {
      queryParams.append('tags', params.tags.trim());
      console.log(`🏷️ [BundleService] Including tags in request: ${params.tags}`);
    }
    
    queryParams.append('active', 'true');

    console.log('📤 Fetching bundles with params:', queryParams.toString());

    const response = await api.get(`/api/bundles?${queryParams.toString()}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    return {
      success: true,
      data: response.data.data || [],
      metadata: response.data.metadata || {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        total: 0
      }
    };
  } catch (error) {
    console.error('❌ Get bundles error:', error);
    throw error.response?.data || error;
  }
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
 * Check bundle stock availability
 */
export const checkBundleStock = async (bundleId) => {
  return apiRequest(() => 
    api.get(`/api/bundles/${bundleId}/stock`)
  );
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

    const response = await api.get(`/api/bundles?${queryParams.toString()}`);
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

    const response = await api.get(`/api/bundles?${queryParams.toString()}`);
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
    const bundleDetails = await getBundleDetails(bundleId);
    
    const cartPromises = bundleDetails.data.items.map(item => {
      return api.post('/api/cart/items', {
        product_variant_id: item.product_variant_id,
        quantity: item.quantity * quantity,
        bundle_origin: 'brand_bundle',
        bundle_id: bundleId
      });
    });

    await Promise.all(cartPromises);

    const cartResponse = await api.get('/api/cart');
    return cartResponse.data;
  } catch (error) {
    console.error('❌ Add bundle to cart error:', error);
    throw error.response?.data || error;
  }
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
 * Get reviews for a bundle
 * @param {string} bundleId - Bundle UUID
 * @param {Object} params - { page, limit, sort }
 * @returns {Promise<Object>} Reviews data
 */
export const getBundleReviews = async (bundleId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit || 10);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const response = await api.get(
      `/api/reviews/bundle/${bundleId}?${queryParams.toString()}`
    );
    
    return {
      success: true,
      data: response.data.data || [],
      metadata: response.data.metadata || { total: 0, average_rating: 0 }
    };
  } catch (error) {
    console.error('❌ Get bundle reviews error:', error);
    return {
      success: false,
      data: [],
      metadata: { total: 0, average_rating: 0 },
      error: error.response?.data?.message || 'Failed to fetch reviews'
    };
  }
};

/**
 * Get related/similar bundles
 * @param {string} bundleId - Current bundle UUID
 * @param {number} limit - Max bundles to return (default: 4)
 * @returns {Promise<Object>} Related bundles
 */
export const getRelatedBundles = async (bundleId, limit = 4) => {
  try {
    const currentBundle = await getBundleById(bundleId);
    
    if (!currentBundle.success) {
      return {
        success: false,
        data: [],
        error: 'Failed to fetch current bundle'
      };
    }
    
    const allBundles = await getAllBundles({
      limit: 20,
      active: true
    });
    
    if (!allBundles.success) {
      return {
        success: false,
        data: [],
        error: 'Failed to fetch bundles'
      };
    }
    
    const bundles = allBundles.data || [];
    
    const related = bundles
      .filter(b => b.id !== bundleId)
      .slice(0, limit);
    
    return {
      success: true,
      data: related,
      count: related.length
    };
  } catch (error) {
    console.error('❌ Get related bundles error:', error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || 'Failed to fetch related bundles'
    };
  }
};

// ==================== UTILITY METHODS ====================

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
 * Validate bundle items stock
 */
export const validateBundleItems = async (items) => {
  return apiRequest(() => 
    api.post('/api/bundles/validate-stock', { items })
  );
};

// ==================== DEFAULT EXPORT ====================

export default {
  getAllBundles,
  getBundleById,
  getBundleDetails,
  checkBundleStock,
  searchBundles,
  getBundlesByPrice,
  addBundleToCart,
  getActiveBundles,
  getBundleReviews,
  getRelatedBundles,
  calculateBundlePrice,
  validateBundleItems,
};