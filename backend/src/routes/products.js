const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);

module.exports = router;