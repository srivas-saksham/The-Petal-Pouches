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
 * @desc    Register a new customer account
 * @access  Public
 * @body    { name, email, password, phone? }
 */
router.post('/register', UserAuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login customer
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', rateLimitCustomerLogin, UserAuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', UserAuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 * @params  token (JWT token from email)
 * @body    { password }
 */
router.post('/reset-password/:token', UserAuthController.resetPassword);

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Verify email with token
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
 * @route   PUT /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private (Customer)
 * @body    { currentPassword, newPassword }
 */
router.put('/change-password', UserAuthController.changePassword);

module.exports = router;