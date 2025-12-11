// backend/src/controllers/cartController.js
// UPDATED: Include stock_limit in cart items response

const supabase = require('../config/supabaseClient');

const TABLES = {
  CART_ITEMS: 'Cart_items',
  CARTS: 'Carts',
  BUNDLES: 'Bundles',
  BUNDLE_ITEMS: 'Bundle_items',
};

const CartController = {

  // ==================== HELPER: GET OR CREATE CART ====================

  getOrCreateCart: async (userId, sessionId) => {
    try {
      console.log('🔍 getOrCreateCart called with:', { userId, sessionId });

      if (userId) {
        const { data: userExists, error: userCheckError } = await supabase
          .from('Users')
          .select('id')
          .eq('id', userId)
          .single();

        if (userCheckError || !userExists) {
          console.error('❌ User does not exist in database:', userId);
          throw new Error(`User ${userId} not found in database`);
        }
        console.log('✅ User verified:', userId);
      }

      let query = supabase
        .from(TABLES.CARTS)
        .select('id, user_id, session_id, expires_at');

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
          .gt('expires_at', new Date().toISOString());
      } else {
        throw new Error('Either user_id or session_id required');
      }

      const { data: existingCart, error: fetchError } = await query.single();

      if (existingCart && !fetchError) {
        console.log('✅ Found existing cart:', existingCart);
        
        if (userId && existingCart.user_id && existingCart.user_id !== userId) {
          console.error('❌ CRITICAL: Cart user_id mismatch!');
          await supabase.from(TABLES.CARTS).delete().eq('id', existingCart.id);
          console.log('🗑️ Deleted mismatched cart, will create new one');
        } else {
          return existingCart;
        }
      }

      console.log('📝 Creating new cart for:', { userId, sessionId });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

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
        console.error('❌ Error creating cart:', insertError);
        throw insertError;
      }

      console.log('✅ Created new cart:', newCart);
      return newCart;

    } catch (error) {
      console.error('❌ Error getting/creating cart:', error);
      throw error;
    }
  },

  // ==================== GET CART ====================

  /**
   * Get user's cart with bundle items
   * GET /api/cart
   * ⭐ UPDATED: Now includes stock_limit for each bundle
   */
  getCart: async (req, res) => {
    try {
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

      console.log('📍 GET /api/cart - userId:', userId, 'sessionId:', sessionId);

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      // ⭐ UPDATED: Include stock_limit in the select query
      const { data: items, error: itemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id,
          quantity,
          bundle_id,
          user_id,
          created_at,
          Bundles (
            id,
            title,
            description,
            img_url,
            price,
            is_active,
            stock_limit
          )
        `)
        .eq('cart_id', cartId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Transform items to flat structure with stock_limit
      const transformedItems = (items || []).map(item => {
        if (!item.Bundles) {
          console.warn('⚠️ Cart item has no bundle:', item.id);
          return null;
        }

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
          stock_limit: item.Bundles.stock_limit, // ⭐ NOW INCLUDED
          type: 'bundle'
        };
      }).filter(Boolean);

      // Calculate totals
      const subtotal = transformedItems.reduce((sum, item) => sum + item.item_total, 0);
      const tax = 0;  // No tax applied
      const shipping = 0;  // Free delivery always
      const total = subtotal;  // Total equals subtotal

      res.json({
        success: true,
        data: {
          cart_id: cartId,
          items: transformedItems,
          totals: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: 0,
            shipping: 0,
            total: parseFloat(subtotal.toFixed(2)),  // Same as subtotal
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
        error: error.message
      });
    }
  },

  // ==================== ADD TO CART ====================

  /**
   * Add bundle to cart
   * POST /api/cart/items
   * Body: { bundle_id, quantity }
   */
  addToCart: async (req, res) => {
    try {
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');
      const { bundle_id, quantity = 1 } = req.body;

      console.log(`🛒 Add to cart - userId: ${userId}, sessionId: ${sessionId}, bundle: ${bundle_id}`);

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
          message: 'User ID or session ID required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;
      const actualUserId = userId || cart.user_id;
      
      console.log('✅ Cart ID:', cartId);
      console.log('✅ Using user_id:', actualUserId);

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

      // ⭐ Validate stock limit
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
        const newQuantity = existingItem.quantity + quantity;

        // ⭐ Validate against stock limit
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

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }
        cartItem = updated;

        console.log(`✅ Updated cart item ${existingItem.id} quantity to ${newQuantity}`);
      } else {
        // ⭐ Validate new quantity against stock limit
        if (bundle.stock_limit !== null && quantity > bundle.stock_limit) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${bundle.stock_limit} units allowed per bundle`
          });
        }

        console.log('📝 Inserting new cart item with:', {
          cart_id: cartId,
          bundle_id: bundle_id,
          quantity,
          user_id: actualUserId
        });

        const { data: inserted, error: insertError } = await supabase
          .from(TABLES.CART_ITEMS)
          .insert([{
            cart_id: cartId,
            bundle_id: bundle_id,
            quantity,
            user_id: actualUserId,
            created_at: new Date().toISOString()
          }])
          .select('id, quantity')
          .single();

        if (insertError) {
          console.error('❌ Insert error details:', insertError);
          throw insertError;
        }
        cartItem = inserted;

        console.log(`✅ Added new cart item ${cartItem.id}`);
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
        error: error.message
      });
    }
  },

  // ==================== UPDATE CART ITEM ====================

  /**
   * Update cart item quantity
   * PATCH /api/cart/items/:id
   * ⭐ UPDATED: Validates against stock_limit
   */
  updateCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId);
      const cartId = cart.id;

      // ⭐ Get cart item WITH bundle stock_limit
      const { data: item, error: itemError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id, 
          cart_id, 
          bundle_id,
          Bundles (
            stock_limit
          )
        `)
        .eq('id', id)
        .single();

      if (itemError || !item) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      if (item.cart_id !== cartId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // ⭐ Validate against stock limit
      const stockLimit = item.Bundles?.stock_limit;
      if (stockLimit !== null && stockLimit !== undefined && quantity > stockLimit) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${stockLimit} units allowed per bundle`
        });
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

      console.log(`✅ Updated cart item ${id} to quantity ${quantity}`);

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
        error: error.message
      });
    }
  },

  // ==================== REMOVE CART ITEM ====================

  removeCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

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

      console.log(`✅ Removed cart item ${id}`);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });

    } catch (error) {
      console.error('❌ Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove cart item',
        error: error.message
      });
    }
  },

  // ==================== CLEAR CART ====================

  clearCart: async (req, res) => {
    try {
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
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

      console.log(`✅ Cleared ${deletedItems?.length || 0} items from cart`);

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
        error: error.message
      });
    }
  },

  // ==================== MERGE CARTS (ON LOGIN) ====================

  mergeCarts: async (req, res) => {
    try {
      const userId = req.user?.id || req.get('x-user-id');
      const { session_id } = req.body;

      if (!userId || !session_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID and session ID are required'
        });
      }

      console.log(`🔀 Merging cart for user ${userId} from session ${session_id}`);

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

      const userCart = await CartController.getOrCreateCart(userId, null);
      const userCartId = userCart.id;

      const { data: guestItems, error: guestItemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('bundle_id, quantity')
        .eq('cart_id', guestCart.id);

      if (guestItemsError) throw guestItemsError;

      if (!guestItems || guestItems.length === 0) {
        await supabase.from(TABLES.CARTS).delete().eq('id', guestCart.id);
        
        return res.json({
          success: true,
          message: 'No items to merge'
        });
      }

      let mergedCount = 0;
      for (const item of guestItems) {
        const { data: existingItem, error: existError } = await supabase
          .from(TABLES.CART_ITEMS)
          .select('id, quantity')
          .eq('cart_id', userCartId)
          .eq('bundle_id', item.bundle_id)
          .single();

        const itemExists = !existError && existingItem;

        if (itemExists) {
          await supabase
            .from(TABLES.CART_ITEMS)
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
          
          mergedCount++;
        } else {
          await supabase
            .from(TABLES.CART_ITEMS)
            .insert([{
              cart_id: userCartId,
              bundle_id: item.bundle_id,
              quantity: item.quantity,
              user_id: userId,
              created_at: new Date().toISOString()
            }]);
          
          mergedCount++;
        }
      }

      await supabase.from(TABLES.CART_ITEMS).delete().eq('cart_id', guestCart.id);
      await supabase.from(TABLES.CARTS).delete().eq('id', guestCart.id);

      console.log(`✅ Merged ${mergedCount} items into user cart`);

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
        error: error.message
      });
    }
  }

};

module.exports = CartController;