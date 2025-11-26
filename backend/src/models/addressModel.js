// backend/src/models/addressModel.js

const pool = require('../config/database');

/**
 * Address Model - Handles all address-related database operations
 * Manages user addresses with default address logic
 */
const AddressModel = {

  // ==================== READ OPERATIONS ====================

  /**
   * Get all addresses for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of address objects
   */
  getUserAddresses: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT * FROM addresses 
         WHERE user_id = $1 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      
      console.log(`📍 Fetched ${result.rows.length} addresses for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  },

  /**
   * Get single address by ID with authorization
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object|null>} - Address object or null
   */
  getAddressById: async (addressId, userId) => {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, userId]
      );

      if (result.rows.length === 0) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      return result.rows[0];
    } catch (error) {
      if (error.code === 'ADDRESS_NOT_FOUND') {
        throw error;
      }
      console.error('Error fetching address by ID:', error);
      throw error;
    }
  },

  /**
   * Get default address for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Default address or null
   */
  getDefaultAddress: async (userId) => {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 AND is_default = true',
        [userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error fetching default address:', error);
      throw error;
    }
  },

  /**
   * Get addresses by type (home, work, etc)
   * @param {string} userId - User ID
   * @param {string} addressType - Type of address
   * @returns {Promise<Array>} - Array of addresses
   */
  getAddressesByType: async (userId, addressType) => {
    try {
      const result = await pool.query(
        `SELECT * FROM addresses 
         WHERE user_id = $1 AND address_type = $2 
         ORDER BY is_default DESC, created_at DESC`,
        [userId, addressType]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching addresses by type:', error);
      throw error;
    }
  },

  /**
   * Get address count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Count of addresses
   */
  getAddressCount: async (userId) => {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM addresses WHERE user_id = $1',
        [userId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting addresses:', error);
      throw error;
    }
  },

  /**
   * Check if user has any addresses
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user has addresses
   */
  userHasAddresses: async (userId) => {
    try {
      const count = await AddressModel.getAddressCount(userId);
      return count > 0;
    } catch (error) {
      console.error('Error checking user addresses:', error);
      throw error;
    }
  },

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create new address
   * @param {string} userId - User ID
   * @param {Object} addressData - Address details
   * @returns {Promise<Object>} - Created address object
   */
  createAddress: async (userId, addressData) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const {
        line1,
        line2,
        city,
        state,
        country = 'India',
        zip_code,
        address_type = 'home',
        phone,
        landmark,
        is_default = false
      } = addressData;

      // Validate required fields
      if (!line1 || !city || !state || !zip_code) {
        const error = new Error('Missing required fields: line1, city, state, zip_code');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }

      // Check if user exists
      const userCheck = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      // Insert new address
      const result = await client.query(
        `INSERT INTO addresses 
         (user_id, line1, line2, city, state, country, zip_code, address_type, phone, landmark, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [userId, line1, line2 || null, city, state, country, zip_code, address_type, phone || null, landmark || null, is_default]
      );

      await client.query('COMMIT');
      
      console.log(`✅ Address created: ${result.rows[0].id}`);
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating address:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update existing address
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} addressData - Updated address details
   * @returns {Promise<Object>} - Updated address object
   */
  updateAddress: async (addressId, userId, addressData) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify ownership
      const existingCheck = await client.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, userId]
      );

      if (existingCheck.rows.length === 0) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      const existing = existingCheck.rows[0];

      // If setting as default and wasn't default before, unset others
      if (addressData.is_default && !existing.is_default) {
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      // Build update query dynamically
      const {
        line1,
        line2,
        city,
        state,
        country,
        zip_code,
        address_type,
        phone,
        landmark,
        is_default
      } = addressData;

      const result = await client.query(
        `UPDATE addresses 
         SET line1 = COALESCE($1, line1),
             line2 = COALESCE($2, line2),
             city = COALESCE($3, city),
             state = COALESCE($4, state),
             country = COALESCE($5, country),
             zip_code = COALESCE($6, zip_code),
             address_type = COALESCE($7, address_type),
             phone = COALESCE($8, phone),
             landmark = COALESCE($9, landmark),
             is_default = COALESCE($10, is_default)
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [line1, line2, city, state, country, zip_code, address_type, phone, landmark, is_default, addressId, userId]
      );

      await client.query('COMMIT');
      
      console.log(`✅ Address updated: ${addressId}`);
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating address:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Set address as default
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Updated address object
   */
  setDefaultAddress: async (addressId, userId) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify ownership
      const existingCheck = await client.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, userId]
      );

      if (existingCheck.rows.length === 0) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      // Unset all defaults for this user
      await client.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set new default
      const result = await client.query(
        'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [addressId, userId]
      );

      await client.query('COMMIT');
      
      console.log(`✅ Default address set: ${addressId}`);
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting default address:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete address (with auto-reassign default logic)
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Result object with deletion info
   */
  deleteAddress: async (addressId, userId) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify ownership and get address info
      const existingCheck = await client.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, userId]
      );

      if (existingCheck.rows.length === 0) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      const existing = existingCheck.rows[0];
      const wasDefault = existing.is_default;

      // Delete the address
      await client.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
        [addressId, userId]
      );

      let newDefaultAddress = null;

      // If deleted address was default, set another as default
      if (wasDefault) {
        const otherAddresses = await client.query(
          'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
          [userId]
        );

        if (otherAddresses.rows.length > 0) {
          const updateResult = await client.query(
            'UPDATE addresses SET is_default = true WHERE id = $1 RETURNING *',
            [otherAddresses.rows[0].id]
          );
          newDefaultAddress = updateResult.rows[0];
        }
      }

      await client.query('COMMIT');
      
      console.log(`✅ Address deleted: ${addressId}${wasDefault ? ' (was default)' : ''}`);

      return {
        wasDefault,
        newDefaultAddress
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting address:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Batch delete addresses
   * @param {Array} addressIds - Array of address IDs
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Result with deletion info
   */
  batchDeleteAddresses: async (addressIds, userId) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if deleting all addresses
      const totalCount = await client.query(
        'SELECT COUNT(*) as count FROM addresses WHERE user_id = $1',
        [userId]
      );

      if (parseInt(totalCount.rows[0].count) === addressIds.length) {
        const error = new Error('Cannot delete all addresses');
        error.code = 'CANNOT_DELETE_ALL';
        throw error;
      }

      // Delete addresses
      const result = await client.query(
        'DELETE FROM addresses WHERE id = ANY($1) AND user_id = $2 RETURNING id, is_default',
        [addressIds, userId]
      );

      const deletedCount = result.rows.length;
      const deletedIds = result.rows.map(r => r.id);
      const deletedDefault = result.rows.some(r => r.is_default);

      let newDefaultAddress = null;

      // If default was deleted, assign new default
      if (deletedDefault) {
        const remainingAddresses = await client.query(
          'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
          [userId]
        );

        if (remainingAddresses.rows.length > 0) {
          const updateResult = await client.query(
            'UPDATE addresses SET is_default = true WHERE id = $1 RETURNING *',
            [remainingAddresses.rows[0].id]
          );
          newDefaultAddress = updateResult.rows[0];
        }
      }

      await client.query('COMMIT');
      
      console.log(`✅ Batch deleted ${deletedCount} addresses`);

      return {
        deletedCount,
        deletedIds,
        newDefaultAddress
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error batch deleting addresses:', error);
      throw error;
    } finally {
      client.release();
    }
  }

};

module.exports = AddressModel;