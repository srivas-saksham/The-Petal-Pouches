// backend/src/routes/addresses.js

const express = require('express');
const router = express.Router();
const {
  getAddresses,
  getAddress,
  createNewAddress,
  updateExistingAddress,
  deleteExistingAddress,
  setAddressAsDefault,
  getDefaultAddressOnly,
  bulkDeleteAddresses,
  getAddressStats,
  geocodeAddress
} = require('../controllers/addressController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

// Apply security headers to all routes
router.use(customerSecurityHeaders);

// All routes require authentication
router.use(verifyCustomerToken);

// ==================== ADDRESS ROUTES ====================

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for authenticated user
 * @query   ?type=home&default_only=true
 * @access  Private (Customer)
 */
router.get('/', getAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Create new address
 * @access  Private (Customer)
 */
router.post('/', createNewAddress);

/**
 * @route   GET /api/addresses/default
 * @desc    Get default address only
 * @access  Private (Customer)
 * @note    Must be BEFORE /:id route to prevent conflict
 */
router.get('/default', getDefaultAddressOnly);

/**
 * @route   GET /api/addresses/stats
 * @desc    Get address statistics (count, types, etc)
 * @access  Private (Customer)
 * @note    Must be BEFORE /:id route to prevent conflict
 */
router.get('/stats', getAddressStats);

/**
 * @route   POST /api/addresses/geocode
 * @desc    Geocode address search (Mapbox/Nominatim)
 * @access  Private (Customer)
 */
router.post('/geocode', geocodeAddress);

/**
 * @route   DELETE /api/addresses/bulk
 * @desc    Bulk delete addresses
 * @body    { addressIds: [uuid1, uuid2, ...] }
 * @access  Private (Customer)
 */
router.delete('/bulk', bulkDeleteAddresses);

/**
 * @route   GET /api/addresses/:id
 * @desc    Get single address by ID
 * @access  Private (Customer)
 */
router.get('/:id', getAddress);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Update existing address
 * @access  Private (Customer)
 */
router.put('/:id', updateExistingAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete address
 * @access  Private (Customer)
 */
router.delete('/:id', deleteExistingAddress);

/**
 * @route   PATCH /api/addresses/:id/default
 * @desc    Set address as default
 * @access  Private (Customer)
 */
router.patch('/:id/default', setAddressAsDefault);

module.exports = router;