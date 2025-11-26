// backend/src/controllers/userAuthController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
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
      const { data: existingUser } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
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
      const { data: newUser, error } = await supabase
        .from('Users')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase(),
          password_hash: passwordHash,
          phone: phone || null,
          is_active: true,
          email_verified: false
        }])
        .select('id, name, email, phone, created_at')
        .single();

      if (error) throw error;

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
        message: 'Registration failed. Please try again.',
        error: error.message
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
      const { data: user, error: fetchError } = await supabase
        .from('Users')
        .select('id, name, email, password_hash, is_active, email_verified')
        .eq('email', email.toLowerCase())
        .single();

      if (fetchError || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

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
      await supabase
        .from('Users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

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
        message: 'Login failed. Please try again.',
        error: error.message
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
      const { data: user, error } = await supabase
        .from('Users')
        .select('id, name, email, phone, email_verified, created_at, last_login')
        .eq('id', req.user.id)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      const { data: user, error } = await supabase
        .from('Users')
        .select('id, name, email, email_verified, is_active')
        .eq('id', req.user.id)
        .single();

      if (error || !user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          code: 'USER_INACTIVE'
        });
      }

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
      const { data: user, error } = await supabase
        .from('Users')
        .select('email_verified, email')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      const { data: updatedUser, error } = await supabase
        .from('Users')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', decoded.id)
        .eq('email', decoded.email)
        .select('id, email, email_verified')
        .single();

      if (error || !updatedUser) {
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
      const { data: user, error } = await supabase
        .from('Users')
        .select('id, email, name')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      // Always return success to prevent email enumeration
      if (error || !user) {
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
      }

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
      const { data: updatedUser, error } = await supabase
        .from('Users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', decoded.id)
        .eq('email', decoded.email)
        .select('id, email')
        .single();

      if (error || !updatedUser) {
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
      const { data: user, error } = await supabase
        .from('Users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      await supabase
        .from('Users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

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