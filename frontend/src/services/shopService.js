// frontend/src/services/shopService.js - FIXED VERSION

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== INITIALIZE SESSION ID ====================

/**
 * Get or create a session ID for guest users
 * Persists in localStorage
 */
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
    console.log('📱 Created guest session:', sessionId);
  }
  
  return sessionId;
};

// ==================== AXIOS INSTANCE ====================

// Create axios instance with base config
const shopAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor to add headers
 * Adds x-user-id and x-session-id to all requests
 */
shopAPI.interceptors.request.use(
  (config) => {
    // ✅ FIX: Get user ID from localStorage (stored by UserAuthContext)
    const storedUser = localStorage.getItem('customer_user');
    let userId = null;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userId = userData.id;
      } catch (e) {
        console.error('Error parsing customer_user:', e);
      }
    }

    // Add user ID if available
    if (userId) {
      config.headers['x-user-id'] = userId;
      console.log('✅ User ID header set:', userId);
    } else {
      console.log('⚠️ No user ID available - guest user');
    }

    // Always add session ID for guest tracking
    const sessionId = getSessionId();
    config.headers['x-session-id'] = sessionId;

    console.log(`📤 Request to ${config.url}:`, {
      'x-user-id': userId || 'not authenticated',
      'x-session-id': sessionId.substring(0, 15) + '...'
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for better error handling
 */
shopAPI.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== DEBOUNCE UTILITY ====================

let searchTimeout;
const debounceSearch = (callback, delay = 500) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(callback, delay);
};

// ==================== SHOP SERVICE ====================

/**
 * Shop Service - Handles all product and cart API calls
 */
const shopService = {

  // ==================== CART METHODS ====================

  /**
   * Get user's cart with items and totals
   * @returns {Promise<Object>} Cart data with items and totals
   */
  getCart: async () => {
    try {
      const response = await shopAPI.get('/cart');
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('❌ Get cart error:', error);
      return {
        success: false,
        data: { items: [], totals: {} },
        error: error.response?.data?.message || 'Failed to fetch cart'
      };
    }
  },

  /**
   * Add item to cart
   * @param {Object} data - { product_variant_id, quantity?, bundle_origin?, bundle_id? }
   * @returns {Promise<Object>} Added item details
   */
  addToCart: async (data) => {
    try {
      console.log('🛒 Adding to cart:', data);
      const response = await shopAPI.post('/cart/items', {
        product_variant_id: data.product_variant_id,
        quantity: data.quantity || 1,
        bundle_origin: data.bundle_origin || 'single',
        bundle_id: data.bundle_id || null
      });

      console.log('✅ Added to cart response:', response.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to add item to cart'
      };
    }
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated item
   */
  updateCartItem: async (itemId, quantity) => {
    try {
      console.log(`📝 Updating cart item ${itemId} to quantity ${quantity}`);
      const response = await shopAPI.patch(`/cart/items/${itemId}`, { quantity });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('❌ Update cart item error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to update cart item'
      };
    }
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} Result
   */
  removeFromCart: async (itemId) => {
    try {
      console.log(`🗑️ Removing cart item ${itemId}`);
      const response = await shopAPI.delete(`/cart/items/${itemId}`);

      return {
        success: true,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item from cart'
      };
    }
  },

  /**
   * Clear entire cart
   * @returns {Promise<Object>} Result
   */
  clearCart: async () => {
    try {
      console.log('🧹 Clearing cart');
      const response = await shopAPI.delete('/cart');

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart'
      };
    }
  },

  /**
   * Merge guest cart into user cart (call on login)
   * @param {string} sessionId - Guest session ID
   * @returns {Promise<Object>} Result
   */
  mergeCarts: async (sessionId) => {
    try {
      console.log('🔀 Merging carts');
      const response = await shopAPI.post('/cart/merge', { session_id: sessionId });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: null
      };
    } catch (error) {
      console.error('❌ Merge carts error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to merge carts'
      };
    }
  },

  // ==================== PRODUCT METHODS ====================

  /**
   * Fetch products with filters and pagination
   * @param {Object} filters - Filter object
   * @returns {Promise<Object>} Products and metadata
   */
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

      const response = await shopAPI.get(`/products?${params.toString()}`);

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
      console.error('❌ Get products error:', error);
      return {
        success: false,
        data: [],
        metadata: {
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
          total: 0
        },
        error: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  },

  /**
   * Fetch single product by ID
   * @param {string} productId - Product UUID
   * @returns {Promise<Object>} Product details
   */
  getProductById: async (productId) => {
    try {
      const response = await shopAPI.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        error: null
      };
    } catch (error) {
      console.error(`❌ Get product ${productId} error:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  },

  /**
   * Fetch product variants
   * @param {string} productId - Product UUID
   * @returns {Promise<Object>} Variants array
   */
  getProductVariants: async (productId) => {
    try {
      const response = await shopAPI.get(`/variants/products/${productId}/variants`);
      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error(`❌ Get variants error:`, error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to fetch variants'
      };
    }
  },

  /**
   * Fetch all categories
   * @returns {Promise<Object>} Categories array
   */
  getCategories: async () => {
    try {
      const response = await shopAPI.get('/categories');
      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error('❌ Get categories error:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  /**
   * Get product reviews
   * @param {string} productId - Product UUID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews data
   */
  getProductReviews: async (productId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sort) params.append('sort', options.sort);

      const response = await shopAPI.get(`/reviews/product/${productId}?${params.toString()}`);

      return {
        success: true,
        data: response.data.data || [],
        metadata: response.data.metadata || { total: 0, average_rating: 0 },
        error: null
      };
    } catch (error) {
      console.error(`❌ Get reviews error:`, error);
      return {
        success: false,
        data: [],
        metadata: { total: 0, average_rating: 0 },
        error: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  },

  /**
   * Get all bundles
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Bundles array
   */
  getBundles: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.active) params.append('active', filters.active);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await shopAPI.get(`/bundles?${params.toString()}`);

      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error('❌ Get bundles error:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to fetch bundles'
      };
    }
  },

  /**
   * Search products with debouncing
   * @param {string} query - Search query
   * @param {Function} onResults - Callback
   * @param {number} delay - Debounce delay
   */
  searchProducts: (query, onResults, delay = 500) => {
    debounceSearch(async () => {
      if (!query || query.length < 2) {
        onResults({ success: true, data: [] });
        return;
      }

      const result = await shopService.getProducts({
        search: query,
        limit: 8
      });

      onResults(result);
    }, delay);
  },

  /**
   * Get price range
   * @returns {Promise<Object>} Min and max price
   */
  getPriceRange: async () => {
    try {
      const response = await shopAPI.get('/products?limit=1');
      const minPrice = response.data.metadata?.minPrice || 100;
      const maxPrice = response.data.metadata?.maxPrice || 50000;

      return {
        success: true,
        minPrice,
        maxPrice,
        error: null
      };
    } catch (error) {
      console.error('❌ Get price range error:', error);
      return {
        success: false,
        minPrice: 100,
        maxPrice: 50000,
        error: error.response?.data?.message || 'Failed to fetch price range'
      };
    }
  },

  /**
   * Get featured products
   * @param {number} limit - Number of products
   * @returns {Promise<Object>} Featured products
   */
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await shopAPI.get(`/products?limit=${limit}&sort=created_at`);

      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error('❌ Get featured products error:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Failed to fetch featured products'
      };
    }
  },

  /**
   * Check product availability
   * @param {string} productId - Product UUID
   * @param {string} variantId - Optional variant UUID
   * @returns {Promise<Object>} Stock information
   */
  checkAvailability: async (productId, variantId = null) => {
    try {
      const endpoint = variantId
        ? `/variants/${variantId}`
        : `/products/${productId}`;

      const response = await shopAPI.get(endpoint);

      return {
        success: true,
        inStock: response.data.data?.stock > 0 || false,
        stock: response.data.data?.stock || 0,
        error: null
      };
    } catch (error) {
      console.error('❌ Check availability error:', error);
      return {
        success: false,
        inStock: false,
        stock: 0,
        error: error.response?.data?.message || 'Failed to check availability'
      };
    }
  },
  /**
   * Get all shop items (products + bundles mixed)
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

      const response = await shopAPI.get(`/shop/items?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data || [],
        metadata: response.data.metadata || {}
      };
    } catch (error) {
      console.error('❌ Get shop items error:', error);
      return {
        success: false,
        data: [],
        metadata: {},
        error: error.response?.data?.message || 'Failed to fetch items'
      };
    }
  },

  /**
   * Get single item by type and ID
   */
  getItemById: async (type, id) => {
    try {
      const response = await shopAPI.get(`/shop/${type}/${id}`);
      
      return {
        success: true,
        data: response.data.data || null
      };
    } catch (error) {
      console.error(`❌ Get ${type} error:`, error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch item'
      };
    }
  },
};

export default shopService;