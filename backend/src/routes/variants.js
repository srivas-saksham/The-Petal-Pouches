// backend/src/routes/variants.js

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createVariant,
  getVariantsByProductId,
  getVariantById,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  uploadVariantImage
} = require('../controllers/variantController');

// ========================================
// PUBLIC ROUTES
// ========================================

// Get all variants for a product
// Accessible via: /api/products/:productId/variants (for bundle manager)
// Accessible via: /api/variants/products/:productId/variants (alternative)
router.get('/products/:productId/variants', getVariantsByProductId);

// Get single variant by ID
// Accessible via: /api/variants/:variantId
router.get('/:variantId', getVariantById);

// ========================================
// ADMIN ROUTES
// ========================================

// Create variant
router.post('/admin/products/:productId/variants', createVariant);

// Update variant - FIXED PATH
router.put('/admin/:variantId', updateVariant);

// Update variant stock only - FIXED PATH
router.patch('/admin/:variantId/stock', updateVariantStock);

// Upload variant image - FIXED PATH
router.post('/admin/:variantId/image', upload.single('image'), uploadVariantImage);

// Delete variant - FIXED PATH
router.delete('/admin/:variantId', deleteVariant);

module.exports = router;