// backend/src/routes/shop.js
const express = require('express');
const router = express.Router();
const ShopController = require('../controllers/shopController');

/**
 * Unified Shop Routes - Products + Bundles
 * All routes are PUBLIC (no auth required)
 */

// Get all shop items (products + bundles mixed)
// GET /api/shop/items?type=all&page=1&limit=20&sort=created_at&search=ring&tags=wedding
router.get('/items', ShopController.getAllItems);

// Get single item by type and ID
// GET /api/shop/product/:id  OR  GET /api/shop/bundle/:id
router.get('/:type/:id', ShopController.getItemById);

module.exports = router;