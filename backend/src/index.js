// backend/src/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ⭐ IMPORTANT: Raw body parser for Razorpay webhook signature verification
// Must be BEFORE express.json() for webhook route
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Standard JSON/URL-encoded parsers for all other routes
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
// SUPABASE CONNECTION TEST
// ============================================

const supabase = require('./config/supabaseClient');

// Test Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from('Products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.log('⚠️  Could not test Supabase connection:', err.message);
  }
})();

// ============================================
// RAZORPAY SERVICE HEALTH CHECK
// ============================================

const razorpayService = require('./services/razorpayService');

(async () => {
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
})();

// ============================================
// ROUTES - ORDER MATTERS!
// ============================================

// 1. ADMIN & STAFF ROUTES
// --------------------------------------------
app.use('/api/admin/auth', require('./routes/adminAuth'));     // Admin Login/Register
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/admin/shipments', require('./routes/shipments'));
app.use('/api/admin', require('./routes/admin'));              // Admin Product Management

// 2. CUSTOMER AUTHENTICATION & PROFILE
// --------------------------------------------
app.use('/api/auth', require('./routes/userAuth'));        // Customer Login/Register
app.use('/api/users', require('./routes/users'));          // Customer Profile/Dashboard
app.use('/api/addresses', require('./routes/addresses'));  // Address Book

// 3. CATALOG (PUBLIC & ADMIN MIXED)
// --------------------------------------------
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tagsRoutes'));
app.use('/api/bundles', require('./routes/bundles'));      // Must be before products to avoid conflicts
app.use('/api/products', require('./routes/products'));
app.use('/api/variants', require('./routes/variants'));
app.use('/api/reviews', require('./routes/reviews'));

// 4. COMMERCE & TRANSACTIONS
// --------------------------------------------
app.use('/api/cart', require('./routes/cart'));            // Shopping Cart
app.use('/api/wishlist', require('./routes/wishlist'));    // Wishlist
app.use('/api/orders', require('./routes/orders'));        // Order Management
app.use('/api/payments', require('./routes/payments'));    // ⭐ Razorpay Payment Integration
app.use('/api/delhivery', require('./routes/delhivery'));  // Delhivery Shipping Integration

// ============================================
// HEALTH CHECK & API DOCUMENTATION
// ============================================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
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
      environment: process.env.NODE_ENV || 'development',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Root endpoint with API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'The Petal Pouches API is running! 🌸',
    version: '1.4.0', // ⭐ Version bump for payment integration
    database: 'Supabase',
    payment_gateway: 'Razorpay',
    documentation: {
      admin: {
        auth: '/api/admin/auth',
        products: '/api/admin/products',
        bundles: '/api/bundles/admin',
        orders: '/api/admin/orders'
      },
      customer: {
        auth: '/api/auth',
        profile: '/api/users',
        addresses: '/api/addresses',
        orders: '/api/orders',
        cart: '/api/cart',
        wishlist: '/api/wishlist',
        payments: '/api/payments' // ⭐ Payment endpoints
      },
      catalog: {
        products: '/api/products',
        categories: '/api/categories',
        bundles: '/api/bundles',
        tags: '/api/tags',
        reviews: '/api/reviews'
      },
      payments: { // ⭐ NEW: Payment-specific docs
        create_order: 'POST /api/payments/create-order',
        verify: 'POST /api/payments/verify',
        status: 'GET /api/payments/status/:order_id',
        webhook: 'POST /api/payments/webhook'
      }
    }
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
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
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      code: err.code 
    })
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableResources: [
      '/api/auth', '/api/users', '/api/products', 
      '/api/cart', '/api/orders', '/api/payments'
    ]
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`   Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: Supabase`);
  console.log(`   Payment: Razorpay`); // ⭐ NEW
  console.log('🚀 ===================================\n');
  
  console.log('📍 Key Endpoints:');
  console.log(`   🌐 Health:     http://localhost:${PORT}/health`);
  console.log(`   🛒 Products:   http://localhost:${PORT}/api/products`);
  console.log(`   🛍️ Cart:       http://localhost:${PORT}/api/cart`);
  console.log(`   👤 User Auth:  http://localhost:${PORT}/api/auth/login`);
  console.log(`   🔐 Admin Auth: http://localhost:${PORT}/api/admin/auth/login`);
  console.log(`   📦 Orders:     http://localhost:${PORT}/api/orders`);
  console.log(`   💳 Payments:   http://localhost:${PORT}/api/payments`); // ⭐ NEW
  console.log('\n✨ Server is ready to accept requests!\n');
});

module.exports = app;