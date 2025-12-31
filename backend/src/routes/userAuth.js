// backend/src/routes/userAuth.js

const express = require('express');
const router = express.Router();
const UserAuthController = require('../controllers/userAuthController');
const { 
  verifyCustomerToken, 
  rateLimitCustomerLogin,
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * User Authentication Routes
 * Base path: /api/auth
 */

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer - Step 1: Send OTP
 * @access  Public
 * @body    { name, email, password, phone? }
 */
router.post('/register', UserAuthController.register);

/**
 * @route   POST /api/auth/register/complete
 * @desc    Complete registration after OTP verification - Step 2
 * @access  Public
 * @body    { name, email, password, phone?, otp }
 */
router.post('/register/complete', UserAuthController.completeRegistration);

/**
 * @route   POST /api/auth/oauth/google
 * @desc    Handle Google OAuth callback
 * @access  Public
 * @body    { accessToken }
 */
router.post('/oauth/google', UserAuthController.handleGoogleOAuth);

/**
 * @route   POST /api/auth/oauth/google/complete
 * @desc    Complete Google OAuth signup with password
 * @access  Public
 * @body    { email, name, password }
 */
router.post('/oauth/google/complete', UserAuthController.completeGoogleOAuthSignup);

/**
 * @route   POST /api/auth/login
 * @desc    Login customer
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', rateLimitCustomerLogin, UserAuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset - Send OTP
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', UserAuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP verification
 * @access  Public
 * @body    { email, otp, password }
 */
router.post('/reset-password', UserAuthController.resetPassword);

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Verify email with token (legacy - kept for compatibility)
 * @access  Public
 * @params  token (JWT token from email)
 */
router.post('/verify-email/:token', UserAuthController.verifyEmail);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication

router.use(verifyCustomerToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private (Customer)
 */
router.get('/me', UserAuthController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout customer (client-side token removal)
 * @access  Private (Customer)
 */
router.post('/logout', UserAuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private (Customer)
 */
router.post('/refresh', UserAuthController.refreshToken);

/**
 * @route   POST /api/auth/verify-email/request
 * @desc    Request email verification (send email)
 * @access  Private (Customer)
 */
router.post('/verify-email/request', UserAuthController.requestEmailVerification);

/**
 * @route   POST /api/auth/change-password/request
 * @desc    Request password change - Send OTP
 * @access  Private (Customer)
 */
router.post('/change-password/request', UserAuthController.requestPasswordChange);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password with OTP verification
 * @access  Private (Customer)
 * @body    { otp, currentPassword, newPassword }
 */
router.put('/change-password', UserAuthController.changePassword);


module.exports = router;