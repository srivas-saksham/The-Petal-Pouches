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

// Public routes
router.get('/products/:productId/variants', getVariantsByProductId);
router.get('/variants/:variantId', getVariantById);

// Admin routes
router.post('/admin/products/:productId/variants', createVariant);
router.put('/admin/variants/:variantId', updateVariant);
router.patch('/admin/variants/:variantId/stock', updateVariantStock);
router.post('/admin/variants/:variantId/image', upload.single('image'), uploadVariantImage);
router.delete('/admin/variants/:variantId', deleteVariant);

module.exports = router;