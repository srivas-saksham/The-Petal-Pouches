// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Admin product routes
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;