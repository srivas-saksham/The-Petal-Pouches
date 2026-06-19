// backend/src/controllers/paymentController.js
/**
 * Payment Controller
 * Handles Razorpay payment operations
 * - Create payment orders
 * - Verify payment signatures
 * - Handle webhooks
 * - Update order payment status
 * ⭐ UPDATED: Integrated coupon validation and application
 */

const razorpayService = require('../services/razorpayService');
const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const PaymentModel = require('../models/paymentModel');
const CouponController = require('./couponController'); // ⭐ NEW

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
   *   delivery_metadata?: object,
   *   coupon_code?: string  ⭐ NEW
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
        delivery_metadata = {},
        coupon_code = null // ⭐ NEW
      } = req.body;

      console.log('💳 [Payment] Creating payment order for user:', userId);
      if (coupon_code) {
        console.log('🎟️ [Payment] Coupon code provided:', coupon_code);
      }

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

      // ===== STEP 4: CALCULATE TOTALS (WITHOUT COUPON FIRST) =====
      const { calculateOrderTotals } = require('../utils/orderHelpers');
      const deliveryMode = delivery_metadata.mode || 'surface';
      const expressCharge = delivery_metadata.express_charge || 0;
      const totals = calculateOrderTotals(cartData.items, deliveryMode, expressCharge);

      console.log('💰 Order totals (before coupon):', totals);

      // ===== STEP 4.5: VALIDATE AND APPLY COUPON ⭐ NEW =====
      let couponData = null;
      let discount = 0;

      if (coupon_code) {
        try {
          console.log('🎟️ [Payment] Validating coupon:', coupon_code);
          
          // ⭐ FIX: Prepare cart items for coupon validation
          const couponCartItems = cartData.items.map(item => ({
            type: item.bundle_id ? 'bundle' : 'product',
            bundle_id: item.bundle_id || null,
            product_id: item.product_id || null,
            quantity: item.quantity,
            price: item.price
          }));

          console.log('📦 [Payment] Cart items for coupon:', couponCartItems);
          
          const couponResult = await CouponController.applyCouponToOrder(
            coupon_code,
            totals.subtotal,
            userId,
            couponCartItems // ⭐ FIX: Pass cart items array
          );

          if (couponResult.success) {
            couponData = {
              coupon_id: couponResult.coupon_id,
              coupon_code: couponResult.coupon_code,
              discount: couponResult.discount
            };
            discount = couponResult.discount;

            console.log(`✅ [Payment] Coupon applied - Discount: ₹${discount}`);
          }
        } catch (couponError) {
          console.error('❌ [Payment] Coupon validation failed:', couponError.message);
          
          return res.status(400).json({
            success: false,
            message: couponError.message,
            code: 'COUPON_INVALID'
          });
        }
      }

      // ===== STEP 5: RECALCULATE FINAL TOTAL WITH DISCOUNT =====
      const finalTotal = totals.total - discount;

      console.log('💰 Final total (after coupon):', {
        subtotal: totals.subtotal,
        express_charge: totals.express_charge,
        discount: discount,
        final_total: finalTotal
      });

      // ===== STEP 6: CREATE RAZORPAY ORDER (NO DB ORDER YET!) =====
      const razorpayOrder = await razorpayService.createOrder({
        amount: finalTotal,
        orderId: null, // ⭐ No DB order ID yet!
        notes: {
          user_id: userId,
          customer_name: req.user.name || 'Customer',
          customer_email: req.user.email,
          address_id: address_id,
          coupon_code: coupon_code || null, // ⭐ Store coupon in notes
          // ⭐ Store order data in notes for later
          order_metadata: JSON.stringify({
            address_id,
            notes,
            gift_wrap,
            gift_message,
            delivery_metadata,
            coupon_code, // ⭐ Include coupon
            coupon_data: couponData // ⭐ Include full coupon data
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

      // ===== STEP 7: RETURN ORDER DETAILS =====
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
            delivery_metadata,
            coupon_code, // ⭐ Include coupon
            coupon_data: couponData // ⭐ Include coupon details
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
   * ⭐ UPDATED: Records coupon usage after successful payment
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

      // ===== STEP 2.5: IDEMPOTENCY GUARD — prevent duplicate orders =====
      // If an order already exists for this razorpay_payment_id, return it immediately.
      // This handles double-submits, network retries, and webhook race conditions.
      {
        const supabaseIdempotency = require('../config/supabaseClient');
        const { data: existingOrder } = await supabaseIdempotency
          .from('Orders')
          .select('id, payment_status, final_total')
          .eq('razorpay_payment_id', razorpay_payment_id)
          .single();

        if (existingOrder) {
          console.log(`ℹ️ [Payment] Order already exists for payment ${razorpay_payment_id} — returning existing order`);
          return res.status(200).json({
            success: true,
            message: 'Payment already verified and order already exists',
            data: {
              order_id: existingOrder.id,
              payment_id: razorpay_payment_id,
              payment_record_id: null,
              status: existingOrder.payment_status,
              amount: existingOrder.final_total,
              method: 'card',
              discount: 0,
              coupon_code: null
            }
          });
        }
      }
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

      // ===== STEP 6.5: REVALIDATE COUPON IF PROVIDED ⭐ NEW =====
      let discount = 0;
      let couponData = null;

      if (order_data.coupon_code) {
        try {
          console.log('🎟️ [Payment] Revalidating coupon:', order_data.coupon_code);
          
          // ⭐ FIX: Prepare cart items for revalidation
          const couponCartItems = cartData.items.map(item => ({
            type: item.bundle_id ? 'bundle' : 'product',
            bundle_id: item.bundle_id || null,
            product_id: item.product_id || null,
            quantity: item.quantity,
            price: item.price
          }));
          
          const couponResult = await CouponController.applyCouponToOrder(
            order_data.coupon_code,
            totals.subtotal,
            userId,
            couponCartItems // ⭐ FIX: Pass cart items array
          );

          if (couponResult.success) {
            discount = couponResult.discount;
            couponData = {
              coupon_id: couponResult.coupon_id,
              coupon_code: couponResult.coupon_code
            };
            
            console.log(`✅ [Payment] Coupon revalidated - Discount: ₹${discount}`);
          }
        } catch (couponError) {
          console.error('❌ [Payment] Coupon revalidation failed:', couponError.message);
          // Continue without coupon - don't fail the payment
          discount = 0;
          couponData = null;
        }
      }

      // ===== STEP 7: FETCH PAYMENT DETAILS =====
      const paymentDetails = await razorpayService.fetchPayment(razorpay_payment_id);
      console.log('💳 Payment details:', paymentDetails);

      // ===== STEP 8: NOW CREATE DATABASE ORDER =====
      const orderDataToCreate = {
        user_id: userId,
        subtotal: totals.subtotal,
        express_charge: totals.express_charge,
        discount: discount, // ⭐ Coupon discount
        final_total: totals.total - discount, // ⭐ Apply discount
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

      const orderItems = cartData.items.map(item => {
      // Bundle item
      if (item.bundle_id) {
        return {
          bundle_id: item.bundle_id,
          product_id: null,
          bundle_title: item.bundle_title,
          quantity: item.quantity,
          price: item.price,
          bundle_origin: item.bundle_origin || 'brand-bundle'
        };
      }
      // Product item
      else if (item.product_id) {
        return {
          bundle_id: null,
          product_id: item.product_id,
          bundle_title: item.bundle_title,
          quantity: item.quantity,
          price: item.price,
          bundle_origin: 'product'
        };
      }
    }).filter(Boolean);

      const order = await OrderModel.create(orderDataToCreate, orderItems);
      console.log(`✅ Order created after payment: ${order.id}`);

      // ===== STEP 9: CREATE PAYMENT RECORD (IDEMPOTENT) =====
      const PaymentModel = require('../models/paymentModel');
      let paymentRecord;
      try {
        paymentRecord = await PaymentModel.createPaymentRecord({
          order_id: order.id,
          user_id: userId,
          provider: 'Razorpay',
          payment_id: razorpay_payment_id,
          amount: paymentDetails.amount_rupees || (totals.total - discount),
          currency: paymentDetails.currency || 'INR',
          status: paymentDetails.status || 'captured',
          is_success: true
        });
        console.log('✅ Payment record created:', paymentRecord.id);
      } catch (paymentError) {
        // Duplicate payment_id - fetch existing record
        if (paymentError.code === '23505') {
          console.log(`ℹ️ [Payment] Payment ${razorpay_payment_id} already recorded, fetching existing`);
          paymentRecord = await PaymentModel.getByPaymentId(razorpay_payment_id);
          if (!paymentRecord) {
            throw new Error('Payment record creation failed and existing record not found');
          }
          console.log(`✅ [Payment] Using existing payment record: ${paymentRecord.id}`);
        } else {
          // Unexpected error - fail normally
          throw paymentError;
        }
      }

      // ===== STEP 9.5: RECORD COUPON USAGE (IDEMPOTENT) =====
      if (couponData && couponData.coupon_id && discount > 0) {
        try {
          console.log('🎟️ [Payment] Recording coupon usage for:', couponData.coupon_code);
          console.log('📊 [Payment] Coupon ID:', couponData.coupon_id, 'Discount:', discount);
          
          const couponUsageResult = await CouponController.recordCouponUsage({
            order_id: order.id,
            coupon_id: couponData.coupon_id,
            discount_amount: discount,
            user_id: userId
          });
          
          if (couponUsageResult.success) {
            console.log('✅ [Payment] Coupon usage recorded successfully');
            console.log('📝 [Payment] Application record:', couponUsageResult.application);
          } else {
            console.error('❌ [Payment] Coupon usage recording failed (but returned)');
          }
        } catch (couponError) {
          // Check if it's a duplicate key error (webhook already recorded it)
          if (couponError.code === '23505' || couponError.message?.includes('duplicate key')) {
            console.log(`ℹ️ [Payment] Coupon ${couponData.coupon_code} already recorded for order ${order.id}`);
            console.log('✅ [Payment] Idempotent operation - continuing normally');
            // This is fine - coupon was already recorded (possibly by webhook)
          } else {
            // Unexpected error - log for manual review but don't fail the order
            console.error('❌❌❌ [Payment] CRITICAL: Failed to record coupon usage:', couponError);
            console.error('🔍 [Payment] Error details:', {
              message: couponError.message,
              stack: couponError.stack,
              couponId: couponData.coupon_id,
              orderId: order.id
            });
            console.error('⚠️ [Payment] ORDER SUCCEEDED BUT COUPON NOT TRACKED - REQUIRES MANUAL REVIEW');
            console.error('📋 [Payment] Manual fix data:', JSON.stringify({
              order_id: order.id,
              coupon_id: couponData.coupon_id,
              coupon_code: couponData.coupon_code,
              discount_amount: discount,
              user_id: userId,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } else {
        console.log('ℹ️ [Payment] No coupon to record (coupon data or discount is zero)');
      }

      // ===== STEP 10: DEDUCT STOCK ===== (Replace lines ~510-535)
      try {
        const StockService = require('../services/stockService');
        
        // ⭐ Separate bundles and products
        const bundleItems = orderItems.filter(item => item.bundle_id);
        const productItems = orderItems.filter(item => !item.bundle_id && item.product_id);
        
        console.log('📊 [Payment] Stock deduction data:', {
          totalItems: orderItems.length,
          bundleItems: bundleItems.length,
          productItems: productItems.length,
          bundleDetails: bundleItems.map(b => ({ 
            bundle_id: b.bundle_id, 
            quantity: b.quantity  // ⭐ This is the actual field name!
          }))
        });
        
        // ⭐ FIX: Deduct bundle stock using the CORRECT field name
        if (bundleItems.length > 0) {
          const stockDeductionItems = bundleItems.map(item => ({
            bundle_id: item.bundle_id,
            quantity: item.quantity  // ✅ Use 'quantity' not 'bundle_quantity'
          }));
          
          console.log('📦 [Payment] Deducting stock for bundles:', stockDeductionItems);
          
          await StockService.deductBundleStock(stockDeductionItems);
          console.log(`✅ Bundle stock deducted: ${bundleItems.length} bundles`);
        }
        
        // ⭐ Deduct product stock
        if (productItems.length > 0) {
          console.log('📦 [Payment] Deducting stock for products:', productItems);
          
          await StockService.deductProductStock(productItems);
          console.log(`✅ Product stock deducted: ${productItems.length} products`);
        }
        
      } catch (stockError) {
        console.error('⚠️ Stock deduction error:', stockError);
        // Don't fail the order, but log for manual review
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
          weight_grams: totals.estimated_weight || 99,
          order_total: totals.total - discount, // ⭐ Use final total with discount
          payment_mode: 'Prepaid',
          dimensions_cm: { length: 10, width: 10, height: 3 }
        });
        console.log('✅ Shipment created');
      } catch (shipmentError) {
        console.error('⚠️ Shipment creation failed:', shipmentError);
      }

      // ===== STEP 12.5: SEND CONFIRMATION EMAILS ===== ⭐ NEW
      try {
        const emailService = require('../services/emailService');
        
        // Fetch complete order with all items
        const completeOrder = await OrderModel.findById(order.id, userId);
        
        // Get user details for emails
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('name, email, phone')
          .eq('id', userId)
          .single();

        if (!userError && userData) {
          // Send customer confirmation email
          try {
            await emailService.sendOrderConfirmation(
              userData.email,
              userData.name,
              completeOrder
            );
            console.log('✅ Order confirmation email sent to customer');
          } catch (emailError) {
            console.error('⚠️ Failed to send customer confirmation email:', emailError);
          }

          // Send admin notification email
          try {
            await emailService.sendAdminOrderNotification(
              completeOrder,
              {
                name: userData.name,
                email: userData.email,
                phone: userData.phone || address.phone
              }
            );
            console.log('✅ Order notification email sent to admin');
          } catch (emailError) {
            console.error('⚠️ Failed to send admin notification email:', emailError);
          }
        }
      } catch (emailError) {
        console.error('⚠️ Email sending error:', emailError);
        // Don't fail order - emails are non-critical
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
          amount: paymentDetails.amount_rupees || (totals.total - discount),
          method: paymentDetails.method || 'card',
          discount: discount, // ⭐ Return discount applied
          coupon_code: couponData?.coupon_code || null // ⭐ Return coupon used
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
   * ⚠️ CRITICAL: req.body MUST be raw buffer for signature verification
   * Configured in index.js: app.use('/api/payments/webhook', express.raw())
   */
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      
      // ✅ FIX: Use raw body buffer directly
      const rawBody = req.body; // This is a Buffer from express.raw()

      console.log('🔔 [Webhook] Received Razorpay webhook');
      console.log('📦 [Webhook] Body type:', typeof rawBody, Buffer.isBuffer(rawBody));

      if (!Buffer.isBuffer(rawBody)) {
        console.error('❌ [Webhook] Body is not a buffer - raw body parser not working');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }

      // ===== STEP 1: VERIFY WEBHOOK SIGNATURE =====
      // ✅ Pass raw buffer directly to verification
      const isValid = razorpayService.verifyWebhookSignature(signature, rawBody);

      if (!isValid) {
        console.error('❌ [Webhook] Invalid signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      console.log('✅ [Webhook] Signature verified');

      // ===== STEP 2: NOW PARSE THE BODY =====
      // ✅ Parse AFTER verification
      const payload = JSON.parse(rawBody.toString('utf8'));
      const event = payload.event;
      const eventPayload = payload.payload?.payment?.entity || payload.payload?.order?.entity;

      console.log(`📨 [Webhook] Event: ${event}`);

      // ✅ QUICK RESPONSE: Acknowledge immediately (prevent retries)
      res.status(200).json({
        success: true,
        message: 'Webhook received, processing asynchronously'
      });

      // ===== STEP 3: ASYNC PROCESSING =====
      // Process after responding to Razorpay
      setImmediate(async () => {
        try {
          switch (event) {
            case 'payment.captured':
              await PaymentController.handlePaymentCaptured(eventPayload);
              break;

            case 'payment.failed':
              await PaymentController.handlePaymentFailed(eventPayload);
              break;

            case 'order.paid':
              await PaymentController.handleOrderPaid(eventPayload);
              break;

            default:
              console.log(`ℹ️ [Webhook] Unhandled event: ${event}`);
          }
        } catch (asyncError) {
          console.error('❌ [Webhook] Async processing error:', asyncError);
          // Don't throw - webhook already acknowledged
        }
      });

    } catch (error) {
      console.error('❌ [Webhook] Processing error:', error);
      
      // Return 200 to prevent Razorpay retries on server errors
      if (!res.headersSent) {
        return res.status(200).json({
          success: false,
          message: 'Webhook received but processing failed'
        });
      }
    }
  },

  // ==================== WEBHOOK EVENT HANDLERS ====================

  /**
   * Handle payment.captured event
   */
  handlePaymentCaptured: async (payload) => {
    try {
      const { order_id, id: payment_id, amount, status } = payload;
      console.log(`✅ [Webhook] Payment captured: ${payment_id}`);

      // Find order by Razorpay order ID
      const supabase = require('../config/supabaseClient');
      const { data: order, error } = await supabase
        .from('Orders')
        .select('id, payment_status, razorpay_payment_id')
        .eq('razorpay_order_id', order_id)
        .single();

      if (error || !order) {
        console.error(`❌ [Webhook] Order not found for Razorpay order: ${order_id}`);
        console.log(`🔄 [Webhook] Attempting fallback order creation from Razorpay notes...`);

        // ===== BUG 2 FIX: FALLBACK ORDER CREATION FROM RAZORPAY NOTES =====
        try {
          // Fetch the Razorpay order to read notes.order_metadata
          const rzpOrder = await razorpayService.fetchRazorpayOrder(order_id);
          if (!rzpOrder || !rzpOrder.notes || !rzpOrder.notes.order_metadata) {
            console.error(`❌ [Webhook] Cannot reconstruct order — no notes.order_metadata on Razorpay order ${order_id}`);
            console.error('📋 [Webhook] Manual reconciliation required:', JSON.stringify({
              event: 'payment.captured',
              razorpay_order_id: order_id,
              razorpay_payment_id: payment_id,
              amount: amount / 100,
              status,
              timestamp: new Date().toISOString()
            }));
            return;
          }

          const meta = JSON.parse(rzpOrder.notes.order_metadata);
          const userId = rzpOrder.notes.user_id;

          if (!userId || !meta.address_id) {
            console.error(`❌ [Webhook] Incomplete notes — cannot reconstruct order. userId=${userId}`);
            return;
          }

          // Fetch address
          const { data: address } = await supabase
            .from('Addresses')
            .select('*')
            .eq('id', meta.address_id)
            .single();

          if (!address) {
            console.error(`❌ [Webhook] Address not found: ${meta.address_id}`);
            return;
          }

          // Fetch cart (may already be cleared — if so, we cannot reconstruct items)
          const CartModel = require('../models/cartModel');
          const cartData = await CartModel.getCartWithItems(userId);

          if (!cartData.items || cartData.items.length === 0) {
            console.error(`❌ [Webhook] Cart empty for user ${userId} — cannot reconstruct order items. Manual action required.`);
            console.error('📋 [Webhook] Payment data for manual order creation:', JSON.stringify({
              razorpay_order_id: order_id,
              razorpay_payment_id: payment_id,
              user_id: userId,
              address_id: meta.address_id,
              amount: amount / 100,
              timestamp: new Date().toISOString()
            }));
            return;
          }

          const { calculateOrderTotals } = require('../utils/orderHelpers');
          const deliveryMode = meta.delivery_metadata?.mode || 'surface';
          const expressCharge = meta.delivery_metadata?.express_charge || 0;
          const totals = calculateOrderTotals(cartData.items, deliveryMode, expressCharge);
          const discount = meta.coupon_data?.discount || 0;

          const orderDataToCreate = {
            user_id: userId,
            subtotal: totals.subtotal,
            express_charge: totals.express_charge,
            discount,
            final_total: totals.total - discount,
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
            payment_status: 'paid',
            notes: meta.notes || null,
            gift_wrap: meta.gift_wrap || false,
            gift_message: meta.gift_message || null,
            bundle_type: 'mixed',
            status: 'confirmed',
            razorpay_order_id: order_id,
            razorpay_payment_id: payment_id,
            razorpay_signature: null, // not available in webhook payload
            delivery_metadata: meta.delivery_metadata || {}
          };

          const orderItems = cartData.items.map(item => {
            if (item.bundle_id) {
              return { bundle_id: item.bundle_id, product_id: null, bundle_title: item.bundle_title, quantity: item.quantity, price: item.price, bundle_origin: item.bundle_origin || 'brand-bundle' };
            } else if (item.product_id) {
              return { bundle_id: null, product_id: item.product_id, bundle_title: item.bundle_title, quantity: item.quantity, price: item.price, bundle_origin: 'product' };
            }
          }).filter(Boolean);

          const newOrder = await OrderModel.create(orderDataToCreate, orderItems);
          console.log(`✅ [Webhook] Fallback order created: ${newOrder.id} for payment ${payment_id}`);

          // Create payment record
          const PaymentModel = require('../models/paymentModel');
          try {
            await PaymentModel.createPaymentRecord({
              order_id: newOrder.id,
              user_id: userId,
              provider: 'Razorpay',
              payment_id,
              amount: amount / 100,
              currency: 'INR',
              status: 'captured',
              is_success: true
            });
          } catch (pmErr) {
            if (pmErr.code !== '23505') console.error('⚠️ [Webhook] Payment record error:', pmErr.message);
          }

          // Clear cart
          await CartModel.clearCart(userId);
          console.log(`✅ [Webhook] Cart cleared for user ${userId}`);

        } catch (fallbackError) {
          console.error('❌ [Webhook] Fallback order creation failed:', fallbackError.message);
        }
        return;
      }

      // Check if this payment_id is already linked
      if (order.razorpay_payment_id === payment_id) {
        console.log(`ℹ️ [Webhook] Payment ${payment_id} already linked to order ${order.id}`);
      }

      // Update payment status if not already paid
      if (order.payment_status !== 'paid') {
        try {
          await OrderModel.updatePaymentStatus(order.id, 'paid', payment_id);
          await OrderModel.updateStatus(order.id, 'confirmed');
          console.log(`✅ [Webhook] Order ${order.id} marked as paid`);
        } catch (updateError) {
          // Check if it's a duplicate payment_id constraint violation
          if (updateError.code === '23505') {
            console.log(`ℹ️ [Webhook] Payment ${payment_id} already linked to another order - idempotent skip`);
            console.log(`✅ [Webhook] Order ${order.id} payment status already handled`);
          } else {
            throw updateError;
          }
        }
      } else {
        console.log(`ℹ️ [Webhook] Order ${order.id} already paid, skipping update`);
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
        .select('id, payment_status')
        .eq('razorpay_order_id', order_id) // ⭐ FIXED: Use correct column
        .single();

      if (error || !order) {
        console.error(`❌ [Webhook] Order not found for Razorpay order: ${order_id}`);
        
        // ⭐ LOG FOR MANUAL RECONCILIATION
        console.error('🔍 [Webhook] Lost webhook data:', JSON.stringify({
          event: 'payment.failed',
          razorpay_order_id: order_id,
          razorpay_payment_id: payment_id,
          error_description,
          timestamp: new Date().toISOString()
        }));
        
        return;
      }

      // Mark payment as failed
      await OrderModel.updatePaymentStatus(order.id, 'failed', payment_id);
      console.log(`❌ [Webhook] Order ${order.id} payment marked as failed`);

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
        .eq('razorpay_order_id', razorpay_order_id) // ⭐ FIXED: Use correct column
        .single();

      if (error || !order) {
        console.error(`❌ [Webhook] Order not found: ${razorpay_order_id}`);
        
        // ⭐ LOG FOR MANUAL RECONCILIATION
        console.error('🔍 [Webhook] Lost webhook data:', JSON.stringify({
          event: 'order.paid',
          razorpay_order_id,
          amount_paid: amount_paid / 100,
          timestamp: new Date().toISOString()
        }));
        
        return;
      }

      // Update if not already paid
      if (order.payment_status !== 'paid') {
        await OrderModel.updatePaymentStatus(order.id, 'paid');
        await OrderModel.updateStatus(order.id, 'confirmed');
        console.log(`✅ [Webhook] Order ${order.id} confirmed via webhook`);
      } else {
        console.log(`ℹ️ [Webhook] Order ${order.id} already paid, skipping update`);
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
          message: 'Order not found or access denied',
          code: 'ORDER_NOT_FOUND'
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