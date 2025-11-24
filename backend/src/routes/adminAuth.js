// backend/src/routes/adminAuth.js

const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  refreshToken
} = require('../controllers/adminAuthController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', verifyAdminToken, getCurrentAdmin);
router.post('/logout', verifyAdminToken, logoutAdmin);

module.exports = router;