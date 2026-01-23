// backend/src/routes/gateway.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateGatewayToken } = require('../middleware/gateway');

/**
 * Gateway Authentication Routes
 * Base path: /api/gateway
 * 
 * ⚠️ IMPORTANT: These routes MUST be registered BEFORE gatewayMiddleware
 * in index.js, otherwise they will require authentication to authenticate!
 */

/**
 * @route   POST /api/gateway/verify
 * @desc    Verify gateway password and return JWT token
 * @access  Public (no auth required)
 * @body    password - String (required)
 * @returns { success, token, expiresIn }
 */
router.post('/verify', async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Verify password against hash
    const isValid = await bcrypt.compare(
      password,
      process.env.GATEWAY_PASSWORD_HASH
    );

    if (!isValid) {
      console.log('❌ Invalid gateway password attempt');
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = generateGatewayToken();
    const expiresIn = process.env.GATEWAY_TOKEN_EXPIRY || '30m';

    console.log('✅ Gateway access granted, token generated');

    res.json({
      success: true,
      message: 'Access granted',
      token,
      expiresIn
    });

  } catch (error) {
    console.error('❌ Gateway verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification error'
    });
  }
});

/**
 * @route   GET /api/gateway/status
 * @desc    Check if gateway is enabled
 * @access  Public
 * @returns { enabled, expiresIn }
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    enabled: process.env.GATEWAY_ENABLED === 'true',
    expiresIn: process.env.GATEWAY_TOKEN_EXPIRY || '30m'
  });
});

module.exports = router;