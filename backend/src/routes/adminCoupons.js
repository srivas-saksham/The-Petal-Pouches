// backend/src/routes/adminCoupons.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const AdminCouponController = require('../controllers/adminCouponController');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

/**
 * Admin Coupon Routes
 * Base path: /api/admin/coupons
 * All routes require admin authentication
 */

router.get('/', AdminCouponController.getAllCoupons);
router.get('/:id', AdminCouponController.getCouponById);
router.post('/', AdminCouponController.createCoupon);
router.put('/:id', AdminCouponController.updateCoupon);
router.delete('/:id', AdminCouponController.deleteCoupon);
router.patch('/:id/toggle', AdminCouponController.toggleActive);
router.get('/:id/stats', AdminCouponController.getCouponStats);

module.exports = router;