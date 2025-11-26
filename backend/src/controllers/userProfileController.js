// backend/src/controllers/userProfileController.js

const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');

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
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('id, name, email, phone, email_verified, created_at, last_login, updated_at')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get all orders for statistics
      const { data: orders, error: ordersError } = await supabase
        .from('Orders')
        .select('status, final_total')
        .eq('user_id', userId);

      const orderStats = {
        total_orders: 0,
        total_spent: 0,
        completed_orders: 0,
        pending_orders: 0
      };

      if (!ordersError && orders) {
        orderStats.total_orders = orders.length;
        orderStats.total_spent = orders.reduce((sum, order) => sum + (order.final_total || 0), 0);
        orderStats.completed_orders = orders.filter(o => o.status === 'delivered').length;
        orderStats.pending_orders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
      }

      // Get wishlist count
      const { count: wishlistCount, error: wishlistError } = await supabase
        .from('Wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get cart count
      const { data: cart, error: cartError } = await supabase
        .from('Carts')
        .select(`
          id,
          Cart_items(quantity)
        `)
        .eq('user_id', userId)
        .single();

      const cartItemsCount = cart && cart.Cart_items 
        ? cart.Cart_items.reduce((sum, item) => sum + (item.quantity || 0), 0) 
        : 0;

      // Get address count
      const { count: addressCount, error: addressError } = await supabase
        .from('Addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get review count
      const { count: reviewCount, error: reviewError } = await supabase
        .from('Reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      res.json({
        success: true,
        data: {
          user,
          statistics: {
            orders: {
              total: orderStats.total_orders,
              completed: orderStats.completed_orders,
              pending: orderStats.pending_orders,
              total_spent: orderStats.total_spent
            },
            wishlist_items: wishlistCount || 0,
            cart_items: cartItemsCount,
            addresses: addressCount || 0,
            reviews: reviewCount || 0
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
      const { data: updatedUser, error: updateError } = await supabase
        .from('Users')
        .update({
          name: name.trim(),
          phone: phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('is_active', true)
        .select('id, name, email, phone, email_verified, updated_at')
        .single();

      if (updateError || !updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Check if new email already exists
      const { data: existingEmail, error: emailError } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', userId)
        .single();

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
          code: 'EMAIL_EXISTS'
        });
      }

      // Update email and set email_verified to false
      const { data: updatedUser, error: updateError } = await supabase
        .from('Users')
        .update({
          email: email.toLowerCase(),
          email_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, name, email, email_verified')
        .single();

      if (updateError) throw updateError;

      console.log(`[Email Update] User ID ${userId} changed email to ${email}`);

      // TODO: Send verification email to new address

      res.json({
        success: true,
        message: 'Email updated. Please verify your new email address.',
        data: { user: updatedUser }
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
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('password_hash, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Soft delete: deactivate account instead of hard delete
      const { error: updateError } = await supabase
        .from('Users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

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
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('Orders')
        .select('id, order_number, status, final_total, created_at, payment_status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Active orders (pending, confirmed, shipped)
      const { data: activeOrders, error: activeOrdersError } = await supabase
        .from('Orders')
        .select('id, order_number, status, final_total, created_at')
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed', 'shipped'])
        .order('created_at', { ascending: false });

      // Wishlist count with recent items
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('Wishlist')
        .select(`
          id,
          created_at,
          Products!inner(
            id,
            title,
            price,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Format wishlist items
      const formattedWishlist = wishlistItems ? wishlistItems.map(item => ({
        id: item.id,
        created_at: item.created_at,
        product_id: item.Products.id,
        title: item.Products.title,
        price: item.Products.price,
        image_url: item.Products.image_url
      })) : [];

      // Total spent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from('Orders')
        .select('final_total')
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .gte('created_at', startOfMonth.toISOString());

      const monthlySpent = monthlyOrders 
        ? monthlyOrders.reduce((sum, order) => sum + (order.final_total || 0), 0) 
        : 0;

      // Pending reviews (delivered orders without reviews)
      const { data: deliveredOrders, error: deliveredError } = await supabase
        .from('Orders')
        .select(`
          id,
          Order_items!inner(
            product_variant_id,
            Product_variants!inner(
              product_id,
              Products!inner(
                id,
                title,
                image_url
              )
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'delivered');

      // Get user's reviews
      const { data: userReviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('product_id')
        .eq('user_id', userId);

      const reviewedProductIds = new Set(userReviews ? userReviews.map(r => r.product_id) : []);

      // Find products without reviews
      const pendingReviewsMap = new Map();
      if (deliveredOrders) {
        deliveredOrders.forEach(order => {
          order.Order_items.forEach(item => {
            const product = item.Product_variants.Products;
            if (!reviewedProductIds.has(product.id) && !pendingReviewsMap.has(product.id)) {
              pendingReviewsMap.set(product.id, {
                order_id: order.id,
                product_variant_id: item.product_variant_id,
                product_id: product.id,
                title: product.title,
                image_url: product.image_url
              });
            }
          });
        });
      }

      const pendingReviews = Array.from(pendingReviewsMap.values()).slice(0, 5);

      res.json({
        success: true,
        data: {
          recent_orders: recentOrders || [],
          active_orders: activeOrders || [],
          wishlist_preview: formattedWishlist,
          monthly_spent: monthlySpent,
          pending_reviews: pendingReviews
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
      const { count: shippedCount, error: shippedError } = await supabase
        .from('Orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'shipped');

      if (!shippedError && shippedCount > 0) {
        notifications.push({
          type: 'delivery',
          message: `You have ${shippedCount} order(s) on the way`,
          priority: 'high',
          created_at: new Date()
        });
      }

      // Check for unverified email
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (!userError && user && !user.email_verified) {
        notifications.push({
          type: 'email_verification',
          message: 'Please verify your email address',
          priority: 'medium',
          created_at: new Date()
        });
      }

      // Check for pending reviews (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentDeliveredOrders, error: ordersError } = await supabase
        .from('Orders')
        .select(`
          id,
          Order_items!inner(
            Product_variants!inner(
              product_id
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get user's reviews
      const { data: userReviews, error: reviewsError } = await supabase
        .from('Reviews')
        .select('product_id')
        .eq('user_id', userId);

      const reviewedProductIds = new Set(userReviews ? userReviews.map(r => r.product_id) : []);

      // Count unique products without reviews
      const unreviewedProducts = new Set();
      if (recentDeliveredOrders) {
        recentDeliveredOrders.forEach(order => {
          order.Order_items.forEach(item => {
            const productId = item.Product_variants.product_id;
            if (!reviewedProductIds.has(productId)) {
              unreviewedProducts.add(productId);
            }
          });
        });
      }

      if (unreviewedProducts.size > 0) {
        notifications.push({
          type: 'review',
          message: `You have ${unreviewedProducts.size} product(s) to review`,
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