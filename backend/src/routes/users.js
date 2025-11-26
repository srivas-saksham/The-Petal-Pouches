// backend/src/routes/users.js

const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/userProfileController');
const { verifyCustomerToken, customerSecurityHeaders } = require('../middleware/userAuth');

/**
 * User Profile Routes
 * Base path: /api/users
 * All routes require authentication
 */

// Apply security headers
router.use(customerSecurityHeaders);

// Apply authentication to all routes
router.use(verifyCustomerToken);

// ==================== PROFILE ROUTES ====================

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with statistics
 * @access  Private (Customer)
 */
router.get('/profile', UserProfileController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (name, phone)
 * @access  Private (Customer)
 * @body    { name, phone? }
 */
router.put('/profile', UserProfileController.updateProfile);

/**
 * @route   PUT /api/users/email
 * @desc    Update user email
 * @access  Private (Customer)
 * @body    { email, password }
 */
router.put('/email', UserProfileController.updateEmail);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete/deactivate user account
 * @access  Private (Customer)
 * @body    { password, confirmDelete: true }
 */
router.delete('/account', UserProfileController.deleteAccount);

// ==================== DASHBOARD ROUTES ====================

/**
 * @route   GET /api/users/dashboard
 * @desc    Get dashboard overview statistics
 * @access  Private (Customer)
 */
router.get('/dashboard', UserProfileController.getDashboardStats);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private (Customer)
 */
router.get('/notifications', UserProfileController.getNotifications);

module.exports = router;