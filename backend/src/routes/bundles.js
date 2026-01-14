// backend/src/routes/bundles.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
const {
  createBundle,
  getAllBundles,
  getBundleById,
  getBundleDetails,
  updateBundle,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  getBundleStock,
  addBundleImages,
  deleteBundleImage,
  reorderBundleImages,
  setPrimaryBundleImage
} = require('../controllers/bundleController');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * @route   GET /api/bundles
 * @desc    Get all bundles with optional filters
 * @access  Public
 * @returns Array of bundles with images
 */
router.get('/', getAllBundles);

/**
 * @route   GET /api/bundles/:id
 * @desc    Get single bundle basic info
 * @access  Public
 * @returns Bundle object with images array
 */
router.get('/:id', getBundleById);

/**
 * @route   GET /api/bundles/:id/details
 * @desc    Get bundle with all items and product details
 * @access  Public
 * @returns Bundle with expanded product info
 */
router.get('/:id/details', getBundleDetails);

/**
 * @route   GET /api/bundles/:id/stock
 * @desc    Check stock availability for bundle
 * @access  Public
 * @returns Stock status for all items
 */
router.get('/:id/stock', getBundleStock);

// ========================================
// ADMIN ROUTES (Bundle Management)
// ⭐ SECURITY: All admin routes protected
// ========================================

/**
 * @route   POST /api/bundles/admin
 * @desc    Create new bundle with images
 * @access  Private (Admin only)
 * @body    Form-data with images[] and bundle fields
 */
router.post('/admin', verifyAdminToken, upload.array('images', 5), createBundle);

/**
 * @route   PUT /api/bundles/admin/:id
 * @desc    Update existing bundle
 * @access  Private (Admin only)
 * @body    Form-data with optional new images[]
 */
router.put('/admin/:id', verifyAdminToken, upload.array('images', 5), updateBundle);

/**
 * @route   DELETE /api/bundles/admin/:id
 * @desc    Delete bundle (CASCADE deletes items and images)
 * @access  Private (Admin only)
 */
router.delete('/admin/:id', verifyAdminToken, deleteBundle);

/**
 * @route   PATCH /api/bundles/admin/:id/toggle
 * @desc    Toggle bundle active/inactive status
 * @access  Private (Admin only)
 */
router.patch('/admin/:id/toggle', verifyAdminToken, toggleBundleStatus);

/**
 * @route   POST /api/bundles/admin/:id/duplicate
 * @desc    Duplicate existing bundle with all images
 * @access  Private (Admin only)
 */
router.post('/admin/:id/duplicate', verifyAdminToken, duplicateBundle);

// ========================================
// IMAGE-SPECIFIC ADMIN ROUTES
// ⭐ SECURITY: All image management protected
// ========================================

/**
 * @route   POST /api/bundles/admin/:id/images
 * @desc    Add images to existing bundle
 * @access  Private (Admin only)
 */
router.post('/admin/:id/images', verifyAdminToken, upload.array('images', 5), addBundleImages);

/**
 * @route   DELETE /api/bundles/admin/:id/images/:imageId
 * @desc    Delete single image from bundle
 * @access  Private (Admin only)
 */
router.delete('/admin/:id/images/:imageId', verifyAdminToken, deleteBundleImage);

/**
 * @route   PATCH /api/bundles/admin/:id/images/reorder
 * @desc    Reorder bundle images
 * @access  Private (Admin only)
 * @body    { order: [{ image_id, display_order }, ...] }
 */
router.patch('/admin/:id/images/reorder', verifyAdminToken, reorderBundleImages);

/**
 * @route   PATCH /api/bundles/admin/:id/images/:imageId/primary
 * @desc    Set image as primary
 * @access  Private (Admin only)
 */
router.patch('/admin/:id/images/:imageId/primary', verifyAdminToken, setPrimaryBundleImage);

module.exports = router;