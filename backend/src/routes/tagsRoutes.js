// backend/src/routes/tagsRoutes.js - BUNDLE TAGS ROUTES

const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTagsWithCounts,
  getTagByName,
  getPopularTags,
  getTagStats,
  createTag,
  updateTag,
  deleteTag,
  updateBundleTags,
  addTagToBundle,
  removeTagFromBundle
} = require('../controllers/tagsController');

// Optional: Import authentication middleware if you have it
// const { protect, admin } = require('../middleware/auth');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * GET /api/tags
 * Get all active tags
 * Query params:
 *   - active: 'true' | 'false' (default: 'true')
 *   - search: string (search tag name/label)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "uuid",
 *       name: "birthday",
 *       label: "Birthday Gifts",
 *       description: "Perfect gifts for birthdays",
 *       icon: "🎂",
 *       color: "#FF69B4",
 *       is_active: true,
 *       display_order: 1
 *     },
 *     ...
 *   ],
 *   count: 10
 * }
 */
router.get('/', getAllTags);

/**
 * GET /api/tags/with-counts
 * Get all tags with the count of bundles that have each tag
 * Perfect for building filter UI with bundle counts
 * 
 * Response includes bundle_count for each tag
 */
router.get('/with-counts', getTagsWithCounts);

/**
 * GET /api/tags/popular
 * Get popular tags sorted by bundle count
 * Query params:
 *   - limit: number (default: 10)
 * 
 * Returns top N most used tags
 */
router.get('/popular', getPopularTags);

/**
 * GET /api/tags/stats
 * Get tag statistics
 * Returns total tags, active tags, and bundle counts
 */
router.get('/stats', getTagStats);

/**
 * GET /api/tags/:name
 * Get single tag by name
 * Param: name (tag name, e.g., 'birthday')
 */
router.get('/:name', getTagByName);

// ========================================
// ADMIN ROUTES (Tag Management)
// ========================================

/**
 * POST /api/tags/admin
 * Create new tag (ADMIN ONLY)
 * Body:
 * {
 *   name: "birthday" (required, unique, lowercase),
 *   label: "Birthday Gifts" (required),
 *   icon: "🎂" (optional, default: '•'),
 *   color: "#FF69B4" (optional, default hex color),
 *   description: "Perfect gifts for birthdays" (optional),
 *   display_order: 1 (optional, default: 0)
 * }
 */
router.post('/admin', createTag);

/**
 * PUT /api/tags/admin/:id
 * Update tag (ADMIN ONLY)
 * Param: id (tag UUID)
 * Body: Any of the fields from POST (name is not updatable)
 */
router.put('/admin/:id', updateTag);

/**
 * DELETE /api/tags/admin/:id
 * Delete tag (ADMIN ONLY)
 * Param: id (tag UUID)
 * Note: This removes the tag definition but doesn't remove it from bundles' JSONB arrays
 */
router.delete('/admin/:id', deleteTag);

// ========================================
// BUNDLE TAG OPERATIONS
// ========================================

/**
 * POST /api/bundles/admin/:bundleId/tags
 * Update bundle tags
 * Param: bundleId (bundle UUID)
 * Body:
 * {
 *   tags: ["birthday", "anniversary"] (array of tag names)
 * }
 * 
 * This REPLACES all existing tags with the new array
 * Sets primary_tag to first tag in array
 */
router.post('/bundles/admin/:bundleId/tags', updateBundleTags);

/**
 * POST /api/bundles/admin/:bundleId/tags/add
 * Add single tag to bundle (without removing existing tags)
 * Param: bundleId (bundle UUID)
 * Body:
 * {
 *   tag: "birthday" (tag name to add)
 * }
 */
router.post('/bundles/admin/:bundleId/tags/add', addTagToBundle);

/**
 * DELETE /api/bundles/admin/:bundleId/tags/:tagName
 * Remove single tag from bundle
 * Params: 
 *   - bundleId (bundle UUID)
 *   - tagName (tag name to remove)
 */
router.delete('/bundles/admin/:bundleId/tags/:tagName', removeTagFromBundle);

module.exports = router;