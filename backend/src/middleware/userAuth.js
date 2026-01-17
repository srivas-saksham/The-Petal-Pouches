// backend/src/middleware/userAuth.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

// ========================================
// JWT SECRET ENFORCEMENT
// ========================================

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set and at least 32 characters');
}

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================

/**
 * Verify JWT token and authenticate customer users
 * @access Private routes only
 * @returns req.user = { userId, email, ... }
 */
const verifyCustomerToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check expiration manually (defense in depth)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Attach decoded user data to request
    req.user = decoded;
    
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

    // Don't log error details in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Token verification error:', error.message);
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Optional authentication for routes that support both guest and authenticated users
 * Used for: Cart, Wishlist (guest mode), etc.
 * 
 * Flow:
 * 1. If JWT token present and valid → req.user = decoded token
 * 2. If no token or invalid token → Check x-session-id header
 * 3. If session ID present → req.sessionId = validated UUID
 * 4. If neither → Continue (controller handles empty state)
 * 
 * @returns req.user (if authenticated) OR req.sessionId (if guest) OR neither
 */
const optionalCustomerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 🔍 DEBUG: Log incoming authentication headers
    console.log('🔍 [optionalCustomerAuth] Headers:', {
      hasAuth: !!authHeader,
      hasSessionId: !!req.headers['x-session-id'],
      authPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });
    
    // ===== CASE 1: JWT TOKEN PROVIDED (AUTHENTICATED USER) =====
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          // Verify token signature
          const decoded = jwt.verify(token, JWT_SECRET);
          
          // ⭐ FIX: Support both 'userId' and 'id' token formats
          const userId = decoded.userId || decoded.id;
          
          // 🔍 DEBUG: Log decoded token info
          console.log('✅ [optionalCustomerAuth] Token decoded:', {
            hasUserId: !!decoded.userId,
            hasId: !!decoded.id,
            extractedUserId: userId,
            exp: decoded.exp,
            currentTime: Math.floor(Date.now() / 1000),
            isExpired: decoded.exp ? decoded.exp < Math.floor(Date.now() / 1000) : false
          });
          
          // Check expiration
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired - fall through to guest session
            console.log('ℹ️ [Auth] Expired token, treating as guest');
          } else {
            // ✅ Valid token - verify user still exists
            const { data: user, error } = await supabase
              .from('Users')
              .select('id, email, phone, name, email_verified')
              .eq('id', userId)  // ⭐ Use extracted userId
              .single();

            // 🔍 DEBUG: Log database lookup result
            console.log('🔍 [optionalCustomerAuth] DB lookup:', {
              tokenUserId: userId,
              hasError: !!error,
              hasUser: !!user,
              errorCode: error?.code,
              errorMessage: error?.message
            });

            if (!error && user) {
              // ✅ Authenticated user with verified account
              req.user = {
                id: user.id,
                userId: user.id, // Compatibility with legacy code
                email: user.email,
                phone: user.phone,
                name: user.name,
                email_verified: user.email_verified
              };
              
              console.log('✅ [Auth] User authenticated:', {
                userId: user.id,
                email: user.email
              });
              
              return next();
            }
            
            // ⚠️ CRITICAL: If Supabase query fails, log error details
            if (error) {
              console.error('❌ [Auth] Supabase query failed:', {
                code: error.code,
                message: error.message,
                details: error.details
              });
              
              // ⚠️ Token is valid but DB lookup failed - still treat as authenticated!
              // This prevents cart operations from failing due to temporary DB issues
              req.user = {
                id: userId,  // ⭐ Use extracted userId
                userId: userId,
                email: decoded.email || null,
                phone: decoded.phone || null,
                name: decoded.name || null,
                email_verified: decoded.email_verified || false
              };
              
              console.log('⚠️ [Auth] Using token data due to DB error');
              return next();
            }
            
            // User deleted but token still valid - treat as guest
            console.log('⚠️ [Auth] User not found in DB, treating as guest');
          }
        } catch (jwtError) {
          // Invalid token - fall through to guest session
          if (process.env.NODE_ENV !== 'production') {
            console.log('ℹ️ [Auth] Invalid token, treating as guest:', jwtError.message);
          }
        }
      }
    }

    // ===== CASE 2: NO VALID TOKEN - CHECK FOR GUEST SESSION =====
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId) {
      // Validate session ID format (must be UUID v4)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(sessionId)) {
        console.log('❌ [Auth] Invalid session ID format:', sessionId);
        return res.status(400).json({
          success: false,
          message: 'Invalid session ID format',
          code: 'INVALID_SESSION_ID'
        });
      }
      
      // Valid session ID
      req.sessionId = sessionId;
      console.log('✅ [Auth] Guest session validated:', sessionId);
      return next();
    }

    // ===== CASE 3: NO TOKEN, NO SESSION - ALLOW EMPTY REQUEST =====
    // Controller will handle empty cart/wishlist
    console.log('ℹ️ [Auth] No authentication provided, continuing as anonymous');
    return next();

  } catch (error) {
    console.error('❌ [Auth] Optional auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed'
    });
  }
};

/**
 * Require email verification
 * @access Use after verifyCustomerToken
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_AUTH'
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

// ========================================
// RATE LIMITING
// ========================================

const rateLimit = require('express-rate-limit');

/**
 * Rate limit for customer login attempts
 * 5 attempts per 15 minutes per IP
 */
const rateLimitCustomerLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limit for password reset requests
 * 3 attempts per 15 minutes per IP
 */
const rateLimitPasswordReset = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limit for OTP requests
 * 5 attempts per 15 minutes per IP
 */
const rateLimitOTP = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Clear rate limit - No-op (express-rate-limit handles cleanup)
 * @deprecated Legacy function, kept for compatibility
 */
const clearCustomerRateLimit = (ip) => {
  // No-op - express-rate-limit handles cleanup automatically
};

// ========================================
// SECURITY HEADERS
// ========================================

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
const customerSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HSTS (HTTPS enforcement) in production only
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// ========================================
// LEGACY COMPATIBILITY
// ========================================

/**
 * @deprecated Use optionalCustomerAuth instead
 * Kept for backward compatibility with existing code
 */
const optionalAuth = optionalCustomerAuth;

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Primary authentication
  verifyCustomerToken,
  optionalCustomerAuth,
  
  // Email verification
  requireEmailVerified,
  
  // Rate limiting
  rateLimitCustomerLogin,
  rateLimitPasswordReset,
  rateLimitOTP,
  clearCustomerRateLimit,
  
  // Security
  customerSecurityHeaders,
  
  // Legacy compatibility
  optionalAuth
};