// backend/src/controllers/userProfileController.js

const pool = require('../config/database');

/**
 * User Profile Controller
 * Handles customer profile management, updates, and statistics
 */
const UserProfileController = {

  // ==================== GET PROFILE ====================

  /**
   * Get user profile with statistics
   * GET /api/users/profile
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user profile
      const userResult = await pool.query(
        `SELECT id, name, email, phone, email_verified, created_at, last_login, updated_at
         FROM users 
         WHERE id = $1 AND is_active = true`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Get order statistics
      const orderStats = await pool.query(
        `SELECT 
           COUNT(*) as total_orders,
           COALESCE(SUM(final_total), 0) as total_spent,
           COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
           COUNT(CASE WHEN status = 'pending' OR status = 'confirmed' THEN 1 END) as pending_orders
         FROM orders 
         WHERE user_id = $1`,
        [userId]
      );

      // Get wishlist count
      const wishlistCount = await pool.query(
        'SELECT COUNT(*) as count FROM wishlist WHERE user_id = $1',
        [userId]
      );

      // Get cart count
      const cartCount = await pool.query(
        `SELECT COALESCE(SUM(ci.quantity), 0) as count
         FROM carts c
         LEFT JOIN cart_items ci ON c.id = ci.cart_id
         WHERE c.user_id = $1`,
        [userId]
      );

      // Get address count
      const addressCount = await pool.query(
        'SELECT COUNT(*) as count FROM addresses WHERE user_id = $1',
        [userId]
      );

      // Get review count
      const reviewCount = await pool.query(
        'SELECT COUNT(*) as count FROM reviews WHERE user_id = $1',
        [userId]
      );

      const stats = orderStats.rows[0];

      res.json({
        success: true,
        data: {
          user,
          statistics: {
            orders: {
              total: parseInt(stats.total_orders),
              completed: parseInt(stats.completed_orders),
              pending: parseInt(stats.pending_orders),
              total_spent: parseFloat(stats.total_spent)
            },
            wishlist_items: parseInt(wishlistCount.rows[0].count),
            cart_items: parseInt(cartCount.rows[0].count),
            addresses: parseInt(addressCount.rows[0].count),
            reviews: parseInt(reviewCount.rows[0].count)
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  },

  // ==================== UPDATE PROFILE ====================

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, phone } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be less than 100 characters'
        });
      }

      // Phone validation (optional)
      if (phone) {
        const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid phone number format'
          });
        }
      }

      // Update profile
      const result = await pool.query(
        `UPDATE users 
         SET name = $1, phone = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true
         RETURNING id, name, email, phone, email_verified, updated_at`,
        [name.trim(), phone || null, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = result.rows[0];

      console.log(`[Profile Update] User ${updatedUser.email} updated profile`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  // ==================== UPDATE EMAIL ====================

  /**
   * Update user email (requires verification)
   * PUT /api/users/email
   */
  updateEmail: async (req, res) => {
    try {
      const userId = req.user.id;
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Verify password
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const bcrypt = require('bcrypt');
      const passwordMatch = await bcrypt.compare(password, userResult.rows[0].password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Check if new email already exists
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), userId]
      );

      if (existingEmail.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
          code: 'EMAIL_EXISTS'
        });
      }

      // Update email and set email_verified to false
      const result = await pool.query(
        `UPDATE users 
         SET email = $1, email_verified = false, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name, email, email_verified`,
        [email.toLowerCase(), userId]
      );

      console.log(`[Email Update] User ID ${userId} changed email to ${email}`);

      // TODO: Send verification email to new address

      res.json({
        success: true,
        message: 'Email updated. Please verify your new email address.',
        data: { user: result.rows[0] }
      });

    } catch (error) {
      console.error('Update email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update email'
      });
    }
  },

  // ==================== DELETE ACCOUNT ====================

  /**
   * Delete/deactivate user account
   * DELETE /api/users/account
   */
  deleteAccount: async (req, res) => {
    try {
      const userId = req.user.id;
      const { password, confirmDelete } = req.body;

      // Validation
      if (!password || confirmDelete !== true) {
        return res.status(400).json({
          success: false,
          message: 'Password and delete confirmation are required'
        });
      }

      // Verify password
      const userResult = await pool.query(
        'SELECT password_hash, email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];
      const bcrypt = require('bcrypt');
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Soft delete: deactivate account instead of hard delete
      await pool.query(
        `UPDATE users 
         SET is_active = false, updated_at = NOW()
         WHERE id = $1`,
        [userId]
      );

      console.log(`[Account Deletion] User ${user.email} deactivated account`);

      res.json({
        success: true,
        message: 'Account deactivated successfully. Contact support to reactivate.'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  },

  // ==================== GET DASHBOARD STATS ====================

  /**
   * Get dashboard overview statistics
   * GET /api/users/dashboard
   */
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user.id;

      // Recent orders (last 5)
      const recentOrders = await pool.query(
        `SELECT id, order_number, status, final_total, created_at, payment_status
         FROM orders 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      );

      // Active orders (pending, confirmed, shipped)
      const activeOrders = await pool.query(
        `SELECT id, order_number, status, final_total, created_at
         FROM orders 
         WHERE user_id = $1 
         AND status IN ('pending', 'confirmed', 'shipped')
         ORDER BY created_at DESC`,
        [userId]
      );

      // Wishlist count with recent items
      const wishlistItems = await pool.query(
        `SELECT w.id, w.created_at, p.id as product_id, p.title, p.price, p.image_url
         FROM wishlist w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = $1
         ORDER BY w.created_at DESC
         LIMIT 5`,
        [userId]
      );

      // Total spent this month
      const monthlySpent = await pool.query(
        `SELECT COALESCE(SUM(final_total), 0) as monthly_total
         FROM orders
         WHERE user_id = $1 
         AND status = 'delivered'
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      );

      // Pending reviews (delivered orders without reviews)
      const pendingReviews = await pool.query(
        `SELECT DISTINCT o.id as order_id, oi.product_variant_id, p.id as product_id, p.title, p.image_url
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN product_variants pv ON oi.product_variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = $1
         WHERE o.user_id = $1 
         AND o.status = 'delivered'
         AND r.id IS NULL
         LIMIT 5`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          recent_orders: recentOrders.rows,
          active_orders: activeOrders.rows,
          wishlist_preview: wishlistItems.rows,
          monthly_spent: parseFloat(monthlySpent.rows[0].monthly_total),
          pending_reviews: pendingReviews.rows
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // ==================== GET NOTIFICATIONS ====================

  /**
   * Get user notifications (orders, wishlist price drops, etc.)
   * GET /api/users/notifications
   */
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;

      const notifications = [];

      // Check for pending deliveries
      const pendingDeliveries = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE user_id = $1 AND status = 'shipped'`,
        [userId]
      );

      if (parseInt(pendingDeliveries.rows[0].count) > 0) {
        notifications.push({
          type: 'delivery',
          message: `You have ${pendingDeliveries.rows[0].count} order(s) on the way`,
          priority: 'high',
          created_at: new Date()
        });
      }

      // Check for unverified email
      const emailStatus = await pool.query(
        'SELECT email_verified FROM users WHERE id = $1',
        [userId]
      );

      if (!emailStatus.rows[0].email_verified) {
        notifications.push({
          type: 'email_verification',
          message: 'Please verify your email address',
          priority: 'medium',
          created_at: new Date()
        });
      }

      // Check for pending reviews
      const pendingReviews = await pool.query(
        `SELECT COUNT(DISTINCT p.id) as count
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN product_variants pv ON oi.product_variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         LEFT JOIN reviews r ON r.product_id = p.id AND r.user_id = $1
         WHERE o.user_id = $1 
         AND o.status = 'delivered'
         AND r.id IS NULL
         AND o.created_at >= NOW() - INTERVAL '30 days'`,
        [userId]
      );

      if (parseInt(pendingReviews.rows[0].count) > 0) {
        notifications.push({
          type: 'review',
          message: `You have ${pendingReviews.rows[0].count} product(s) to review`,
          priority: 'low',
          created_at: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          notifications,
          unread_count: notifications.length
        }
      });

    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

};

module.exports = UserProfileController;