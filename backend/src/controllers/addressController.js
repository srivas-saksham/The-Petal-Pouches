// backend/src/controllers/addressController.js

const supabase = require('../config/supabaseClient');
const AddressModel = require('../models/addressModel'); // Import the model to use its methods

/**
 * Address Controller
 * Handles customer address management with geocoding support
 */
const AddressController = {

  // ==================== GET ADDRESSES ====================
  
  /**
   * Get all addresses for authenticated user
   * GET /api/addresses
   */
  getAddresses: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await AddressModel.getUserAddresses(userId);

      res.status(200).json({
        success: true,
        count: result.length,
        addresses: result
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses',
        error: error.message
      });
    }
  },

  // ==================== GET ADDRESS BY ID ====================
  
  /**
   * Get single address by ID
   * GET /api/addresses/:id
   */
  getAddressById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const address = await AddressModel.getAddressById(id, userId);

      res.status(200).json({
        success: true,
        address
      });
    } catch (error) {
      if (error.code === 'ADDRESS_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      console.error('Get address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch address',
        error: error.message
      });
    }
  },

  // ==================== CREATE ADDRESS ====================
  
  /**
   * Create new address
   * POST /api/addresses
   */
  createAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const address = await AddressModel.createAddress(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        address
      });
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create address',
        error: error.message
      });
    }
  },

  // ==================== UPDATE ADDRESS ====================
  
  /**
   * Update existing address
   * PUT /api/addresses/:id
   */
  updateAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const address = await AddressModel.updateAddress(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address
      });
    } catch (error) {
      if (error.code === 'ADDRESS_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update address',
        error: error.message
      });
    }
  },

  // ==================== DELETE ADDRESS ====================
  
  /**
   * Delete address
   * DELETE /api/addresses/:id
   */
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await AddressModel.deleteAddress(id, userId);

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        was_default: result.wasDefault,
        new_default: result.newDefaultAddress
      });
    } catch (error) {
      if (error.code === 'ADDRESS_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
        error: error.message
      });
    }
  },

  // ==================== BULK DELETE ADDRESSES ====================

  /**
   * Bulk delete addresses
   * DELETE /api/addresses/bulk
   */
  bulkDeleteAddresses: async (req, res) => {
    try {
      const userId = req.user.id;
      const { addressIds } = req.body;

      if (!addressIds || !Array.isArray(addressIds) || addressIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of address IDs to delete'
        });
      }

      const result = await AddressModel.batchDeleteAddresses(addressIds, userId);

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} addresses`,
        result
      });
    } catch (error) {
      if (error.code === 'CANNOT_DELETE_ALL') {
        return res.status(400).json({ success: false, message: 'Cannot delete all addresses at once' });
      }
      console.error('Bulk delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete addresses',
        error: error.message
      });
    }
  },

  // ==================== SET DEFAULT ADDRESS ====================
  
  /**
   * Set address as default
   * PATCH /api/addresses/:id/default
   */
  setDefaultAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const address = await AddressModel.setDefaultAddress(id, userId);

      res.status(200).json({
        success: true,
        message: 'Default address updated',
        address
      });
    } catch (error) {
      if (error.code === 'ADDRESS_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default address',
        error: error.message
      });
    }
  },

  // ==================== GET DEFAULT ADDRESS ====================
  
  /**
   * Get user's default address
   * GET /api/addresses/default
   */
  getDefaultAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const address = await AddressModel.getDefaultAddress(userId);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'No default address found'
        });
      }

      res.status(200).json({
        success: true,
        address
      });
    } catch (error) {
      console.error('Get default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch default address',
        error: error.message
      });
    }
  },

  // ==================== GET ADDRESS STATS ====================

  /**
   * Get address count/stats
   * GET /api/addresses/stats
   */
  getAddressStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await AddressModel.getAddressCount(userId);
      const hasAddresses = await AddressModel.userHasAddresses(userId);

      res.status(200).json({
        success: true,
        stats: {
          total_addresses: count,
          has_addresses: hasAddresses
        }
      });
    } catch (error) {
      console.error('Get address stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch address statistics',
        error: error.message
      });
    }
  },

  // ==================== GEOCODE ADDRESS ====================
  
  /**
   * Geocode address (Placeholder)
   * POST /api/addresses/geocode
   */
  geocodeAddress: async (req, res) => {
    try {
      const { query } = req.body;
      // Mock response for now
      res.status(200).json({
        success: true,
        message: 'Geocoding service not yet implemented',
        results: []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Geocoding failed',
        error: error.message
      });
    }
  }

};

module.exports = AddressController;