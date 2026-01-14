// backend/src/routes/addresses.js
// ⭐ SERVERLESS-READY + FULLY SECURED

const express = require('express');
const router = express.Router();
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
  bulkDeleteAddresses,
  getAddressStats,
  geocodeAddress
} = require('../controllers/addressController');

const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

/**
 * Address Routes
 * Base path: /api/addresses
 * 
 * Security:
 * - All routes require JWT authentication
 * - User can only access/modify their own addresses
 * - Authorization verified in controller
 */

// ========================================
// MIDDLEWARE (Applied to all routes)
// ========================================

// Apply security headers
router.use(customerSecurityHeaders);

// Apply authentication to all routes
router.use(verifyCustomerToken);

// ========================================
// ADDRESS MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/addresses/default
 * @desc    Get default shipping address for logged-in user
 * @access  Private (Customer)
 * @returns Address object or null
 * @note    MUST be before /:id route to prevent route conflict
 */
router.get('/default', getDefaultAddress);

/**
 * @route   GET /api/addresses/stats
 * @desc    Get address statistics (total count, types breakdown)
 * @access  Private (Customer)
 * @returns { total: number, by_type: { home: number, office: number, other: number } }
 * @note    MUST be before /:id route to prevent route conflict
 */
router.get('/stats', getAddressStats);

/**
 * @route   POST /api/addresses/geocode
 * @desc    Geocode address search (autocomplete/validation)
 * @access  Private (Customer)
 * @body    query - Address search string
 * @returns { suggestions: [{ formatted_address, lat, lon, ... }] }
 * @note    Uses Mapbox/Nominatim API - has timeout limits
 */
router.post('/geocode', geocodeAddress);

/**
 * @route   DELETE /api/addresses/bulk
 * @desc    Bulk delete multiple addresses
 * @access  Private (Customer - own addresses only)
 * @body    { addressIds: [uuid1, uuid2, ...] }
 * @returns { success, deleted_count: number }
 * @note    Cannot delete default address
 */
router.delete('/bulk', bulkDeleteAddresses);

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for logged-in user
 * @access  Private (Customer)
 * @query   type - Filter by address type (home, office, other)
 * @query   default_only - Return only default address (true/false)
 * @returns Array of address objects
 */
router.get('/', getAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Create new address
 * @access  Private (Customer)
 * @body    full_name - String (required)
 * @body    phone - String (required)
 * @body    address_line_1 - String (required)
 * @body    address_line_2 - String (optional)
 * @body    city - String (required)
 * @body    state - String (required)
 * @body    pincode - String (required)
 * @body    address_type - Enum (home, office, other)
 * @body    is_default - Boolean (optional)
 * @returns Created address object
 */
router.post('/', createAddress);

/**
 * @route   GET /api/addresses/:id
 * @desc    Get single address by ID
 * @access  Private (Customer - own addresses only)
 * @params  id - Address UUID
 * @returns Address object
 */
router.get('/:id', getAddressById);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Update existing address
 * @access  Private (Customer - own addresses only)
 * @params  id - Address UUID
 * @body    Same fields as POST (all optional)
 * @returns Updated address object
 */
router.put('/:id', updateAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete address
 * @access  Private (Customer - own addresses only)
 * @params  id - Address UUID
 * @note    Cannot delete default address
 * @returns { success, message }
 */
router.delete('/:id', deleteAddress);

/**
 * @route   PATCH /api/addresses/:id/default
 * @desc    Set address as default shipping address
 * @access  Private (Customer - own addresses only)
 * @params  id - Address UUID
 * @note    Automatically unsets previous default address
 * @returns Updated address object
 */
router.patch('/:id/default', setDefaultAddress);

module.exports = router;