const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
// const { authenticateAdmin } = require('../middlewares/auth'); // TODO: Add later

// Admin product routes
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;