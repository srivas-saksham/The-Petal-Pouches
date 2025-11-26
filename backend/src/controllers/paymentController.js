// backend/src/controllers/paymentController.js

const supabase = require('../config/supabaseClient');
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
        const { data: order, error } = await supabase
          .from('Orders')
          .select('id, user_id, final_total')
          .eq('id', orderId)
          .eq('user_id', userId)
          .single();

        if (error || !order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Verify amount matches order total
        if (parseFloat(order.final_total) !== parseFloat(amount)) {
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
    try {
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
          await supabase
            .from('Payments')
            .insert([{
              user_id: userId,
              order_id: orderId,
              provider: 'razorpay',
              payment_id: razorpay_payment_id,
              amount: 0,
              status: 'failed',
              is_success: false,
              failure_msg: 'Invalid signature'
            }]);

          // Update order payment status
          await supabase
            .from('Orders')
            .update({ payment_status: 'failed' })
            .eq('id', orderId);
        }

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed - Invalid signature'
        });
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      // Record successful payment
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('Payments')
        .insert([{
          user_id: userId,
          order_id: orderId || null,
          provider: 'razorpay',
          payment_id: razorpay_payment_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'success',
          is_success: true
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update order status and payment status
      if (orderId) {
        // Get current order status
        const { data: currentOrder } = await supabase
          .from('Orders')
          .select('status')
          .eq('id', orderId)
          .single();

        const newStatus = currentOrder?.status === 'pending' ? 'confirmed' : currentOrder?.status;

        await supabase
          .from('Orders')
          .update({
            payment_status: 'paid',
            payment_id: razorpay_payment_id,
            status: newStatus
          })
          .eq('id', orderId);
      }

      console.log(`✅ Payment verified: ${razorpay_payment_id}`);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: paymentRecord,
          razorpay_payment_id,
          razorpay_order_id
        }
      });

    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
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
            await supabase
              .from('Orders')
              .update({ payment_status: 'failed' })
              .eq('id', orderId);
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

      // Build query
      let query = supabase
        .from('Payments')
        .select(`
          *,
          Orders (
            id,
            final_total,
            status
          )
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Filter by status
      if (status) {
        query = query.eq('status', status);
      }

      // Apply pagination and ordering
      const { data: payments, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;

      // Transform data to match original structure
      const transformedPayments = (payments || []).map(payment => ({
        ...payment,
        order_number: payment.Orders?.id || null,
        order_amount: payment.Orders?.final_total || null,
        order_status: payment.Orders?.status || null
      }));

      res.status(200).json({
        success: true,
        message: 'Payment history retrieved successfully',
        data: transformedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
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

      const { data: payment, error } = await supabase
        .from('Payments')
        .select(`
          *,
          Orders (
            id,
            final_total,
            status
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Transform data to match original structure
      const transformedPayment = {
        ...payment,
        order_number: payment.Orders?.id || null,
        order_amount: payment.Orders?.final_total || null,
        order_status: payment.Orders?.status || null
      };

      res.status(200).json({
        success: true,
        message: 'Payment details retrieved successfully',
        data: transformedPayment
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