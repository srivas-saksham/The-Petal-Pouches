// frontend/src/services/bundleService.js

import api from './api';

/**
 * Bundle Service
 * Handles all API calls related to bundles
 */

const bundleService = {
  /**
   * Get all bundles with filters
   * @param {Object} params - { page, limit, sort, search, min_price, max_price }
   * @returns {Promise<Object>} { bundles, metadata }
   */
  getAllBundles: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.search) queryParams.append('search', params.search);
      if (params.min_price) queryParams.append('min_price', params.min_price);
      if (params.max_price) queryParams.append('max_price', params.max_price);
      queryParams.append('active', 'true'); // Only active bundles

      const response = await api.get(`/bundles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get bundles error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get bundle by ID (basic info only)
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} Bundle object
   */
  getBundleById: async (bundleId) => {
    try {
      const response = await api.get(`/bundles/${bundleId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get bundle error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get bundle with all items and product details
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} Bundle with items array
   */
  getBundleDetails: async (bundleId) => {
    try {
      const response = await api.get(`/bundles/${bundleId}/details`);
      return response.data;
    } catch (error) {
      console.error('❌ Get bundle details error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Check bundle stock availability
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} { in_stock, stock_limit, issues }
   */
  checkBundleStock: async (bundleId) => {
    try {
      const response = await api.get(`/bundles/${bundleId}/stock`);
      return response.data;
    } catch (error) {
      console.error('❌ Check stock error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Search bundles
   * @param {string} query - Search term
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Search results
   */
  searchBundles: async (query, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: query,
        page: params.page || 1,
        limit: params.limit || 12,
        active: 'true'
      });

      const response = await api.get(`/bundles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Search bundles error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get bundles by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {Object} params - { page, limit }
   * @returns {Promise<Object>} Filtered bundles
   */
  getBundlesByPrice: async (minPrice, maxPrice, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 12,
        active: 'true'
      });

      if (minPrice) queryParams.append('min_price', minPrice);
      if (maxPrice) queryParams.append('max_price', maxPrice);

      const response = await api.get(`/bundles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get bundles by price error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Add bundle to cart
   * @param {string} bundleId - Bundle UUID
   * @param {number} quantity - Quantity (default: 1)
   * @returns {Promise<Object>} Updated cart
   */
  addBundleToCart: async (bundleId, quantity = 1) => {
    try {
      // First, get bundle details to add all items
      const bundleDetails = await bundleService.getBundleDetails(bundleId);
      
      // Add each item from bundle to cart with bundle metadata
      const cartPromises = bundleDetails.data.items.map(item => {
        return api.post('/cart/items', {
          product_variant_id: item.product_variant_id,
          quantity: item.quantity * quantity,
          bundle_origin: 'brand_bundle',
          bundle_id: bundleId
        });
      });

      await Promise.all(cartPromises);

      // Return updated cart
      const cartResponse = await api.get('/cart');
      return cartResponse.data;
    } catch (error) {
      console.error('❌ Add bundle to cart error:', error);
      throw error.response?.data || error;
    }
  }
};

export default bundleService;