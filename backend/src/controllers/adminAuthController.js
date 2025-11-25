// backend/src/controllers/adminAuthController.js

const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Admin Registration (one-time setup by super admin)
 * POST /api/admin/auth/register
 */
const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert([{
        email,
        password_hash: hashedPassword,
        name,
        role: role || 'staff', // Default to staff
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

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
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register admin',
      error: error.message
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

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ CLEAR RATE LIMIT ON SUCCESSFUL LOGIN
    const { clearRateLimit } = require('../middleware/adminAuth');
    const ip = req.ip || req.connection.remoteAddress;
    clearRateLimit(ip);

    // Generate JWT token with SHORTER expiration (30 minutes for session-based)
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
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
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * ✅ NEW: Verify Admin Password (Re-authentication)
 * POST /api/admin/auth/verify
 */
const verifyAdminPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This admin account has been deactivated'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // ✅ CLEAR RATE LIMIT ON SUCCESSFUL VERIFICATION
    const { clearRateLimit } = require('../middleware/adminAuth');
    const ip = req.ip || req.connection.remoteAddress;
    clearRateLimit(ip);

    // Generate new session token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );

    // Optional: Log re-authentication attempt
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
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

/**
 * Get Current Admin
 * GET /api/admin/auth/me
 */
const getCurrentAdmin = async (req, res) => {
  try {
    // req.admin is set by middleware
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
  // JWT logout is client-side (delete token)
  // Optional: add token to blacklist in DB
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

    // Verify old token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      { ignoreExpiration: true }
    );

    // Get fresh admin data
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

    // Generate new token
    const newToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' } // ✅ Changed to 30m
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

module.exports = {
  registerAdmin,
  loginAdmin,
  verifyAdminPassword, // ✅ NEW: Export verify function
  getCurrentAdmin,
  logoutAdmin,
  refreshToken
};