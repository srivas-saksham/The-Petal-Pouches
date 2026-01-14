// backend/src/routes/shop.js
// ⭐ SERVERLESS-READY (No changes needed)

const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/shopController');

// ========================================
// PUBLIC ROUTES (Customer Browsing)
// ========================================

/**
 * @route   GET /api/shop/items
 * @desc    Get all shop items (products + bundles mixed)
 * @access  Public
 * @query   type - Filter by 'product', 'bundle', or 'all' (default: all)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @query   sort - Sort by field (default: created_at)
 * @query   search - Search term (searches title/description)
 * @query   tags - Filter by tags (comma-separated)
 * @returns { items: [], total: number, page: number, limit: number }
 */
router.get('/items', ShopController.getAllItems);

/**
 * @route   GET /api/shop/:type/:id
 * @desc    Get single item by type and ID
 * @access  Public
 * @params  type - 'product' or 'bundle'
 * @params  id - Item UUID
 * @returns Product or Bundle object with full details
 */
router.get('/:type/:id', ShopController.getItemById);

module.exports = router;