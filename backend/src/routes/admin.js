// backend/src/routes/admin.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

/**
 * Admin Product Routes
 * Base path: /api/admin
 * 
 * ⚠️ DEPRECATED: These routes exist for backward compatibility
 * NEW ROUTES: Use /api/products/admin instead (already secured)
 * 
 * Security:
 * - All routes require admin authentication
 */

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

/**
 * @route   POST /api/admin/products
 * @desc    Create new product (DEPRECATED - use /api/products/admin)
 * @access  Private (Admin)
 */
router.post('/products', upload.single('image'), createProduct);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product (DEPRECATED - use /api/products/admin/:id)
 * @access  Private (Admin)
 */
router.put('/products/:id', upload.single('image'), updateProduct);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product (DEPRECATED - use /api/products/admin/:id)
 * @access  Private (Admin)
 */
router.delete('/products/:id', deleteProduct);

module.exports = router;