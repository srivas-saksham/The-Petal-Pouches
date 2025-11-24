// backend/src/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();

// Middleware Configuration
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
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
// ROUTES - ORDER MATTERS! (Most specific first)
// ============================================

// 1. Admin Authentication routes (MUST BE FIRST - no auth required)
app.use('/api/admin/auth', require('./routes/adminAuth'));

// 2. Categories routes (both public and admin)
app.use('/api/categories', require('./routes/categories'));

// 3. Bundle routes (must come BEFORE product routes to avoid conflicts)
app.use('/api/bundles', require('./routes/bundles'));

// 4. Admin routes (must come BEFORE general product routes)
app.use('/api/admin', require('./routes/admin'));

// 5. Public product routes (must come AFTER admin routes)
app.use('/api/products', require('./routes/products'));

// 6. Variant routes - SPECIFIC PATHS ONLY
app.use('/api/variants', require('./routes/variants'));

// ============================================
// HEALTH CHECK & ERROR HANDLERS
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint with API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'The Petal Pouches API is running! 🌸',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/admin/auth/register',
        login: 'POST /api/admin/auth/login',
        me: 'GET /api/admin/auth/me',
        logout: 'POST /api/admin/auth/logout'
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/admin/products',
        update: 'PUT /api/admin/products/:id',
        delete: 'DELETE /api/admin/products/:id'
      },
      categories: {
        getAll: 'GET /api/categories',
        getById: 'GET /api/categories/:id',
        create: 'POST /api/categories/admin',
        update: 'PUT /api/categories/admin/:id',
        delete: 'DELETE /api/categories/admin/:id'
      },
      bundles: {
        getAll: 'GET /api/bundles',
        getById: 'GET /api/bundles/:id',
        checkStock: 'GET /api/bundles/:id/stock',
        create: 'POST /api/bundles/admin',
        update: 'PUT /api/bundles/admin/:id',
        delete: 'DELETE /api/bundles/admin/:id',
        toggle: 'PATCH /api/bundles/admin/:id/toggle',
        duplicate: 'POST /api/bundles/admin/:id/duplicate'
      },
      variants: {
        getByProduct: 'GET /api/variants/products/:productId/variants',
        getById: 'GET /api/variants/:variantId',
        create: 'POST /api/variants/admin/products/:productId/variants',
        update: 'PUT /api/variants/admin/:variantId',
        delete: 'DELETE /api/variants/admin/:variantId'
      }
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: {
      auth: '/api/admin/auth',
      products: '/api/products',
      admin: '/api/admin',
      categories: '/api/categories',
      bundles: '/api/bundles',
      variants: '/api/variants'
    }
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
  console.log('🚀 ===================================\n');
  
  console.log('📍 Available Endpoints:');
  console.log(`   🌐 Health: http://localhost:${PORT}/health`);
  console.log(`   🔐 Auth (Login): http://localhost:${PORT}/api/admin/auth/login`);
  console.log(`   🔐 Auth (Register): http://localhost:${PORT}/api/admin/auth/register`);
  console.log(`   📦 Products (Public): http://localhost:${PORT}/api/products`);
  console.log(`   🔑 Admin (Products): http://localhost:${PORT}/api/admin/products`);
  console.log(`   📂 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`   🎁 Bundles (Public): http://localhost:${PORT}/api/bundles`);
  console.log(`   🔑 Admin (Bundles): http://localhost:${PORT}/api/bundles/admin`);
  console.log(`   🎨 Variants: http://localhost:${PORT}/api/variants`);
  console.log('\n✨ Server is ready to accept requests!\n');
});

module.exports = app;