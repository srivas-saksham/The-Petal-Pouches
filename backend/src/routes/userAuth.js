// backend/src/routes/userAuth.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const UserAuthController = require('../controllers/userAuthController');
const { 
  verifyCustomerToken, 
  rateLimitCustomerLogin,
  rateLimitPasswordReset,
  rateLimitOTP,
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * User Authentication Routes
 * Base path: /api/auth
 * 
 * Security:
 * - Rate limiting on all sensitive endpoints
 * - JWT-based authentication (stateless)
 * - OTP verification for registration and password reset
 * - Public routes before protected routes
 */

// ========================================
// MIDDLEWARE (Applied to all routes)
// ========================================

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new customer - Step 1: Send OTP to email
 * @access  Public
 * @body    full_name - String (required)
 * @body    email - String (required, must be unique)
 * @body    password - String (required, min 8 chars)
 * @body    phone - String (optional)
 * @returns { success, message, tempUserId }
 * @security Rate limited to 5 requests per 15 minutes per IP
 */
router.post('/register', rateLimitOTP, UserAuthController.register);

/**
 * @route   POST /api/auth/register/complete
 * @desc    Complete registration after OTP verification - Step 2
 * @access  Public
 * @body    full_name - String (required)
 * @body    email - String (required)
 * @body    password - String (required)
 * @body    phone - String (optional)
 * @body    otp - String (required, 6 digits)
 * @returns { success, token, user }
 * @security Rate limited to 5 requests per 15 minutes per IP
 */
router.post('/register/complete', rateLimitOTP, UserAuthController.completeRegistration);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 * @body    email - String (required)
 * @body    password - String (required)
 * @returns { success, token, user }
 * @security Rate limited to 5 requests per 15 minutes per IP
 */
router.post('/login', rateLimitCustomerLogin, UserAuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset - Send OTP to email
 * @access  Public
 * @body    email - String (required)
 * @returns { success, message }
 * @security Rate limited to 3 requests per 15 minutes per IP
 */
router.post('/forgot-password', rateLimitPasswordReset, UserAuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP verification
 * @access  Public
 * @body    email - String (required)
 * @body    otp - String (required, 6 digits)
 * @body    password - String (required, min 8 chars)
 * @returns { success, message }
 * @security Rate limited to 5 requests per 15 minutes per IP
 */
router.post('/reset-password', rateLimitOTP, UserAuthController.resetPassword);

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Verify email using token from email link
 * @access  Public
 * @params  token - JWT token from verification email
 * @returns { success, message }
 * @note    Legacy endpoint - prefer OTP-based verification
 */
router.post('/verify-email/:token', UserAuthController.verifyEmail);

// ========================================
// OAUTH ROUTES (Google Sign-In)
// ========================================

/**
 * @route   POST /api/auth/oauth/google
 * @desc    Handle Google OAuth login/signup
 * @access  Public
 * @body    accessToken - Google OAuth access token
 * @returns { success, token, user, needsPassword?: boolean }
 * @note    If needsPassword=true, user must complete signup with password
 */
router.post('/oauth/google', UserAuthController.handleGoogleOAuth);

/**
 * @route   POST /api/auth/oauth/google/complete
 * @desc    Complete Google OAuth signup by setting password
 * @access  Public
 * @body    email - String (from Google)
 * @body    full_name - String (from Google)
 * @body    password - String (required for new users)
 * @returns { success, token, user }
 */
router.post('/oauth/google/complete', UserAuthController.completeGoogleOAuthSignup);

// ========================================
// PROTECTED ROUTES (Require authentication)
// ========================================

// Apply authentication to all routes below
router.use(verifyCustomerToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Customer)
 * @returns { user: { id, email, full_name, phone, email_verified, ... } }
 */
router.get('/me', UserAuthController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout customer (client-side token removal)
 * @access  Private (Customer)
 * @returns { success, message }
 * @note    JWT is stateless - actual logout happens client-side
 */
router.post('/logout', UserAuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token (get new token before expiration)
 * @access  Private (Customer)
 * @returns { success, token }
 */
router.post('/refresh', UserAuthController.refreshToken);

/**
 * @route   POST /api/auth/verify-email/request
 * @desc    Request email verification (send verification email)
 * @access  Private (Customer)
 * @returns { success, message }
 * @note    Sends verification link to user's email
 */
router.post('/verify-email/request', UserAuthController.requestEmailVerification);

/**
 * @route   POST /api/auth/change-password/request
 * @desc    Request password change - Send OTP to email
 * @access  Private (Customer)
 * @returns { success, message }
 * @security Requires current session authentication
 */
router.post('/change-password/request', UserAuthController.requestPasswordChange);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password with OTP verification
 * @access  Private (Customer)
 * @body    otp - String (required, 6 digits)
 * @body    currentPassword - String (required for verification)
 * @body    newPassword - String (required, min 8 chars)
 * @returns { success, message }
 * @security Requires current password + OTP verification
 */
router.put('/change-password', UserAuthController.changePassword);

module.exports = router;