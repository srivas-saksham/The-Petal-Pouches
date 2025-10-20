// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (no multer needed - categories don't have images)
router.post('/admin', createCategory);
router.put('/admin/:id', updateCategory);
router.delete('/admin/:id', deleteCategory);

module.exports = router;