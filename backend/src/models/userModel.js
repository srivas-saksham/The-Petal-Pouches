// backend/src/models/userModel.js

const pool = require('../config/database');
const bcrypt = require('bcrypt');

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
      
      const query = `
        INSERT INTO users (
          id, name, email, password_hash, phone, 
          email_verified, is_active, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 
          false, true, now(), now()
        )
        RETURNING id, name, email, phone, email_verified, is_active, created_at, updated_at
      `;
      
      const values = [name, email, password_hash, phone || null];
      const result = await pool.query(query, values);
      
      console.log(`[UserModel] New user created: ${email}`);
      return result.rows[0];
      
    } catch (error) {
      // Handle PostgreSQL unique constraint violation
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new Error('EMAIL_EXISTS');
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
    const query = `
      SELECT 
        id, name, email, password_hash, phone, 
        email_verified, is_active, created_at, updated_at, last_login
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  },

  /**
   * Find user by ID (without password_hash)
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(userId) {
    const query = `
      SELECT 
        id, name, email, phone, 
        email_verified, is_active, created_at, updated_at, last_login
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Get user profile with statistics
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User profile with order count, wishlist count, etc.
   */
  async getProfile(userId) {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone, 
        u.email_verified, u.is_active, u.created_at, u.last_login,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT w.id) as wishlist_count,
        COUNT(DISTINCT a.id) as address_count,
        COALESCE(SUM(o.final_total), 0)::int as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      LEFT JOIN wishlist w ON u.id = w.user_id
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    const query = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists`;
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
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
    
    const query = `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        updated_at = now()
      WHERE id = $3 AND is_active = true
      RETURNING id, name, email, phone, email_verified, is_active, created_at, updated_at
    `;
    
    const values = [name || null, phone || null, userId];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    
    console.log(`[UserModel] Profile updated for user: ${userId}`);
    return result.rows[0];
  },

  /**
   * Update user email
   * @param {string} userId - User UUID
   * @param {string} newEmail - New email address
   * @returns {Promise<Object>} Updated user object
   */
  async updateEmail(userId, newEmail) {
    try {
      const query = `
        UPDATE users
        SET 
          email = $1,
          email_verified = false,
          updated_at = now()
        WHERE id = $2 AND is_active = true
        RETURNING id, name, email, phone, email_verified, is_active
      `;
      
      const result = await pool.query(query, [newEmail, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }
      
      console.log(`[UserModel] Email updated for user: ${userId}`);
      return result.rows[0];
      
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('EMAIL_EXISTS');
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
    
    const query = `
      UPDATE users
      SET 
        password_hash = $1,
        updated_at = now()
      WHERE id = $2 AND is_active = true
    `;
    
    const result = await pool.query(query, [password_hash, userId]);
    
    if (result.rowCount === 0) {
      throw new Error('USER_NOT_FOUND');
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
    const query = `
      UPDATE users
      SET 
        email_verified = true,
        updated_at = now()
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rowCount === 0) {
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
    const query = `
      UPDATE users
      SET last_login = now()
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
  },

  // ==================== DELETE OPERATIONS ====================
  
  /**
   * Soft delete user account (set is_active to false)
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if successful
   */
  async deactivate(userId) {
    const query = `
      UPDATE users
      SET 
        is_active = false,
        updated_at = now()
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rowCount === 0) {
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
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await pool.query(query, [userId]);
    
    if (result.rowCount === 0) {
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
    const query = `
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.final_total ELSE 0 END), 0)::int as total_spent,
        COUNT(DISTINCT w.id) as wishlist_items,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT a.id) as saved_addresses
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      LEFT JOIN wishlist w ON u.id = w.user_id
      LEFT JOIN reviews r ON u.id = r.user_id
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || {
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      total_spent: 0,
      wishlist_items: 0,
      total_reviews: 0,
      saved_addresses: 0
    };
  },

  /**
   * Search users by name or email (admin function)
   * @param {string} searchTerm - Search query
   * @param {number} [limit=20] - Maximum results
   * @param {number} [offset=0] - Pagination offset
   * @returns {Promise<Array>} Array of users
   */
  async search(searchTerm, limit = 20, offset = 0) {
    const query = `
      SELECT 
        id, name, email, phone, 
        email_verified, is_active, created_at, last_login
      FROM users
      WHERE 
        (name ILIKE $1 OR email ILIKE $1)
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, limit, offset]);
    
    return result.rows;
  }
};

module.exports = UserModel;