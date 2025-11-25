// backend/src/middleware/addressValidation.js

const { body, param, validationResult } = require('express-validator');

/**
 * Validation rules for creating a new address
 */
const validateCreateAddress = [
  body('line1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Address line 1 must be between 5 and 255 characters')
    .trim(),

  body('line2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must not exceed 255 characters')
    .trim(),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('State can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Country can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('zip_code')
    .notEmpty()
    .withMessage('ZIP code is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('ZIP code must be exactly 6 digits for India')
    .trim(),

  body('address_type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be one of: home, work, other'),

  body('phone')
    .optional()
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits, optionally starting with +')
    .trim(),

  body('landmark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Landmark must not exceed 255 characters')
    .trim(),

  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean value'),

  // Custom validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation rules for updating an address
 */
const validateUpdateAddress = [
  param('id')
    .isUUID()
    .withMessage('Address ID must be a valid UUID'),

  body('line1')
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage('Address line 1 must be between 5 and 255 characters')
    .trim(),

  body('line2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must not exceed 255 characters')
    .trim(),

  body('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('state')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('State can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Country can only contain letters, spaces, hyphens, apostrophes, and periods')
    .trim(),

  body('zip_code')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('ZIP code must be exactly 6 digits for India')
    .trim(),

  body('address_type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be one of: home, work, other'),

  body('phone')
    .optional()
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits, optionally starting with +')
    .trim(),

  body('landmark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Landmark must not exceed 255 characters')
    .trim(),

  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean value'),

  // Custom validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation for address ID parameter
 */
const validateAddressId = [
  param('id')
    .isUUID()
    .withMessage('Address ID must be a valid UUID'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation for geocoding search
 */
const validateGeocodeSearch = [
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Search query must be between 3 and 255 characters')
    .trim(),

  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('country')
    .optional()
    .isLength({ max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geocoding validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation for setting default address
 */
const validateSetDefault = [
  param('id')
    .isUUID()
    .withMessage('Address ID must be a valid UUID'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID for default setting',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Custom middleware to check if user has reached address limit
 */
const checkAddressLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Import addressModel here to avoid circular dependency
    const { getAddressCount } = require('../models/addressModel');
    const addressCount = await getAddressCount(userId);

    // Limit to 10 addresses per user
    const ADDRESS_LIMIT = 10;
    
    if (addressCount >= ADDRESS_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${ADDRESS_LIMIT} addresses allowed per user`,
        currentCount: addressCount,
        limit: ADDRESS_LIMIT
      });
    }

    next();
  } catch (error) {
    console.error('Address limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check address limit',
      error: error.message
    });
  }
};

/**
 * Sanitize address data
 */
const sanitizeAddressData = (req, res, next) => {
  if (req.body) {
    // Trim all string fields
    const stringFields = ['line1', 'line2', 'city', 'state', 'country', 'zip_code', 'phone', 'landmark', 'address_type'];
    
    stringFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });

    // Set default country to India if not provided
    if (!req.body.country) {
      req.body.country = 'India';
    }

    // Set default address_type to home if not provided
    if (!req.body.address_type) {
      req.body.address_type = 'home';
    }

    // Convert is_default to boolean if provided
    if (req.body.is_default !== undefined) {
      req.body.is_default = Boolean(req.body.is_default);
    }
  }

  next();
};

module.exports = {
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressId,
  validateGeocodeSearch,
  validateSetDefault,
  checkAddressLimit,
  sanitizeAddressData
};