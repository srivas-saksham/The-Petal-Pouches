// backend/src/routes/delhivery.js
/**
 * Delhivery Routes
 * PIN Serviceability & TAT Checking
 * 
 * Base path: /api/delhivery
 * Public routes (no authentication required)
 */

const express = require('express');
const router = express.Router();
const DelhiveryController = require('../controllers/delhiveryController');

// ==================== PUBLIC ROUTES ====================

/**
 * Quick Pincode Serviceability Check
 * 
 * @route   GET /api/delhivery/check-pin/:pincode
 * @desc    Check if a pincode is serviceable
 * @access  Public
 * @param   pincode - 6-digit pincode
 * @query   useCache - Use cached results (default: true)
 * 
 * @example
 * curl -X GET "http://localhost:5000/api/delhivery/check-pin/400001"
 * 
 * @response
 * {
 *   "success": true,
 *   "pincode": "400001",
 *   "serviceable": true,
 *   "status": "Serviceable",
 *   "city": "Mumbai",
 *   "state": "MH",
 *   "features": {
 *     "cod": true,
 *     "prepaid": true,
 *     "pickup": true,
 *     "reverse": false,
 *     "cash": false
 *   },
 *   "fromCache": false
 * }
 */
router.get('/check-pin/:pincode', DelhiveryController.checkPincode);

/**
 * Get Estimated Delivery Time (TAT)
 * 
 * @route   GET /api/delhivery/tat/:pincode
 * @desc    Get estimated days & delivery date
 * @access  Public
 * @param   pincode - 6-digit destination pincode
 * @query   mode - 'S' (Surface, default) or 'E' (Express)
 * @query   originPin - Origin pincode (default: warehouse pincode)
 * @query   pickupDate - Expected pickup date (YYYY-MM-DD)
 * 
 * @example
 * curl -X GET "http://localhost:5000/api/delhivery/tat/400001?mode=S"
 * curl -X GET "http://localhost:5000/api/delhivery/tat/400001?mode=E&originPin=110001"
 * 
 * @response
 * {
 *   "success": true,
 *   "estimatedDays": 3,
 *   "expectedDeliveryDate": "2025-12-12",
 *   "mode": "Surface",
 *   "originPincode": "110001",
 *   "destinationPincode": "400001",
 *   "pickupDate": "2025-12-09"
 * }
 */
router.get('/tat/:pincode', DelhiveryController.getDeliveryTime);

/**
 * Combined Delivery Check (Serviceability + TAT)
 * 
 * @route   GET /api/delhivery/check/:pincode
 * @desc    Check serviceability AND get both Surface/Express TAT
 * @access  Public
 * @param   pincode - 6-digit destination pincode
 * @query   originPin - Origin pincode (optional)
 * 
 * Perfect for checkout flow - returns everything needed
 * 
 * @example
 * curl -X GET "http://localhost:5000/api/delhivery/check/400001"
 * 
 * @response
 * {
 *   "success": true,
 *   "pincode": "400001",
 *   "serviceable": true,
 *   "location": {
 *     "city": "Mumbai",
 *     "state": "MH"
 *   },
 *   "features": {
 *     "cod": true,
 *     "prepaid": true,
 *     "pickup": true,
 *     "reverse": false,
 *     "cash": false
 *   },
 *   "deliveryOptions": {
 *     "surface": {
 *       "mode": "Surface",
 *       "estimatedDays": 3,
 *       "deliveryDate": "2025-12-12",
 *       "cost": "₹50-80"
 *     },
 *     "express": {
 *       "mode": "Express",
 *       "estimatedDays": 2,
 *       "deliveryDate": "2025-12-11",
 *       "cost": "₹70-100"
 *     }
 *   },
 *   "bestOption": {
 *     "success": true,
 *     "estimatedDays": 2,
 *     "expectedDeliveryDate": "2025-12-11",
 *     "mode": "Express"
 *   }
 * }
 */
router.get('/check/:pincode', DelhiveryController.checkDelivery);

/**
 * Bulk Pincode Check
 * 
 * @route   POST /api/delhivery/check-pins
 * @desc    Check multiple pincodes at once
 * @access  Public
 * @body    { pincodes: ["400001", "400002", "400003"] }
 * @limit   Max 20 pincodes per request
 * 
 * @example
 * curl -X POST "http://localhost:5000/api/delhivery/check-pins" \
 *   -H "Content-Type: application/json" \
 *   -d '{"pincodes": ["400001", "400002", "400003"]}'
 * 
 * @response
 * {
 *   "success": true,
 *   "count": 3,
 *   "results": [
 *     {
 *       "pincode": "400001",
 *       "serviceable": true,
 *       "status": "Serviceable",
 *       "city": "Mumbai",
 *       "state": "MH"
 *     },
 *     ...
 *   ]
 * }
 */
router.post('/check-pins', DelhiveryController.checkMultiplePincodes);

/**
 * Health Check
 * 
 * @route   GET /api/delhivery/health
 * @desc    Check if Delhivery API is reachable
 * @access  Public
 * 
 * @example
 * curl -X GET "http://localhost:5000/api/delhivery/health"
 */
router.get('/health', DelhiveryController.healthCheck);

// ==================== CACHE MANAGEMENT ROUTES ====================

/**
 * Get Cache Statistics
 * 
 * @route   GET /api/delhivery/cache/stats
 * @desc    Get cache hit/miss statistics
 * @access  Public (consider protecting with auth)
 * 
 * @example
 * curl -X GET "http://localhost:5000/api/delhivery/cache/stats"
 */
router.get('/cache/stats', DelhiveryController.getCacheStats);

/**
 * Clear Cache
 * 
 * @route   DELETE /api/delhivery/cache
 * @desc    Clear all cached pincodes
 * @access  Public (consider protecting with auth)
 * 
 * @example
 * curl -X DELETE "http://localhost:5000/api/delhivery/cache"
 */
router.delete('/cache', DelhiveryController.clearCache);

module.exports = router;