// backend/src/services/razorpayService.js
/**
 * Razorpay Service
 * Handles all Razorpay payment operations
 * - Create orders
 * - Verify payment signatures
 * - Process refunds
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    // Initialize Razorpay instance
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    this.currency = process.env.RAZORPAY_CURRENCY || 'INR';
    
    // Validate configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ CRITICAL: Razorpay credentials not configured in .env file!');
      console.error('Add these lines to your .env file:');
      console.error('RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx');
      console.error('RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx');
    } else {
      console.log(`✅ Razorpay configured: ${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...`);
    }
  }

  // ==================== CREATE ORDER ====================

  /**
   * Create Razorpay order
   * @param {Object} orderData - Order details
   * @param {number} orderData.amount - Amount in rupees (will be converted to paise)
   * @param {string} orderData.orderId - Your internal order ID
   * @param {Object} orderData.notes - Additional metadata
   * @returns {Promise<Object>} Razorpay order details
   */
  async createOrder(orderData) {
    try {
      const { amount, orderId, notes = {} } = orderData;

      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      console.log(`💳 [Razorpay] Creating order for ₹${amount}`);

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // ✅ Convert rupees to paise (₹100 = 10000 paise)
        currency: this.currency,
        // ✅ Bug 4 fix: only include receipt if orderId is a non-null string
        ...(orderId ? { receipt: orderId } : {}),
        notes: {
          order_id: orderId,
          ...notes,
        },
      };

      const razorpayOrder = await this.razorpay.orders.create(options);

      console.log(`✅ [Razorpay] Order created: ${razorpayOrder.id}`);

      return {
        success: true,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount, // In paise
        amount_rupees: razorpayOrder.amount / 100, // In rupees
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
      };

    } catch (error) {
      console.error('❌ [Razorpay] Create order failed:', {
        statusCode: error.statusCode,
        description: error.error?.description,
        message: error.message,
        full: error
      });

      // Handle Razorpay API errors
      if (error.statusCode === 401) {
        throw new Error('Invalid Razorpay credentials. Check API keys.');
      }

      if (error.statusCode === 400) {
        throw new Error(`Razorpay validation error: ${error.error?.description || error.message}`);
      }

      throw new Error(`Failed to create Razorpay order: ${error.error?.description || error.message || 'Unknown Razorpay error'}`);
    }
  }

  // ==================== VERIFY PAYMENT ====================

  /**
   * Verify Razorpay payment signature
   * This ensures the payment callback is authentic and not tampered
   * 
   * @param {Object} paymentData - Payment verification data
   * @param {string} paymentData.razorpay_order_id - Razorpay order ID
   * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
   * @param {string} paymentData.razorpay_signature - Signature from Razorpay
   * @returns {boolean} true if signature is valid
   */
  verifyPaymentSignature(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.error('❌ [Razorpay] Missing payment verification data');
        return false;
      }

      console.log(`🔐 [Razorpay] Verifying payment: ${razorpay_payment_id}`);

      // Generate expected signature
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      // Compare signatures (constant-time comparison to prevent timing attacks)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpay_signature, 'hex')
      );

      if (isValid) {
        console.log(`✅ [Razorpay] Payment verified successfully`);
      } else {
        console.error(`❌ [Razorpay] Invalid signature - possible tampering detected!`);
      }

      return isValid;

    } catch (error) {
      console.error('❌ [Razorpay] Signature verification error:', error);
      return false;
    }
  }

  // ==================== VERIFY WEBHOOK ====================

  /**
   * Verify webhook signature
   * Ensures webhook events are from Razorpay
   * 
   * @param {string} signature - X-Razorpay-Signature header
   * @param {string} body - Raw webhook body (JSON string)
   * @returns {boolean} true if webhook is authentic
   */
  verifyWebhookSignature(signature, body) {
  try {
    // Fail-closed in production, permissive in development
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        console.error('🚨 [Razorpay] CRITICAL: Webhook secret required in production - REJECTING');
        return false;
      }
      console.warn('⚠️ [Razorpay] [DEV ONLY] Webhook secret not configured - allowing');
      return true;
    }

    if (!signature) {
      console.error('🚨 [Razorpay] Missing webhook signature header');
      return false;
    }

      console.log(`🔐 [Razorpay] Verifying webhook signature`);

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );

      if (isValid) {
        console.log(`✅ [Razorpay] Webhook verified successfully`);
      } else {
        console.error(`❌ [Razorpay] Invalid webhook signature!`);
      }

      return isValid;

    } catch (error) {
      console.error('❌ [Razorpay] Webhook verification error:', error);
      return false;
    }
  }

  // ==================== FETCH RAZORPAY ORDER ====================

  /**
   * Fetch a Razorpay order by its order ID (used by webhook fallback)
   * @param {string} razorpayOrderId - Razorpay order ID (order_xxx)
   * @returns {Promise<Object|null>} Razorpay order object including notes
   */
  async fetchRazorpayOrder(razorpayOrderId) {
    try {
      console.log(`📥 [Razorpay] Fetching order: ${razorpayOrderId}`);
      const order = await this.razorpay.orders.fetch(razorpayOrderId);
      console.log(`✅ [Razorpay] Order fetched: ${order.id}`);
      return order;
    } catch (error) {
      console.error('❌ [Razorpay] Fetch order failed:', error.message);
      return null;
    }
  }

  // ==================== FETCH PAYMENT ====================

  /**
   * Fetch payment details from Razorpay
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<Object>} Payment details
   */
  async fetchPayment(paymentId) {
    try {
      console.log(`📥 [Razorpay] Fetching payment: ${paymentId}`);

      const payment = await this.razorpay.payments.fetch(paymentId);

      console.log(`✅ [Razorpay] Payment fetched: ${payment.status}`);

      return {
        success: true,
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at,
      };

    } catch (error) {
      console.error('❌ [Razorpay] Fetch payment failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== REFUND ====================

  /**
   * Create refund for a payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund (optional, full refund if not specified)
   * @returns {Promise<Object>} Refund details
   */
  async createRefund(paymentId, amount = null) {
    try {
      console.log(`💸 [Razorpay] Creating refund for: ${paymentId}`);

      const options = {};
      
      // Partial refund if amount specified
      if (amount) {
        options.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, options);

      console.log(`✅ [Razorpay] Refund created: ${refund.id}`);

      return {
        success: true,
        refund_id: refund.id,
        payment_id: refund.payment_id,
        amount: refund.amount / 100, // Convert to rupees
        currency: refund.currency,
        status: refund.status,
        created_at: refund.created_at,
      };

    } catch (error) {
      console.error('❌ [Razorpay] Refund failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check if Razorpay API is accessible
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      // Try to fetch a dummy order (will fail but confirms API is reachable)
      await this.razorpay.orders.fetch('order_dummy');
    } catch (error) {
      // If we get 401, credentials are wrong
      if (error.statusCode === 401) {
        return {
          healthy: false,
          service: 'Razorpay API',
          message: 'Invalid API credentials',
          timestamp: new Date().toISOString(),
        };
      }

      // If we get 400 (bad request), API is reachable
      if (error.statusCode === 400 || error.statusCode === 404) {
        return {
          healthy: true,
          service: 'Razorpay API',
          message: 'API is responsive',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        healthy: false,
        service: 'Razorpay API',
        message: 'API is unreachable',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
const razorpayService = new RazorpayService();
module.exports = razorpayService;