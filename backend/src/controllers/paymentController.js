// backend/src/controllers/paymentController.js
/**
 * Payment Controller
 * Handles Razorpay payment operations
 * - Create payment orders
 * - Verify payment signatures
 * - Handle webhooks
 * - Update order payment status
 */

const razorpayService = require('../services/razorpayService');
const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const PaymentModel = require('../models/paymentModel');

const PaymentController = {

  // ==================== CREATE PAYMENT ORDER ====================

  /**
   * Create Razorpay order for payment
   * POST /api/payments/create-order
   * 
   * Flow:
   * 1. Create pending order in database
   * 2. Create Razorpay order
   * 3. Return order details + Razorpay order ID
   * 
   * @body {
   *   address_id: string,
   *   notes?: string,
   *   gift_wrap?: boolean,
   *   gift_message?: string,
   *   delivery_metadata?: object
   * }
   */
  createPaymentOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        address_id,
        notes,
        gift_wrap = false,
        gift_message,
        delivery_metadata = {}
      } = req.body;

      console.log('💳 [Payment] Creating payment order for user:', userId);

      // ===== STEP 1: VALIDATE ADDRESS =====
      if (!address_id) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required'
        });
      }

      const supabase = require('../config/supabaseClient');
      const { data: address, error: addrError } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', address_id)
        .eq('user_id', userId)
        .single();

      if (addrError || !address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // ===== STEP 2: GET CART =====
      const cartData = await CartModel.getCartWithItems(userId);

      if (!cartData.items || cartData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty',
          code: 'CART_EMPTY'
        });
      }

      // ===== STEP 3: CHECK STOCK =====
      const stockCheck = await CartModel.checkStock(userId);
      
      if (!stockCheck.all_in_stock) {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock',
          code: 'INSUFFICIENT_STOCK',
          out_of_stock_items: stockCheck.out_of_stock_items
        });
      }

      // ===== STEP 4: CALCULATE TOTALS =====
      const { calculateOrderTotals } = require('../utils/orderHelpers');
      const deliveryMode = delivery_metadata.mode || 'surface';
      const expressCharge = delivery_metadata.express_charge || 0;
      const totals = calculateOrderTotals(cartData.items, deliveryMode, expressCharge);

      console.log('💰 Order totals:', totals);

      // ===== STEP 5: CREATE RAZORPAY ORDER (NO DB ORDER YET!) =====
      const razorpayOrder = await razorpayService.createOrder({
        amount: totals.total,
        orderId: null, // ⭐ No DB order ID yet!
        notes: {
          user_id: userId,
          customer_name: req.user.name || 'Customer',
          customer_email: req.user.email,
          address_id: address_id,
          // ⭐ Store order data in notes for later
          order_metadata: JSON.stringify({
            address_id,
            notes,
            gift_wrap,
            gift_message,
            delivery_metadata
          })
        }
      });

      if (!razorpayOrder.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to initialize payment'
        });
      }

      console.log(`✅ Razorpay order created: ${razorpayOrder.razorpay_order_id}`);

      // ===== STEP 6: RETURN ORDER DETAILS =====
      return res.status(201).json({
        success: true,
        message: 'Payment order created',
        data: {
          razorpay_order_id: razorpayOrder.razorpay_order_id,
          amount: razorpayOrder.amount_rupees,
          currency: razorpayOrder.currency,
          key_id: process.env.RAZORPAY_KEY_ID,
          customer: {
            name: req.user.name || 'Customer',
            email: req.user.email,
            phone: address.phone
          },
          // ⭐ Return order data to frontend for verification
          order_data: {
            address_id,
            notes,
            gift_wrap,
            gift_message,
            delivery_metadata
          }
        }
      });

    } catch (error) {
      console.error('❌ [Payment] Create order error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== VERIFY PAYMENT ====================

  /**
   * Verify payment signature after successful payment
   * POST /api/payments/verify
   */
  verifyPayment: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_data // ⭐ Order data from frontend
      } = req.body;

      console.log('🔐 [Payment] Verifying payment:', razorpay_payment_id);

      // ===== STEP 1: VALIDATE INPUT =====
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_data) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment verification data'
        });
      }

      // ===== STEP 2: VERIFY RAZORPAY SIGNATURE =====
      const isValid = razorpayService.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!isValid) {
        console.error('❌ [Payment] Invalid signature');
        
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          code: 'INVALID_SIGNATURE'
        });
      }

      console.log('✅ [Payment] Signature verified');

      // ===== STEP 3: GET CART (REVALIDATE) =====
      const cartData = await CartModel.getCartWithItems(userId);

      if (!cartData.items || cartData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // ===== STEP 4: CHECK STOCK AGAIN =====
      const stockCheck = await CartModel.checkStock(userId);
      
      if (!stockCheck.all_in_stock) {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock',
          code: 'INSUFFICIENT_STOCK',
          out_of_stock_items: stockCheck.out_of_stock_items
        });
      }

      // ===== STEP 5: GET ADDRESS =====
      const supabase = require('../config/supabaseClient');
      const { data: address } = await supabase
        .from('Addresses')
        .select('*')
        .eq('id', order_data.address_id)
        .eq('user_id', userId)
        .single();

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // ===== STEP 6: CALCULATE TOTALS =====
      const { calculateOrderTotals } = require('../utils/orderHelpers');
      const deliveryMode = order_data.delivery_metadata?.mode || 'surface';
      const expressCharge = order_data.delivery_metadata?.express_charge || 0;
      const totals = calculateOrderTotals(cartData.items, deliveryMode, expressCharge);

      // ===== STEP 7: FETCH PAYMENT DETAILS =====
      const paymentDetails = await razorpayService.fetchPayment(razorpay_payment_id);
      console.log('💳 Payment details:', paymentDetails);

      // ===== STEP 8: NOW CREATE DATABASE ORDER =====
      const orderData = {
        user_id: userId,
        subtotal: totals.subtotal,
        express_charge: totals.express_charge,
        discount: 0,
        final_total: totals.total,
        shipping_address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          country: address.country || 'India',
          zip_code: address.zip_code,
          phone: address.phone,
          landmark: address.landmark
        },
        payment_method: 'online',
        payment_status: 'paid', // ⭐ Already paid!
        notes: order_data.notes || null,
        gift_wrap: order_data.gift_wrap || false,
        gift_message: order_data.gift_message || null,
        bundle_type: 'mixed',
        status: 'confirmed', // ⭐ Already confirmed!
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        delivery_metadata: order_data.delivery_metadata || {}
      };

      const orderItems = cartData.items.map(item => ({
        bundle_id: item.bundle_id,
        bundle_title: item.title,
        bundle_quantity: item.quantity,
        price: item.price,
        bundle_origin: 'brand-bundle'
      }));

      const order = await OrderModel.create(orderData, orderItems);
      console.log(`✅ Order created after payment: ${order.id}`);

      // ===== STEP 9: CREATE PAYMENT RECORD =====
      const PaymentModel = require('../models/paymentModel');
      const paymentRecord = await PaymentModel.createPaymentRecord({
        order_id: order.id,
        user_id: userId,
        provider: 'Razorpay',
        payment_id: razorpay_payment_id,
        amount: paymentDetails.amount_rupees || totals.total,
        currency: paymentDetails.currency || 'INR',
        status: paymentDetails.status || 'captured',
        is_success: true
      });
      console.log('✅ Payment record created:', paymentRecord.id);

      // ===== STEP 10: DEDUCT STOCK =====
      try {
        const StockService = require('../services/stockService');
        const stockDeductionItems = orderItems.map(item => ({
          bundle_id: item.bundle_id,
          quantity: item.bundle_quantity
        }));

        await StockService.deductBundleStock(stockDeductionItems);
        console.log('✅ Stock deducted');
      } catch (stockError) {
        console.error('⚠️ Stock deduction error:', stockError);
      }

      // ===== STEP 11: CLEAR CART =====
      await CartModel.clearCart(userId);
      console.log('✅ Cart cleared');

      // ===== STEP 12: CREATE SHIPMENT =====
      try {
        const ShipmentModel = require('../models/shipmentModel');
        const deliveryMetadata = order_data.delivery_metadata || {};

        await ShipmentModel.createWithCostCalculation(order.id, {
          destination_pincode: address.zip_code,
          destination_city: address.city,
          destination_state: address.state,
          shipping_mode: deliveryMetadata.mode === 'express' ? 'Express' : 'Surface',
          weight_grams: 1000,
          order_total: totals.total,
          payment_mode: 'Prepaid',
          dimensions_cm: { length: 30, width: 25, height: 10 }
        });
        console.log('✅ Shipment created');
      } catch (shipmentError) {
        console.error('⚠️ Shipment creation failed:', shipmentError);
      }

      // ===== STEP 13: RETURN SUCCESS =====
      return res.status(200).json({
        success: true,
        message: 'Payment verified and order created',
        data: {
          order_id: order.id,
          payment_id: razorpay_payment_id,
          payment_record_id: paymentRecord.id,
          status: 'paid',
          amount: paymentDetails.amount_rupees || totals.total,
          method: paymentDetails.method || 'card'
        }
      });

    } catch (error) {
      console.error('❌ [Payment] Verify payment error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== WEBHOOK HANDLER ====================

  /**
   * Handle Razorpay webhooks
   * POST /api/payments/webhook
   * 
   * Handles:
   * - payment.captured
   * - payment.failed
   * - order.paid
   */
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const body = JSON.stringify(req.body);

      console.log('🔔 [Webhook] Received Razorpay webhook');

      // ===== STEP 1: VERIFY WEBHOOK SIGNATURE =====
      const isValid = razorpayService.verifyWebhookSignature(signature, body);

      if (!isValid) {
        console.error('❌ [Webhook] Invalid signature');
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      console.log('✅ [Webhook] Signature verified');

      // ===== STEP 2: PROCESS WEBHOOK EVENT =====
      const event = req.body.event;
      const payload = req.body.payload?.payment?.entity || req.body.payload?.order?.entity;

      console.log(`📨 [Webhook] Event: ${event}`);

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'order.paid':
          await this.handleOrderPaid(payload);
          break;

        default:
          console.log(`ℹ️ [Webhook] Unhandled event: ${event}`);
      }

      // ===== STEP 3: ACKNOWLEDGE WEBHOOK =====
      return res.status(200).json({
        success: true,
        message: 'Webhook processed'
      });

    } catch (error) {
      console.error('❌ [Webhook] Processing error:', error);
      
      // Return 200 to prevent Razorpay retries on server errors
      return res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed'
      });
    }
  },

  // ==================== WEBHOOK EVENT HANDLERS ====================

  /**
   * Handle payment.captured event
   */
  handlePaymentCaptured: async (payload) => {
    try {
      const { order_id, id: payment_id } = payload;
      
      console.log(`✅ [Webhook] Payment captured: ${payment_id}`);

      // Find order by Razorpay order ID
      const supabase = require('../config/supabaseClient');
      const { data: order, error } = await supabase
        .from('Orders')
        .select('id, payment_status')
        .eq('payment_id', order_id)
        .single();

      if (error || !order) {
        console.warn(`⚠️ [Webhook] Order not found for Razorpay order: ${order_id}`);
        return;
      }

      // Update if not already paid
      if (order.payment_status !== 'paid') {
        await OrderModel.updatePaymentStatus(order.id, 'paid', payment_id);
        await OrderModel.updateStatus(order.id, 'confirmed');
        console.log(`✅ [Webhook] Order ${order.id} marked as paid`);
      }

    } catch (error) {
      console.error('❌ [Webhook] Payment captured handler error:', error);
    }
  },

  /**
   * Handle payment.failed event
   */
  handlePaymentFailed: async (payload) => {
    try {
      const { order_id, id: payment_id, error_description } = payload;
      
      console.log(`❌ [Webhook] Payment failed: ${payment_id} - ${error_description}`);

      // Find order
      const supabase = require('../config/supabaseClient');
      const { data: order, error } = await supabase
        .from('Orders')
        .select('id')
        .eq('payment_id', order_id)
        .single();

      if (error || !order) {
        console.warn(`⚠️ [Webhook] Order not found for Razorpay order: ${order_id}`);
        return;
      }

      // Mark payment as failed
      await OrderModel.updatePaymentStatus(order.id, 'failed', payment_id);
      console.log(`❌ [Webhook] Order ${order.id} payment failed`);

    } catch (error) {
      console.error('❌ [Webhook] Payment failed handler error:', error);
    }
  },

  /**
   * Handle order.paid event
   */
  handleOrderPaid: async (payload) => {
    try {
      const { id: razorpay_order_id, amount_paid } = payload;
      
      console.log(`✅ [Webhook] Order paid: ${razorpay_order_id}`);

      // Find order
      const supabase = require('../config/supabaseClient');
      const { data: order, error } = await supabase
        .from('Orders')
        .select('id, payment_status')
        .eq('payment_id', razorpay_order_id)
        .single();

      if (error || !order) {
        console.warn(`⚠️ [Webhook] Order not found: ${razorpay_order_id}`);
        return;
      }

      // Update if not already paid
      if (order.payment_status !== 'paid') {
        await OrderModel.updatePaymentStatus(order.id, 'paid');
        await OrderModel.updateStatus(order.id, 'confirmed');
        console.log(`✅ [Webhook] Order ${order.id} confirmed`);
      }

    } catch (error) {
      console.error('❌ [Webhook] Order paid handler error:', error);
    }
  },

  // ==================== PAYMENT STATUS CHECK ====================

  /**
   * Check payment status
   * GET /api/payments/status/:order_id
   */
  getPaymentStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.order_id;

      const order = await OrderModel.findById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          order_id: order.id,
          payment_status: order.payment_status,
          payment_id: order.payment_id,
          payment_method: order.payment_method,
          amount: order.final_total
        }
      });

    } catch (error) {
      console.error('❌ [Payment] Get status error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get payment status'
      });
    }
  }
};

module.exports = PaymentController;