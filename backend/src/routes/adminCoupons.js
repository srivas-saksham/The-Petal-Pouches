// backend/src/routes/adminCoupons.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const AdminCouponController = require('../controllers/adminCouponController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

/**
 * Admin Coupon Routes
 * Base path: /api/admin/coupons
 * All routes require admin authentication
 */

// ⭐ IMPORTANT: Place specific routes BEFORE parameterized routes
// This prevents /:id from catching routes like /stats or /eligible-items

router.get('/', AdminCouponController.getAllCoupons);
router.post('/', AdminCouponController.createCoupon);

// ⭐ FIXED: Specific routes must come BEFORE /:id route
router.get('/:id/stats', AdminCouponController.getCouponStats);
router.get('/:id/eligible-items', AdminCouponController.getEligibleItems);
router.patch('/:id/toggle', AdminCouponController.toggleActive);

// ⭐ General /:id routes come AFTER specific ones
router.get('/:id', AdminCouponController.getCouponById);
router.put('/:id', AdminCouponController.updateCoupon);
router.delete('/:id', AdminCouponController.deleteCoupon);

module.exports = router;