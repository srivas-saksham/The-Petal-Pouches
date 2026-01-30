// backend/src/index.js
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');

// ============================================
// 🔥 SERVERLESS OPTIMIZATION: Load env ONCE
// ============================================
// Load environment variables at module level (only runs once per container)
if (!process.env.VERCEL) {
  dotenv.config();
}

// ============================================
// 🔥 SERVERLESS OPTIMIZATION: Cache clients
// ============================================
// Cache expensive service initializations to prevent re-initialization on every request
let supabaseClient = null;
let razorpayClient = null;

const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = require('./config/supabaseClient');
  }
  return supabaseClient;
};

const getRazorpay = () => {
  if (!razorpayClient) {
    razorpayClient = require('./services/razorpayService');
  }
  return razorpayClient;
};

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// 🔥 SERVERLESS-SAFE CORS (FINAL FIX)
// ============================================

const allowedOrigins = [
  // 🌍 Production frontend domains
  'https://rizarafrontend.vercel.app',
  'https://rizara.in',
  'https://www.rizara.in',

  // 🧪 Local development
  'http://localhost:5173',

  // 🛠 Backend self-origin
  'https://rizarabackend.vercel.app'
];


app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-session-id, x-user-id'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  // ✅ CRITICAL: end preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// ============================================
// SECURITY HEADERS (AFTER CORS)
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// ⭐ CRITICAL: Raw body parser for Razorpay webhook signature verification
// Must be BEFORE express.json() for webhook route
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ✅ CRITICAL: Standard JSON/URL-encoded parsers for all other routes
// MUST BE BEFORE ANY ROUTES THAT NEED req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// 🗺️ SITEMAP - SEO CRITICAL (PUBLIC ROUTE)
// ============================================
// ⚠️ MUST be BEFORE gatewayMiddleware to be publicly accessible
// ⚠️ MUST be AFTER express.json() for proper request handling
// Location: https://rizarabackend.vercel.app/sitemap.xml
// Purpose: Dynamic sitemap generation from database
app.use('/', require('./routes/sitemap'));

// ============================================
// IMPORT AUTHENTICATION MIDDLEWARE
// ============================================

const { verifyAdminToken } = require('./middleware/adminAuth');
const { verifyCustomerToken } = require('./middleware/userAuth');

// ============================================
// ROUTES - ORDER MATTERS!
// ============================================

// 🆕 WEBHOOKS (MUST BE FIRST - before any auth middleware)
// --------------------------------------------
app.use('/api/webhooks', require('./routes/webhooks'));

app.use('/api/cron', require('./routes/cron'));

// 1. ADMIN AUTHENTICATION (PUBLIC)
// --------------------------------------------
app.use('/api/admin/auth', require('./routes/adminAuth')); // ✅ Login/Register - NO auth

// 2. ADMIN PROTECTED ROUTES (ALL REQUIRE verifyAdminToken)
// --------------------------------------------
app.use('/api/admin/orders', verifyAdminToken, require('./routes/adminOrders'));
app.use('/api/admin/customers', verifyAdminToken, require('./routes/adminCustomers'));
app.use('/api/admin/shipments', verifyAdminToken, require('./routes/shipments'));
app.use('/api/admin/coupons', verifyAdminToken, require('./routes/adminCoupons'));
app.use('/api/admin', verifyAdminToken, require('./routes/admin')); // Product management

// 3. CUSTOMER AUTHENTICATION (PUBLIC)
// --------------------------------------------
app.use('/api/auth', require('./routes/userAuth'));   // ✅ Login/Register - NO auth
app.use('/api/otp', require('./routes/otp'));         // ✅ OTP verification - NO auth

// 4. CUSTOMER PROTECTED ROUTES (ALL REQUIRE verifyCustomerToken)
// --------------------------------------------
app.use('/api/users', verifyCustomerToken, require('./routes/users'));           // ✅ Profile/Dashboard
app.use('/api/addresses', verifyCustomerToken, require('./routes/addresses'));   // ✅ Address management
app.use('/api/wishlist', verifyCustomerToken, require('./routes/wishlist'));     // ✅ Wishlist
app.use('/api/orders', verifyCustomerToken, require('./routes/orders'));         // ✅ Order management

// 5. PUBLIC CATALOG ROUTES (NO AUTH REQUIRED)
// --------------------------------------------
app.use('/api/cart', require('./routes/cart'));             // ✅ Cart (works for guests too)
app.use('/api/categories', require('./routes/categories')); // ✅ Browse categories
app.use('/api/tags', require('./routes/tagsRoutes'));       // ✅ Browse tags
app.use('/api/bundles', require('./routes/bundles'));       // ✅ Browse bundles (admin endpoints inside have own auth)
app.use('/api/products', require('./routes/products'));     // ✅ Browse products (admin endpoints inside have own auth)
app.use('/api/variants', require('./routes/variants'));     // ✅ Product variants
app.use('/api/reviews', require('./routes/reviews'));       // ✅ Product reviews
app.use('/api/coupons', require('./routes/coupons'));       // ✅ Validate coupons
app.use('/api/shop', require('./routes/shop'));             // ✅ Unified shop routes (products + bundles)

// 6. PAYMENT & SHIPPING (MIXED - auth handled inside routes)
// --------------------------------------------
app.use('/api/payments', require('./routes/payments'));     // ✅ Razorpay integration
app.use('/api/delhivery', require('./routes/delhivery'));   // ✅ Delhivery shipping

// ============================================
// HEALTH CHECK & API DOCUMENTATION
// ============================================

// Health check endpoint - optimized with cached clients
app.get('/health', async (req, res) => {
  try {
    const supabase = getSupabase();
    const razorpayService = getRazorpay();
    
    // Test Supabase connection
    const { error: supabaseError } = await supabase
      .from('Products')
      .select('count')
      .limit(1);
    
    const supabaseStatus = supabaseError ? 'unhealthy' : 'healthy';
    
    // Test Razorpay connection
    const razorpayHealth = await razorpayService.healthCheck();
    const razorpayStatus = razorpayHealth.healthy ? 'healthy' : 'unhealthy';
    
    // Overall status
    const overallStatus = (supabaseError || !razorpayHealth.healthy) ? 'degraded' : 'healthy';
    
    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      success: overallStatus === 'healthy',
      status: overallStatus,
      message: overallStatus === 'healthy' ? 'All services operational' : 'Some services have issues',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        supabase: supabaseStatus,
        razorpay: razorpayStatus
      }
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Root endpoint with API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'The Petal Pouches API is running! 🌸',
    version: '2.0.0', // ✅ Serverless Migration
    database: 'Supabase',
    payment_gateway: 'Razorpay',
    shipping: 'Delhivery',
    architecture: 'Serverless Functions',
    documentation: {
      admin: {
        auth: '/api/admin/auth (PUBLIC)',
        products: '/api/admin/products (PROTECTED)',
        bundles: '/api/bundles/admin (PROTECTED)',
        orders: '/api/admin/orders (PROTECTED)',
        shipments: '/api/admin/shipments (PROTECTED)',
        customers: '/api/admin/customers (PROTECTED)',
        coupons: '/api/admin/coupons (PROTECTED)'
      },
      customer: {
        auth: '/api/auth (PUBLIC)',
        otp: '/api/otp (PUBLIC)',
        profile: '/api/users (PROTECTED)',
        addresses: '/api/addresses (PROTECTED)',
        orders: '/api/orders (PROTECTED)',
        cart: '/api/cart (PUBLIC - supports guests)',
        wishlist: '/api/wishlist (PROTECTED)',
        payments: '/api/payments (MIXED)'
      },
      catalog: {
        products: '/api/products (PUBLIC)',
        categories: '/api/categories (PUBLIC)',
        bundles: '/api/bundles (PUBLIC)',
        tags: '/api/tags (PUBLIC)',
        reviews: '/api/reviews (PUBLIC)',
        coupons: '/api/coupons (PUBLIC - validation only)'
      },
      webhooks: {
        delhivery: 'POST /api/webhooks/delhivery',
        razorpay: 'POST /api/payments/webhook'
      },
      cron: {
        shipment_sync: 'POST /api/cron/sync-shipments (PROTECTED)'
      }
    }
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  // ✅ SECURITY: Never log full error in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err.stack);
  }
  
  // Handle Supabase-specific errors
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  
  // Check if it's a Supabase error
  if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case '23505':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503':
        statusCode = 400;
        message = 'Invalid reference - related resource not found';
        break;
      case '42501':
        statusCode = 403;
        message = 'Insufficient permissions';
        break;
      default:
        statusCode = 500;
        message = 'Database operation failed';
    }
  }
  
  // ✅ SECURITY: Never expose stack traces or internal error codes
  res.status(statusCode).json({
    success: false,
    message
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableResources: [
      '/api/auth', '/api/otp', '/api/users', '/api/products',
      '/api/cart', '/api/orders', '/api/payments', 
      '/api/coupons', '/api/webhooks'
    ]
  });
});

// ============================================
// LOCAL DEVELOPMENT SERVER (ONLY)
// ============================================

// ✅ This block only runs when executing `node src/index.js` directly
// ✅ Vercel ignores this completely and uses module.exports instead
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, async () => {
    console.log('\n🚀 ===================================');
    console.log(`   Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Mode: LOCAL DEVELOPMENT`);
    console.log(`   Database: Supabase`);
    console.log(`   Payment: Razorpay`);
    console.log(`   Shipping: Delhivery`);
    console.log('🚀 ===================================\n');
    
    console.log('📍 Key Endpoints:');
    console.log(`   🌐 Health:     http://localhost:${PORT}/health`);
    console.log(`   🛒 Products:   http://localhost:${PORT}/api/products`);
    console.log(`   🛍️ Cart:       http://localhost:${PORT}/api/cart`);
    console.log(`   🎟️ Coupons:    http://localhost:${PORT}/api/coupons`);
    console.log(`   🔐 OTP:        http://localhost:${PORT}/api/otp`);
    console.log(`   👤 User Auth:  http://localhost:${PORT}/api/auth/login`);
    console.log(`   🔐 Admin Auth: http://localhost:${PORT}/api/admin/auth/login`);
    console.log(`   📦 Orders:     http://localhost:${PORT}/api/orders`);
    console.log(`   💳 Payments:   http://localhost:${PORT}/api/payments`);
    console.log(`   🚚 Webhooks:   http://localhost:${PORT}/api/webhooks/delhivery`);
    
    // Test connections on local startup only
    const supabase = getSupabase();
    const razorpayService = getRazorpay();
    
    console.log('\n🔍 Testing service connections...');
    
    try {
      const { error } = await supabase.from('Products').select('count').limit(1);
      if (error) {
        console.log('⚠️  Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    } catch (err) {
      console.log('⚠️  Could not test Supabase connection:', err.message);
    }
    
    try {
      const healthCheck = await razorpayService.healthCheck();
      if (healthCheck.healthy) {
        console.log('✅ Razorpay API configured and reachable');
      } else {
        console.log('⚠️  Razorpay configuration issue:', healthCheck.message);
      }
    } catch (err) {
      console.log('⚠️  Could not verify Razorpay configuration:', err.message);
    }
  });
}

// ============================================
// SERVERLESS EXPORT (VERCEL/NETLIFY/AWS)
// ============================================

module.exports = app;