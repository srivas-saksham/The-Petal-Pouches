// backend/src/routes/bundleRoutes.js - UPDATED WITH TAG SUPPORT

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
 * 
 * Query params:
 *   - active: 'true' | 'false' (filter by active status, default: true)
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - sort: 'created_at' | 'price' | 'title' | 'discount_percent' (default: 'created_at')
 *   - order: 'asc' | 'desc' (default varies by sort)
 *   - search: string (search in title/description)
 *   - min_price: number (minimum price filter)
 *   - max_price: number (maximum price filter)
 *   - in_stock: 'true' (filter only in-stock bundles)
 *   - tags: 'birthday,anniversary' (comma-separated tag names - FILTERS bundles with ANY of these tags)
 * 
 * Examples:
 *   GET /api/bundles?tags=birthday
 *   GET /api/bundles?tags=birthday,anniversary&in_stock=true&sort=price&order=asc
 *   GET /api/bundles?search=special&min_price=500&max_price=2000
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "uuid",
 *       title: "Birthday Special",
 *       price: 1299,
 *       tags: ["birthday", "gift"],
 *       primary_tag: "birthday",
 *       ...other fields
 *     },
 *     ...
 *   ],
 *   metadata: {
 *     totalCount: 45,
 *     totalPages: 3,
 *     currentPage: 1,
 *     limit: 20,
 *     hasMore: true
 *   }
 * }
 */
router.get('/', getAllBundles);

/**
 * GET /api/bundles/:id
 * Get single bundle details with basic info only
 * Returns bundle info with stock status
 */
router.get('/:id', getBundleById);

/**
 * GET /api/bundles/:id/details
 * Get single bundle with all items and product details
 * Returns bundle info + array of products/variants in the bundle
 * Does NOT return product prices to customers
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
 * 
 * Form Fields:
 *   - image: file (optional - bundle display image)
 *   - title: string (required)
 *   - description: string (optional)
 *   - price: number (required - discounted bundle price)
 *   - stock_limit: number (optional - max bundles available)
 *   - tags: JSON string (optional - array of tag names)
 *     Example: '["birthday", "gift"]'
 *   - items: JSON string (required - array of products/variants)
 *     Format: [
 *       { 
 *         product_id: "uuid", 
 *         variant_id: "uuid" (optional),
 *         quantity: number 
 *       }
 *     ]
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Bundle created successfully",
 *   data: {
 *     id: "uuid",
 *     title: "Bundle Title",
 *     tags: ["birthday"],
 *     primary_tag: "birthday",
 *     ...other fields
 *   }
 * }
 */
router.post('/admin', upload.single('image'), createBundle);

/**
 * PUT /api/bundles/admin/:id
 * Update existing bundle
 * Content-Type: multipart/form-data
 * 
 * Param: id (bundle UUID)
 * Body: Same as POST, all fields optional except at least one must be provided
 * Can update tags, items, pricing, etc.
 */
router.put('/admin/:id', upload.single('image'), updateBundle);

/**
 * DELETE /api/bundles/admin/:id
 * Delete bundle (CASCADE deletes bundle_items)
 * Also deletes bundle image from Cloudinary
 * 
 * Param: id (bundle UUID)
 */
router.delete('/admin/:id', deleteBundle);

/**
 * PATCH /api/bundles/admin/:id/toggle
 * Toggle bundle active/inactive status
 * No body required - automatically toggles current status
 * 
 * Param: id (bundle UUID)
 */
router.patch('/admin/:id/toggle', toggleBundleStatus);

/**
 * POST /api/bundles/admin/:id/duplicate
 * Duplicate existing bundle with "(Copy)" suffix
 * Creates new bundle with same items but inactive by default
 * Preserves all tags from original bundle
 * 
 * Param: id (bundle UUID)
 * No body required
 */
router.post('/admin/:id/duplicate', duplicateBundle);

/**
 * TAG OPERATIONS
 * Note: Tag routes are in tagsRoutes.js
 * POST /api/bundles/admin/:bundleId/tags - Update bundle tags
 * POST /api/bundles/admin/:bundleId/tags/add - Add tag to bundle
 * DELETE /api/bundles/admin/:bundleId/tags/:tagName - Remove tag from bundle
 */

module.exports = router;