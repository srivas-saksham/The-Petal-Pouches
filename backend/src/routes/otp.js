// backend/src/routes/otp.js

const express = require('express');
const router = express.Router();
const OTPController = require('../controllers/otpController');
const { customerSecurityHeaders } = require('../middleware/userAuth');

/**
 * OTP Routes
 * Base path: /api/otp
 * Handles OTP generation, verification, and resend
 */

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// ==================== PUBLIC OTP ROUTES ====================

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to email
 * @access  Public
 * @body    { email, type, name? }
 * @types   'registration', 'password_reset', 'email_change'
 */
router.post('/send', OTPController.sendOTP);

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP code
 * @access  Public
 * @body    { email, otp, type }
 */
router.post('/verify', OTPController.verifyOTP);

/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP to email
 * @access  Public
 * @body    { email, type, name? }
 */
router.post('/resend', OTPController.resendOTP);

/**
 * @route   GET /api/otp/check-verified
 * @desc    Check if OTP has been verified
 * @access  Public
 * @query   email, type
 */
router.get('/check-verified', OTPController.checkVerified);

module.exports = router;