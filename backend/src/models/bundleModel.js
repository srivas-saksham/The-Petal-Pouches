// backend/src/models/bundleModel.js

const supabase = require('../config/supabaseClient');

/**
 * Bundle Model
 * Handles all database operations for Bundles and Bundle_items tables
 */
const BundleModel = {

  /**
   * Get all active bundles with basic info
   * @param {Object} filters - { page, limit, sort }
   * @returns {Promise<Array>} Array of bundles
   */
  getAllBundles: async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        sort = 'created_at',
        active_only = true
      } = filters;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('Bundles')
        .select('*', { count: 'exact' });

      // Filter active bundles only
      if (active_only) {
        query = query.eq('is_active', true);
      }

      // Apply sorting
      const sortOrder = sort === 'price_asc' ? true : false;
      const sortColumn = sort.includes('price') ? 'price' : 'created_at';
      query = query.order(sortColumn, { ascending: sortOrder });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        bundles: data || [],
        total: count || 0,
        page: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Get all bundles error:', error);
      throw error;
    }
  },

  /**
   * Get single bundle by ID with all items and product details
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} Bundle with items array
   */
  getBundleWithItems: async (bundleId) => {
    try {
      // Get bundle basic info
      const { data: bundle, error: bundleError } = await supabase
        .from('Bundles')
        .select('*')
        .eq('id', bundleId)
        .eq('is_active', true)
        .single();

      if (bundleError) throw bundleError;
      if (!bundle) {
        const error = new Error('Bundle not found');
        error.code = 'BUNDLE_NOT_FOUND';
        throw error;
      }

      // Get bundle items with product and variant details
      const { data: items, error: itemsError } = await supabase
        .from('Bundle_items')
        .select(`
          id,
          quantity,
          product_id,
          product_variant_id,
          Products (
            id,
            title,
            description,
            img_url,
            category_id,
            sku,
            has_variants,
            Categories (
              id,
              name
            )
          ),
          Product_variants (
            id,
            sku,
            attributes,
            img_url,
            weight
          )
        `)
        .eq('bundle_id', bundleId);

      if (itemsError) throw itemsError;

      // Format response
      const bundleWithItems = {
        ...bundle,
        items: (items || []).map(item => ({
          id: item.id,
          quantity: item.quantity,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          product: item.Products ? {
            id: item.Products.id,
            title: item.Products.title,
            description: item.Products.description,
            img_url: item.Products.img_url,
            sku: item.Products.sku,
            has_variants: item.Products.has_variants,
            category: item.Products.Categories
          } : null,
          variant: item.Product_variants ? {
            id: item.Product_variants.id,
            sku: item.Product_variants.sku,
            attributes: item.Product_variants.attributes,
            img_url: item.Product_variants.img_url,
            weight: item.Product_variants.weight
          } : null
        }))
      };

      return bundleWithItems;
    } catch (error) {
      console.error('❌ Get bundle with items error:', error);
      throw error;
    }
  },

  /**
   * Get bundle basic info only (no items)
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} Bundle info
   */
  getBundleById: async (bundleId) => {
    try {
      const { data, error } = await supabase
        .from('Bundles')
        .select('*')
        .eq('id', bundleId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) {
        const error = new Error('Bundle not found');
        error.code = 'BUNDLE_NOT_FOUND';
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Get bundle by ID error:', error);
      throw error;
    }
  },

  /**
   * Check if bundle has sufficient stock
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<Object>} Stock status
   */
  checkBundleStock: async (bundleId) => {
    try {
      // Get bundle stock limit
      const { data: bundle, error: bundleError } = await supabase
        .from('Bundles')
        .select('stock_limit, title')
        .eq('id', bundleId)
        .single();

      if (bundleError) throw bundleError;

      // Get all items in bundle
      const { data: items, error: itemsError } = await supabase
        .from('Bundle_items')
        .select(`
          quantity,
          product_variant_id,
          Product_variants!inner(stock)
        `)
        .eq('bundle_id', bundleId);

      if (itemsError) throw itemsError;

      // Check if all items have sufficient stock
      const stockIssues = [];
      
      for (const item of items) {
        const availableStock = item.Product_variants?.stock || 0;
        const requiredQuantity = item.quantity;

        if (availableStock < requiredQuantity) {
          stockIssues.push({
            variant_id: item.product_variant_id,
            required: requiredQuantity,
            available: availableStock
          });
        }
      }

      return {
        in_stock: stockIssues.length === 0,
        stock_limit: bundle.stock_limit,
        issues: stockIssues
      };
    } catch (error) {
      console.error('❌ Check bundle stock error:', error);
      throw error;
    }
  },

  /**
   * Get bundle count (for pagination)
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  getBundleCount: async (filters = {}) => {
    try {
      const { active_only = true } = filters;

      let query = supabase
        .from('Bundles')
        .select('*', { count: 'exact', head: true });

      if (active_only) {
        query = query.eq('is_active', true);
      }

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('❌ Get bundle count error:', error);
      throw error;
    }
  },

  /**
   * Search bundles by title/description
   * @param {string} query - Search query
   * @param {Object} options - { page, limit }
   * @returns {Promise<Object>} Search results
   */
  searchBundles: async (query, options = {}) => {
    try {
      const { page = 1, limit = 12 } = options;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('Bundles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        bundles: data || [],
        total: count || 0,
        page: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Search bundles error:', error);
      throw error;
    }
  },

  /**
   * Get bundles by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {Object} options - { page, limit }
   * @returns {Promise<Object>} Filtered bundles
   */
  getBundlesByPriceRange: async (minPrice, maxPrice, options = {}) => {
    try {
      const { page = 1, limit = 12 } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('Bundles')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (minPrice) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice) {
        query = query.lte('price', maxPrice);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        bundles: data || [],
        total: count || 0,
        page: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Get bundles by price range error:', error);
      throw error;
    }
  }

};

module.exports = BundleModel;