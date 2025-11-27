// backend/src/controllers/cartController.js - FULLY FIXED

const supabase = require('../config/supabaseClient');

/**
 * Cart Controller - cart_id approach with CORRECT error handling
 * NO .catch() - Supabase doesn't support it!
 */

// ✅ CRITICAL: Case-sensitive table names from your Supabase
const TABLES = {
  PRODUCTS: 'Products',              // Capitalized
  PRODUCT_VARIANTS: 'Product_variants',  // Capitalized
  CART_ITEMS: 'cart_items',          // lowercase
  CARTS: 'Carts',                    // Capitalized
  CATEGORIES: 'Categories'           // Capitalized
};

const CartController = {

  // ==================== HELPER: GET OR CREATE CART ====================

  /**
   * Get or create cart for user/session
   * Returns cart_id to use for cart_items
   */
  getOrCreateCart: async (userId, sessionId) => {
    try {
      // Build query based on what we have
      let query = supabase
        .from(TABLES.CARTS)
        .select('id, user_id, session_id, expires_at');

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
          .gt('expires_at', new Date().toISOString()); // Not expired
      } else {
        throw new Error('Either user_id or session_id required');
      }

      const { data: existingCart, error: fetchError } = await query.single();

      // If cart exists, return it
      if (existingCart && !fetchError) {
        console.log('✅ Found existing cart:', existingCart.id);
        return existingCart.id;
      }

      // Create new cart
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { data: newCart, error: insertError } = await supabase
        .from(TABLES.CARTS)
        .insert([{
          user_id: userId || null,
          session_id: sessionId || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      console.log('✅ Created new cart:', newCart.id);
      return newCart.id;

    } catch (error) {
      console.error('❌ Error getting/creating cart:', error);
      throw error;
    }
  },

  // ==================== GET CART ====================

  /**
   * Get user's cart with items and totals
   * GET /api/cart
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

      // Step 1: Get or create cart
      const cartId = await CartController.getOrCreateCart(userId, sessionId);

      // Step 2: Get cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id,
          quantity,
          bundle_origin,
          bundle_id,
          product_variant_id,
          Product_variants (
            id,
            sku,
            price,
            stock_quantity,
            attributes,
            product_id,
            Products (
              id,
              title,
              description,
              img_url,
              category_id,
              Categories (
                name
              )
            )
          ),
          Products (
            id,
            title,
            description,
            img_url,
            price,
            stock,
            category_id,
            Categories (
              name
            )
          )
        `)
        .eq('cart_id', cartId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Transform items to flat structure
      const transformedItems = (items || []).map(item => {
        // If has variant, use variant data
        if (item.Product_variants) {
          return {
            id: item.id,
            variant_id: item.Product_variants.id,
            product_id: item.Product_variants.Products.id,
            title: item.Product_variants.Products.title,
            description: item.Product_variants.Products.description,
            image_url: item.Product_variants.Products.img_url,
            category: item.Product_variants.Products.Categories?.name || null,
            sku: item.Product_variants.sku,
            price: parseFloat(item.Product_variants.price),
            quantity: item.quantity,
            stock_quantity: item.Product_variants.stock_quantity,
            attributes: item.Product_variants.attributes,
            bundle_origin: item.bundle_origin,
            bundle_id: item.bundle_id,
            item_total: parseFloat(item.Product_variants.price) * item.quantity,
            in_stock: item.Product_variants.stock_quantity > 0
          };
        }
        // Otherwise use direct product data (no variants)
        else if (item.Products) {
          return {
            id: item.id,
            variant_id: null,
            product_id: item.Products.id,
            title: item.Products.title,
            description: item.Products.description,
            image_url: item.Products.img_url,
            category: item.Products.Categories?.name || null,
            sku: null,
            price: parseFloat(item.Products.price),
            quantity: item.quantity,
            stock_quantity: item.Products.stock,
            attributes: null,
            bundle_origin: item.bundle_origin,
            bundle_id: item.bundle_id,
            item_total: parseFloat(item.Products.price) * item.quantity,
            in_stock: item.Products.stock > 0
          };
        }
        return null;
      }).filter(Boolean); // Remove any null items

      // Calculate totals
      const subtotal = transformedItems.reduce((sum, item) => sum + item.item_total, 0);
      const tax = subtotal * 0.18;
      const shipping = subtotal >= 999 ? 0 : 99;
      const total = subtotal + tax + shipping;

      res.json({
        success: true,
        data: {
          cart_id: cartId,
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
   * Add item to cart
   * POST /api/cart/items
   */
  addToCart: async (req, res) => {
    try {
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');
      const { product_variant_id, quantity = 1, bundle_origin = 'single', bundle_id = null } = req.body;

      console.log(`🛒 Add to cart - userId: ${userId}, sessionId: ${sessionId}, variant: ${product_variant_id}`);

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

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      // Step 1: Get or create cart
      const cartId = await CartController.getOrCreateCart(userId, sessionId);
      console.log('✅ Cart ID:', cartId);

      // Step 2: Verify product/variant exists and get stock
      const { data: variant, error: variantError } = await supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .select(`
          id,
          stock_quantity,
          price,
          product_id,
          Products (
            id,
            title
          )
        `)
        .eq('id', product_variant_id)
        .single();

      // ✅ FIX: Proper error handling without .catch()
      let product = null;
      if (variantError || !variant) {
        console.log('⚠️ Variant not found, checking if it\'s a product ID:', product_variant_id);
        
        const { data: directProduct, error: productError } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, title, price, stock')
          .eq('id', product_variant_id)
          .single();

        if (productError || !directProduct) {
          console.error('❌ Not found:', product_variant_id);
          return res.status(404).json({
            success: false,
            message: 'Product variant or product not found'
          });
        }

        product = directProduct;
        console.log('✅ Found product (no variant):', product.id);
      } else {
        console.log('✅ Found variant:', variant.id);
      }

      // Get stock and price
      const stockQuantity = variant ? variant.stock_quantity : product.stock;
      const price = variant ? variant.price : product.price;

      if (stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${stockQuantity} items available in stock`,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      // Step 3: Check if item already in cart
      // ✅ FIX: NO .catch() - handle error properly
      const { data: existingItem, error: existError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_variant_id', product_variant_id)
        .single();

      // Handle "not found" as normal flow (not an error)
      const itemExists = !existError && existingItem;

      let cartItem;

      if (itemExists) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (stockQuantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${stockQuantity} items available`,
            code: 'INSUFFICIENT_STOCK'
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

        console.log(`✅ Updated cart item ${existingItem.id} quantity to ${newQuantity}`);
      } else {
        // Add new item
        const { data: inserted, error: insertError } = await supabase
          .from(TABLES.CART_ITEMS)
          .insert([{
            cart_id: cartId,
            product_variant_id,
            quantity,
            bundle_origin,
            bundle_id,
            created_at: new Date().toISOString()
          }])
          .select('id, quantity')
          .single();

        if (insertError) throw insertError;
        cartItem = inserted;

        console.log(`✅ Added new cart item ${cartItem.id}`);
      }

      const productTitle = variant ? variant.Products.title : product.title;

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        data: {
          cart_item_id: cartItem.id,
          quantity: cartItem.quantity,
          product_title: productTitle
        }
      });

    } catch (error) {
      console.error('❌ Add to cart error:', error);
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
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      // Get cart ID
      const cartId = await CartController.getOrCreateCart(userId, sessionId);

      // Verify cart item belongs to this cart
      const { data: item, error: itemError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select(`
          id,
          cart_id,
          product_variant_id,
          Product_variants (
            stock_quantity
          ),
          Products (
            stock
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
      if (item.cart_id !== cartId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Check stock
      const availableStock = item.Product_variants?.stock_quantity || item.Products?.stock;
      
      if (availableStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} items available in stock`,
          code: 'INSUFFICIENT_STOCK'
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

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  removeCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.get('x-user-id');
      const sessionId = req.get('x-session-id');

      // Get cart ID
      const cartId = await CartController.getOrCreateCart(userId, sessionId);

      // Verify the item belongs to this cart
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

      // Verify ownership
      if (item.cart_id !== cartId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Delete the item
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

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
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

      // Get cart ID
      const cartId = await CartController.getOrCreateCart(userId, sessionId);

      // Delete all cart items for this cart
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

  /**
   * Merge guest cart into user cart on login
   * POST /api/cart/merge
   */
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

      // Get guest cart
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
      const userCartId = await CartController.getOrCreateCart(userId, null);

      // Get guest cart items
      const { data: guestItems, error: guestItemsError } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('product_variant_id, quantity, bundle_origin, bundle_id')
        .eq('cart_id', guestCart.id);

      if (guestItemsError) throw guestItemsError;

      if (!guestItems || guestItems.length === 0) {
        // Delete guest cart
        await supabase.from(TABLES.CARTS).delete().eq('id', guestCart.id);
        
        return res.json({
          success: true,
          message: 'No items to merge'
        });
      }

      // Merge items one by one
      let mergedCount = 0;
      for (const item of guestItems) {
        // Check if item exists in user cart
        const { data: existingItem, error: existError } = await supabase
          .from(TABLES.CART_ITEMS)
          .select('id, quantity')
          .eq('cart_id', userCartId)
          .eq('product_variant_id', item.product_variant_id)
          .single();

        const itemExists = !existError && existingItem;

        if (itemExists) {
          // Update quantity
          await supabase
            .from(TABLES.CART_ITEMS)
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
          
          mergedCount++;
        } else {
          // Insert new item
          await supabase
            .from(TABLES.CART_ITEMS)
            .insert([{
              cart_id: userCartId,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              bundle_origin: item.bundle_origin,
              bundle_id: item.bundle_id,
              created_at: new Date().toISOString()
            }]);
          
          mergedCount++;
        }
      }

      // Delete guest cart and its items
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