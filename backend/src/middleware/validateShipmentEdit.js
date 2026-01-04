// backend/src/middleware/validateShipmentEdit.js
/**
 * Middleware for validating shipment edit requests
 * Checks request data before processing
 */

const ShipmentEditValidator = require('../utils/shipmentEditValidator');

/**
 * Validate edit request body
 * Ensures only valid fields are being updated
 */
const validateEditRequest = (req, res, next) => {
  try {
    const updateData = req.body;

    // Check if body exists
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
        code: 'MISSING_BODY'
      });
    }

    // Check if at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update',
        code: 'EMPTY_UPDATE'
      });
    }

    // Validate fields using validator
    const validation = ShipmentEditValidator.validateEditFields(updateData);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
        code: 'VALIDATION_FAILED'
      });
    }

    // If validation passed, continue
    next();

  } catch (error) {
    console.error('❌ Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

/**
 * Sanitize edit data
 * Removes unauthorized fields and trims strings
 */
const sanitizeEditData = (req, res, next) => {
  try {
    const updateData = req.body;

    // Allowed fields for editing
    const allowedFields = [
      'name',
      'phone',
      'add',
      'address', // alias for 'add'
      'products_desc',
      'weight',
      'shipment_height',
      'shipment_width',
      'shipment_length',
      'pt',
      'cod_amount',
      'admin_notes'
    ];

    // Create sanitized object
    const sanitized = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updateData[key];

        // Trim strings
        if (typeof value === 'string') {
          value = value.trim();
        }

        // Convert numeric strings to numbers
        if (['weight', 'shipment_height', 'shipment_width', 'shipment_length', 'cod_amount'].includes(key)) {
          value = parseFloat(value);
          if (isNaN(value)) {
            return res.status(400).json({
              success: false,
              message: `Invalid numeric value for field: ${key}`,
              code: 'INVALID_NUMBER'
            });
          }
        }

        // Normalize phone number
        if (key === 'phone') {
          value = String(value).replace(/\D/g, ''); // Remove non-digits
        }

        // Convert 'address' alias to 'add'
        if (key === 'address') {
          sanitized.add = value;
        } else {
          sanitized[key] = value;
        }
      }
    });

    // Replace body with sanitized data
    req.body = sanitized;

    console.log('✅ [Middleware] Sanitized edit data:', sanitized);

    next();

  } catch (error) {
    console.error('❌ Sanitization middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Data sanitization error',
      error: error.message
    });
  }
};

/**
 * Validate shipment ID parameter
 */
const validateShipmentId = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Shipment ID is required',
        code: 'MISSING_ID'
      });
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipment ID format',
        code: 'INVALID_ID'
      });
    }

    next();

  } catch (error) {
    console.error('❌ ID validation error:', error);
    res.status(500).json({
      success: false,
      message: 'ID validation error',
      error: error.message
    });
  }
};

/**
 * Rate limiting for edit requests (optional)
 * Prevents abuse - max 10 edits per minute per IP
 */
const rateLimitEdits = (() => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 10;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const ipRequests = requests.get(ip);
    
    // Clean old requests
    const validRequests = ipRequests.filter(time => now - time < WINDOW_MS);
    
    if (validRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many edit requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: Math.ceil(WINDOW_MS / 1000) // seconds
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    next();
  };
})();

/**
 * Log edit attempts for audit trail
 */
const logEditAttempt = (req, res, next) => {
  const { id } = req.params;
  const adminId = req.admin?.id || req.user?.id || 'unknown';
  const updateFields = Object.keys(req.body);

  console.log('📝 [EditAudit] Edit attempt:', {
    shipment_id: id,
    admin_id: adminId,
    fields: updateFields,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  next();
};

module.exports = {
  validateEditRequest,
  sanitizeEditData,
  validateShipmentId,
  rateLimitEdits,
  logEditAttempt
};