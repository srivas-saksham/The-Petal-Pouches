// backend/src/models/userModel.js

const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');

/**
 * User Model - Handles all user-related database operations for customers
 * Manages user CRUD operations, authentication, and profile management
 */
const UserModel = {
  
  // ==================== CREATE OPERATIONS ====================
  
  /**
   * Create a new user account
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password (will be hashed)
   * @param {string} [userData.phone] - Optional phone number
   * @returns {Promise<Object>} Created user object (without password)
   * @throws {Error} If email already exists or validation fails
   */
  async create(userData) {
    const { name, email, password, phone } = userData;
    
    try {
      // Hash password with bcrypt
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const { data: user, error } = await supabase
        .from('Users')
        .insert([{
          name,
          email,
          password_hash,
          phone: phone || null,
          email_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, name, email, phone, email_verified, is_active, created_at, updated_at')
        .single();
      
      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          throw new Error('EMAIL_EXISTS');
        }
        throw error;
      }
      
      console.log(`[UserModel] New user created: ${email}`);
      return user;
      
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        throw error;
      }
      console.error('[UserModel] Error creating user:', error);
      throw error;
    }
  },

  // ==================== READ OPERATIONS ====================
  
  /**
   * Find user by email (includes password_hash for authentication)
   * @param {string} email - User email address
   * @returns {Promise<Object|null>} User object with password_hash or null
   */
  async findByEmail(email) {
    const { data: user, error } = await supabase
      .from('Users')
      .select('id, name, email, password_hash, phone, email_verified, is_active, created_at, updated_at, last_login')
      .eq('email', email)
      .single();
    
    if (error) {
      return null;
    }
    
    return user;
  },

  /**
   * Find user by ID (without password_hash)
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(userId) {
    const { data: user, error } = await supabase
      .from('Users')
      .select('id, name, email, phone, email_verified, is_active, created_at, updated_at, last_login')
      .eq('id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return null;
    }
    
    return user;
  },

  /**
   * Get user profile with statistics
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User profile with order count, wishlist count, etc.
   */
  async getProfile(userId) {
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id, name, email, phone, email_verified, is_active, created_at, last_login')
      .eq('id', userId)
      .eq('is_active', true)
      .single();
    
    if (userError || !user) {
      return null;
    }

    // Get orders (excluding cancelled)
    const { data: orders, error: ordersError } = await supabase
      .from('Orders')
      .select('id, final_total')
      .eq('user_id', userId)
      .neq('status', 'cancelled');

    // Get wishlist count
    const { count: wishlistCount, error: wishlistError } = await supabase
      .from('Wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get address count
    const { count: addressCount, error: addressError } = await supabase
      .from('Addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate totals
    const totalOrders = orders ? orders.length : 0;
    const totalSpent = orders ? orders.reduce((sum, order) => sum + (order.final_total || 0), 0) : 0;

    return {
      ...user,
      total_orders: totalOrders,
      wishlist_count: wishlistCount || 0,
      address_count: addressCount || 0,
      total_spent: Math.floor(totalSpent)
    };
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    const { count, error } = await supabase
      .from('Users')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);
    
    return (count || 0) > 0;
  },

  // ==================== UPDATE OPERATIONS ====================
  
  /**
   * Update user profile information
   * @param {string} userId - User UUID
   * @param {Object} updateData - Fields to update
   * @param {string} [updateData.name] - New name
   * @param {string} [updateData.phone] - New phone
   * @returns {Promise<Object>} Updated user object
   */
  async updateProfile(userId, updateData) {
    const { name, phone } = updateData;
    
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    
    const { data: user, error } = await supabase
      .from('Users')
      .update(updates)
      .eq('id', userId)
      .eq('is_active', true)
      .select('id, name, email, phone, email_verified, is_active, created_at, updated_at')
      .single();
    
    if (error || !user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    console.log(`[UserModel] Profile updated for user: ${userId}`);
    return user;
  },

  /**
   * Update user email
   * @param {string} userId - User UUID
   * @param {string} newEmail - New email address
   * @returns {Promise<Object>} Updated user object
   */
  async updateEmail(userId, newEmail) {
    try {
      const { data: user, error } = await supabase
        .from('Users')
        .update({
          email: newEmail,
          email_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('is_active', true)
        .select('id, name, email, phone, email_verified, is_active')
        .single();
      
      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          throw new Error('EMAIL_EXISTS');
        }
        throw error;
      }
      
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }
      
      console.log(`[UserModel] Email updated for user: ${userId}`);
      return user;
      
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS' || error.message === 'USER_NOT_FOUND') {
        throw error;
      }
      throw error;
    }
  },

  /**
   * Update user password
   * @param {string} userId - User UUID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} True if successful
   */
  async updatePassword(userId, newPassword) {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const { error, count } = await supabase
      .from('Users')
      .update({
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('is_active', true);
    
    if (error) {
      throw error;
    }
    
    console.log(`[UserModel] Password updated for user: ${userId}`);
    return true;
  },

  /**
   * Verify user email
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if successful
   */
  async verifyEmail(userId) {
    const { error } = await supabase
      .from('Users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('is_active', true);
    
    if (error) {
      throw new Error('USER_NOT_FOUND');
    }
    
    console.log(`[UserModel] Email verified for user: ${userId}`);
    return true;
  },

  /**
   * Update last login timestamp
   * @param {string} userId - User UUID
   * @returns {Promise<void>}
   */
  async updateLastLogin(userId) {
    await supabase
      .from('Users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  },

  // ==================== DELETE OPERATIONS ====================
  
  /**
   * Soft delete user account (set is_active to false)
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if successful
   */
  async deactivate(userId) {
    const { data, error } = await supabase
      .from('Users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (error || !data || data.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    
    console.log(`[UserModel] User deactivated: ${userId}`);
    return true;
  },

  /**
   * Hard delete user account (permanent deletion)
   * WARNING: This will CASCADE delete all related data
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if successful
   */
  async hardDelete(userId) {
    const { data, error } = await supabase
      .from('Users')
      .delete()
      .eq('id', userId)
      .select();
    
    if (error || !data || data.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    
    console.log(`[UserModel] User permanently deleted: ${userId}`);
    return true;
  },

  // ==================== AUTHENTICATION HELPERS ====================
  
  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} User object (without password) if authenticated
   * @throws {Error} If credentials are invalid or account is inactive
   */
  async authenticate(email, password) {
    // Find user with password hash
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }
    
    // Check if account is active
    if (!user.is_active) {
      throw new Error('ACCOUNT_INACTIVE');
    }
    
    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }
    
    // Update last login
    await this.updateLastLogin(user.id);
    
    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log(`[UserModel] User authenticated: ${email}`);
    return userWithoutPassword;
  },

  // ==================== UTILITY METHODS ====================
  
  /**
   * Get user statistics
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics(userId) {
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('Orders')
      .select('id, status, final_total')
      .eq('user_id', userId);

    // Get wishlist count
    const { count: wishlistCount, error: wishlistError } = await supabase
      .from('Wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get reviews count
    const { count: reviewsCount, error: reviewsError } = await supabase
      .from('Reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get addresses count
    const { count: addressesCount, error: addressesError } = await supabase
      .from('Addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate statistics
    const stats = {
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      total_spent: 0,
      wishlist_items: wishlistCount || 0,
      total_reviews: reviewsCount || 0,
      saved_addresses: addressesCount || 0
    };

    if (orders && orders.length > 0) {
      stats.total_orders = orders.length;
      stats.completed_orders = orders.filter(o => o.status === 'delivered').length;
      stats.cancelled_orders = orders.filter(o => o.status === 'cancelled').length;
      stats.total_spent = Math.floor(
        orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.final_total || 0), 0)
      );
    }

    return stats;
  },

  /**
   * Search users by name or email (admin function)
   * @param {string} searchTerm - Search query
   * @param {number} [limit=20] - Maximum results
   * @param {number} [offset=0] - Pagination offset
   * @returns {Promise<Array>} Array of users
   */
  async search(searchTerm, limit = 20, offset = 0) {
    const { data: users, error } = await supabase
      .from('Users')
      .select('id, name, email, phone, email_verified, is_active, created_at, last_login')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('[UserModel] Search error:', error);
      return [];
    }
    
    return users || [];
  }
};

module.exports = UserModel;