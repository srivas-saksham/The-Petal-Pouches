// backend/src/models/cartModel.js

const supabase = require('../config/supabaseClient');

/**
 * Cart Model - Handles shopping cart operations
 * Manages cart items, quantities, and cart lifecycle
 */
const CartModel = {

  // ==================== CART INITIALIZATION ====================

  /**
   * Get or create cart for user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Cart object
   */
  async getOrCreateCart(userId) {
    try {
      // Check if cart exists
      const { data: existingCart, error: fetchError } = await supabase
        .from('Carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingCart && !fetchError) {
        return existingCart;
      }

      // Create new cart
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newCart, error: insertError } = await supabase
        .from('Carts')
        .insert([{
          user_id: userId,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`[CartModel] New cart created for user: ${userId}`);
      return newCart;
      
    } catch (error) {
      console.error('[CartModel] Error getting/creating cart:', error);
      throw error;
    }
  },

  /**
   * Get cart for guest user by session ID
   * @param {string} sessionId - Guest session ID
   * @returns {Promise<Object|null>} Cart object or null
   */
  async getGuestCart(sessionId) {
    try {
      const { data, error } = await supabase
        .from('Carts')
        .select('*')
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('[CartModel] Error getting guest cart:', error);
      throw error;
    }
  },

  /**
   * Create guest cart
   * @param {string} sessionId - Guest session ID
   * @returns {Promise<Object>} Cart object
   */
  async createGuestCart(sessionId) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('Carts')
        .insert([{
          session_id: sessionId,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`[CartModel] Guest cart created: ${sessionId}`);
      return data;
    } catch (error) {
      console.error('[CartModel] Error creating guest cart:', error);
      throw error;
    }
  },

  // ==================== CART ITEMS OPERATIONS ====================

  /**
   * Get full cart with items and product details
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Cart with items array
   */
  async getCartWithItems(userId) {
    try {
      // Get cart
      const { data: cart, error: cartError } = await supabase
        .from('Carts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (cartError && cartError.code === 'PGRST116') {
        // Create cart if doesn't exist
        const newCart = await this.getOrCreateCart(userId);
        return {
          ...newCart,
          items: [],
          item_count: 0,
          subtotal: 0
        };
      }

      if (cartError) throw cartError;

      // Get cart items with product details
      const { data: items, error: itemsError } = await supabase
        .from('Cart_items')
        .select(`
          *,
          Product_variants!inner(
            id,
            sku,
            price,
            stock,
            weight,
            attributes,
            img_url,
            Products!inner(
              id,
              title,
              description,
              img_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Format items
      const formattedItems = (items || []).map(item => ({
        id: item.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        bundle_origin: item.bundle_origin,
        bundle_id: item.bundle_id,
        product_id: item.Product_variants.Products.id,
        product_title: item.Product_variants.Products.title,
        product_description: item.Product_variants.Products.description,
        product_img: item.Product_variants.img_url || item.Product_variants.Products.img_url,
        variant_sku: item.Product_variants.sku,
        variant_attributes: item.Product_variants.attributes,
        price: item.Product_variants.price,
        stock: item.Product_variants.stock,
        weight: item.Product_variants.weight,
        item_total: item.Product_variants.price * item.quantity
      }));

      const subtotal = formattedItems.reduce((sum, item) => sum + item.item_total, 0);

      return {
        cart_id: cart.id,
        user_id: cart.user_id,
        created_at: cart.created_at,
        updated_at: cart.updated_at,
        items: formattedItems,
        item_count: formattedItems.length,
        subtotal
      };
    } catch (error) {
      console.error('[CartModel] Error getting cart with items:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * @param {string} userId - User UUID
   * @param {string} productVariantId - Product variant UUID
   * @param {number} quantity - Quantity to add
   * @param {Object} [bundleInfo] - Optional bundle information
   * @returns {Promise<Object>} Added/updated cart item
   */
  async addItem(userId, productVariantId, quantity, bundleInfo = {}) {
    try {
      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('Cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_variant_id', productVariantId)
        .single();

      let cartItem;

      if (existingItem && !fetchError) {
        // Update quantity
        const { data: updatedItem, error: updateError } = await supabase
          .from('Cart_items')
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('product_variant_id', productVariantId)
          .select()
          .single();

        if (updateError) throw updateError;
        cartItem = updatedItem;
        console.log(`[CartModel] Cart item quantity updated: ${productVariantId}`);
      } else {
        // Insert new item
        const { data: newItem, error: insertError } = await supabase
          .from('Cart_items')
          .insert([{
            user_id: userId,
            product_variant_id: productVariantId,
            quantity: quantity,
            bundle_origin: bundleInfo.bundle_origin || null,
            bundle_id: bundleInfo.bundle_id || null,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        cartItem = newItem;
        console.log(`[CartModel] Item added to cart: ${productVariantId}`);
      }

      // Update cart timestamp
      await supabase
        .from('Carts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', cart.id);

      // Return item with product details
      const { data: itemWithDetails, error: detailsError } = await supabase
        .from('Cart_items')
        .select(`
          *,
          Product_variants!inner(
            id,
            price,
            stock,
            sku,
            attributes,
            Products!inner(
              title,
              img_url
            )
          )
        `)
        .eq('id', cartItem.id)
        .single();

      if (detailsError) throw detailsError;

      return {
        ...itemWithDetails,
        product_title: itemWithDetails.Product_variants.Products.title,
        product_img: itemWithDetails.Product_variants.Products.img_url,
        price: itemWithDetails.Product_variants.price,
        stock: itemWithDetails.Product_variants.stock,
        sku: itemWithDetails.Product_variants.sku,
        attributes: itemWithDetails.Product_variants.attributes
      };
      
    } catch (error) {
      console.error('[CartModel] Error adding item to cart:', error);
      throw error;
    }
  },

  /**
   * Update cart item quantity
   * @param {string} userId - User UUID
   * @param {string} cartItemId - Cart item UUID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateItemQuantity(userId, cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeItem(userId, cartItemId);
      }

      const { data, error } = await supabase
        .from('Cart_items')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('CART_ITEM_NOT_FOUND');
        }
        throw error;
      }

      // Update cart timestamp
      await supabase
        .from('Carts')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      console.log(`[CartModel] Cart item quantity updated: ${cartItemId}`);
      return data;
    } catch (error) {
      console.error('[CartModel] Error updating item quantity:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   * @param {string} userId - User UUID
   * @param {string} cartItemId - Cart item UUID
   * @returns {Promise<boolean>} True if removed
   */
  async removeItem(userId, cartItemId) {
    try {
      const { data, error } = await supabase
        .from('Cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('CART_ITEM_NOT_FOUND');
      }

      // Update cart timestamp
      await supabase
        .from('Carts')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      console.log(`[CartModel] Item removed from cart: ${cartItemId}`);
      return true;
    } catch (error) {
      console.error('[CartModel] Error removing item:', error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if cleared
   */
  async clearCart(userId) {
    try {
      const { data, error } = await supabase
        .from('Cart_items')
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Update cart timestamp
      await supabase
        .from('Carts')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      const itemCount = data ? data.length : 0;
      console.log(`[CartModel] Cart cleared for user: ${userId} (${itemCount} items)`);
      return true;
    } catch (error) {
      console.error('[CartModel] Error clearing cart:', error);
      throw error;
    }
  },

  // ==================== CART CALCULATIONS ====================

  /**
   * Get cart totals
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Cart totals (subtotal, tax, shipping, total)
   */
  async getCartTotals(userId) {
    try {
      // Get cart items with prices
      const { data: items, error } = await supabase
        .from('Cart_items')
        .select(`
          quantity,
          Product_variants!inner(
            price
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (!items || items.length === 0) {
        return {
          subtotal: 0,
          item_count: 0,
          total_quantity: 0,
          shipping_cost: 0,
          tax: 0,
          discount: 0,
          final_total: 0
        };
      }

      const subtotal = items.reduce((sum, item) => {
        return sum + (item.Product_variants.price * item.quantity);
      }, 0);

      const item_count = items.length;
      const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);

      // Calculate shipping (free above ₹999)
      const shipping_cost = subtotal >= 999 ? 0 : 50;

      // Calculate tax (18% GST)
      const tax = Math.round(subtotal * 0.18);

      // No discount by default (applied separately via coupons)
      const discount = 0;

      const final_total = subtotal + shipping_cost + tax - discount;

      return {
        subtotal,
        item_count,
        total_quantity,
        shipping_cost,
        tax,
        discount,
        final_total
      };
    } catch (error) {
      console.error('[CartModel] Error getting cart totals:', error);
      throw error;
    }
  },

  /**
   * Check if cart items are in stock
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Stock status for each item
   */
  async checkStock(userId) {
    try {
      const { data: items, error } = await supabase
        .from('Cart_items')
        .select(`
          id,
          product_variant_id,
          quantity,
          Product_variants!inner(
            stock,
            sku,
            Products!inner(
              title
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const formattedItems = (items || []).map(item => ({
        cart_item_id: item.id,
        product_variant_id: item.product_variant_id,
        cart_quantity: item.quantity,
        available_stock: item.Product_variants.stock,
        product_title: item.Product_variants.Products.title,
        sku: item.Product_variants.sku,
        in_stock: item.Product_variants.stock >= item.quantity
      }));

      const allInStock = formattedItems.every(item => item.in_stock);
      const outOfStockItems = formattedItems.filter(item => !item.in_stock);

      return {
        all_in_stock: allInStock,
        items: formattedItems,
        out_of_stock_items: outOfStockItems
      };
    } catch (error) {
      console.error('[CartModel] Error checking stock:', error);
      throw error;
    }
  },

  // ==================== CART MERGE & TRANSFER ====================

  /**
   * Merge guest cart into user cart on login
   * @param {string} sessionId - Guest session ID
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if merged
   */
  async mergeGuestCart(sessionId, userId) {
    try {
      // Get guest cart
      const { data: guestCart, error: cartError } = await supabase
        .from('Carts')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (cartError || !guestCart) {
        return false;
      }

      // Get or create user cart
      await this.getOrCreateCart(userId);

      // Get guest cart items
      const { data: guestItems, error: itemsError } = await supabase
        .from('Cart_items')
        .select('*')
        .eq('cart_id', guestCart.id);

      if (itemsError) throw itemsError;

      if (guestItems && guestItems.length > 0) {
        // Transfer each item to user cart
        for (const item of guestItems) {
          // Check if item already exists in user cart
          const { data: existingItem } = await supabase
            .from('Cart_items')
            .select('*')
            .eq('user_id', userId)
            .eq('product_variant_id', item.product_variant_id)
            .single();

          if (existingItem) {
            // Update quantity
            await supabase
              .from('Cart_items')
              .update({
                quantity: existingItem.quantity + item.quantity
              })
              .eq('user_id', userId)
              .eq('product_variant_id', item.product_variant_id);
          } else {
            // Insert new item
            await supabase
              .from('Cart_items')
              .insert([{
                user_id: userId,
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                bundle_origin: item.bundle_origin,
                bundle_id: item.bundle_id,
                created_at: new Date().toISOString()
              }]);
          }
        }
      }

      // Delete guest cart items
      await supabase
        .from('Cart_items')
        .delete()
        .eq('cart_id', guestCart.id);

      // Delete guest cart
      await supabase
        .from('Carts')
        .delete()
        .eq('id', guestCart.id);

      console.log(`[CartModel] Guest cart merged for user: ${userId}`);
      return true;
      
    } catch (error) {
      console.error('[CartModel] Error merging guest cart:', error);
      throw error;
    }
  },

  // ==================== CART CLEANUP ====================

  /**
   * Delete expired guest carts (cleanup job)
   * @returns {Promise<number>} Number of carts deleted
   */
  async cleanupExpiredCarts() {
    try {
      const { data, error } = await supabase
        .from('Carts')
        .delete()
        .not('session_id', 'is', null)
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) throw error;

      const count = data ? data.length : 0;
      console.log(`[CartModel] Cleaned up ${count} expired guest carts`);
      return count;
    } catch (error) {
      console.error('[CartModel] Error cleaning up carts:', error);
      throw error;
    }
  },

  /**
   * Get cart item count
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of items in cart
   */
  async getItemCount(userId) {
    try {
      const { count, error } = await supabase
        .from('Cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[CartModel] Error getting item count:', error);
      throw error;
    }
  }
};

module.exports = CartModel;