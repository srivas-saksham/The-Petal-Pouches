// backend/src/utils/otpGenerator.js

/**
 * OTP Generator Utility
 * Generates secure 6-digit numeric OTPs
 */

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit numeric OTP
 */
function generateOTP() {
  // Generate random 6-digit number (100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Generate OTP expiry timestamp (10 minutes from now)
 * @returns {Date} Expiry timestamp
 */
function generateOTPExpiry() {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10);
  return expiryTime;
}

/**
 * Check if OTP has expired
 * @param {Date|string} expiryTime - OTP expiry timestamp
 * @returns {boolean} True if expired
 */
function isOTPExpired(expiryTime) {
  const now = new Date();
  const expiry = new Date(expiryTime);
  return now > expiry;
}

module.exports = {
  generateOTP,
  generateOTPExpiry,
  isOTPExpired
};