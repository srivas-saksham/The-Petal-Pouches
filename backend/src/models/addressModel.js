// backend/src/models/addressModel.js

const supabase = require('../config/supabaseClient');

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
      const { data: addresses, error } = await supabase
        .from('Addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`📍 Fetched ${addresses?.length || 0} addresses for user ${userId}`);
      return addresses || [];
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
      const { data: address, error } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (error || !address) {
        const err = new Error('Address not found');
        err.code = 'ADDRESS_NOT_FOUND';
        throw err;
      }

      return address;
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
      const { data: address, error } = await supabase
        .from('Addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        return null;
      }

      return address;
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
      const { data: addresses, error } = await supabase
        .from('Addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('address_type', addressType)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return addresses || [];
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
      const { count, error } = await supabase
        .from('Addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return count || 0;
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
    try {
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
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await supabase
          .from('Addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Insert new address
      const { data: address, error: insertError } = await supabase
        .from('Addresses')
        .insert([{
          user_id: userId,
          line1,
          line2: line2 || null,
          city,
          state,
          country,
          zip_code,
          address_type,
          phone: phone || null,
          landmark: landmark || null,
          is_default
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      console.log(`✅ Address created: ${address.id}`);
      return address;

    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
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
    try {
      // Verify ownership
      const { data: existing, error: existingError } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (existingError || !existing) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      // If setting as default and wasn't default before, unset others
      if (addressData.is_default && !existing.is_default) {
        await supabase
          .from('Addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      // Build update object
      const updateObj = {};
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

      if (line1 !== undefined) updateObj.line1 = line1;
      if (line2 !== undefined) updateObj.line2 = line2;
      if (city !== undefined) updateObj.city = city;
      if (state !== undefined) updateObj.state = state;
      if (country !== undefined) updateObj.country = country;
      if (zip_code !== undefined) updateObj.zip_code = zip_code;
      if (address_type !== undefined) updateObj.address_type = address_type;
      if (phone !== undefined) updateObj.phone = phone;
      if (landmark !== undefined) updateObj.landmark = landmark;
      if (is_default !== undefined) updateObj.is_default = is_default;

      // Update address
      const { data: updatedAddress, error: updateError } = await supabase
        .from('Addresses')
        .update(updateObj)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      console.log(`✅ Address updated: ${addressId}`);
      return updatedAddress;

    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  /**
   * Set address as default
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Updated address object
   */
  setDefaultAddress: async (addressId, userId) => {
    try {
      // Verify ownership
      const { data: existing, error: existingError } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (existingError || !existing) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      // Unset all defaults for this user
      await supabase
        .from('Addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set new default
      const { data: updatedAddress, error: updateError } = await supabase
        .from('Addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      console.log(`✅ Default address set: ${addressId}`);
      return updatedAddress;

    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
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
    try {
      // Verify ownership and get address info
      const { data: existing, error: existingError } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (existingError || !existing) {
        const error = new Error('Address not found');
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      const wasDefault = existing.is_default;

      // Delete the address
      const { error: deleteError } = await supabase
        .from('Addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      let newDefaultAddress = null;

      // If deleted address was default, set another as default
      if (wasDefault) {
        const { data: otherAddresses, error: otherError } = await supabase
          .from('Addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!otherError && otherAddresses && otherAddresses.length > 0) {
          const { data: updated, error: updateError } = await supabase
            .from('Addresses')
            .update({ is_default: true })
            .eq('id', otherAddresses[0].id)
            .select()
            .single();

          if (!updateError) {
            newDefaultAddress = updated;
          }
        }
      }
      
      console.log(`✅ Address deleted: ${addressId}${wasDefault ? ' (was default)' : ''}`);

      return {
        wasDefault,
        newDefaultAddress
      };

    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  /**
   * Batch delete addresses
   * @param {Array} addressIds - Array of address IDs
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Result with deletion info
   */
  batchDeleteAddresses: async (addressIds, userId) => {
    try {
      // Check if deleting all addresses
      const { count: totalCount, error: countError } = await supabase
        .from('Addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      if (totalCount === addressIds.length) {
        const error = new Error('Cannot delete all addresses');
        error.code = 'CANNOT_DELETE_ALL';
        throw error;
      }

      // Get addresses to be deleted to check if default is included
      const { data: toDelete, error: fetchError } = await supabase
        .from('Addresses')
        .select('id, is_default')
        .in('id', addressIds)
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      const deletedDefault = toDelete?.some(addr => addr.is_default) || false;

      // Delete addresses
      const { data: deleted, error: deleteError } = await supabase
        .from('Addresses')
        .delete()
        .in('id', addressIds)
        .eq('user_id', userId)
        .select('id, is_default');

      if (deleteError) throw deleteError;

      const deletedCount = deleted?.length || 0;
      const deletedIds = deleted?.map(r => r.id) || [];

      let newDefaultAddress = null;

      // If default was deleted, assign new default
      if (deletedDefault) {
        const { data: remainingAddresses, error: remainingError } = await supabase
          .from('Addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!remainingError && remainingAddresses && remainingAddresses.length > 0) {
          const { data: updated, error: updateError } = await supabase
            .from('Addresses')
            .update({ is_default: true })
            .eq('id', remainingAddresses[0].id)
            .select()
            .single();

          if (!updateError) {
            newDefaultAddress = updated;
          }
        }
      }
      
      console.log(`✅ Batch deleted ${deletedCount} addresses`);

      return {
        deletedCount,
        deletedIds,
        newDefaultAddress
      };

    } catch (error) {
      console.error('Error batch deleting addresses:', error);
      throw error;
    }
  }

};

module.exports = AddressModel;