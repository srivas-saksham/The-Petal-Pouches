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

// PUBLIC ROUTES
// Get all variants for a specific product
router.get('/products/:productId/variants', getVariantsByProductId);

// Get single variant details
router.get('/:variantId', getVariantById);

// ADMIN ROUTES
// Create new variant for a product
router.post('/admin/products/:productId/variants', createVariant);

// Update variant
router.put('/admin/:variantId', updateVariant);

// Update variant stock only (quick update)
router.patch('/admin/:variantId/stock', updateVariantStock);

// Upload variant image
router.post('/admin/:variantId/image', upload.single('image'), uploadVariantImage);

// Delete variant
router.delete('/admin/:variantId', deleteVariant);

module.exports = router;