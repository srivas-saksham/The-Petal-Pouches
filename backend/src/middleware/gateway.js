// backend/src/middleware/gateway.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================================
// CONFIGURATION
// ============================================

const GATEWAY_ENABLED = process.env.GATEWAY_ENABLED === 'true';
const GATEWAY_PASSWORD_HASH = process.env.GATEWAY_PASSWORD_HASH;
const GATEWAY_HEADER_NAME = process.env.GATEWAY_HEADER_NAME || 'x-gateway-token';
const JWT_SECRET = process.env.JWT_SECRET || 'gateway-secret-key-change-in-production';
const TOKEN_EXPIRY = process.env.GATEWAY_TOKEN_EXPIRY || '30m';

// ============================================
// ✅ WHITELISTED PATHS (NEVER require gateway auth)
// ============================================

const WHITELISTED_PATHS = [
  // Webhooks
  '/api/payments/webhook',
  '/api/webhooks/delhivery',
  
  // Gateway routes
  '/api/gateway/verify',
  '/api/gateway/status',
  
  // ✅ Authentication routes MUST be accessible
  '/api/admin/auth/login',
  '/api/admin/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/otp/send',
  '/api/otp/verify',
  
  // ✅ Public routes that work for guests
  '/api/cart',
  '/api/products',
  '/api/categories',
  '/api/bundles',
  '/api/shop',
  '/api/tags',
  '/api/reviews',
  '/api/variants',
];

// Optionally whitelist cron endpoints
const WHITELIST_CRON = process.env.GATEWAY_WHITELIST_CRON === 'true';
if (WHITELIST_CRON) {
  WHITELISTED_PATHS.push('/api/cron/sync-shipments');
}

// ============================================
// VALIDATION
// ============================================

if (GATEWAY_ENABLED) {
  if (!GATEWAY_PASSWORD_HASH) {
    throw new Error('❌ GATEWAY_ENABLED=true but GATEWAY_PASSWORD_HASH is not set');
  }
  
  if (GATEWAY_PASSWORD_HASH.length < 20) {
    throw new Error('❌ GATEWAY_PASSWORD_HASH must be a valid bcrypt hash');
  }
  
  console.log('🔒 Gateway protection ENABLED');
  console.log(`   Header: ${GATEWAY_HEADER_NAME}`);
  console.log(`   Token Expiry: ${TOKEN_EXPIRY}`);
  console.log(`   Whitelisted paths: ${WHITELISTED_PATHS.length}`);
}

// ============================================
// JWT HELPERS
// ============================================

/**
 * Generate JWT token after password verification
 */
const generateGatewayToken = () => {
  return jwt.sign(
    { gateway: true, type: 'gateway' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Verify JWT token
 */
const verifyGatewayToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.gateway === true && decoded.type === 'gateway';
  } catch (error) {
    return false;
  }
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Gateway authentication middleware
 * Supports both JWT tokens and plain passwords (for backward compatibility)
 */
const gatewayMiddleware = async (req, res, next) => {
  // ✅ FAST PATH: Gateway disabled
  if (!GATEWAY_ENABLED) {
    return next();
  }

  // ✅ FAST PATH: Exact path match (includes auth routes)
  if (WHITELISTED_PATHS.includes(req.path)) {
    return next();
  }

  // ✅ FAST PATH: Wildcard webhook paths
  if (req.path.startsWith('/api/webhooks/')) {
    return next();
  }

  // ✅ FAST PATH: Path prefix matching for public routes
  const publicPrefixes = [
    // Auth routes
    '/api/admin/auth/',
    '/api/auth/',
    '/api/otp/',
    
    // Public catalog routes (work for guests)
    '/api/cart',
    '/api/products',
    '/api/categories',
    '/api/bundles',
    '/api/shop',
    '/api/tags',
    '/api/reviews',
    '/api/variants',
    '/api/coupons',
  ];
  
  if (publicPrefixes.some(prefix => req.path.startsWith(prefix))) {
    return next();
  }

  // ⚠️ CRITICAL: Extract token/password from custom header
  const providedToken = req.headers[GATEWAY_HEADER_NAME];

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      message: 'Gateway authentication required',
      code: 'GATEWAY_AUTH_REQUIRED'
    });
  }

  // ✅ Check if it's a JWT token (contains dots)
  if (providedToken.includes('.')) {
    const isValidToken = verifyGatewayToken(providedToken);
    
    if (isValidToken) {
      return next(); // ✅ Valid JWT token
    }
    
    // Token expired or invalid
    return res.status(401).json({
      success: false,
      message: 'Gateway session expired',
      code: 'GATEWAY_TOKEN_EXPIRED'
    });
  }

  // ⚠️ FALLBACK: Plain password validation (backward compatibility)
  try {
    const isValid = await bcrypt.compare(providedToken, GATEWAY_PASSWORD_HASH);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Gateway authentication failed',
        code: 'GATEWAY_AUTH_FAILED'
      });
    }

    // ✅ Password valid - continue to routes
    next();

  } catch (error) {
    console.error('❌ Gateway auth error:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Gateway authentication error',
      code: 'GATEWAY_ERROR'
    });
  }
};

// ============================================
// HELPER: Generate Password Hash
// ============================================

const generateHash = async (password) => {
  if (!password) {
    console.error('❌ Usage: generateHash(password)');
    return;
  }
  
  const hash = await bcrypt.hash(password, 10);
  console.log('\n🔐 Generated Hash:');
  console.log(hash);
  console.log('\n📋 Add to .env:');
  console.log(`GATEWAY_PASSWORD_HASH=${hash}`);
  console.log('');
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  gatewayMiddleware,
  generateHash,
  generateGatewayToken,
  verifyGatewayToken
};