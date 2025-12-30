// backend/src/controllers/otpController.js

const OTPModel = require('../models/otpModel');
const emailService = require('../services/emailService');
const supabase = require('../config/supabaseClient');

/**
 * OTP Controller
 * Handles OTP generation, sending, verification, and resend logic
 */
const OTPController = {

  /**
   * Send OTP to email
   * POST /api/otp/send
   * Body: { email, type, name? }
   * Types: 'registration', 'password_reset', 'email_change'
   */
  sendOTP: async (req, res) => {
    try {
      const { email, type, name } = req.body;

      // Validation
      if (!email || !type) {
        return res.status(400).json({
          success: false,
          message: 'Email and type are required'
        });
      }

      // Validate type
      const validTypes = ['registration', 'password_reset', 'email_change'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP type'
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

      // Check rate limit
      const rateLimit = await OTPModel.checkRateLimit(email);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: rateLimit.message,
          resetIn: rateLimit.resetIn
        });
      }

      // For registration: check if email already exists
      if (type === 'registration') {
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
      }

      // For password_reset: check if user exists
      if (type === 'password_reset') {
        const { data: user } = await supabase
          .from('Users')
          .select('id, name')
          .eq('email', email.toLowerCase())
          .eq('is_active', true)
          .single();

        if (!user) {
          // Security: Don't reveal if email exists
          return res.json({
            success: true,
            message: 'If the email exists, an OTP has been sent.'
          });
        }
      }

      // Generate and store OTP
      const otpResult = await OTPModel.createOTP(email, type);

      if (!otpResult.success) {
        throw new Error('Failed to generate OTP');
      }

      // Send OTP via email based on type
      let emailSent = false;
      
      try {
        switch (type) {
          case 'registration':
            await emailService.sendRegistrationOTP(email, otpResult.otp, name || 'User');
            emailSent = true;
            break;

          case 'password_reset':
            // Get user name for personalization
            const { data: userData } = await supabase
              .from('Users')
              .select('name')
              .eq('email', email.toLowerCase())
              .single();
            
            await emailService.sendPasswordResetOTP(email, otpResult.otp, userData?.name || 'User');
            emailSent = true;
            break;

          case 'email_change':
            await emailService.sendEmailChangeOTP(email, otpResult.otp, name || 'User');
            emailSent = true;
            break;
        }
      } catch (emailError) {
        console.error('[OTPController] Email send error:', emailError);
        // Delete OTP if email fails
        await OTPModel.deleteOTP(email, type);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again.'
        });
      }

      console.log(`[OTPController] OTP sent to ${email} (type: ${type})`);

      res.json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        attemptsRemaining: rateLimit.attemptsRemaining - 1,
        expiresIn: 600 // 10 minutes in seconds
      });

    } catch (error) {
      console.error('[OTPController] Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: error.message
      });
    }
  },

  /**
   * Verify OTP
   * POST /api/otp/verify
   * Body: { email, otp, type }
   */
  verifyOTP: async (req, res) => {
    try {
      const { email, otp, type } = req.body;

      // Validation
      if (!email || !otp || !type) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and type are required'
        });
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP format. Must be 6 digits.'
        });
      }

      // Verify OTP
      const verificationResult = await OTPModel.verifyOTP(email, otp, type);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message,
          code: verificationResult.error
        });
      }

      console.log(`[OTPController] OTP verified for ${email} (type: ${type})`);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        verified: true
      });

    } catch (error) {
      console.error('[OTPController] Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed. Please try again.',
        error: error.message
      });
    }
  },

  /**
   * Resend OTP
   * POST /api/otp/resend
   * Body: { email, type, name? }
   */
  resendOTP: async (req, res) => {
    try {
      const { email, type, name } = req.body;

      // Validation
      if (!email || !type) {
        return res.status(400).json({
          success: false,
          message: 'Email and type are required'
        });
      }

      // Check rate limit (stricter for resend)
      const rateLimit = await OTPModel.checkRateLimit(email, 5, 15); // 5 attempts in 15 mins
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: rateLimit.message,
          resetIn: rateLimit.resetIn
        });
      }

      // Delete old OTP
      await OTPModel.deleteOTP(email, type);

      // Generate new OTP
      const otpResult = await OTPModel.createOTP(email, type);

      if (!otpResult.success) {
        throw new Error('Failed to generate OTP');
      }

      // Send OTP via email
      try {
        switch (type) {
          case 'registration':
            await emailService.sendRegistrationOTP(email, otpResult.otp, name || 'User');
            break;

          case 'password_reset':
            const { data: userData } = await supabase
              .from('Users')
              .select('name')
              .eq('email', email.toLowerCase())
              .single();
            
            await emailService.sendPasswordResetOTP(email, otpResult.otp, userData?.name || 'User');
            break;

          case 'email_change':
            await emailService.sendEmailChangeOTP(email, otpResult.otp, name || 'User');
            break;
        }
      } catch (emailError) {
        console.error('[OTPController] Email send error on resend:', emailError);
        await OTPModel.deleteOTP(email, type);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to resend OTP. Please try again.'
        });
      }

      console.log(`[OTPController] OTP resent to ${email} (type: ${type})`);

      res.json({
        success: true,
        message: 'OTP resent successfully. Please check your email.',
        attemptsRemaining: rateLimit.attemptsRemaining - 1,
        expiresIn: 600
      });

    } catch (error) {
      console.error('[OTPController] Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
        error: error.message
      });
    }
  },

  /**
   * Check if OTP is verified (utility endpoint)
   * GET /api/otp/check-verified
   * Query: ?email=x&type=y
   */
  checkVerified: async (req, res) => {
    try {
      const { email, type } = req.query;

      if (!email || !type) {
        return res.status(400).json({
          success: false,
          message: 'Email and type are required'
        });
      }

      const isVerified = await OTPModel.hasValidVerifiedOTP(email, type);

      res.json({
        success: true,
        verified: isVerified
      });

    } catch (error) {
      console.error('[OTPController] Check verified error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check verification status',
        error: error.message
      });
    }
  }

};

module.exports = OTPController;