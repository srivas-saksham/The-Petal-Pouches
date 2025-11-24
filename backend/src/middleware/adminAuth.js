// backend/src/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate admin users
 */
const verifyAdminToken = (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach admin data to request object
    req.admin = decoded;
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    // Generic error
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if admin has required role(s)
 * @param {string|string[]} roles - Single role or array of allowed roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // Ensure admin is authenticated first
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array for consistency
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if admin's role is in allowed roles
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.admin.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if admin has specific permission
 * @param {string} permission - Required permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admins have all permissions
    if (req.admin.role === 'admin') {
      return next();
    }

    // Check if admin has the specific permission
    const permissions = req.admin.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permission
      });
    }

    next();
  };
};

module.exports = {
  verifyAdminToken,
  requireRole,
  requirePermission
};