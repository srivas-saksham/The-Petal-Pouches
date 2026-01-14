// backend/src/routes/coupons.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const { 
  verifyCustomerToken,
  optionalCustomerAuth // ⭐ USE EXISTING MIDDLEWARE
} = require('../middleware/userAuth');

// ⭐ REMOVED: Insecure custom optionalCustomerAuth implementation

router.post('/validate', verifyCustomerToken, CouponController.validateCoupon);
router.get('/active', optionalCustomerAuth, CouponController.getActiveCoupons);
router.get('/:code/check-usage', verifyCustomerToken, CouponController.checkUserUsage);

module.exports = router;