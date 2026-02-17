// backend/src/controllers/adminAuthController.js

const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ✅ ENFORCE SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set and at least 32 characters');
}

// ✅ SESSION EXTENSION CONSTANTS
const MAX_SESSION_SECONDS = 4 * 60 * 60; // 4 hours hard cap
const EXTEND_SECONDS = 15 * 60;           // 15 minutes per click
const GRACE_PERIOD_SECONDS = 2 * 60;      // allow extend if expired < 2 min ago

// ✅ INPUT SANITIZATION
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().toLowerCase();
};

/**
 * Admin Registration
 * POST /api/admin/auth/register
 */
const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // ✅ Sanitize email
    const sanitizedEmail = sanitizeInput(email);

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // ✅ Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // ✅ Use bcrypt cost factor 12 (more secure)
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: sanitizedEmail,
        password_hash: hashedPassword,
        name: name.trim(),
        role: role || 'staff',
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      // ✅ Don't leak database errors
      if (process.env.NODE_ENV !== 'production') {
        console.error('Admin registration error:', error);
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to register admin'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin registration error:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to register admin'
    });
  }
};

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // ✅ Sanitize email
    const sanitizedEmail = sanitizeInput(email);

    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (fetchError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated'
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ Clear rate limit
    const { clearRateLimit } = require('../middleware/adminAuth');
    const ip = req.ip || req.connection.remoteAddress;
    clearRateLimit(ip);

    // ✅ Use enforced secret
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const expiresAt = Math.floor(Date.now() / 1000) + (30 * 60);

    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        expiresAt,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          _id: admin.id
        }
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin login error:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Verify Admin Password
 * POST /api/admin/auth/verify
 */
const verifyAdminPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const sanitizedEmail = sanitizeInput(email);

    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (fetchError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated'
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const { clearRateLimit } = require('../middleware/adminAuth');
    const ip = req.ip || req.connection.remoteAddress;
    clearRateLimit(ip);

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const expiresAt = Math.floor(Date.now() / 1000) + (30 * 60);

    await supabase
      .from('admin_users')
      .update({ 
        last_login: new Date().toISOString()
      })
      .eq('id', admin.id);

    res.status(200).json({
      success: true,
      message: 'Identity verified successfully',
      data: {
        token,
        expiresAt,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          _id: admin.id
        }
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin verification error:', error);
    }
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

/**
 * Get Current Admin
 * GET /api/admin/auth/me
 */
const getCurrentAdmin = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin data'
    });
  }
};

/**
 * Admin Logout
 * POST /api/admin/auth/logout
 */
const logoutAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Refresh Token
 * POST /api/admin/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // ✅ Use enforced secret
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account deactivated'
      });
    }

    const newToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Extend Admin Session by 15 minutes
 * POST /api/admin/auth/extend
 */
const extendAdminToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Decode even if expired (grace period check happens in middleware,
    // but we double-check here for safety)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    const now = Math.floor(Date.now() / 1000);

    // Reject if expired more than GRACE_PERIOD_SECONDS ago
    if (decoded.exp && (now - decoded.exp) > GRACE_PERIOD_SECONDS) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Verify admin still exists and is active in DB
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'Admin account deactivated' });
    }

    // Calculate new expiry: current exp + 15 min, capped at MAX_SESSION_SECONDS from now
    const newExpiryUnix = Math.min(
      decoded.exp + EXTEND_SECONDS,
      now + MAX_SESSION_SECONDS
    );

    const dynamicExpiresIn = newExpiryUnix - now;

    if (dynamicExpiresIn <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Maximum session length reached'
      });
    }

    const newToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      JWT_SECRET,
      { expiresIn: dynamicExpiresIn }
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        expiresAt: newExpiryUnix,
        expiresInSeconds: dynamicExpiresIn
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Extend token error:', error);
    }
    res.status(401).json({ success: false, message: 'Token extension failed' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  verifyAdminPassword,
  getCurrentAdmin,
  logoutAdmin,
  refreshToken,
  extendAdminToken 
};