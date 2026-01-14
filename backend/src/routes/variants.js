// backend/src/routes/variants.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
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
router.get('/products/:productId/variants', getVariantsByProductId);
router.get('/:variantId', getVariantById);

// ⭐ ADMIN ROUTES - Apply authentication
router.use('/admin', verifyAdminToken);

router.post('/admin/products/:productId/variants', createVariant);
router.put('/admin/:variantId', updateVariant);
router.patch('/admin/:variantId/stock', updateVariantStock);
router.post('/admin/:variantId/image', upload.single('image'), uploadVariantImage);
router.delete('/admin/:variantId', deleteVariant);

module.exports = router;