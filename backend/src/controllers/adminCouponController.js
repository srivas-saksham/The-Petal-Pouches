// backend/src/controllers/adminCouponController.js
/**
 * Admin Coupon Controller
 * Handles coupon management operations for admins
 */

const CouponModel = require('../models/couponModel');
const { validateCouponFormat } = require('../utils/couponHelpers');

const AdminCouponController = {

  // ==================== GET ALL COUPONS ====================

  /**
   * Get all coupons with filters and pagination
   * GET /api/admin/coupons
   */
  async getAllCoupons(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        search = null
      } = req.query;

      console.log(`📋 [AdminCoupon] Fetching coupons - Page: ${page}, Status: ${status || 'all'}`);

      const result = await CouponModel.getAllCoupons({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search
      });

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Get all error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== GET COUPON BY ID ====================

  /**
   * Get single coupon details
   * GET /api/admin/coupons/:id
   */
  async getCouponById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 [AdminCoupon] Fetching coupon: ${id}`);

      const coupon = await CouponModel.findById(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // Get usage stats
      const stats = await CouponModel.getCouponStats(id);

      return res.status(200).json({
        success: true,
        data: {
          ...coupon,
          stats
        }
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Get by ID error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== CREATE COUPON ====================

  /**
   * Create new coupon
   * POST /api/admin/coupons
   */
  async createCoupon(req, res) {
    try {
      const couponData = req.body;

      console.log(`➕ [AdminCoupon] Creating coupon: ${couponData.code}`);

      // Validate coupon code format
      const formatCheck = validateCouponFormat(couponData.code);
      if (!formatCheck.valid) {
        return res.status(400).json({
          success: false,
          message: formatCheck.error
        });
      }

      // Validate required fields
      if (!couponData.description) {
        return res.status(400).json({
          success: false,
          message: 'Description is required'
        });
      }

      if (!couponData.discount_type || !['Percent', 'Fixed'].includes(couponData.discount_type)) {
        return res.status(400).json({
          success: false,
          message: 'Valid discount type is required (Percent or Fixed)'
        });
      }

      if (!couponData.discount_value || couponData.discount_value <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Discount value must be greater than 0'
        });
      }

      if (!couponData.start_date || !couponData.end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Create coupon
      const coupon = await CouponModel.create(couponData);

      console.log(`✅ [AdminCoupon] Coupon created: ${coupon.code}`);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Create error:', error);

      if (error.message === 'COUPON_CODE_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'A coupon with this code already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== UPDATE COUPON ====================

  /**
   * Update existing coupon
   * PUT /api/admin/coupons/:id
   */
  async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log(`✏️ [AdminCoupon] Updating coupon: ${id}`);

      // Check if coupon exists
      const existing = await CouponModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // Validate code format if updating code
      if (updates.code) {
        const formatCheck = validateCouponFormat(updates.code);
        if (!formatCheck.valid) {
          return res.status(400).json({
            success: false,
            message: formatCheck.error
          });
        }
      }

      // Update coupon
      const coupon = await CouponModel.update(id, updates);

      console.log(`✅ [AdminCoupon] Coupon updated: ${coupon.code}`);

      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Update error:', error);

      if (error.message === 'COUPON_CODE_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'A coupon with this code already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== DELETE COUPON ====================

  /**
   * Delete coupon
   * DELETE /api/admin/coupons/:id
   */
  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;

      console.log(`🗑️ [AdminCoupon] Deleting coupon: ${id}`);

      // Check if coupon exists
      const existing = await CouponModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // Delete coupon
      await CouponModel.delete(id);

      console.log(`✅ [AdminCoupon] Coupon deleted: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Delete error:', error);

      if (error.message === 'COUPON_IN_USE') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete coupon that has been used'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to delete coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== TOGGLE ACTIVE STATUS ====================

  /**
   * Toggle coupon active status
   * PATCH /api/admin/coupons/:id/toggle
   */
  async toggleActive(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔄 [AdminCoupon] Toggling active status: ${id}`);

      // Check if coupon exists
      const existing = await CouponModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // Toggle active status
      const coupon = await CouponModel.update(id, {
        is_active: !existing.is_active
      });

      console.log(`✅ [AdminCoupon] Status toggled: ${coupon.is_active ? 'Active' : 'Inactive'}`);

      return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.is_active ? 'activated' : 'deactivated'} successfully`,
        data: coupon
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Toggle error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle coupon status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== GET COUPON STATS ====================

  /**
   * Get coupon usage statistics
   * GET /api/admin/coupons/:id/stats
   */
  async getCouponStats(req, res) {
    try {
      const { id } = req.params;

      console.log(`📊 [AdminCoupon] Fetching stats: ${id}`);

      const stats = await CouponModel.getCouponStats(id);

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ [AdminCoupon] Get stats error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon stats',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

};

module.exports = AdminCouponController;