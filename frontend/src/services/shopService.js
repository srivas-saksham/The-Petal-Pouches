// frontend/src/services/shopService.js
// CHANGE FROM ORIGINAL: getAllItems and getTagsByType now accept and forward `gender` param.
// All other methods unchanged.

import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const shopAPI = api;

let searchTimeout;
const debounceSearch = (callback, delay = 500) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(callback, delay);
};

const shopService = {

  // ==================== CART METHODS ====================

  getCart: async () => {
    try {
      const response = await shopAPI.get('/api/cart');
      return { success: true, data: response.data.data, error: null };
    } catch (error) {
      return { success: false, data: { items: [], totals: {} }, error: error.response?.data?.message || 'Failed to fetch cart' };
    }
  },

  addToCart: async (data) => {
    try {
      const response = await shopAPI.post('/api/cart/items', {
        product_variant_id: data.product_variant_id,
        quantity: data.quantity || 1,
        bundle_origin: data.bundle_origin || 'single',
        bundle_id: data.bundle_id || null
      });
      return { success: true, data: response.data.data, message: response.data.message, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.response?.data?.message || 'Failed to add item to cart' };
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await shopAPI.patch(`/api/cart/items/${itemId}`, { quantity });
      return { success: true, data: response.data.data, message: response.data.message, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.response?.data?.message || 'Failed to update cart item' };
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await shopAPI.delete(`/api/cart/items/${itemId}`);
      return { success: true, message: response.data.message, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to remove item from cart' };
    }
  },

  clearCart: async () => {
    try {
      const response = await shopAPI.delete('/api/cart');
      return { success: true, data: response.data.data, message: response.data.message, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to clear cart' };
    }
  },

  mergeCarts: async (sessionId) => {
    try {
      const response = await shopAPI.post('/api/cart/merge', { session_id: sessionId });
      return { success: true, data: response.data.data, message: response.data.message, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to merge carts' };
    }
  },

  // ==================== PRODUCT METHODS ====================

  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.in_stock) params.append('in_stock', filters.in_stock);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      const response = await shopAPI.get(`/api/products?${params.toString()}`);
      return { success: true, data: response.data.data || [], metadata: response.data.metadata || { currentPage: 1, totalPages: 1, hasMore: false, total: 0 } };
    } catch (error) {
      return { success: false, data: [], metadata: { currentPage: 1, totalPages: 1, hasMore: false, total: 0 }, error: error.response?.data?.message || 'Failed to fetch products' };
    }
  },

  getProductById: async (productId) => {
    try {
      const response = await shopAPI.get(`/api/products/${productId}`);
      return { success: true, data: response.data.data || response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.response?.data?.message || 'Failed to fetch product' };
    }
  },

  getProductVariants: async (productId) => {
    try {
      const response = await shopAPI.get(`/api/variants/products/${productId}/variants`);
      return { success: true, data: response.data.data || [], error: null };
    } catch (error) {
      return { success: false, data: [], error: error.response?.data?.message || 'Failed to fetch variants' };
    }
  },

  getCategories: async () => {
    try {
      const response = await shopAPI.get('/api/categories');
      return { success: true, data: response.data.data || [], error: null };
    } catch (error) {
      return { success: false, data: [], error: error.response?.data?.message || 'Failed to fetch categories' };
    }
  },

  getProductReviews: async (productId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sort) params.append('sort', options.sort);
      const response = await shopAPI.get(`/api/reviews/product/${productId}?${params.toString()}`);
      return { success: true, data: response.data.data || [], metadata: response.data.metadata || { total: 0, average_rating: 0 }, error: null };
    } catch (error) {
      return { success: false, data: [], metadata: { total: 0, average_rating: 0 }, error: error.response?.data?.message || 'Failed to fetch reviews' };
    }
  },

  getBundles: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.active) params.append('active', filters.active);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      const response = await shopAPI.get(`/api/bundles?${params.toString()}`);
      return { success: true, data: response.data.data || [], error: null };
    } catch (error) {
      return { success: false, data: [], error: error.response?.data?.message || 'Failed to fetch bundles' };
    }
  },

  searchProducts: (query, onResults, delay = 500) => {
    debounceSearch(async () => {
      if (!query || query.length < 2) { onResults({ success: true, data: [] }); return; }
      const result = await shopService.getProducts({ search: query, limit: 8 });
      onResults(result);
    }, delay);
  },

  getPriceRange: async () => {
    try {
      const response = await shopAPI.get('/api/products?limit=1');
      return { success: true, minPrice: response.data.metadata?.minPrice || 100, maxPrice: response.data.metadata?.maxPrice || 50000, error: null };
    } catch (error) {
      return { success: false, minPrice: 100, maxPrice: 50000, error: error.response?.data?.message || 'Failed to fetch price range' };
    }
  },

  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await shopAPI.get(`/api/products?limit=${limit}&sort=created_at`);
      return { success: true, data: response.data.data || [], error: null };
    } catch (error) {
      return { success: false, data: [], error: error.response?.data?.message || 'Failed to fetch featured products' };
    }
  },

  checkAvailability: async (productId, variantId = null) => {
    try {
      const endpoint = variantId ? `/api/variants/${variantId}` : `/api/products/${productId}`;
      const response = await shopAPI.get(endpoint);
      return { success: true, inStock: response.data.data?.stock > 0 || false, stock: response.data.data?.stock || 0, error: null };
    } catch (error) {
      return { success: false, inStock: false, stock: 0, error: error.response?.data?.message || 'Failed to check availability' };
    }
  },

  /**
   * Get all shop items (products + bundles mixed)
   * ✅ UPDATED: Now accepts `gender` param for brand mode filtering
   * @param {Object} params - Query parameters (including optional `gender`)
   */
  getAllItems: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      if (params.search) queryParams.append('search', params.search);
      if (params.min_price) queryParams.append('min_price', params.min_price);
      if (params.max_price) queryParams.append('max_price', params.max_price);
      if (params.in_stock) queryParams.append('in_stock', params.in_stock);
      if (params.tags) queryParams.append('tags', params.tags);
      // ✅ NEW: Gender segmentation param
      if (params.gender) queryParams.append('gender', params.gender);

      const response = await shopAPI.get(`/api/shop/items?${queryParams.toString()}`);
      return { success: true, data: response.data.data || [], metadata: response.data.metadata || {} };
    } catch (error) {
      return { success: false, data: [], metadata: {}, error: error.response?.data?.message || 'Failed to fetch items' };
    }
  },

  /**
   * Get tags with counts filtered by item type
   * ✅ UPDATED: Now accepts `gender` in filterContext
   */
  getTagsByType: async (type = 'all', filterContext = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('type', type);
      if (filterContext.tags) params.append('tags', filterContext.tags);
      if (filterContext.search) params.append('search', filterContext.search);
      if (filterContext.min_price) params.append('min_price', filterContext.min_price);
      if (filterContext.max_price) params.append('max_price', filterContext.max_price);
      if (filterContext.in_stock) params.append('in_stock', filterContext.in_stock);
      // ✅ NEW: Gender segmentation param
      if (filterContext.gender) params.append('gender', filterContext.gender);

      const response = await shopAPI.get(`/api/tags/with-counts?${params.toString()}`);
      return { success: true, data: response.data.data || [], context: response.data.context || {} };
    } catch (error) {
      return { success: false, data: [], context: {}, error: error.response?.data?.message || 'Failed to fetch tags' };
    }
  },

  getItemById: async (type, id) => {
    try {
      const response = await shopAPI.get(`/api/shop/${type}/${id}`);
      return { success: true, data: response.data.data || null };
    } catch (error) {
      return { success: false, data: null, error: error.response?.data?.message || 'Failed to fetch item' };
    }
  },
};

export default shopService;