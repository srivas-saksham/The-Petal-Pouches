// backend/src/routes/adminCoupons.js
/**
 * Admin Coupon Routes
 * Base path: /api/admin/coupons
 */

const express = require('express');
const router = express.Router();
const AdminCouponController = require('../controllers/adminCouponController');

// All routes require admin authentication

// ==================== COUPON CRUD ====================

/**
 * @route   GET /api/admin/coupons
 * @desc    Get all coupons with filters
 * @access  Private (Admin)
 * @query   { page, limit, status, search }
 */
router.get('/', AdminCouponController.getAllCoupons);

/**
 * @route   GET /api/admin/coupons/:id
 * @desc    Get single coupon by ID
 * @access  Private (Admin)
 */
router.get('/:id', AdminCouponController.getCouponById);

/**
 * @route   POST /api/admin/coupons
 * @desc    Create new coupon
 * @access  Private (Admin)
 * @body    { code, description, discount_type, discount_value, ... }
 */
router.post('/', AdminCouponController.createCoupon);

/**
 * @route   PUT /api/admin/coupons/:id
 * @desc    Update existing coupon
 * @access  Private (Admin)
 * @body    { any coupon fields to update }
 */
router.put('/:id', AdminCouponController.updateCoupon);

/**
 * @route   DELETE /api/admin/coupons/:id
 * @desc    Delete coupon
 * @access  Private (Admin)
 */
router.delete('/:id', AdminCouponController.deleteCoupon);

/**
 * @route   PATCH /api/admin/coupons/:id/toggle
 * @desc    Toggle coupon active status
 * @access  Private (Admin)
 */
router.patch('/:id/toggle', AdminCouponController.toggleActive);

/**
 * @route   GET /api/admin/coupons/:id/stats
 * @desc    Get coupon usage statistics
 * @access  Private (Admin)
 */
router.get('/:id/stats', AdminCouponController.getCouponStats);

module.exports = router;