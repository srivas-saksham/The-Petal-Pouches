// frontend/src/services/addressService.js

import api from './api';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('customer_token');
};

/**
 * Get all addresses for current user
 * GET /api/addresses
 */
export const getAddresses = async () => {
  try {
    const response = await api.get('/api/addresses');

    return {
      success: true,
      data: response.data.addresses || response.data.data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch addresses',
    };
  }
};

/**
 * Get single address by ID
 * GET /api/addresses/:id
 */
export const getAddressById = async (addressId) => {
  try {
    const response = await api.get(`/api/addresses/${addressId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch address',
    };
  }
};

/**
 * Create new address
 * POST /api/addresses
 * @param {Object} addressData - Address information
 * @param {string} addressData.line1 - Address line 1 (required)
 * @param {string} addressData.line2 - Address line 2 (optional)
 * @param {string} addressData.city - City (required)
 * @param {string} addressData.state - State (required)
 * @param {string} addressData.country - Country (required)
 * @param {string} addressData.zip_code - Postal code (required)
 * @param {string} addressData.landmark - Landmark (optional)
 * @param {string} addressData.phone - Contact phone (required)
 * @param {number} addressData.latitude - Latitude (optional)
 * @param {number} addressData.longitude - Longitude (optional)
 * @param {boolean} addressData.is_default - Set as default (optional)
 */
export const createAddress = async (addressData) => {
  try {
    // Validate required fields
    const requiredFields = ['line1', 'city', 'state', 'country', 'zip_code', 'phone'];
    for (const field of requiredFields) {
      if (!addressData[field] || !addressData[field].trim()) {
        return {
          success: false,
          error: `${field.replace('_', ' ')} is required`,
        };
      }
    }

    const response = await api.post('/api/addresses', addressData);

    return {
      success: true,
      data: response.data.data,
      message: 'Address created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create address',
    };
  }
};

/**
 * Update existing address
 * PUT /api/addresses/:id
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    // Validate required fields
    const requiredFields = ['line1', 'city', 'state', 'country', 'zip_code', 'phone'];
    for (const field of requiredFields) {
      if (!addressData[field] || !addressData[field].trim()) {
        return {
          success: false,
          error: `${field.replace('_', ' ')} is required`,
        };
      }
    }

    const response = await api.put(`/api/addresses/${addressId}`, addressData);

    return {
      success: true,
      data: response.data.data,
      message: 'Address updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update address',
    };
  }
};

/**
 * Delete address
 * DELETE /api/addresses/:id
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/api/addresses/${addressId}`);

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete address',
    };
  }
};

/**
 * Set address as default
 * PATCH /api/addresses/:id/default
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.patch(`/api/addresses/${addressId}/default`);

    return {
      success: true,
      data: response.data.data,
      message: 'Default address updated',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to set default address',
    };
  }
};

/**
 * Validate address fields
 * @param {Object} address - Address object to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateAddress = (address) => {
  const errors = [];

  // Required fields
  if (!address.line1 || !address.line1.trim()) {
    errors.push('Address line 1 is required');
  }

  if (!address.city || !address.city.trim()) {
    errors.push('City is required');
  }

  if (!address.state || !address.state.trim()) {
    errors.push('State is required');
  }

  if (!address.country || !address.country.trim()) {
    errors.push('Country is required');
  }

  if (!address.zip_code || !address.zip_code.trim()) {
    errors.push('Postal code is required');
  }

  // Validate zip code format (basic)
  if (address.zip_code && !/^\d{6}$/.test(address.zip_code.trim())) {
    errors.push('Invalid postal code format (6 digits required)');
  }

  // UPDATED: Make phone required
  if (!address.phone || !address.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
    errors.push('Invalid phone number format (10 digits required)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} - Formatted address string
 */
export const formatAddressDisplay = (address) => {
  if (!address) return '';

  const parts = [
    address.line1,
    address.line2,
    address.landmark,
    address.city,
    address.state,
    address.zip_code,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * Get default address from list
 * @param {Array} addresses - Array of address objects
 * @returns {Object|null} - Default address or null
 */
export const getDefaultAddress = (addresses) => {
  if (!addresses || !Array.isArray(addresses)) return null;
  return addresses.find(addr => addr.is_default) || addresses[0] || null;
};