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
    
    // ✅ Check token expiration explicitly
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Attach admin data to request object
    req.admin = decoded;
    
    // ✅ Optional: Log admin activity for security audit
    console.log(`[Admin Activity] ${decoded.email} accessed ${req.method} ${req.originalUrl}`);
    
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
      // ✅ Log unauthorized access attempt
      console.warn(`[Security] Admin ${req.admin.email} attempted to access resource requiring roles: ${allowedRoles.join(', ')}`);
      
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
      // ✅ Log unauthorized access attempt
      console.warn(`[Security] Admin ${req.admin.email} attempted to access resource requiring permission: ${permission}`);
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permission
      });
    }

    next();
  };
};

/**
 * ✅ FIXED: Rate limiting middleware for sensitive endpoints
 * Simple in-memory rate limiter (for production, use Redis)
 */
const loginAttempts = new Map();

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  const attempts = loginAttempts.get(ip).filter(time => now - time < windowMs);
  
  if (attempts.length >= maxAttempts) {
    console.warn(`[Security] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((attempts[0] + windowMs - now) / 1000)
    });
  }

  // ✅ Store the IP for cleanup on success
  req.rateLimitIp = ip;
  
  attempts.push(now);
  loginAttempts.set(ip, attempts);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of loginAttempts.entries()) {
      const filtered = value.filter(time => now - time < windowMs);
      if (filtered.length === 0) {
        loginAttempts.delete(key);
      } else {
        loginAttempts.set(key, filtered);
      }
    }
  }

  next();
};

/**
 * ✅ NEW: Clear rate limit on successful login
 */
const clearRateLimit = (ip) => {
  if (loginAttempts.has(ip)) {
    loginAttempts.delete(ip);
    console.log(`[Security] Rate limit cleared for IP: ${ip}`);
  }
};

/**
 * ✅ NEW: Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS only (if in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

module.exports = {
  verifyAdminToken,
  requireRole,
  requirePermission,
  rateLimitLogin,
  clearRateLimit, // ✅ NEW: Export rate limiter
  securityHeaders  // ✅ NEW: Export security headers
};