// backend/src/routes/payments.js
/**
 * Payment Routes
 * Base path: /api/payments
 * Handles Razorpay payment operations
 */

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { 
  verifyCustomerToken, 
  customerSecurityHeaders 
} = require('../middleware/userAuth');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhooks (payment events)
 * @access  Public (called by Razorpay)
 * @note    NO AUTH - Razorpay servers call this
 * @note    Uses raw body parser for signature verification
 */
router.post('/webhook', PaymentController.handleWebhook);

// ==================== PROTECTED ROUTES ====================

// Apply security headers to all protected routes
router.use(customerSecurityHeaders);

// Apply authentication to all protected routes
router.use(verifyCustomerToken);

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for payment
 * @access  Private (Customer)
 * @body    { address_id, notes?, gift_wrap?, gift_message?, delivery_metadata? }
 * @returns { order_id, razorpay_order_id, amount, currency, key_id, customer }
 */
router.post('/create-order', PaymentController.createPaymentOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment signature after successful payment
 * @access  Private (Customer)
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
 * @returns { order_id, payment_id, status, amount, method }
 */
router.post('/verify', PaymentController.verifyPayment);

/**
 * @route   GET /api/payments/status/:order_id
 * @desc    Check payment status for an order
 * @access  Private (Customer)
 * @returns { order_id, payment_status, payment_id, payment_method, amount }
 */
router.get('/status/:order_id', PaymentController.getPaymentStatus);

// ==================== EXPORT ====================

module.exports = router;