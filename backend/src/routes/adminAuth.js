// backend/src/routes/adminAuth.js

const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  refreshToken,
  verifyAdminPassword
} = require('../controllers/adminAuthController');
const { 
  verifyAdminToken, 
  rateLimitLogin, 
  securityHeaders 
} = require('../middleware/adminAuth');

// ✅ Apply security headers to all admin routes
router.use(securityHeaders);

// ✅ Public routes with rate limiting for auth endpoints
router.post('/register', rateLimitLogin, registerAdmin);
router.post('/login', rateLimitLogin, loginAdmin);
router.post('/verify', rateLimitLogin, verifyAdminPassword);
router.post('/refresh', refreshToken);

// ✅ Protected routes
router.get('/me', verifyAdminToken, getCurrentAdmin);
router.post('/logout', verifyAdminToken, logoutAdmin);

module.exports = router;