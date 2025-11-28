// backend/src/routes/bundles.js - MODIFIED (preserving existing functionality)

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
  getBundleStock
} = require('../controllers/bundleController');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * GET /api/bundles
 * Get all bundles with optional filters
 * Query params:
 *   - active: 'true' | 'false' (filter by active status)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 *   - sort: 'created_at' | 'price_asc' | 'price_desc'
 *   - search: string (search in title/description)
 *   - min_price: number (minimum price filter)
 *   - max_price: number (maximum price filter)
 */
router.get('/', getAllBundles);

/**
 * GET /api/bundles/:id
 * Get single bundle details with basic info only
 */
router.get('/:id', getBundleById);

/**
 * GET /api/bundles/:id/details
 * Get single bundle with all items and product details (NO PRICES)
 * Returns bundle info + array of products/variants in the bundle
 */
router.get('/:id/details', getBundleDetails);

/**
 * GET /api/bundles/:id/stock
 * Check stock availability for all items in bundle
 * Returns which items are in stock or out of stock
 */
router.get('/:id/stock', getBundleStock);

// ========================================
// ADMIN ROUTES (Bundle Management)
// ========================================

/**
 * POST /api/bundles/admin
 * Create new bundle
 * Content-Type: multipart/form-data
 * Body:
 *   - image: file (optional - bundle display image)
 *   - title: string (required)
 *   - description: string (optional)
 *   - price: number (required - discounted bundle price)
 *   - stock_limit: number (optional - max bundles available)
 *   - items: JSON string (required - array of products/variants)
 *     Format: [{ product_id: uuid, variant_id: uuid?, quantity: number }]
 */
router.post('/admin', upload.single('image'), createBundle);

/**
 * PUT /api/bundles/admin/:id
 * Update existing bundle
 * Content-Type: multipart/form-data
 * Body: Same as POST, all fields optional except at least one must be provided
 */
router.put('/admin/:id', upload.single('image'), updateBundle);

/**
 * DELETE /api/bundles/admin/:id
 * Delete bundle (CASCADE deletes bundle_items)
 * Also deletes bundle image from Cloudinary
 */
router.delete('/admin/:id', deleteBundle);

/**
 * PATCH /api/bundles/admin/:id/toggle
 * Toggle bundle active/inactive status
 * No body required - automatically toggles current status
 */
router.patch('/admin/:id/toggle', toggleBundleStatus);

/**
 * POST /api/bundles/admin/:id/duplicate
 * Duplicate existing bundle with "(Copy)" suffix
 * Creates new bundle with same items but inactive by default
 * No body required
 */
router.post('/admin/:id/duplicate', duplicateBundle);

module.exports = router;