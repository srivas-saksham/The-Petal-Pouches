// backend/src/routes/coupons.js
/**
 * Coupon Routes (Customer-facing)
 * Base path: /api/coupons
 * ⭐ UPDATED: Added optional auth middleware for personalized coupon filtering
 */

const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const { verifyCustomerToken } = require('../middleware/userAuth');

// ==================== OPTIONAL AUTH MIDDLEWARE ====================

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't block if missing
 * Sets req.user if token is valid, otherwise leaves it undefined
 * This allows both guest and authenticated users to access the route
 */
const optionalCustomerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If no token, continue as guest
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('ℹ️ [OptionalAuth] No token - continuing as guest');
    return next();
  }

  // If token exists, try to verify it
  const token = authHeader.substring(7);
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Set user if token is valid
    console.log(`✅ [OptionalAuth] Token verified for user: ${decoded.id}`);
  } catch (error) {
    // Invalid token - continue as guest (don't block)
    console.log('⚠️ [OptionalAuth] Invalid token - continuing as guest:', error.message);
  }
  
  next();
};

// ==================== PUBLIC/PROTECTED ROUTES ====================

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate a coupon code
 * @access  Private (Customer)
 * @body    { code: string, cart_total: number }
 * @returns { success: boolean, data: { coupon, discount, savings_text } }
 */
router.post('/validate', verifyCustomerToken, CouponController.validateCoupon);

/**
 * @route   GET /api/coupons/active
 * @desc    Get all active coupons with unlock status
 * @access  Public with optional auth (guests see all coupons, logged-in users see filtered coupons)
 * @query   { cart_total?: number }
 * @returns { success: boolean, data: { all_coupons, unlocked_coupons, locked_coupons } }
 * 
 * ⭐ BEHAVIOR:
 * - Guest users: See all active coupons
 * - Logged-in users: See only coupons they haven't exhausted (usage < usage_per_user)
 * - Coupons sorted by min_order_value ascending (lowest unlock requirement first)
 */
router.get('/active', optionalCustomerAuth, CouponController.getActiveCoupons);

/**
 * @route   GET /api/coupons/:code/check-usage
 * @desc    Check if user can use a specific coupon
 * @access  Private (Customer)
 * @returns { success: boolean, data: { usage_count, usage_limit, can_use } }
 */
router.get('/:code/check-usage', verifyCustomerToken, CouponController.checkUserUsage);

// ==================== EXPORT ====================

module.exports = router;