// backend/src/models/addressModel.js

import supabase from '../config/supabaseClient.js';

/**
 * Get all addresses for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of address objects
 */
export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Get single address by ID
 * @param {string} addressId - Address ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Address object
 */
export const getAddressById = async (addressId, userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

/**
 * Get default address for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Default address or null
 */
export const getDefaultAddress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  } catch (error) {
    console.error('Error fetching default address:', error);
    throw error;
  }
};

/**
 * Create new address
 * @param {string} userId - User ID
 * @param {Object} addressData - Address details
 * @returns {Promise<Object>} - Created address object
 */
export const createAddress = async (userId, addressData) => {
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

    // If this is being set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
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
        is_default,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
};

/**
 * Update existing address
 * @param {string} addressId - Address ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} addressData - Updated address details
 * @returns {Promise<Object>} - Updated address object
 */
export const updateAddress = async (addressId, userId, addressData) => {
  try {
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

    // Verify ownership
    const existing = await getAddressById(addressId, userId);
    if (!existing) {
      const error = new Error('Address not found or unauthorized');
      error.status = 404;
      throw error;
    }

    // If setting as default, unset others
    if (is_default && !existing.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const updateData = {};
    if (line1 !== undefined) updateData.line1 = line1;
    if (line2 !== undefined) updateData.line2 = line2 || null;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (zip_code !== undefined) updateData.zip_code = zip_code;
    if (address_type !== undefined) updateData.address_type = address_type;
    if (phone !== undefined) updateData.phone = phone || null;
    if (landmark !== undefined) updateData.landmark = landmark || null;
    if (is_default !== undefined) updateData.is_default = is_default;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

/**
 * Delete address
 * @param {string} addressId - Address ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Deleted address object
 */
export const deleteAddress = async (addressId, userId) => {
  try {
    // Verify ownership
    const existing = await getAddressById(addressId, userId);
    if (!existing) {
      const error = new Error('Address not found or unauthorized');
      error.status = 404;
      throw error;
    }

    // If deleting default address, set another as default
    if (existing.is_default) {
      const otherAddresses = await getUserAddresses(userId);
      const nextDefault = otherAddresses.find((a) => a.id !== addressId);
      
      if (nextDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', nextDefault.id);
      }
    }

    const { data, error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

/**
 * Set address as default
 * @param {string} addressId - Address ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Updated address object
 */
export const setDefaultAddress = async (addressId, userId) => {
  try {
    // Verify ownership
    const existing = await getAddressById(addressId, userId);
    if (!existing) {
      const error = new Error('Address not found or unauthorized');
      error.status = 404;
      throw error;
    }

    // Unset current default
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    // Set new default
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

/**
 * Check if user has any addresses
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if user has addresses
 */
export const userHasAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking user addresses:', error);
    throw error;
  }
};

/**
 * Get addresses by type (home, work, etc)
 * @param {string} userId - User ID
 * @param {string} addressType - Type of address
 * @returns {Promise<Array>} - Array of addresses
 */
export const getAddressesByType = async (userId, addressType) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('address_type', addressType)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching addresses by type:', error);
    throw error;
  }
};

/**
 * Batch update addresses (for cleaning up)
 * @param {string} userId - User ID
 * @param {Array} addressIds - Array of address IDs to delete
 * @returns {Promise<number>} - Number of deleted addresses
 */
export const batchDeleteAddresses = async (userId, addressIds) => {
  try {
    const { count, error } = await supabase
      .from('addresses')
      .delete()
      .in('id', addressIds)
      .eq('user_id', userId);

    if (error) throw error;
    return count;
  } catch (error) {
    console.error('Error batch deleting addresses:', error);
    throw error;
  }
};

/**
 * Get address count for user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of addresses
 */
export const getAddressCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (error) throw error;
    return count;
  } catch (error) {
    console.error('Error counting addresses:', error);
    throw error;
  }
};

export default {
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  userHasAddresses,
  getAddressesByType,
  batchDeleteAddresses,
  getAddressCount
};