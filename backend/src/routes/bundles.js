// backend/src/routes/bundles.js - UPDATED WITH MULTIPLE IMAGE SUPPORT

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
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
  // NEW: Image-specific operations
  addBundleImages,
  deleteBundleImage,
  reorderBundleImages,
  setPrimaryBundleImage
} = require('../controllers/bundleController');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * GET /api/bundles
 * Get all bundles with optional filters
 * NOW RETURNS: images array with each bundle
 */
router.get('/', getAllBundles);

/**
 * GET /api/bundles/:id
 * Get single bundle details with basic info only
 * NOW RETURNS: images array included
 */
router.get('/:id', getBundleById);

/**
 * GET /api/bundles/:id/details
 * Get single bundle with all items and product details
 * NOW RETURNS: images array + product details
 */
router.get('/:id/details', getBundleDetails);

/**
 * GET /api/bundles/:id/stock
 * Check stock availability for all items in bundle
 */
router.get('/:id/stock', getBundleStock);

// ========================================
// ADMIN ROUTES (Bundle Management)
// ========================================

/**
 * POST /api/bundles/admin
 * Create new bundle
 * UPDATED: Now accepts multiple images
 * 
 * Content-Type: multipart/form-data
 * 
 * Form Fields:
 *   - images: file[] (NEW: array of images, 1-5 files)
 *   - image: file (BACKWARD COMPATIBLE: single image still works)
 *   - title: string (required)
 *   - description: string (optional)
 *   - price: number (required)
 *   - stock_limit: number (optional)
 *   - tags: JSON string (optional)
 *   - items: JSON string (required)
 * 
 * First image becomes primary by default
 */
router.post('/admin', upload.array('images', 5), createBundle);

/**
 * PUT /api/bundles/admin/:id
 * Update existing bundle
 * UPDATED: Now accepts multiple new images
 * 
 * Form Fields:
 *   - images: file[] (NEW: add new images)
 *   - image: file (BACKWARD COMPATIBLE: single image)
 *   - delete_image_ids: JSON string (array of image IDs to delete)
 *   - ... other fields same as POST
 */
router.put('/admin/:id', upload.array('images', 5), updateBundle);

/**
 * DELETE /api/bundles/admin/:id
 * Delete bundle (CASCADE deletes bundle_items and bundle_images)
 * UPDATED: Now deletes all images from Cloudinary
 */
router.delete('/admin/:id', deleteBundle);

/**
 * PATCH /api/bundles/admin/:id/toggle
 * Toggle bundle active/inactive status
 */
router.patch('/admin/:id/toggle', toggleBundleStatus);

/**
 * POST /api/bundles/admin/:id/duplicate
 * Duplicate existing bundle
 * UPDATED: Preserves all images from original bundle
 */
router.post('/admin/:id/duplicate', duplicateBundle);

// ========================================
// NEW: IMAGE-SPECIFIC ADMIN ROUTES
// ========================================

/**
 * POST /api/bundles/admin/:id/images
 * Add images to existing bundle
 * Body (multipart): images[] - array of image files
 */
router.post('/admin/:id/images', upload.array('images', 5), addBundleImages);

/**
 * DELETE /api/bundles/admin/:id/images/:imageId
 * Delete single image from bundle
 * Prevents deletion if it's the only image
 */
router.delete('/admin/:id/images/:imageId', deleteBundleImage);

/**
 * PATCH /api/bundles/admin/:id/images/reorder
 * Reorder images
 * Body: { order: [{ image_id, display_order }, ...] }
 */
router.patch('/admin/:id/images/reorder', reorderBundleImages);

/**
 * PATCH /api/bundles/admin/:id/images/:imageId/primary
 * Set image as primary
 * Automatically unsets other primary images
 */
router.patch('/admin/:id/images/:imageId/primary', setPrimaryBundleImage);

module.exports = router;