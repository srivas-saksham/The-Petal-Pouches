// backend/src/controllers/addressController.js

const {
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
} = require('../models/addressModel');

/**
 * Get all addresses for authenticated user
 * GET /api/addresses
 */
const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { type, default_only } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    let addresses;

    if (default_only === 'true') {
      // Get only default address
      const defaultAddress = await getDefaultAddress(userId);
      addresses = defaultAddress ? [defaultAddress] : [];
    } else if (type) {
      // Filter by address type
      addresses = await getAddressesByType(userId, type);
    } else {
      // Get all addresses
      addresses = await getUserAddresses(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: addresses,
      count: addresses.length
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses',
      error: error.message
    });
  }
};

/**
 * Get single address by ID
 * GET /api/addresses/:id
 */
const getAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const address = await getAddressById(id, userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address retrieved successfully',
      data: address
    });

  } catch (error) {
    console.error('Get address error:', error);
    
    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this address'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve address',
      error: error.message
    });
  }
};

/**
 * Create new address
 * POST /api/addresses
 */
const createNewAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const addressData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if this is the user's first address (auto-set as default)
    const hasAddresses = await userHasAddresses(userId);
    if (!hasAddresses) {
      addressData.is_default = true;
    }

    const newAddress = await createAddress(userId, addressData);

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: newAddress
    });

  } catch (error) {
    console.error('Create address error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
};

/**
 * Update existing address
 * PUT /api/addresses/:id
 */
const updateExistingAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { id } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const updatedAddress = await updateAddress(id, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });

  } catch (error) {
    console.error('Update address error:', error);

    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this address'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

/**
 * Delete address
 * DELETE /api/addresses/:id
 */
const deleteExistingAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const result = await deleteAddress(id, userId);

    res.status(200).json({
      success: true,
      message: result.wasDefault 
        ? 'Default address deleted and new default set successfully'
        : 'Address deleted successfully',
      data: {
        deletedAddressId: id,
        wasDefault: result.wasDefault,
        newDefaultAddress: result.newDefaultAddress || null
      }
    });

  } catch (error) {
    console.error('Delete address error:', error);

    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this address'
      });
    }

    if (error.message === 'Cannot delete the only address') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your only address. Please add another address first.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

/**
 * Set address as default
 * PATCH /api/addresses/:id/default
 */
const setAddressAsDefault = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const defaultAddress = await setDefaultAddress(id, userId);

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: defaultAddress
    });

  } catch (error) {
    console.error('Set default address error:', error);

    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this address'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
};

/**
 * Get default address only
 * GET /api/addresses/default
 */
const getDefaultAddressOnly = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const defaultAddress = await getDefaultAddress(userId);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: 'No default address found. Please add an address first.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default address retrieved successfully',
      data: defaultAddress
    });

  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve default address',
      error: error.message
    });
  }
};

/**
 * Bulk delete addresses
 * DELETE /api/addresses/bulk
 */
const bulkDeleteAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const { addressIds } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!addressIds || !Array.isArray(addressIds) || addressIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Address IDs array is required'
      });
    }

    // Validate all IDs are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidIds = addressIds.filter(id => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address IDs provided',
        invalidIds
      });
    }

    const result = await batchDeleteAddresses(addressIds, userId);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} address(es)`,
      data: {
        deletedCount: result.deletedCount,
        deletedIds: result.deletedIds,
        newDefaultAddress: result.newDefaultAddress || null
      }
    });

  } catch (error) {
    console.error('Bulk delete addresses error:', error);

    if (error.message === 'Cannot delete all addresses') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete all addresses. At least one address must remain.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete addresses',
      error: error.message
    });
  }
};

/**
 * Get address statistics
 * GET /api/addresses/stats
 */
const getAddressStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const totalCount = await getAddressCount(userId);
    const addresses = await getUserAddresses(userId);

    // Count by type
    const typeStats = addresses.reduce((acc, addr) => {
      acc[addr.address_type] = (acc[addr.address_type] || 0) + 1;
      return acc;
    }, {});

    const defaultAddress = addresses.find(addr => addr.is_default);

    res.status(200).json({
      success: true,
      message: 'Address statistics retrieved successfully',
      data: {
        totalCount,
        typeBreakdown: typeStats,
        hasDefault: !!defaultAddress,
        defaultAddressType: defaultAddress?.address_type || null,
        limit: 10,
        remaining: Math.max(0, 10 - totalCount)
      }
    });

  } catch (error) {
    console.error('Get address stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve address statistics',
      error: error.message
    });
  }
};

/**
 * Geocoding search endpoint
 * POST /api/addresses/geocode
 */
const geocodeAddress = async (req, res) => {
  try {
    const { query, lat, lng, country = 'IN' } = req.body;

    // This would integrate with Mapbox/Nominatim
    // For now, return a mock response structure
    const mockResults = [
      {
        address: `${query}, India`,
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        components: {
          line1: query,
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          zip_code: '110001'
        }
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Geocoding results retrieved successfully',
      data: mockResults,
      query,
      count: mockResults.length
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding service failed',
      error: error.message
    });
  }
};

module.exports = {
  getAddresses,
  getAddress,
  createNewAddress,
  updateExistingAddress,
  deleteExistingAddress,
  setAddressAsDefault,
  getDefaultAddressOnly,
  bulkDeleteAddresses,
  getAddressStats,
  geocodeAddress
};