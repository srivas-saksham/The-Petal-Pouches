// backend/src/models/cartModel.js

const pool = require('../config/database');

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
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if cart exists
      let cart = await client.query(
        `SELECT * FROM carts WHERE user_id = $1`,
        [userId]
      );

      if (cart.rows.length === 0) {
        // Create new cart
        const result = await client.query(
          `INSERT INTO carts (id, user_id, expires_at, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, now() + interval '7 days', now(), now())
           RETURNING *`,
          [userId]
        );
        cart = result;
        console.log(`[CartModel] New cart created for user: ${userId}`);
      }

      await client.query('COMMIT');
      return cart.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[CartModel] Error getting/creating cart:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get cart for guest user by session ID
   * @param {string} sessionId - Guest session ID
   * @returns {Promise<Object|null>} Cart object or null
   */
  async getGuestCart(sessionId) {
    const query = `
      SELECT * FROM carts 
      WHERE session_id = $1 AND expires_at > now()
    `;
    
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  },

  /**
   * Create guest cart
   * @param {string} sessionId - Guest session ID
   * @returns {Promise<Object>} Cart object
   */
  async createGuestCart(sessionId) {
    const query = `
      INSERT INTO carts (id, session_id, expires_at, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, now() + interval '7 days', now(), now())
      RETURNING *
    `;
    
    const result = await pool.query(query, [sessionId]);
    console.log(`[CartModel] Guest cart created: ${sessionId}`);
    return result.rows[0];
  },

  // ==================== CART ITEMS OPERATIONS ====================

  /**
   * Get full cart with items and product details
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Cart with items array
   */
  async getCartWithItems(userId) {
    const query = `
      SELECT 
        c.id as cart_id,
        c.user_id,
        c.created_at as cart_created_at,
        c.updated_at as cart_updated_at,
        json_agg(
          json_build_object(
            'id', ci.id,
            'product_variant_id', ci.product_variant_id,
            'quantity', ci.quantity,
            'bundle_origin', ci.bundle_origin,
            'bundle_id', ci.bundle_id,
            'product_id', p.id,
            'product_title', p.title,
            'product_description', p.description,
            'product_img', COALESCE(pv.img_url, p.img_url),
            'variant_sku', pv.sku,
            'variant_attributes', pv.attributes,
            'price', pv.price,
            'stock', pv.stock,
            'weight', pv.weight,
            'item_total', (pv.price * ci.quantity)
          ) ORDER BY ci.created_at DESC
        ) FILTER (WHERE ci.id IS NOT NULL) as items
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN product_variants pv ON ci.product_variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE c.user_id = $1
      GROUP BY c.id
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Create cart if doesn't exist
      const newCart = await this.getOrCreateCart(userId);
      return {
        ...newCart,
        items: []
      };
    }
    
    const cart = result.rows[0];
    
    return {
      cart_id: cart.cart_id,
      user_id: cart.user_id,
      created_at: cart.cart_created_at,
      updated_at: cart.cart_updated_at,
      items: cart.items || [],
      item_count: cart.items ? cart.items.length : 0,
      subtotal: cart.items 
        ? cart.items.reduce((sum, item) => sum + item.item_total, 0)
        : 0
    };
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
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Check if item already exists in cart
      const existingItem = await client.query(
        `SELECT * FROM cart_items 
         WHERE user_id = $1 AND product_variant_id = $2`,
        [userId, productVariantId]
      );

      let cartItem;

      if (existingItem.rows.length > 0) {
        // Update quantity
        const result = await client.query(
          `UPDATE cart_items 
           SET quantity = quantity + $1, updated_at = now()
           WHERE user_id = $2 AND product_variant_id = $3
           RETURNING *`,
          [quantity, userId, productVariantId]
        );
        cartItem = result.rows[0];
        console.log(`[CartModel] Cart item quantity updated: ${productVariantId}`);
      } else {
        // Insert new item
        const result = await client.query(
          `INSERT INTO cart_items (
             id, user_id, product_variant_id, quantity, 
             bundle_origin, bundle_id, created_at
           )
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
           RETURNING *`,
          [
            userId,
            productVariantId,
            quantity,
            bundleInfo.bundle_origin || null,
            bundleInfo.bundle_id || null
          ]
        );
        cartItem = result.rows[0];
        console.log(`[CartModel] Item added to cart: ${productVariantId}`);
      }

      // Update cart timestamp
      await client.query(
        `UPDATE carts SET updated_at = now() WHERE id = $1`,
        [cart.id]
      );

      await client.query('COMMIT');
      
      // Return item with product details
      const itemWithDetails = await client.query(
        `SELECT 
           ci.*,
           p.title as product_title,
           p.img_url as product_img,
           pv.price,
           pv.stock,
           pv.sku,
           pv.attributes
         FROM cart_items ci
         JOIN product_variants pv ON ci.product_variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         WHERE ci.id = $1`,
        [cartItem.id]
      );
      
      return itemWithDetails.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[CartModel] Error adding item to cart:', error);
      throw error;
    } finally {
      client.release();
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
    if (quantity <= 0) {
      return await this.removeItem(userId, cartItemId);
    }

    const query = `
      UPDATE cart_items
      SET quantity = $1, updated_at = now()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [quantity, cartItemId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }
    
    // Update cart timestamp
    await pool.query(
      `UPDATE carts SET updated_at = now() 
       WHERE user_id = $1`,
      [userId]
    );
    
    console.log(`[CartModel] Cart item quantity updated: ${cartItemId}`);
    return result.rows[0];
  },

  /**
   * Remove item from cart
   * @param {string} userId - User UUID
   * @param {string} cartItemId - Cart item UUID
   * @returns {Promise<boolean>} True if removed
   */
  async removeItem(userId, cartItemId) {
    const query = `
      DELETE FROM cart_items
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [cartItemId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }
    
    // Update cart timestamp
    await pool.query(
      `UPDATE carts SET updated_at = now() 
       WHERE user_id = $1`,
      [userId]
    );
    
    console.log(`[CartModel] Item removed from cart: ${cartItemId}`);
    return true;
  },

  /**
   * Clear entire cart
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if cleared
   */
  async clearCart(userId) {
    const query = `
      DELETE FROM cart_items
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Update cart timestamp
    await pool.query(
      `UPDATE carts SET updated_at = now() 
       WHERE user_id = $1`,
      [userId]
    );
    
    console.log(`[CartModel] Cart cleared for user: ${userId} (${result.rowCount} items)`);
    return true;
  },

  // ==================== CART CALCULATIONS ====================

  /**
   * Get cart totals
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Cart totals (subtotal, tax, shipping, total)
   */
  async getCartTotals(userId) {
    const query = `
      SELECT 
        COALESCE(SUM(pv.price * ci.quantity), 0)::int as subtotal,
        COUNT(ci.id) as item_count,
        COALESCE(SUM(ci.quantity), 0) as total_quantity
      FROM carts c
      LEFT JOIN cart_items ci ON c.user_id = ci.user_id
      LEFT JOIN product_variants pv ON ci.product_variant_id = pv.id
      WHERE c.user_id = $1
      GROUP BY c.id
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
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
    
    const { subtotal, item_count, total_quantity } = result.rows[0];
    
    // Calculate shipping (free above ₹999)
    const shipping_cost = subtotal >= 999 ? 0 : 50;
    
    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18);
    
    // No discount by default (applied separately via coupons)
    const discount = 0;
    
    const final_total = subtotal + shipping_cost + tax - discount;
    
    return {
      subtotal,
      item_count: parseInt(item_count),
      total_quantity: parseInt(total_quantity),
      shipping_cost,
      tax,
      discount,
      final_total
    };
  },

  /**
   * Check if cart items are in stock
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Stock status for each item
   */
  async checkStock(userId) {
    const query = `
      SELECT 
        ci.id as cart_item_id,
        ci.product_variant_id,
        ci.quantity as cart_quantity,
        pv.stock as available_stock,
        p.title as product_title,
        pv.sku,
        CASE 
          WHEN pv.stock >= ci.quantity THEN true
          ELSE false
        END as in_stock
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    const allInStock = result.rows.every(item => item.in_stock);
    const outOfStockItems = result.rows.filter(item => !item.in_stock);
    
    return {
      all_in_stock: allInStock,
      items: result.rows,
      out_of_stock_items: outOfStockItems
    };
  },

  // ==================== CART MERGE & TRANSFER ====================

  /**
   * Merge guest cart into user cart on login
   * @param {string} sessionId - Guest session ID
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if merged
   */
  async mergeGuestCart(sessionId, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get guest cart items
      const guestCart = await client.query(
        `SELECT c.id FROM carts c WHERE c.session_id = $1`,
        [sessionId]
      );

      if (guestCart.rows.length === 0) {
        await client.query('COMMIT');
        return false;
      }

      const guestCartId = guestCart.rows[0].id;

      // Get or create user cart
      await this.getOrCreateCart(userId);

      // Transfer cart items from guest to user
      const transferQuery = `
        INSERT INTO cart_items (id, user_id, product_variant_id, quantity, bundle_origin, bundle_id, created_at)
        SELECT 
          gen_random_uuid(),
          $1,
          ci.product_variant_id,
          ci.quantity,
          ci.bundle_origin,
          ci.bundle_id,
          now()
        FROM cart_items ci
        WHERE ci.cart_id = $2
        ON CONFLICT (user_id, product_variant_id) 
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `;
      
      await client.query(transferQuery, [userId, guestCartId]);

      // Delete guest cart and items
      await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [guestCartId]);
      await client.query(`DELETE FROM carts WHERE id = $1`, [guestCartId]);

      await client.query('COMMIT');
      console.log(`[CartModel] Guest cart merged for user: ${userId}`);
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[CartModel] Error merging guest cart:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // ==================== CART CLEANUP ====================

  /**
   * Delete expired guest carts (cleanup job)
   * @returns {Promise<number>} Number of carts deleted
   */
  async cleanupExpiredCarts() {
    const query = `
      DELETE FROM carts
      WHERE session_id IS NOT NULL 
        AND expires_at < now()
      RETURNING id
    `;
    
    const result = await pool.query(query);
    console.log(`[CartModel] Cleaned up ${result.rowCount} expired guest carts`);
    return result.rowCount;
  },

  /**
   * Get cart item count
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of items in cart
   */
  async getItemCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM cart_items
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = CartModel;