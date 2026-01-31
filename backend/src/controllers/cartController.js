// backend/src/controllers/cartController.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const supabase = require('../config/supabaseClient');

const TABLES = {
  CART_ITEMS: 'Cart_items',
  CARTS: 'Carts',
  BUNDLES: 'Bundles',
  BUNDLE_ITEMS: 'Bundle_items',
  PRODUCTS: 'Products'
};

const CartController = {

  // ==================== HELPER: GET OR CREATE CART ====================

  /**
   * Get or create cart for user or guest session
   * @param {string} userId - Authenticated user ID (from JWT)
   * @param {string} sessionId - Guest session UUID
   * @returns {Object} Cart object
   */
  getOrCreateCart: async (userId, sessionId) => {
    try {
      // ✅ SECURITY: Validate inputs
      if (!userId && !sessionId) {
        throw new Error('Either user_id or session_id required');
      }

      // ✅ If userId provided, verify user exists
      if (userId) {
        const { data: userExists, error: userCheckError } = await supabase
          .from('Users')
          .select('id')
          .eq('id', userId)
          .single();

        if (userCheckError || !userExists) {
          throw new Error(`User ${userId} not found in database`);
        }
      }

      // Build query based on auth type
      let query = supabase
        .from(TABLES.CARTS)
        .select('id, user_id, session_id, expires_at');

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Guest cart with expiration check
        query = query
          .eq('session_id', sessionId)
          .gt('expires_at', new Date().toISOString());
      }

      const { data: existingCart, error: fetchError } = await query.single();

      // Return existing cart if found
      if (existingCart && !fetchError) {
        // ✅ SECURITY: Verify cart ownership
        if (userId && existingCart.user_id && existingCart.user_id !== userId) {
          console.error('❌ CRITICAL: Cart user_id mismatch - deleting corrupted cart');
          await supabase.from(TABLES.CARTS).delete().eq('id', existingCart.id);
        } else {
          return existingCart;
        }
      }

      // Create new cart
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiration

      const { data: newCart, error: insertError } = await supabase
        .from(TABLES.CARTS)
        .insert([{
          user_id: userId || null,
          session_id: sessionId || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, user_id, session_id')
        .single();

      if (insertError) {
        throw insertError;
      }

      return newCart;

    } catch (error) {
      console.error('❌ Error getting/creating cart:', error);
      throw error;
    }
  },

  // ==================== GET CART ====================

  /**
   * Get user's cart with all items (bundles + products)
   * GET /api/cart
   * @access Public (uses optionalCustomerAuth)
   */
  getCart: async (req, res) => {
    try {
      // ✅ SECURITY: Only trust middleware
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!userId && !sessionId) {
        // Empty cart for non-authenticated, no-session users
        return res.json({
          success: true,
          data: {
            cart_id: null,
            items: [],
            totals: {
              subtotal: 0,
              tax: 0,
              shipping: 0,
              total: 0,
              item_count: 0,
              total_quantity: 0
            }
          }
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      // Fetch ALL cart items with LEFT JOIN to both Bundles and Products
      const { data: items, error: itemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id,
          quantity,
          bundle_id,
          product_id,
          item_type,
          created_at,
          Bundles (
            id,
            title,
            description,
            img_url,
            price,
            is_active,
            stock_limit,
            weight
          ),
          Products (
            id,
            title,
            description,
            img_url,
            price,
            stock,
            weight,
            sku
          )
        `)
        .eq('cart_id', cartId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Transform items - handles BOTH bundles and products
      const transformedItems = (items || []).map(item => {
        
        // BUNDLE ITEM
        if (item.bundle_id && item.Bundles) {
          return {
            id: item.id,
            bundle_id: item.Bundles.id,
            title: item.Bundles.title,
            description: item.Bundles.description,
            image_url: item.Bundles.img_url,
            price: parseFloat(item.Bundles.price),
            quantity: item.quantity,
            item_total: parseFloat(item.Bundles.price) * item.quantity,
            is_active: item.Bundles.is_active,
            stock_limit: item.Bundles.stock_limit,
            weight: item.Bundles.weight || 199,
            type: 'bundle'
          };
        }
        
        // PRODUCT ITEM
        if (item.product_id && item.Products) {
          return {
            id: item.id,
            product_id: item.Products.id,
            title: item.Products.title,
            description: item.Products.description,
            image_url: item.Products.img_url,
            price: parseFloat(item.Products.price),
            quantity: item.quantity,
            item_total: parseFloat(item.Products.price) * item.quantity,
            stock_limit: item.Products.stock,
            weight: item.Products.weight || 99,
            type: 'product'
          };
        }

        // Invalid/orphaned item
        console.warn('⚠️ Invalid cart item (no bundle or product):', item.id);
        return null;
        
      }).filter(Boolean);

      // Calculate totals
      const subtotal = transformedItems.reduce((sum, item) => sum + item.item_total, 0);
      const total = subtotal;

      res.json({
        success: true,
        data: {
          cart_id: cartId,
          items: transformedItems,
          totals: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: 0,
            shipping: 0,
            total: parseFloat(total.toFixed(2)),
            item_count: transformedItems.length,
            total_quantity: transformedItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== ADD BUNDLE TO CART ====================

  /**
   * Add bundle to cart
   * POST /api/cart/items
   * @body { bundle_id, quantity }
   */
  addToCart: async (req, res) => {
  try {
    // ⭐ DEBUG: Log authentication state
    console.log('🔍 [addToCart] Auth Debug:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      hasSessionId: !!req.sessionId,
      sessionId: req.sessionId,
      authHeader: req.headers.authorization?.substring(0, 20) + '...',
    });

    // ✅ SECURITY: Only trust middleware
    const userId = req.user?.id;
    const sessionId = req.sessionId;
    const { bundle_id, quantity = 1 } = req.body;

      if (!bundle_id) {
        return res.status(400).json({
          success: false,
          message: 'Bundle ID is required'
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Authentication or session required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      // Verify bundle exists and is active
      const { data: bundle, error: bundleError } = await supabase
        .from(TABLES.BUNDLES)
        .select('id, title, price, is_active, stock_limit')
        .eq('id', bundle_id)
        .single();

      if (bundleError || !bundle) {
        return res.status(404).json({
          success: false,
          message: 'Bundle not found'
        });
      }

      if (!bundle.is_active) {
        return res.status(400).json({
          success: false,
          message: 'This bundle is not available'
        });
      }

      // Check stock limit
      if (bundle.stock_limit !== null && bundle.stock_limit === 0) {
        return res.status(400).json({
          success: false,
          message: 'This bundle is out of stock'
        });
      }

      // Check if bundle already in cart
      const { data: existingItem, error: existError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('bundle_id', bundle_id)
        .single();

      const itemExists = !existError && existingItem;

      let cartItem;

      if (itemExists) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;

        // Validate against stock limit
        if (bundle.stock_limit !== null && newQuantity > bundle.stock_limit) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${bundle.stock_limit} units allowed per bundle`
          });
        }

        const { data: updated, error: updateError } = await supabase
          .from(TABLES.CART_ITEMS)
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select('id, quantity')
          .single();

        if (updateError) throw updateError;
        cartItem = updated;

      } else {
        // Insert new item
        if (bundle.stock_limit !== null && quantity > bundle.stock_limit) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${bundle.stock_limit} units allowed per bundle`
          });
        }

        const { data: inserted, error: insertError } = await supabase
          .from(TABLES.CART_ITEMS)
          .insert([{
            cart_id: cartId,
            bundle_id: bundle_id,
            product_id: null,
            item_type: 'bundle',
            quantity,
            user_id: userId || null,
            created_at: new Date().toISOString()
          }])
          .select('id, quantity')
          .single();

        if (insertError) throw insertError;
        cartItem = inserted;
      }

      res.json({
        success: true,
        message: 'Bundle added to cart successfully',
        data: {
          cart_item_id: cartItem.id,
          quantity: cartItem.quantity,
          bundle_title: bundle.title
        }
      });

    } catch (error) {
      console.error('❌ Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bundle to cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== ADD PRODUCT TO CART ====================

  /**
   * Add individual product to cart
   * POST /api/cart/products
   * @body { product_id, quantity }
   */
  addProductToCart: async (req, res) => {
    try {
      // ✅ SECURITY: Only trust middleware
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const { product_id, quantity = 1 } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Authentication or session required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);

      // Verify product exists
      const { data: product, error: productError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('id, title, price, stock, is_sellable') // 🔒 NEW: Fetch sellability flag
        .eq('id', product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // 🔒 NEW: CRITICAL SECURITY - Prevent bundle-only products from being purchased individually
      if (product.is_sellable === false) {
        return res.status(403).json({
          success: false,
          message: 'This product is only available as part of a bundle'
        });
      }

      if (product.stock === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock'
        });
      }

      // Check if product already in cart
      const { data: existingItem } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', product_id)
        .eq('item_type', 'product')
        .single();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available`
          });
        }

        const { data: updated } = await supabase
          .from(TABLES.CART_ITEMS)
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        return res.json({
          success: true,
          message: 'Product quantity updated',
          data: updated
        });
      }

      // Insert new product item
      const { data: newItem, error: insertError } = await supabase
        .from(TABLES.CART_ITEMS)
        .insert([{
          cart_id: cart.id,
          user_id: userId || null,
          product_id: product_id,
          bundle_id: null,
          item_type: 'product',
          quantity: quantity,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      res.json({
        success: true,
        message: 'Product added to cart',
        data: newItem
      });

    } catch (error) {
      console.error('❌ Add product to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product to cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== UPDATE CART ITEM ====================

  /**
   * Update cart item quantity
   * PATCH /api/cart/items/:id
   * @body { quantity }
   */
  updateCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      // ✅ SECURITY: Only trust middleware
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      // Get cart item WITH bundle/product stock info
      const { data: item, error: itemError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id, 
          cart_id, 
          bundle_id,
          product_id,
          item_type,
          Bundles (stock_limit),
          Products (stock)
        `)
        .eq('id', id)
        .single();

      if (itemError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // ✅ SECURITY: Verify cart ownership
      if (item.cart_id !== cartId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Validate against stock limits
      if (item.item_type === 'bundle') {
        const stockLimit = item.Bundles?.stock_limit;
        if (stockLimit !== null && stockLimit !== undefined && quantity > stockLimit) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${stockLimit} units allowed per bundle`
          });
        }
      } else if (item.item_type === 'product') {
        const stock = item.Products?.stock;
        if (stock !== null && stock !== undefined && quantity > stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${stock} units available`
          });
        }
      }

      // Update quantity
      const { error: updateError } = await supabase
        .from(TABLES.CART_ITEMS)
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: 'Cart item updated',
        data: { quantity }
      });

    } catch (error) {
      console.error('❌ Update cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== REMOVE CART ITEM ====================

  removeCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      // ✅ SECURITY: Only trust middleware
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      const { data: item, error: itemError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('id, cart_id')
        .eq('id', id)
        .single();

      if (itemError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // ✅ SECURITY: Verify cart ownership
      if (item.cart_id !== cartId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { error } = await supabase
        .from(TABLES.CART_ITEMS)
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Item removed from cart'
      });

    } catch (error) {
      console.error('❌ Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove cart item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== CLEAR CART ====================

  clearCart: async (req, res) => {
    try {
      // ✅ SECURITY: Only trust middleware
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Authentication or session required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      const { data: deletedItems, error } = await supabase
        .from(TABLES.CART_ITEMS)
        .delete()
        .eq('cart_id', cartId)
        .select('id');

      if (error) throw error;

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { items_removed: deletedItems?.length || 0 }
      });

    } catch (error) {
      console.error('❌ Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== MERGE CARTS (ON LOGIN) ====================

  /**
   * Merge guest cart into authenticated user cart
   * POST /api/cart/merge
   * @body { session_id }
   * @access Private (requires JWT)
   */
  mergeCarts: async (req, res) => {
    try {
      // ✅ SECURITY: Only trust middleware (JWT required for this endpoint)
      const userId = req.user?.id;
      const { session_id } = req.body;

      if (!userId || !session_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID and session ID are required'
        });
      }

      // Find guest cart
      const { data: guestCart, error: guestCartError } = await supabase
        .from(TABLES.CARTS)
        .select('id')
        .eq('session_id', session_id)
        .single();

      if (guestCartError || !guestCart) {
        return res.json({
          success: true,
          message: 'No guest cart to merge'
        });
      }

      // Get or create user cart
      const userCart = await CartController.getOrCreateCart(userId, null);
      const userCartId = userCart.id;

      // Get guest cart items
      const { data: guestItems, error: guestItemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('bundle_id, product_id, item_type, quantity')
        .eq('cart_id', guestCart.id);

      if (guestItemsError) throw guestItemsError;

      if (!guestItems || guestItems.length === 0) {
        // Clean up empty guest cart
        await supabase.from(TABLES.CARTS).delete().eq('id', guestCart.id);
        
        return res.json({
          success: true,
          message: 'No items to merge'
        });
      }

      // Merge items
      let mergedCount = 0;
      for (const item of guestItems) {
        // Check if item already in user cart
        const { data: existingItem, error: existError } = await supabase
          .from(TABLES.CART_ITEMS)
          .select('id, quantity')
          .eq('cart_id', userCartId)
          .eq('bundle_id', item.bundle_id || null)
          .eq('product_id', item.product_id || null)
          .eq('item_type', item.item_type)
          .single();

        const itemExists = !existError && existingItem;

        if (itemExists) {
          // Update existing item
          await supabase
            .from(TABLES.CART_ITEMS)
            .update({ 
              quantity: existingItem.quantity + item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id);
          
          mergedCount++;
        } else {
          // Insert new item
          await supabase
            .from(TABLES.CART_ITEMS)
            .insert([{
              cart_id: userCartId,
              bundle_id: item.bundle_id || null,
              product_id: item.product_id || null,
              item_type: item.item_type,
              quantity: item.quantity,
              user_id: userId,
              created_at: new Date().toISOString()
            }]);
          
          mergedCount++;
        }
      }

      // Clean up guest cart
      await supabase.from(TABLES.CART_ITEMS).delete().eq('cart_id', guestCart.id);
      await supabase.from(TABLES.CARTS).delete().eq('id', guestCart.id);

      res.json({
        success: true,
        message: 'Carts merged successfully',
        data: { items_merged: mergedCount }
      });

    } catch (error) {
      console.error('❌ Merge carts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to merge carts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

};

module.exports = CartController;