// backend/src/models/otpModel.js

const supabase = require('../config/supabaseClient');
const { generateOTP, generateOTPExpiry, isOTPExpired } = require('../utils/otpGenerator');

/**
 * OTP Model - Handles all OTP-related database operations
 * Manages OTP creation, verification, and cleanup
 */
const OTPModel = {

  /**
   * Create and store new OTP
   * @param {string} email - User email
   * @param {string} type - OTP type: 'registration', 'password_reset', 'email_change'
   * @returns {Promise<Object>} OTP record with code
   */
  async createOTP(email, type) {
    try {
      const otp = generateOTP();
      const expiresAt = generateOTPExpiry();

      // Delete any existing OTPs for this email and type
      await supabase
        .from('email_otps')
        .delete()
        .eq('email', email.toLowerCase())
        .eq('type', type);

      // Insert new OTP
      const { data, error } = await supabase
        .from('email_otps')
        .insert([{
          email: email.toLowerCase(),
          otp,
          type,
          verified: false,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`[OTPModel] OTP created for ${email} (type: ${type})`);
      
      return {
        success: true,
        otp: data.otp,
        id: data.id,
        expires_at: data.expires_at
      };

    } catch (error) {
      console.error('[OTPModel] Error creating OTP:', error);
      throw error;
    }
  },

  /**
   * Verify OTP code
   * @param {string} email - User email
   * @param {string} otp - OTP code to verify
   * @param {string} type - OTP type
   * @returns {Promise<Object>} Verification result
   */
  async verifyOTP(email, otp, type) {
    try {
      // Find OTP record
      const { data, error } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('otp', otp)
        .eq('type', type)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'INVALID_OTP',
          message: 'Invalid or expired OTP'
        };
      }

      // Check if expired
      if (isOTPExpired(data.expires_at)) {
        // Delete expired OTP
        await supabase
          .from('email_otps')
          .delete()
          .eq('id', data.id);

        return {
          success: false,
          error: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Mark as verified
      await supabase
        .from('email_otps')
        .update({ verified: true })
        .eq('id', data.id);

      console.log(`[OTPModel] OTP verified for ${email} (type: ${type})`);

      return {
        success: true,
        message: 'OTP verified successfully',
        otpId: data.id
      };

    } catch (error) {
      console.error('[OTPModel] Error verifying OTP:', error);
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'OTP verification failed'
      };
    }
  },

  /**
   * Check if user has a valid verified OTP
   * @param {string} email - User email
   * @param {string} type - OTP type
   * @returns {Promise<boolean>} True if valid verified OTP exists
   */
  async hasValidVerifiedOTP(email, type) {
    try {
      const { data, error } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('type', type)
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if still valid (not expired)
      if (isOTPExpired(data.expires_at)) {
        // Delete expired OTP
        await supabase
          .from('email_otps')
          .delete()
          .eq('id', data.id);
        return false;
      }

      return true;

    } catch (error) {
      console.error('[OTPModel] Error checking verified OTP:', error);
      return false;
    }
  },

  /**
   * Delete OTP after use (cleanup)
   * @param {string} email - User email
   * @param {string} type - OTP type
   * @returns {Promise<void>}
   */
  async deleteOTP(email, type) {
    try {
      await supabase
        .from('email_otps')
        .delete()
        .eq('email', email.toLowerCase())
        .eq('type', type);

      console.log(`[OTPModel] OTP deleted for ${email} (type: ${type})`);
    } catch (error) {
      console.error('[OTPModel] Error deleting OTP:', error);
    }
  },

  /**
   * Check rate limit - prevent OTP spam
   * @param {string} email - User email
   * @param {number} maxAttempts - Max attempts allowed (default: 3)
   * @param {number} windowMinutes - Time window in minutes (default: 15)
   * @returns {Promise<Object>} Rate limit status
   */
  async checkRateLimit(email, maxAttempts = 3, windowMinutes = 15) {
    try {
      const timeWindow = new Date();
      timeWindow.setMinutes(timeWindow.getMinutes() - windowMinutes);

      const { data, error } = await supabase
        .from('email_otps')
        .select('id, created_at')
        .eq('email', email.toLowerCase())
        .gte('created_at', timeWindow.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const attemptCount = data ? data.length : 0;

      if (attemptCount >= maxAttempts) {
        const oldestAttempt = data[data.length - 1];
        const resetTime = new Date(oldestAttempt.created_at);
        resetTime.setMinutes(resetTime.getMinutes() + windowMinutes);
        
        const minutesLeft = Math.ceil((resetTime - new Date()) / 60000);

        return {
          allowed: false,
          attemptsRemaining: 0,
          resetIn: minutesLeft,
          message: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
        };
      }

      return {
        allowed: true,
        attemptsRemaining: maxAttempts - attemptCount,
        message: 'Rate limit OK'
      };

    } catch (error) {
      console.error('[OTPModel] Error checking rate limit:', error);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        attemptsRemaining: 1,
        message: 'Rate limit check failed, allowing request'
      };
    }
  },

  /**
   * Clean up expired OTPs (called periodically)
   * @returns {Promise<number>} Number of deleted records
   */
  async cleanupExpired() {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('email_otps')
        .delete()
        .lt('expires_at', now)
        .select();

      if (error) throw error;

      const deletedCount = data ? data.length : 0;
      
      if (deletedCount > 0) {
        console.log(`[OTPModel] Cleaned up ${deletedCount} expired OTP(s)`);
      }

      return deletedCount;

    } catch (error) {
      console.error('[OTPModel] Error cleaning up expired OTPs:', error);
      return 0;
    }
  },

  /**
   * Get OTP statistics (for debugging/monitoring)
   * @param {string} email - User email
   * @returns {Promise<Object>} OTP statistics
   */
  async getStats(email) {
    try {
      const { data, error } = await supabase
        .from('email_otps')
        .select('type, verified, created_at, expires_at')
        .eq('email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        total: data ? data.length : 0,
        verified: data ? data.filter(otp => otp.verified).length : 0,
        pending: data ? data.filter(otp => !otp.verified).length : 0,
        recent: data ? data.slice(0, 5) : []
      };

    } catch (error) {
      console.error('[OTPModel] Error getting stats:', error);
      return { total: 0, verified: 0, pending: 0, recent: [] };
    }
  }

};

module.exports = OTPModel;