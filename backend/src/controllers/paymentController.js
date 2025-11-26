// backend/src/controllers/paymentController.js

const pool = require('../config/database');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Payment Controller
 * Handles Razorpay and Stripe payment processing
 */
const PaymentController = {

  // ==================== RAZORPAY INTEGRATION ====================

  /**
   * Create Razorpay order
   * POST /api/payments/razorpay/create
   */
  createRazorpayOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, currency = 'INR', orderId } = req.body;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }

      // Verify order exists and belongs to user
      if (orderId) {
        const orderCheck = await pool.query(
          'SELECT id, user_id, final_total FROM orders WHERE id = $1 AND user_id = $2',
          [orderId, userId]
        );

        if (orderCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Verify amount matches order total
        if (orderCheck.rows[0].final_total !== amount) {
          return res.status(400).json({
            success: false,
            message: 'Amount mismatch with order total'
          });
        }
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: orderId || `receipt_${Date.now()}`,
        notes: {
          user_id: userId,
          order_id: orderId || null
        }
      });

      console.log(`✅ Razorpay order created: ${razorpayOrder.id}`);

      res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: {
          razorpay_order_id: razorpayOrder.id,
          amount: razorpayOrder.amount / 100, // Convert back to rupees
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      });

    } catch (error) {
      console.error('Create Razorpay order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
        error: error.message
      });
    }
  },

  /**
   * Verify Razorpay payment signature
   * POST /api/payments/razorpay/verify
   */
  verifyRazorpayPayment: async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const userId = req.user.id;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
      } = req.body;

      // Validation
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment details are required'
        });
      }

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        // Record failed payment
        if (orderId) {
          await client.query(
            `INSERT INTO payments (user_id, order_id, provider, payment_id, amount, status, is_success, failure_msg)
             VALUES ($1, $2, 'razorpay', $3, 0, 'failed', false, 'Invalid signature')`,
            [userId, orderId, razorpay_payment_id]
          );

          // Update order payment status
          await client.query(
            `UPDATE orders SET payment_status = 'failed' WHERE id = $1`,
            [orderId]
          );
        }

        await client.query('COMMIT');

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed - Invalid signature'
        });
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      // Record successful payment
      const paymentResult = await client.query(
        `INSERT INTO payments (user_id, order_id, provider, payment_id, amount, currency, status, is_success)
         VALUES ($1, $2, 'razorpay', $3, $4, $5, 'success', true)
         RETURNING *`,
        [userId, orderId || null, razorpay_payment_id, payment.amount / 100, payment.currency]
      );

      // Update order status and payment status
      if (orderId) {
        await client.query(
          `UPDATE orders 
           SET payment_status = 'paid', 
               payment_id = $1,
               status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END
           WHERE id = $2`,
          [razorpay_payment_id, orderId]
        );
      }

      await client.query('COMMIT');

      console.log(`✅ Payment verified: ${razorpay_payment_id}`);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: paymentResult.rows[0],
          razorpay_payment_id,
          razorpay_order_id
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Verify Razorpay payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  /**
   * Razorpay webhook handler
   * POST /api/payments/razorpay/webhook
   */
  razorpayWebhook: async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      const event = req.body.event;
      const payload = req.body.payload;

      console.log(`📨 Razorpay webhook: ${event}`);

      // Handle different events
      switch (event) {
        case 'payment.captured':
          // Payment successful
          console.log(`✅ Payment captured: ${payload.payment.entity.id}`);
          break;

        case 'payment.failed':
          // Payment failed
          console.log(`❌ Payment failed: ${payload.payment.entity.id}`);
          
          // Update order status
          const orderId = payload.payment.entity.notes?.order_id;
          if (orderId) {
            await pool.query(
              `UPDATE orders SET payment_status = 'failed' WHERE id = $1`,
              [orderId]
            );
          }
          break;

        case 'refund.created':
          // Refund initiated
          console.log(`💰 Refund created: ${payload.refund.entity.id}`);
          break;

        default:
          console.log(`ℹ️ Unhandled event: ${event}`);
      }

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Razorpay webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  },

  // ==================== STRIPE INTEGRATION ====================

  /**
   * Create Stripe payment intent
   * POST /api/payments/stripe/intent
   */
  createStripeIntent: async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, currency = 'inr', orderId } = req.body;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }

      // Note: Stripe integration requires stripe npm package
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      res.status(501).json({
        success: false,
        message: 'Stripe integration not yet implemented. Please use Razorpay or COD.'
      });

    } catch (error) {
      console.error('Create Stripe intent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Stripe payment intent',
        error: error.message
      });
    }
  },

  /**
   * Stripe webhook handler
   * POST /api/payments/stripe/webhook
   */
  stripeWebhook: async (req, res) => {
    try {
      // Note: Requires stripe package for signature verification
      
      res.status(501).json({
        success: false,
        message: 'Stripe webhook not yet implemented'
      });

    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  },

  // ==================== PAYMENT QUERIES ====================

  /**
   * Get user's payment history
   * GET /api/payments/history
   */
  getPaymentHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT p.*, o.id as order_number, o.final_total as order_amount
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        WHERE p.user_id = $1
      `;
      const params = [userId];

      // Filter by status
      if (status) {
        query += ` AND p.status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM payments WHERE user_id = $1',
        [userId]
      );

      res.status(200).json({
        success: true,
        message: 'Payment history retrieved successfully',
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(countResult.rows[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment history',
        error: error.message
      });
    }
  },

  /**
   * Get payment details by ID
   * GET /api/payments/:id
   */
  getPaymentDetails: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await pool.query(
        `SELECT p.*, o.id as order_number, o.final_total as order_amount, o.status as order_status
         FROM payments p
         LEFT JOIN orders o ON p.order_id = o.id
         WHERE p.id = $1 AND p.user_id = $2`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment details retrieved successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment details',
        error: error.message
      });
    }
  }

};

module.exports = PaymentController;