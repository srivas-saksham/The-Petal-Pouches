// backend/src/routes/otp.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const OTPController = require('../controllers/otpController');
const { 
  customerSecurityHeaders,
  rateLimitOTP 
} = require('../middleware/userAuth');

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// ⭐ CRITICAL: Apply rate limiting to ALL OTP endpoints
router.use(rateLimitOTP);

/**
 * OTP Routes
 * Base path: /api/otp
 * 
 * Security:
 * - Rate limited to 5 requests per 15 minutes per IP
 * - All endpoints are public (no auth required)
 * - OTP expires after 10 minutes
 */

router.post('/send', OTPController.sendOTP);
router.post('/verify', OTPController.verifyOTP);
router.post('/resend', OTPController.resendOTP);
router.get('/check-verified', OTPController.checkVerified);

module.exports = router;