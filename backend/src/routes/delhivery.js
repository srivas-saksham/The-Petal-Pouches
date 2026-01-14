// backend/src/routes/delhivery.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const DelhiveryController = require('../controllers/delhiveryController');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS

/**
 * Delhivery Routes
 * PIN Serviceability & TAT Checking
 * 
 * Base path: /api/delhivery
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/delhivery/check-pin/:pincode
 * @desc    Check if a pincode is serviceable
 * @access  Public
 */
router.get('/check-pin/:pincode', DelhiveryController.checkPincode);

/**
 * @route   GET /api/delhivery/tat/:pincode
 * @desc    Get estimated delivery time (TAT)
 * @access  Public
 */
router.get('/tat/:pincode', DelhiveryController.getDeliveryTime);

/**
 * @route   GET /api/delhivery/check/:pincode
 * @desc    Combined serviceability + TAT check
 * @access  Public
 */
router.get('/check/:pincode', DelhiveryController.checkDelivery);

/**
 * @route   POST /api/delhivery/check-pins
 * @desc    Bulk pincode check (max 20 pincodes)
 * @access  Public
 * @note    Consider adding rate limiting if abuse is detected
 */
router.post('/check-pins', DelhiveryController.checkMultiplePincodes);

/**
 * @route   GET /api/delhivery/health
 * @desc    Check Delhivery API health
 * @access  Public
 */
router.get('/health', DelhiveryController.healthCheck);

// ==================== ADMIN ROUTES (Cache Management) ====================

/**
 * @route   GET /api/delhivery/cache/stats
 * @desc    Get cache statistics (hit/miss rates)
 * @access  Private (Admin only)
 */
router.get('/cache/stats', verifyAdminToken, DelhiveryController.getCacheStats);

/**
 * @route   DELETE /api/delhivery/cache
 * @desc    Clear all cached pincode data
 * @access  Private (Admin only)
 * @warning This forces fresh API calls and may impact performance
 */
router.delete('/cache', verifyAdminToken, DelhiveryController.clearCache);

module.exports = router;