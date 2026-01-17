// backend/src/services/emailService.js

const https = require('https');
const RegistrationOTPTemplate = require('../templates/RegistrationOTPTemplate');
const PasswordResetOTPTemplate = require('../templates/PasswordResetOTPTemplate');
const EmailChangeOTPTemplate = require('../templates/EmailChangeOTPTemplate');
const WelcomeEmailTemplate = require('../templates/WelcomeEmailTemplate');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rizarajewels.com';
const BREVO_API_URL = 'api.brevo.com';

/**
 * Send email via Brevo API
 * @param {Object} emailData - Email configuration
 * @returns {Promise<Object>} Success/failure result
 */
async function sendEmail(emailData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      sender: {
        name: 'Rizara Luxe',
        email: EMAIL_FROM
      },
      to: [{ email: emailData.to }],
      subject: emailData.subject,
      htmlContent: emailData.html
    });

    const options = {
      hostname: BREVO_API_URL,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Email sent successfully to ${emailData.to}`);
          resolve({ success: true, data: JSON.parse(data) });
        } else {
          console.error(`Email failed to ${emailData.to}:`, data);
          reject(new Error(`Email send failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Email request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Send Registration OTP Email
 */
async function sendRegistrationOTP(email, otp, name) {
  const html = RegistrationOTPTemplate({ name, otp });
  
  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - Rizara Luxe',
    html
  });
}

/**
 * Send Password Reset OTP Email
 */
async function sendPasswordResetOTP(email, otp, name) {
  const html = PasswordResetOTPTemplate({ name, otp });
  
  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - Rizara Luxe',
    html
  });
}

/**
 * Send Email Change OTP
 */
async function sendEmailChangeOTP(email, otp, name) {
  const html = EmailChangeOTPTemplate({ name, otp });
  
  return await sendEmail({
    to: email,
    subject: 'Email Address Change Verification - Rizara Luxe',
    html
  });
}

/**
 * Send Welcome Email (after successful registration)
 */
async function sendWelcomeEmail(email, name) {
  const html = WelcomeEmailTemplate({ name, frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173' });
  
  return await sendEmail({
    to: email,
    subject: 'Welcome to Rizara Luxe',
    html
  });
}

module.exports = {
  sendRegistrationOTP,
  sendPasswordResetOTP,
  sendEmailChangeOTP,
  sendWelcomeEmail
};