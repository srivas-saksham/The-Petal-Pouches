// backend/src/controllers/cartController.js

const supabase = require('../config/supabaseClient');

/**
 * Cart Controller
 * Handles shopping cart operations for authenticated and guest users
 */
const CartController = {

  // ==================== GET CART ====================

  /**
   * Get user's cart with items and totals
   * GET /api/cart
   */
  getCart: async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'];

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      // Get or create cart
      let cart;
      if (userId) {
        const { data: existingCart } = await supabase
          .from('Carts')
          .select('id, user_id, session_id, created_at, updated_at')
          .eq('user_id', userId)
          .single();

        if (!existingCart) {
          // Create cart for user
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          const { data: newCart, error } = await supabase
            .from('Carts')
            .insert([{
              user_id: userId,
              expires_at: expiresAt.toISOString(),
              created_at: new Date().toISOString()
            }])
            .select('id, user_id, created_at')
            .single();

          if (error) throw error;
          cart = newCart;
        } else {
          cart = existingCart;
        }
      } else {
        // Guest cart
        const now = new Date().toISOString();
        const { data: existingCart } = await supabase
          .from('Carts')
          .select('id, session_id, created_at, expires_at')
          .eq('session_id', sessionId)
          .gt('expires_at', now)
          .single();

        if (!existingCart) {
          // Create guest cart
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          const { data: newCart, error } = await supabase
            .from('Carts')
            .insert([{
              session_id: sessionId,
              expires_at: expiresAt.toISOString(),
              created_at: new Date().toISOString()
            }])
            .select('id, session_id, created_at')
            .single();

          if (error) throw error;
          cart = newCart;
        } else {
          cart = existingCart;
        }
      }

      // Get cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from('Cart_Items')
        .select(`
          id,
          quantity,
          bundle_origin,
          bundle_id,
          product_variant_id,
          Product_Variants!inner (
            id,
            sku,
            price,
            stock_quantity,
            attributes,
            product_id,
            Products!inner (
              id,
              title,
              description,
              image_url,
              category_id,
              Categories (
                name
              )
            )
          )
        `)
        .eq('cart_id', cart.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Transform items to flat structure
      const transformedItems = (items || []).map(item => ({
        id: item.id,
        variant_id: item.Product_Variants.id,
        product_id: item.Product_Variants.Products.id,
        title: item.Product_Variants.Products.title,
        description: item.Product_Variants.Products.description,
        image_url: item.Product_Variants.Products.image_url,
        category: item.Product_Variants.Products.Categories?.name || null,
        sku: item.Product_Variants.sku,
        price: parseFloat(item.Product_Variants.price),
        quantity: item.quantity,
        stock_quantity: item.Product_Variants.stock_quantity,
        attributes: item.Product_Variants.attributes,
        bundle_origin: item.bundle_origin,
        bundle_id: item.bundle_id,
        item_total: parseFloat(item.Product_Variants.price) * item.quantity,
        in_stock: item.Product_Variants.stock_quantity > 0
      }));

      // Calculate totals
      const subtotal = transformedItems.reduce((sum, item) => sum + item.item_total, 0);
      
      // Tax calculation (18% GST)
      const tax = subtotal * 0.18;
      
      // Shipping calculation (free above ₹999)
      const shipping = subtotal >= 999 ? 0 : 99;
      
      const total = subtotal + tax + shipping;

      res.json({
        success: true,
        data: {
          cart: {
            id: cart.id,
            user_id: cart.user_id,
            session_id: cart.session_id,
            created_at: cart.created_at
          },
          items: transformedItems,
          totals: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            item_count: transformedItems.length,
            total_quantity: transformedItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }
      });

    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart',
        error: error.message
      });
    }
  },

  // ==================== ADD TO CART ====================

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  addToCart: async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'];
      const { product_variant_id, quantity = 1, bundle_origin = 'single', bundle_id = null } = req.body;

      if (!product_variant_id) {
        return res.status(400).json({
          success: false,
          message: 'Product variant ID is required'
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      // Check product variant exists and has stock
      const { data: variant, error: variantError } = await supabase
        .from('Product_Variants')
        .select(`
          id,
          stock_quantity,
          price,
          Products!inner (
            title
          )
        `)
        .eq('id', product_variant_id)
        .single();

      if (variantError || !variant) {
        return res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
      }

      if (variant.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock_quantity} items available in stock`,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      // Get or create cart
      let cartId;
      if (userId) {
        const { data: existingCart } = await supabase
          .from('Carts')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingCart) {
          cartId = existingCart.id;
          // Update timestamp
          await supabase
            .from('Carts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', cartId);
        } else {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          const { data: newCart, error } = await supabase
            .from('Carts')
            .insert([{
              user_id: userId,
              expires_at: expiresAt.toISOString()
            }])
            .select('id')
            .single();

          if (error) throw error;
          cartId = newCart.id;
        }
      } else if (sessionId) {
        const now = new Date().toISOString();
        const { data: existingCart } = await supabase
          .from('Carts')
          .select('id')
          .eq('session_id', sessionId)
          .gt('expires_at', now)
          .single();

        if (existingCart) {
          cartId = existingCart.id;
          await supabase
            .from('Carts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', cartId);
        } else {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          const { data: newCart, error } = await supabase
            .from('Carts')
            .insert([{
              session_id: sessionId,
              expires_at: expiresAt.toISOString()
            }])
            .select('id')
            .single();

          if (error) throw error;
          cartId = newCart.id;
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('Cart_Items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_variant_id', product_variant_id)
        .single();

      let cartItem;
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (variant.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${variant.stock_quantity} items available`,
            code: 'INSUFFICIENT_STOCK'
          });
        }

        const { data: updated, error } = await supabase
          .from('Cart_Items')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select('id, quantity')
          .single();

        if (error) throw error;
        cartItem = updated;
      } else {
        // Add new item
        const { data: inserted, error } = await supabase
          .from('Cart_Items')
          .insert([{
            cart_id: cartId,
            product_variant_id: product_variant_id,
            quantity: quantity,
            bundle_origin: bundle_origin,
            bundle_id: bundle_id
          }])
          .select('id, quantity')
          .single();

        if (error) throw error;
        cartItem = inserted;
      }

      console.log(`[Cart] Added ${quantity}x ${variant.Products.title} to cart`);

      res.json({
        success: true,
        message: 'Item added to cart',
        data: {
          cart_item_id: cartItem.id,
          quantity: cartItem.quantity
        }
      });

    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error.message
      });
    }
  },

  // ==================== UPDATE CART ITEM ====================

  /**
   * Update cart item quantity
   * PATCH /api/cart/items/:id
   */
  updateCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'];

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      // Verify cart item belongs to user and get stock info
      const { data: item, error: itemError } = await supabase
        .from('Cart_Items')
        .select(`
          id,
          product_variant_id,
          Carts!inner (
            user_id,
            session_id
          ),
          Product_Variants!inner (
            stock_quantity
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

      // Verify ownership
      const belongsToUser = item.Carts.user_id === userId || item.Carts.session_id === sessionId;
      if (!belongsToUser) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Check stock
      if (item.Product_Variants.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.Product_Variants.stock_quantity} items available in stock`,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      // Update quantity
      const { error: updateError } = await supabase
        .from('Cart_Items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      console.log(`[Cart] Updated cart item ${id} to quantity ${quantity}`);

      res.json({
        success: true,
        message: 'Cart item updated',
        data: { quantity }
      });

    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: error.message
      });
    }
  },

  // ==================== REMOVE CART ITEM ====================

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  removeCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'];

      // First verify the item belongs to user
      const { data: item } = await supabase
        .from('Cart_Items')
        .select(`
          id,
          Carts!inner (
            user_id,
            session_id
          )
        `)
        .eq('id', id)
        .single();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Verify ownership
      const belongsToUser = item.Carts.user_id === userId || item.Carts.session_id === sessionId;
      if (!belongsToUser) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Delete the item
      const { error } = await supabase
        .from('Cart_Items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log(`[Cart] Removed cart item ${id}`);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });

    } catch (error) {
      console.error('Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove cart item',
        error: error.message
      });
    }
  },

  // ==================== CLEAR CART ====================

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
  clearCart: async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'];

      // Get cart ID first
      let cartQuery = supabase.from('Carts').select('id');
      
      if (userId) {
        cartQuery = cartQuery.eq('user_id', userId);
      } else if (sessionId) {
        cartQuery = cartQuery.eq('session_id', sessionId);
      } else {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      const { data: cart } = await cartQuery.single();

      if (!cart) {
        return res.json({
          success: true,
          message: 'Cart cleared',
          data: { items_removed: 0 }
        });
      }

      // Delete all cart items
      const { data: deletedItems, error } = await supabase
        .from('Cart_Items')
        .delete()
        .eq('cart_id', cart.id)
        .select('id');

      if (error) throw error;

      console.log(`[Cart] Cleared ${deletedItems?.length || 0} items from cart`);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { items_removed: deletedItems?.length || 0 }
      });

    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error.message
      });
    }
  },

  // ==================== MERGE CARTS ====================

  /**
   * Merge guest cart into user cart on login
   * POST /api/cart/merge
   */
  mergeCarts: async (req, res) => {
    try {
      const userId = req.user.id;
      const { session_id } = req.body;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      // Get guest cart
      const now = new Date().toISOString();
      const { data: guestCart } = await supabase
        .from('Carts')
        .select('id')
        .eq('session_id', session_id)
        .gt('expires_at', now)
        .single();

      if (!guestCart) {
        return res.json({
          success: true,
          message: 'No guest cart to merge'
        });
      }

      // Get guest cart items
      const { data: guestItems, error: guestItemsError } = await supabase
        .from('Cart_Items')
        .select('product_variant_id, quantity, bundle_origin, bundle_id')
        .eq('cart_id', guestCart.id);

      if (guestItemsError) throw guestItemsError;

      if (!guestItems || guestItems.length === 0) {
        // Delete empty guest cart
        await supabase.from('Carts').delete().eq('id', guestCart.id);
        return res.json({
          success: true,
          message: 'No items to merge'
        });
      }

      // Get or create user cart
      let userCart = await supabase
        .from('Carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      let userCartId;
      if (!userCart.data) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { data: newCart, error } = await supabase
          .from('Carts')
          .insert([{
            user_id: userId,
            expires_at: expiresAt.toISOString()
          }])
          .select('id')
          .single();

        if (error) throw error;
        userCartId = newCart.id;
      } else {
        userCartId = userCart.data.id;
      }

      // Merge items one by one
      for (const item of guestItems) {
        // Check if item exists in user cart
        const { data: existingItem } = await supabase
          .from('Cart_Items')
          .select('id, quantity')
          .eq('cart_id', userCartId)
          .eq('product_variant_id', item.product_variant_id)
          .single();

        if (existingItem) {
          // Update quantity
          await supabase
            .from('Cart_Items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
        } else {
          // Insert new item
          await supabase
            .from('Cart_Items')
            .insert([{
              cart_id: userCartId,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              bundle_origin: item.bundle_origin,
              bundle_id: item.bundle_id
            }]);
        }
      }

      // Delete guest cart items and cart
      await supabase.from('Cart_Items').delete().eq('cart_id', guestCart.id);
      await supabase.from('Carts').delete().eq('id', guestCart.id);

      console.log(`[Cart] Merged guest cart ${guestCart.id} into user cart ${userCartId}`);

      res.json({
        success: true,
        message: 'Carts merged successfully'
      });

    } catch (error) {
      console.error('Merge carts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to merge carts',
        error: error.message
      });
    }
  }

};

module.exports = CartController;