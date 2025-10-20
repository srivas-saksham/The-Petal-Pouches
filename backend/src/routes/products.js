// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById 
} = require('../controllers/productController');

// Public product routes (no multer needed - just reading data)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;