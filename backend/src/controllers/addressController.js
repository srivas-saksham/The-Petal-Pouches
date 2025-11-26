// backend/src/controllers/addressController.js

const pool = require('../config/database');

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

      const result = await pool.query(
        `SELECT * FROM addresses 
         WHERE user_id = $1 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        addresses: result.rows
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

      const result = await pool.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      res.status(200).json({
        success: true,
        address: result.rows[0]
      });

    } catch (error) {
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
      const {
        line1,
        line2,
        city,
        state,
        country = 'India',
        zip_code,
        is_default = false,
        address_type = 'home',
        phone,
        landmark
      } = req.body;

      // Validation
      if (!line1 || !city || !state || !zip_code) {
        return res.status(400).json({
          success: false,
          message: 'Address line 1, city, state, and zip code are required'
        });
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await pool.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await pool.query(
        `INSERT INTO addresses 
         (user_id, line1, line2, city, state, country, zip_code, is_default, address_type, phone, landmark)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [userId, line1, line2, city, state, country, zip_code, is_default, address_type, phone, landmark]
      );

      console.log(`✅ Address created: ${result.rows[0].id}`);

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        address: result.rows[0]
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
      const {
        line1,
        line2,
        city,
        state,
        country,
        zip_code,
        is_default,
        address_type,
        phone,
        landmark
      } = req.body;

      // Check if address exists and belongs to user
      const existingAddress = await pool.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingAddress.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await pool.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2',
          [userId, id]
        );
      }

      const result = await pool.query(
        `UPDATE addresses 
         SET line1 = COALESCE($1, line1),
             line2 = COALESCE($2, line2),
             city = COALESCE($3, city),
             state = COALESCE($4, state),
             country = COALESCE($5, country),
             zip_code = COALESCE($6, zip_code),
             is_default = COALESCE($7, is_default),
             address_type = COALESCE($8, address_type),
             phone = COALESCE($9, phone),
             landmark = COALESCE($10, landmark)
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [line1, line2, city, state, country, zip_code, is_default, address_type, phone, landmark, id, userId]
      );

      console.log(`✅ Address updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address: result.rows[0]
      });

    } catch (error) {
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

      const result = await pool.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      console.log(`✅ Address deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });

    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
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

      // Check if address exists and belongs to user
      const existingAddress = await pool.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingAddress.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Unset all other defaults
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set this address as default
      const result = await pool.query(
        'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      console.log(`✅ Default address set: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Default address updated',
        address: result.rows[0]
      });

    } catch (error) {
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

      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 AND is_default = true',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No default address found'
        });
      }

      res.status(200).json({
        success: true,
        address: result.rows[0]
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

  // ==================== GEOCODE ADDRESS ====================
  
  /**
   * Geocode address (Mapbox/Nominatim fallback)
   * POST /api/addresses/geocode
   */
  geocodeAddress: async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query is required'
        });
      }

      // This would integrate with Mapbox or Nominatim
      // For now, return mock data (implement in geocodingService.js)
      
      res.status(200).json({
        success: true,
        message: 'Geocoding service not yet implemented',
        results: []
      });

    } catch (error) {
      console.error('Geocode error:', error);
      res.status(500).json({
        success: false,
        message: 'Geocoding failed',
        error: error.message
      });
    }
  }

};

module.exports = AddressController;