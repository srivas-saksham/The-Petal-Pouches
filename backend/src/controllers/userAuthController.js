// backend/src/controllers/userAuthController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { clearCustomerRateLimit } = require('../middleware/userAuth');

/**
 * User Authentication Controller
 * Handles customer registration, login, logout, password reset, email verification
 */
const UserAuthController = {

  // ==================== REGISTRATION ====================
  
  /**
   * Register a new customer
   * POST /api/auth/register
   */
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Password strength validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, phone, created_at, is_active, email_verified)
         VALUES ($1, $2, $3, $4, NOW(), true, false)
         RETURNING id, name, email, phone, created_at`,
        [name.trim(), email.toLowerCase(), passwordHash, phone || null]
      );

      const newUser = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          email_verified: false
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      console.log(`[Registration] New user registered: ${newUser.email}`);

      // TODO: Send verification email (implement emailService)

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            email_verified: false
          },
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  },

  // ==================== LOGIN ====================

  /**
   * Login customer
   * POST /api/auth/login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const result = await pool.query(
        'SELECT id, name, email, password_hash, is_active, email_verified FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const user = result.rows[0];

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Clear rate limit on successful login
      if (req.rateLimitIp) {
        clearCustomerRateLimit(req.rateLimitIp);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          email_verified: user.email_verified
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      console.log(`[Login] User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            email_verified: user.email_verified
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  },

  // ==================== LOGOUT ====================

  /**
   * Logout customer (client-side token removal)
   * POST /api/auth/logout
   */
  logout: async (req, res) => {
    try {
      // In JWT authentication, logout is typically handled client-side
      // by removing the token from storage
      
      console.log(`[Logout] User logged out: ${req.user?.email || 'Unknown'}`);

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  // ==================== GET CURRENT USER ====================

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  getCurrentUser: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, phone, email_verified, created_at, last_login
         FROM users 
         WHERE id = $1 AND is_active = true`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user data'
      });
    }
  },

  // ==================== REFRESH TOKEN ====================

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  refreshToken: async (req, res) => {
    try {
      // Get current user data from database to ensure it's up to date
      const result = await pool.query(
        'SELECT id, name, email, email_verified, is_active FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          code: 'USER_INACTIVE'
        });
      }

      const user = result.rows[0];

      // Generate new token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          email_verified: user.email_verified
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      console.log(`[Refresh] Token refreshed for: ${user.email}`);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token'
      });
    }
  },

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Request email verification
   * POST /api/auth/verify-email/request
   */
  requestEmailVerification: async (req, res) => {
    try {
      const userId = req.user.id;

      // Check if already verified
      const result = await pool.query(
        'SELECT email_verified, email FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      // Generate verification token
      const verificationToken = jwt.sign(
        { id: userId, email: user.email, type: 'email_verification' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // TODO: Send verification email with token
      console.log(`[Email Verification] Token generated for: ${user.email}`);
      console.log(`Verification link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`);

      res.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        // Remove in production - only for testing
        ...(process.env.NODE_ENV === 'development' && { token: verificationToken })
      });

    } catch (error) {
      console.error('Request email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  },

  /**
   * Verify email with token
   * POST /api/auth/verify-email/:token
   */
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      if (decoded.type !== 'email_verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Update user email_verified status
      const result = await pool.query(
        `UPDATE users 
         SET email_verified = true, updated_at = NOW()
         WHERE id = $1 AND email = $2
         RETURNING id, email, email_verified`,
        [decoded.id, decoded.email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`[Email Verified] ${decoded.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          email_verified: true
        }
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Verification link expired. Please request a new one.',
          code: 'TOKEN_EXPIRED'
        });
      }

      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  },

  // ==================== PASSWORD RESET ====================

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if user exists
      const result = await pool.query(
        'SELECT id, email, name FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // TODO: Send password reset email
      console.log(`[Password Reset] Token generated for: ${user.email}`);
      console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        // Remove in production - only for testing
        ...(process.env.NODE_ENV === 'development' && { token: resetToken })
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  },

  /**
   * Reset password with token
   * POST /api/auth/reset-password/:token
   */
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }

      // Password validation
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset token'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update password
      const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW()
         WHERE id = $2 AND email = $3
         RETURNING id, email`,
        [passwordHash, decoded.id, decoded.email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`[Password Reset] Password reset successful for: ${decoded.email}`);

      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset link expired. Please request a new one.',
          code: 'TOKEN_EXPIRED'
        });
      }

      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  },

  // ==================== CHANGE PASSWORD ====================

  /**
   * Change password (authenticated user)
   * PUT /api/auth/change-password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }

      // Get current password hash
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_PASSWORD'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );

      console.log(`[Password Change] Password changed for user ID: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

};

module.exports = UserAuthController;