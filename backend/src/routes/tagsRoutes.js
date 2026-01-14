// backend/src/routes/tagsRoutes.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
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

// PUBLIC ROUTES
router.get('/', getAllTags);
router.get('/with-counts', getTagsWithCounts);
router.get('/popular', getPopularTags);
router.get('/stats', getTagStats);
router.get('/:name', getTagByName);

// ⭐ ADMIN ROUTES - Apply authentication
router.use('/admin', verifyAdminToken); // Protects all /admin/* routes

router.post('/admin', createTag);
router.put('/admin/:id', updateTag);
router.delete('/admin/:id', deleteTag);
router.post('/bundles/admin/:bundleId/tags', updateBundleTags);
router.post('/bundles/admin/:bundleId/tags/add', addTagToBundle);
router.delete('/bundles/admin/:bundleId/tags/:tagName', removeTagFromBundle);

module.exports = router;