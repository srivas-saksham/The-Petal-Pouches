// backend/src/models/productModel.js
const supabase = require('../config/supabaseClient');

const ProductModel = {

  /**
   * Get all products with pagination
   */
  getAllProducts: async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        min_price = '',
        max_price = '',
        in_stock = false
      } = filters;

      let query = supabase
        .from('Products')
        .select('*', { count: 'exact' });

      if (search) query = query.ilike('title', `%${search}%`);
      if (min_price) query = query.gte('price', parseInt(min_price));
      if (max_price) query = query.lte('price', parseInt(max_price));
      if (in_stock) query = query.gt('stock', 0);

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        total: count || 0,
        page: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Get products error:', error);
      throw error;
    }
  },

  /**
   * Get single product by ID
   */
  getProductById: async (productId) => {
    try {
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Get product by ID error:', error);
      throw error;
    }
  }

};

module.exports = ProductModel;