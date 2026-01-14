// backend/src/routes/categories.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// ========================================
// PUBLIC ROUTES (Customer-facing)
// ========================================

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @returns Array of categories
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 * @returns Category object
 */
router.get('/:id', getCategoryById);

// ========================================
// ADMIN ROUTES (Category Management)
// ⭐ SECURITY: All admin routes protected
// ========================================

/**
 * @route   POST /api/categories/admin
 * @desc    Create new category
 * @access  Private (Admin only)
 * @body    { name: string }
 */
router.post('/admin', verifyAdminToken, createCategory);

/**
 * @route   PUT /api/categories/admin/:id
 * @desc    Update existing category
 * @access  Private (Admin only)
 * @body    { name: string }
 */
router.put('/admin/:id', verifyAdminToken, updateCategory);

/**
 * @route   DELETE /api/categories/admin/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 * @note    May orphan products if no CASCADE rule
 */
router.delete('/admin/:id', verifyAdminToken, deleteCategory);

module.exports = router;