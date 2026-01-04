// backend/src/middleware/userAuth.js

const jwt = require('jsonwebtoken');

// ✅ ENFORCE SECRET - Application won't start without it
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set and at least 32 characters');
}

/**
 * Middleware to verify JWT token and authenticate customer users
 */
const verifyCustomerToken = (req, res, next) => {
  try {
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

    // ✅ Use enforced secret (no fallback)
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    req.user = decoded;
    
    // ✅ REMOVED: Don't log user emails/tokens
    
    next();
  } catch (error) {
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

    // ✅ Don't log error details in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Token verification error:', error.message);
    }
    
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
 * Rate limiting - Use express-rate-limit package instead
 */
const rateLimit = require('express-rate-limit');

const rateLimitCustomerLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Clear rate limit - Not needed with express-rate-limit
 */
const clearCustomerRateLimit = (ip) => {
  // No-op - express-rate-limit handles cleanup
};

/**
 * Security headers middleware
 */
const customerSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

/**
 * Optional auth for guest/authenticated routes
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (token) {
      // ✅ Use enforced secret
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Invalid token, continue as guest (don't log)
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