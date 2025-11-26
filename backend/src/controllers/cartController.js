// backend/src/controllers/cartController.js

const pool = require('../config/database');

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
        const cartResult = await pool.query(
          `SELECT id, user_id, session_id, created_at, updated_at
           FROM carts
           WHERE user_id = $1`,
          [userId]
        );

        if (cartResult.rows.length === 0) {
          // Create cart for user
          const newCart = await pool.query(
            `INSERT INTO carts (user_id, expires_at, created_at)
             VALUES ($1, NOW() + INTERVAL '30 days', NOW())
             RETURNING id, user_id, created_at`,
            [userId]
          );
          cart = newCart.rows[0];
        } else {
          cart = cartResult.rows[0];
        }
      } else {
        // Guest cart
        const cartResult = await pool.query(
          `SELECT id, session_id, created_at, expires_at
           FROM carts
           WHERE session_id = $1 AND expires_at > NOW()`,
          [sessionId]
        );

        if (cartResult.rows.length === 0) {
          // Create guest cart
          const newCart = await pool.query(
            `INSERT INTO carts (session_id, expires_at, created_at)
             VALUES ($1, NOW() + INTERVAL '7 days', NOW())
             RETURNING id, session_id, created_at`,
            [sessionId]
          );
          cart = newCart.rows[0];
        } else {
          cart = cartResult.rows[0];
        }
      }

      // Get cart items with product details
      const itemsResult = await pool.query(
        `SELECT 
           ci.id,
           ci.quantity,
           ci.bundle_origin,
           ci.bundle_id,
           pv.id as variant_id,
           pv.sku,
           pv.price,
           pv.stock_quantity,
           pv.attributes,
           p.id as product_id,
           p.title,
           p.description,
           p.image_url,
           p.category_id,
           c.name as category_name
         FROM cart_items ci
         JOIN product_variants pv ON ci.product_variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE ci.cart_id = $1
         ORDER BY ci.created_at DESC`,
        [cart.id]
      );

      // Calculate totals
      const items = itemsResult.rows;
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
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
          items: items.map(item => ({
            id: item.id,
            variant_id: item.variant_id,
            product_id: item.product_id,
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            category: item.category_name,
            sku: item.sku,
            price: parseFloat(item.price),
            quantity: item.quantity,
            stock_quantity: item.stock_quantity,
            attributes: item.attributes,
            bundle_origin: item.bundle_origin,
            bundle_id: item.bundle_id,
            item_total: parseFloat(item.price) * item.quantity,
            in_stock: item.stock_quantity > 0
          })),
          totals: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            item_count: items.length,
            total_quantity: items.reduce((sum, item) => sum + item.quantity, 0)
          }
        }
      });

    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart'
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
      const variantCheck = await pool.query(
        `SELECT pv.id, pv.stock_quantity, pv.price, p.title
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         WHERE pv.id = $1`,
        [product_variant_id]
      );

      if (variantCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
      }

      const variant = variantCheck.rows[0];

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
        const cartResult = await pool.query(
          `INSERT INTO carts (user_id, expires_at, created_at)
           VALUES ($1, NOW() + INTERVAL '30 days', NOW())
           ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
           RETURNING id`,
          [userId]
        );
        cartId = cartResult.rows[0].id;
      } else if (sessionId) {
        const cartResult = await pool.query(
          `INSERT INTO carts (session_id, expires_at, created_at)
           VALUES ($1, NOW() + INTERVAL '7 days', NOW())
           ON CONFLICT (session_id) WHERE expires_at > NOW() DO UPDATE SET updated_at = NOW()
           RETURNING id`,
          [sessionId]
        );
        cartId = cartResult.rows[0].id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'User ID or session ID required'
        });
      }

      // Check if item already in cart
      const existingItem = await pool.query(
        `SELECT id, quantity FROM cart_items 
         WHERE cart_id = $1 AND product_variant_id = $2`,
        [cartId, product_variant_id]
      );

      let cartItem;
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;
        
        if (variant.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${variant.stock_quantity} items available`,
            code: 'INSUFFICIENT_STOCK'
          });
        }

        const updateResult = await pool.query(
          `UPDATE cart_items 
           SET quantity = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING id, quantity`,
          [newQuantity, existingItem.rows[0].id]
        );
        cartItem = updateResult.rows[0];
      } else {
        // Add new item
        const insertResult = await pool.query(
          `INSERT INTO cart_items (cart_id, product_variant_id, quantity, bundle_origin, bundle_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id, quantity`,
          [cartId, product_variant_id, quantity, bundle_origin, bundle_id]
        );
        cartItem = insertResult.rows[0];
      }

      console.log(`[Cart] Added ${quantity}x ${variant.title} to cart`);

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
        message: 'Failed to add item to cart'
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

      // Verify cart item belongs to user
      const itemCheck = await pool.query(
        `SELECT ci.id, ci.product_variant_id, pv.stock_quantity
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         JOIN product_variants pv ON ci.product_variant_id = pv.id
         WHERE ci.id = $1 AND (c.user_id = $2 OR c.session_id = $3)`,
        [id, userId, sessionId]
      );

      if (itemCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      const item = itemCheck.rows[0];

      // Check stock
      if (item.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.stock_quantity} items available in stock`,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      // Update quantity
      await pool.query(
        `UPDATE cart_items 
         SET quantity = $1, updated_at = NOW()
         WHERE id = $2`,
        [quantity, id]
      );

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
        message: 'Failed to update cart item'
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

      // Verify cart item belongs to user
      const deleteResult = await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.cart_id = c.id 
         AND ci.id = $1 
         AND (c.user_id = $2 OR c.session_id = $3)
         RETURNING ci.id`,
        [id, userId, sessionId]
      );

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      console.log(`[Cart] Removed cart item ${id}`);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });

    } catch (error) {
      console.error('Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove cart item'
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

      // Delete all cart items
      const deleteResult = await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.cart_id = c.id 
         AND (c.user_id = $1 OR c.session_id = $2)
         RETURNING ci.id`,
        [userId, sessionId]
      );

      console.log(`[Cart] Cleared ${deleteResult.rows.length} items from cart`);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { items_removed: deleteResult.rows.length }
      });

    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart'
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

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Get guest cart
        const guestCart = await client.query(
          'SELECT id FROM carts WHERE session_id = $1 AND expires_at > NOW()',
          [session_id]
        );

        if (guestCart.rows.length === 0) {
          await client.query('COMMIT');
          return res.json({
            success: true,
            message: 'No guest cart to merge'
          });
        }

        const guestCartId = guestCart.rows[0].id;

        // Get or create user cart
        const userCartResult = await client.query(
          `INSERT INTO carts (user_id, expires_at, created_at)
           VALUES ($1, NOW() + INTERVAL '30 days', NOW())
           ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
           RETURNING id`,
          [userId]
        );

        const userCartId = userCartResult.rows[0].id;

        // Merge items (update quantity if exists, insert if new)
        await client.query(
          `INSERT INTO cart_items (cart_id, product_variant_id, quantity, bundle_origin, bundle_id)
           SELECT $1, product_variant_id, quantity, bundle_origin, bundle_id
           FROM cart_items
           WHERE cart_id = $2
           ON CONFLICT (cart_id, product_variant_id) 
           DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
          [userCartId, guestCartId]
        );

        // Delete guest cart
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [guestCartId]);
        await client.query('DELETE FROM carts WHERE id = $1', [guestCartId]);

        await client.query('COMMIT');

        console.log(`[Cart] Merged guest cart ${guestCartId} into user cart ${userCartId}`);

        res.json({
          success: true,
          message: 'Carts merged successfully'
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Merge carts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to merge carts'
      });
    }
  }

};

module.exports = CartController;