// backend/src/models/wishlistModel.js

const supabase = require('../config/supabaseClient');

/**
 * Wishlist Model - Handles all wishlist-related database operations
 * Manages user wishlist items with product details
 */
const WishlistModel = {

  // ==================== READ OPERATIONS ====================

  /**
   * Get user's wishlist with pagination and filters
   * @param {string} userId - User UUID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sort - Sort by (date/title/price)
   * @param {string} categoryId - Optional category filter
   * @returns {Promise<Object>} Wishlist with items and pagination
   */
  async getWishlist(userId, page = 1, limit = 20, sort = 'date', categoryId = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build base query
      let query = supabase
        .from('Wishlist')
        .select(`
          id,
          created_at,
          Products!inner(
            id,
            title,
            description,
            price,
            stock,
            img_url,
            sku,
            has_variants,
            category_id,
            Categories(
              id,
              name
            ),
            Product_variants(
              id,
              sku,
              attributes,
              price,
              stock,
              img_url,
              is_default
            )
          )
        `)
        .eq('user_id', userId);

      // Apply category filter if provided
      if (categoryId) {
        query = query.eq('Products.category_id', categoryId);
      }

      // Apply sorting
      if (sort === 'title') {
        query = query.order('Products(title)', { ascending: true });
      } else if (sort === 'price') {
        query = query.order('Products(price)', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: wishlistItems, error: itemsError } = await query;

      if (itemsError) throw itemsError;

      // Format the results
      const items = (wishlistItems || []).map(item => ({
        id: item.id,
        added_at: item.created_at,
        product_id: item.Products.id,
        title: item.Products.title,
        description: item.Products.description,
        price: item.Products.price,
        stock_quantity: item.Products.stock,
        image_url: item.Products.img_url,
        sku: item.Products.sku,
        has_variants: item.Products.has_variants,
        category_id: item.Products.category_id,
        category_name: item.Products.Categories?.name || null,
        in_stock: item.Products.stock > 0,
        variants: item.Products.Product_variants || []
      }));

      // Get total count (separate query for accurate count)
      let countQuery = supabase
        .from('Wishlist')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (categoryId) {
        countQuery = countQuery.eq('Products.category_id', categoryId);
      }

      const { count: totalCount, error: countError } = await countQuery;

      if (countError) throw countError;

      // Get stock statistics
      const { data: statsData, error: statsError } = await supabase
        .from('Wishlist')
        .select(`
          Products!inner(
            stock
          )
        `)
        .eq('user_id', userId);

      if (statsError) throw statsError;

      const inStockCount = (statsData || []).filter(item => item.Products.stock > 0).length;
      const outOfStockCount = (statsData || []).filter(item => item.Products.stock === 0).length;

      return {
        items,
        pagination: {
          total: totalCount || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((totalCount || 0) / limit),
          hasMore: page < Math.ceil((totalCount || 0) / limit)
        },
        in_stock_count: inStockCount,
        out_of_stock_count: outOfStockCount
      };
      
    } catch (error) {
      console.error('[WishlistModel] Error getting wishlist:', error);
      throw error;
    }
  },

  /**
   * Check if product is in user's wishlist
   * @param {string} userId - User UUID
   * @param {string} productId - Product UUID
   * @returns {Promise<boolean>} True if in wishlist
   */
  async isInWishlist(userId, productId) {
    try {
      const { data, error } = await supabase
        .from('Wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error('[WishlistModel] Error checking wishlist:', error);
      throw error;
    }
  },

  /**
   * Get wishlist item by ID
   * @param {string} itemId - Wishlist item UUID
   * @param {string} userId - User UUID (for authorization)
   * @returns {Promise<Object|null>} Wishlist item or null
   */
  async getItemById(itemId, userId) {
    try {
      const { data, error } = await supabase
        .from('Wishlist')
        .select(`
          *,
          Products!inner(
            title,
            price,
            stock,
            img_url,
            has_variants
          )
        `)
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        title: data.Products.title,
        price: data.Products.price,
        stock: data.Products.stock,
        image_url: data.Products.img_url,
        has_variants: data.Products.has_variants
      };
    } catch (error) {
      console.error('[WishlistModel] Error getting item by ID:', error);
      throw error;
    }
  },

  // ==================== CREATE OPERATIONS ====================

  /**
   * Add item to wishlist
   * @param {string} userId - User UUID
   * @param {string} productId - Product UUID
   * @returns {Promise<Object>} Created wishlist item
   */
  async addItem(userId, productId) {
    try {
      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('Products')
        .select('id, title')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // Check if already in wishlist
      const { data: existing, error: existsError } = await supabase
        .from('Wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing && !existsError) {
        throw new Error('ALREADY_IN_WISHLIST');
      }

      // Add to wishlist
      const { data: wishlistItem, error: insertError } = await supabase
        .from('Wishlist')
        .insert([{
          user_id: userId,
          product_id: productId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`[WishlistModel] Item added to wishlist: ${productId} for user ${userId}`);
      return wishlistItem;

    } catch (error) {
      if (error.message === 'ALREADY_IN_WISHLIST' || error.message === 'PRODUCT_NOT_FOUND') {
        throw error;
      }
      console.error('[WishlistModel] Error adding to wishlist:', error);
      throw error;
    }
  },

  // ==================== DELETE OPERATIONS ====================

  /**
   * Remove item from wishlist
   * @param {string} itemId - Wishlist item UUID
   * @param {string} userId - User UUID (for authorization)
   * @returns {Promise<boolean>} True if removed
   */
  async removeItem(itemId, userId) {
    try {
      const { data, error } = await supabase
        .from('Wishlist')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return false;
      }

      console.log(`[WishlistModel] Item removed from wishlist: ${itemId}`);
      return true;
    } catch (error) {
      console.error('[WishlistModel] Error removing item:', error);
      throw error;
    }
  },

  /**
   * Remove product from wishlist (by product_id)
   * @param {string} userId - User UUID
   * @param {string} productId - Product UUID
   * @returns {Promise<boolean>} True if removed
   */
  async removeByProductId(userId, productId) {
    try {
      const { data, error } = await supabase
        .from('Wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return false;
      }

      console.log(`[WishlistModel] Product removed from wishlist: ${productId}`);
      return true;
    } catch (error) {
      console.error('[WishlistModel] Error removing product:', error);
      throw error;
    }
  },

  /**
   * Clear entire wishlist
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Result with count
   */
  async clearWishlist(userId) {
    try {
      const { data, error } = await supabase
        .from('Wishlist')
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      const count = data ? data.length : 0;
      console.log(`[WishlistModel] Wishlist cleared for user ${userId} (${count} items)`);

      return {
        success: true,
        count
      };
    } catch (error) {
      console.error('[WishlistModel] Error clearing wishlist:', error);
      throw error;
    }
  },

  // ==================== WISHLIST STATISTICS ====================

  /**
   * Get wishlist statistics
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Wishlist statistics
   */
  async getWishlistStats(userId) {
    try {
      const { data: wishlistItems, error } = await supabase
        .from('Wishlist')
        .select(`
          created_at,
          Products!inner(
            price,
            stock
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (!wishlistItems || wishlistItems.length === 0) {
        return {
          total_items: 0,
          in_stock_items: 0,
          out_of_stock_items: 0,
          total_value: 0,
          avg_price: 0,
          oldest_item_date: null,
          newest_item_date: null
        };
      }

      // Calculate statistics
      const totalItems = wishlistItems.length;
      const inStockItems = wishlistItems.filter(item => item.Products.stock > 0).length;
      const outOfStockItems = wishlistItems.filter(item => item.Products.stock === 0).length;
      const totalValue = wishlistItems.reduce((sum, item) => sum + item.Products.price, 0);
      const avgPrice = Math.round(totalValue / totalItems);

      const dates = wishlistItems.map(item => new Date(item.created_at));
      const oldestDate = new Date(Math.min(...dates));
      const newestDate = new Date(Math.max(...dates));

      return {
        total_items: totalItems,
        in_stock_items: inStockItems,
        out_of_stock_items: outOfStockItems,
        total_value: totalValue,
        avg_price: avgPrice,
        oldest_item_date: oldestDate.toISOString(),
        newest_item_date: newestDate.toISOString()
      };
    } catch (error) {
      console.error('[WishlistModel] Error getting wishlist stats:', error);
      throw error;
    }
  },

  /**
   * Get wishlist count
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of items in wishlist
   */
  async getItemCount(userId) {
    try {
      const { count, error } = await supabase
        .from('Wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[WishlistModel] Error getting item count:', error);
      throw error;
    }
  },

  // ==================== CART OPERATIONS ====================

  /**
   * Move all wishlist items to cart
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Result with counts
   */
  async moveAllToCart(userId) {
    try {
      // Get all wishlist items with stock info
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('Wishlist')
        .select(`
          id,
          product_id,
          Products!inner(
            title,
            stock,
            has_variants,
            Product_variants(
              id,
              is_default,
              stock
            )
          )
        `)
        .eq('user_id', userId);

      if (wishlistError) throw wishlistError;

      if (!wishlistItems || wishlistItems.length === 0) {
        return {
          moved_count: 0,
          out_of_stock_count: 0,
          out_of_stock_items: []
        };
      }

      let movedCount = 0;
      const outOfStockItems = [];

      // Import CartModel
      const CartModel = require('./cartModel');

      for (const item of wishlistItems) {
        // Check stock
        if (item.Products.stock <= 0) {
          outOfStockItems.push({
            product_id: item.product_id,
            title: item.Products.title
          });
          continue;
        }

        // Determine variant to use
        let variantId = null;
        if (item.Products.has_variants) {
          // Look for default variant
          const defaultVariant = item.Products.Product_variants?.find(v => v.is_default);
          
          if (defaultVariant) {
            variantId = defaultVariant.id;
          } else {
            // Get first available variant with stock
            const availableVariant = item.Products.Product_variants?.find(v => v.stock > 0);
            
            if (availableVariant) {
              variantId = availableVariant.id;
            } else {
              outOfStockItems.push({
                product_id: item.product_id,
                title: item.Products.title
              });
              continue;
            }
          }
        }

        // Add to cart
        try {
          await CartModel.addItem(userId, variantId || item.product_id, 1, {
            bundle_origin: 'single'
          });
          
          // Remove from wishlist
          await supabase
            .from('Wishlist')
            .delete()
            .eq('id', item.id);
          
          movedCount++;
        } catch (error) {
          console.error(`Error moving item ${item.product_id} to cart:`, error);
        }
      }

      console.log(`[WishlistModel] Moved ${movedCount} items to cart for user ${userId}`);
      
      return {
        moved_count: movedCount,
        out_of_stock_count: outOfStockItems.length,
        out_of_stock_items: outOfStockItems
      };

    } catch (error) {
      console.error('[WishlistModel] Error moving items to cart:', error);
      throw error;
    }
  }
};

module.exports = WishlistModel;