// backend/src/controllers/wishlistController.js

const WishlistModel = require('../models/wishlistModel');

/**
 * Wishlist Controller
 * Handles customer wishlist operations - add, view, remove, move to cart
 */
const WishlistController = {

  // ==================== GET WISHLIST ====================

  /**
   * Get user's wishlist with product details
   * GET /api/wishlist?page=1&limit=20&sort=date
   */
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 20, 
        sort = 'date',
        category_id 
      } = req.query;

      const result = await WishlistModel.getWishlist(
        userId,
        parseInt(page),
        parseInt(limit),
        sort,
        category_id
      );

      return res.status(200).json({
        success: true,
        items: result.items,
        pagination: result.pagination,
        in_stock_count: result.in_stock_count,
        out_of_stock_count: result.out_of_stock_count
      });

    } catch (error) {
      console.error('❌ Get wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist'
      });
    }
  },

  // ==================== ADD TO WISHLIST ====================

  /**
   * Add product to wishlist
   * POST /api/wishlist
   */
  addToWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      // Validation
      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      // Add to wishlist
      const item = await WishlistModel.addItem(userId, product_id);

      if (!item) {
        return res.status(400).json({
          success: false,
          message: 'Failed to add product to wishlist'
        });
      }

      console.log(`✅ Added to wishlist: Product ${product_id} for user ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        item
      });

    } catch (error) {
      console.error('❌ Add to wishlist error:', error);

      if (error.message === 'ALREADY_IN_WISHLIST') {
        return res.status(400).json({
          success: false,
          message: 'Product is already in your wishlist'
        });
      }

      if (error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to add to wishlist'
      });
    }
  },

  // ==================== REMOVE FROM WISHLIST ====================

  /**
   * Remove item from wishlist
   * DELETE /api/wishlist/:id
   */
  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const itemId = req.params.id;

      const removed = await WishlistModel.removeItem(itemId, userId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in wishlist'
        });
      }

      console.log(`✅ Removed from wishlist: Item ${itemId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Item removed from wishlist'
      });

    } catch (error) {
      console.error('❌ Remove from wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove from wishlist'
      });
    }
  },

  // ==================== CLEAR WISHLIST ====================

  /**
   * Clear entire wishlist
   * DELETE /api/wishlist
   */
  clearWishlist: async (req, res) => {
    try {
      const userId = req.user.id;

      const cleared = await WishlistModel.clearWishlist(userId);

      console.log(`✅ Cleared wishlist for user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully',
        items_removed: cleared.count
      });

    } catch (error) {
      console.error('❌ Clear wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear wishlist'
      });
    }
  },

  // ==================== MOVE TO CART ====================

  /**
   * Move single item from wishlist to cart
   * POST /api/wishlist/:id/move-to-cart
   */
  moveToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const itemId = req.params.id;
      const { variant_id, quantity = 1 } = req.body;

      // Get wishlist item
      const wishlistResult = await WishlistModel.getWishlist(userId, 1, 1000, 'date');
      const item = wishlistResult.items.find(i => i.id === itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in wishlist'
        });
      }

      // Check stock
      if (item.stock_quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock'
        });
      }

      // Determine variant to use
      let selectedVariantId = variant_id;
      
      if (!selectedVariantId) {
        // Use default variant or first available variant
        if (item.variants && item.variants.length > 0) {
          const defaultVariant = item.variants.find(v => v.is_default);
          selectedVariantId = defaultVariant ? defaultVariant.id : item.variants[0].id;
        }
      }

      if (!selectedVariantId) {
        return res.status(400).json({
          success: false,
          message: 'Product variant is required'
        });
      }

      // Add to cart
      const CartModel = require('../models/cartModel');
      await CartModel.addItem(userId, null, selectedVariantId, quantity, 'single');

      // Remove from wishlist
      await WishlistModel.removeItem(itemId, userId);

      console.log(`✅ Moved to cart: Item ${itemId} for user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Item moved to cart successfully'
      });

    } catch (error) {
      console.error('❌ Move to cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to move item to cart'
      });
    }
  },

  // ==================== MOVE ALL TO CART ====================

  /**
   * Move all wishlist items to cart
   * POST /api/wishlist/move-all-to-cart
   */
  moveAllToCart: async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await WishlistModel.moveAllToCart(userId);

      console.log(`✅ Moved all to cart: ${result.moved_count} items for user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Items moved to cart successfully',
        moved_count: result.moved_count,
        out_of_stock_count: result.out_of_stock_count,
        out_of_stock_items: result.out_of_stock_items
      });

    } catch (error) {
      console.error('❌ Move all to cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to move items to cart'
      });
    }
  },

  // ==================== CHECK IF IN WISHLIST ====================

  /**
   * Check if product is in wishlist
   * GET /api/wishlist/check/:product_id
   */
  checkInWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.product_id;

      const inWishlist = await WishlistModel.isInWishlist(userId, productId);

      return res.status(200).json({
        success: true,
        in_wishlist: inWishlist
      });

    } catch (error) {
      console.error('❌ Check wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check wishlist'
      });
    }
  },

  // ==================== WISHLIST STATISTICS ====================

  /**
   * Get wishlist statistics
   * GET /api/wishlist/stats
   */
  getWishlistStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const stats = await WishlistModel.getWishlistStats(userId);

      return res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Get wishlist stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist statistics'
      });
    }
  }

};

module.exports = WishlistController;