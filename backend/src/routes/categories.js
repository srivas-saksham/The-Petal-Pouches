// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (you'll add auth middleware later)
router.post('/admin', createCategory);
router.put('/admin/:id', updateCategory);
router.delete('/admin/:id', deleteCategory);

module.exports = router;