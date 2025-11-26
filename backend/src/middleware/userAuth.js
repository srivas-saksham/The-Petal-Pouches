// backend/src/middleware/userAuth.js

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate customer users
 */
const verifyCustomerToken = (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check token expiration explicitly
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Attach user data to request object
    req.user = decoded;
    
    // Log user activity for security audit (optional)
    console.log(`[Customer Activity] ${decoded.email} accessed ${req.method} ${req.originalUrl}`);
    
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
 * Optional middleware to verify email is verified
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

/**
 * Rate limiting middleware for sensitive customer endpoints
 * Simple in-memory rate limiter (for production, use Redis)
 */
const customerLoginAttempts = new Map();

const rateLimitCustomerLogin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!customerLoginAttempts.has(ip)) {
    customerLoginAttempts.set(ip, []);
  }

  const attempts = customerLoginAttempts.get(ip).filter(time => now - time < windowMs);
  
  if (attempts.length >= maxAttempts) {
    console.warn(`[Security] Customer rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((attempts[0] + windowMs - now) / 1000)
    });
  }

  // Store the IP for cleanup on success
  req.rateLimitIp = ip;
  
  attempts.push(now);
  customerLoginAttempts.set(ip, attempts);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of customerLoginAttempts.entries()) {
      const filtered = value.filter(time => now - time < windowMs);
      if (filtered.length === 0) {
        customerLoginAttempts.delete(key);
      } else {
        customerLoginAttempts.set(key, filtered);
      }
    }
  }

  next();
};

/**
 * Clear rate limit on successful login
 */
const clearCustomerRateLimit = (ip) => {
  if (customerLoginAttempts.has(ip)) {
    customerLoginAttempts.delete(ip);
    console.log(`[Security] Customer rate limit cleared for IP: ${ip}`);
  }
};

/**
 * Security headers middleware for customer routes
 */
const customerSecurityHeaders = (req, res, next) => {
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

/**
 * Optional middleware to attach user data from token without requiring authentication
 * Useful for routes that work for both authenticated and guest users
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without auth
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid, continue without auth
    console.log('Optional auth: Invalid token, continuing as guest');
  }
  
  next();
};

module.exports = {
  verifyCustomerToken,
  requireEmailVerified,
  rateLimitCustomerLogin,
  clearCustomerRateLimit,
  customerSecurityHeaders,
  optionalAuth
};