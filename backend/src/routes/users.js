// backend/src/routes/users.js
// ⭐ SERVERLESS-READY + FULLY SECURED

const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/userProfileController');
const { verifyCustomerToken, customerSecurityHeaders } = require('../middleware/userAuth');

/**
 * User Profile Routes
 * Base path: /api/users
 * 
 * Security:
 * - All routes require JWT authentication
 * - User can only access/modify their own profile
 * - Sensitive operations (email change, account deletion) require password verification
 */

// ========================================
// MIDDLEWARE (Applied to all routes)
// ========================================

// Apply security headers
router.use(customerSecurityHeaders);

// Apply authentication to all routes
router.use(verifyCustomerToken);

// ========================================
// DASHBOARD & OVERVIEW ROUTES
// ========================================

/**
 * @route   GET /api/users/dashboard
 * @desc    Get dashboard overview statistics
 * @access  Private (Customer)
 * @returns { total_orders, total_spent, pending_orders, wishlist_count, recent_activity: [] }
 * @note    Aggregates data from orders, wishlist, and profile
 */
router.get('/dashboard', UserProfileController.getDashboardStats);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications (order updates, promotions, etc.)
 * @access  Private (Customer)
 * @query   unread_only - Filter unread notifications (true/false)
 * @query   limit - Number of notifications (default: 20)
 * @returns { notifications: [], unread_count: number }
 */
router.get('/notifications', UserProfileController.getNotifications);

// ========================================
// PROFILE MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/users/profile
 * @desc    Get complete user profile with statistics
 * @access  Private (Customer)
 * @returns { user: {...}, stats: { orders, wishlist, addresses } }
 */
router.get('/profile', UserProfileController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update basic user profile (name, phone)
 * @access  Private (Customer)
 * @body    full_name - String (optional)
 * @body    phone - String (optional, must be unique)
 * @returns Updated user object
 * @note    Does NOT require password for basic updates
 */
router.put('/profile', UserProfileController.updateProfile);

/**
 * @route   PUT /api/users/email
 * @desc    Update user email address
 * @access  Private (Customer)
 * @body    email - String (required, must be unique)
 * @body    password - String (required for verification)
 * @returns { success, message }
 * @security Password verification required
 * @note    May trigger email verification flow
 */
router.put('/email', UserProfileController.updateEmail);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete/deactivate user account
 * @access  Private (Customer)
 * @body    password - String (required for verification)
 * @body    confirmDelete - Boolean (must be true)
 * @returns { success, message }
 * @security Password verification + explicit confirmation required
 * @note    This may be a soft delete (deactivation) or hard delete
 * @warning Irreversible action - deletes all user data
 */
router.delete('/account', UserProfileController.deleteAccount);

module.exports = router;