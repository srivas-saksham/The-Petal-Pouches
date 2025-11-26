// backend/src/routes/payments.js

const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  createStripeIntent,
  stripeWebhook,
  getPaymentHistory,
  getPaymentDetails
} = require('../controllers/paymentController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

// ==================== RAZORPAY ROUTES ====================

/**
 * @route   POST /api/payments/razorpay/create
 * @desc    Create Razorpay order
 * @body    { amount: number, orderId?: uuid }
 * @access  Private (Customer)
 */
router.post('/razorpay/create', verifyCustomerToken, customerSecurityHeaders, createRazorpayOrder);

/**
 * @route   POST /api/payments/razorpay/verify
 * @desc    Verify Razorpay payment signature
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 * @access  Private (Customer)
 */
router.post('/razorpay/verify', verifyCustomerToken, customerSecurityHeaders, verifyRazorpayPayment);

/**
 * @route   POST /api/payments/razorpay/webhook
 * @desc    Razorpay webhook endpoint
 * @access  Public (Razorpay servers only - signature verified)
 * @note    NO authentication middleware - Razorpay needs direct access
 */
router.post('/razorpay/webhook', razorpayWebhook);

// ==================== STRIPE ROUTES ====================

/**
 * @route   POST /api/payments/stripe/intent
 * @desc    Create Stripe payment intent
 * @body    { amount: number, orderId?: uuid }
 * @access  Private (Customer)
 */
router.post('/stripe/intent', verifyCustomerToken, customerSecurityHeaders, createStripeIntent);

/**
 * @route   POST /api/payments/stripe/webhook
 * @desc    Stripe webhook endpoint
 * @access  Public (Stripe servers only - signature verified)
 * @note    NO authentication middleware - Stripe needs direct access
 */
router.post('/stripe/webhook', stripeWebhook);

// ==================== PAYMENT QUERY ROUTES ====================

// Apply security headers to all query routes
router.use(customerSecurityHeaders);

// All query routes require authentication
router.use(verifyCustomerToken);

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @query   ?page=1&limit=10&status=success
 * @access  Private (Customer)
 */
router.get('/history', getPaymentHistory);

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment details
 * @access  Private (Customer)
 */
router.get('/:id', getPaymentDetails);

module.exports = router;