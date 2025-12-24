// backend/src/controllers/orderController.js - ENHANCED VERSION

const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const ShipmentModel = require('../models/shipmentModel');
const { calculateOrderTotals, validateOrderData } = require('../utils/orderHelpers');
const StockService = require('../services/stockService');

/**
 * Order Controller - ENHANCED
 * Handles customer order operations with shipment auto-generation
 */
const OrderController = {

  // ==================== CREATE ORDER (ENHANCED) ====================

  /**
   * Create a new order from cart - ENHANCED with Stock Deduction
   * POST /api/orders
   * 
   * Flow:
   * 1. Validate cart & address
   * 2. Check stock availability
   * 3. Create order with items (BUNDLE-ONLY storage)
   * 4. Deduct bundle stock
   * 5. Auto-create pending shipment
   * 6. Clear cart
   * 7. Return order details
   */
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        address_id, 
        payment_method = 'cod',
        notes,
        gift_wrap = false,
        gift_message,
        coupon_code,
        // ✅ NEW: Accept delivery metadata from frontend
        delivery_metadata = {}
      } = req.body;

      console.log('📦 Creating order with delivery metadata:', delivery_metadata);

      // ===== STEP 1: VALIDATE ADDRESS =====
      if (!address_id) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required'
        });
      }

      // Verify address belongs to user
      const { data: address, error: addrError } = await require('../config/supabaseClient')
        .from('Addresses')
        .select('*')
        .eq('id', address_id)
        .eq('user_id', userId)
        .single();

      if (addrError || !address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found or does not belong to you'
        });
      }

      console.log('✅ Address validated:', address.city);

      // ===== STEP 2: GET CART WITH FULL DETAILS =====
      const cartData = await CartModel.getCartWithItems(userId);

      if (!cartData.items || cartData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create order. Cart is empty.',
          code: 'CART_EMPTY'
        });
      }

      console.log(`📋 Cart has ${cartData.items.length} bundles`);

      // ===== STEP 3: VALIDATE STOCK =====
      const stockCheck = await CartModel.checkStock(userId);
      
      if (!stockCheck.all_in_stock) {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock. Please update your cart.',
          code: 'INSUFFICIENT_STOCK',
          out_of_stock_items: stockCheck.out_of_stock_items
        });
      }

      console.log('✅ Stock validated');

      // ===== STEP 4: CALCULATE TOTALS =====
      const deliveryMode = delivery_metadata.mode || 'surface';
      const expressCharge = delivery_metadata.express_charge || 0;

      const totals = calculateOrderTotals(cartData.items, deliveryMode, expressCharge);
      console.log('💰 Order totals (corrected):', totals);

      // ===== STEP 5: PREPARE ORDER DATA =====
      const orderData = {
        user_id: userId,
        subtotal: totals.subtotal,
        express_charge: totals.express_charge,  // ✅ Express charges if applicable
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
        payment_method: payment_method,
        payment_status: 'unpaid',
        notes: notes || null,
        gift_wrap: gift_wrap,
        gift_message: gift_message || null,
        bundle_type: 'mixed',
        status: 'pending',
        // ✅ NEW: Store delivery metadata
        delivery_metadata: {
          mode: delivery_metadata.mode || 'surface',
          estimated_days: delivery_metadata.estimated_days,
          expected_delivery_date: delivery_metadata.expected_delivery_date,
          express_charge: expressCharge,
          pincode: address.zip_code,
          city: address.city,
          state: address.state,
          saved_at: new Date().toISOString()
        }
      };

      // ===== STEP 6: ⭐ PREPARE ORDER ITEMS (ONLY BUNDLES) =====
      const orderItems = [];
      
      for (const item of cartData.items) {
        // ⭐ STORE ONLY BUNDLE INFO (not individual bundle items)
        orderItems.push({
          bundle_id: item.bundle_id,
          bundle_title: item.title,
          bundle_quantity: item.quantity, // How many of THIS bundle
          price: item.price, // Bundle price per unit
          bundle_origin: 'brand-bundle'
        });
      }

      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid items found in cart'
        });
      }

      console.log('📝 Order items prepared:', orderItems.length, 'bundles');

      // ===== STEP 7: CREATE ORDER =====
      const order = await OrderModel.create(orderData, orderItems);
      console.log(`✅ Order created: ${order.id}`);

      // ===== STEP 8: ⭐ DEDUCT BUNDLE STOCK =====
      // This is the KEY addition - deduct stock AFTER order is created
      try {
        const stockDeductionItems = cartData.items.map(item => ({
          bundle_id: item.bundle_id,
          quantity: item.quantity
        }));

        const stockDeduction = await StockService.deductBundleStock(stockDeductionItems);
        
        if (!stockDeduction.success) {
          console.warn('⚠️ Some stock deductions failed:', stockDeduction.failed);
          // Don't fail the order - log the failures and continue
        } else {
          console.log(`✅ Stock deducted for ${stockDeduction.deducted.length} bundles`);
        }
      } catch (stockError) {
        console.error('⚠️ Stock deduction error:', stockError);
        // Don't fail order creation if stock deduction fails
      }

      // ===== STEP 9: AUTO-CREATE SHIPMENT WITH COST CALCULATION =====
      try {
        const shipment = await ShipmentModel.createWithCostCalculation(order.id, {
          destination_pincode: address.zip_code,
          destination_city: address.city,
          destination_state: address.state,
          shipping_mode: deliveryMode === 'express' ? 'Express' : 'Surface',
          weight_grams: totals.estimated_weight || 1000,
          order_total: totals.total,
          payment_mode: payment_method,
          dimensions_cm: {
            length: 30,
            width: 25,
            height: 10
          }
        });
        console.log(`✅ Shipment created (pending_review): ${shipment.id}`);
        console.log(`   Estimated cost: ₹${shipment.estimated_cost}`);
      } catch (shipmentError) {
        console.error('⚠️ Shipment creation failed:', shipmentError);
        // Don't fail order creation if shipment fails
      }

      // ===== STEP 10: CLEAR CART =====
      await CartModel.clearCart(userId);
      console.log('✅ Cart cleared');

      // ===== STEP 11: FETCH COMPLETE ORDER =====
      const completeOrder = await OrderModel.findById(order.id, userId);

      console.log(`✅ Order ${order.id} completed successfully with stock deduction`);

      // Return complete order data including delivery info
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: {
          ...completeOrder,
          delivery_metadata: orderData.delivery_metadata  // ✅ Include in response
        }
      });

    } catch (error) {
      console.error('❌ Create order error:', error);

      // Handle specific errors
      if (error.message === 'CART_EMPTY') {
        return res.status(400).json({
          success: false,
          message: 'Cannot create order. Cart is empty.'
        });
      }

      if (error.message === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock. Please update your cart.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== GET ORDERS ====================

  /**
   * Get all orders for logged-in user
   * GET /api/orders?page=1&limit=10&status=pending
   */
  getOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        status, 
        payment_status,
        from_date,
        to_date 
      } = req.query;

      const filters = {
        status,
        payment_status,
        from_date,
        to_date
      };

      const result = await OrderModel.findByUser(
        userId,
        {
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          status,
          payment_status
        }
      );

      // Get total count
      const totalCount = await OrderModel.countByUser(userId, status);

      return res.status(200).json({
        success: true,
        data: result, // Array of orders with items_preview
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Get orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  },

  /**
   * Get single order details
   * GET /api/orders/:id
   */
  getOrderById: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const order = await OrderModel.findById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Get shipment info if exists
      try {
        const shipment = await ShipmentModel.getByOrderId(orderId);
        if (shipment) {
          order.shipment = shipment;
        }
      } catch (err) {
        console.warn('No shipment found for order:', orderId);
      }

      return res.status(200).json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('❌ Get order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch order details'
      });
    }
  },

  // ==================== ORDER STATISTICS ====================

  /**
   * Get order statistics for user
   * GET /api/orders/stats
   */
  getOrderStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const stats = await OrderModel.getStatistics(userId);

      return res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Get order stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics'
      });
    }
  },

  // ==================== CANCEL ORDER ====================

  /**
   * Cancel an order
   * POST /api/orders/:id/cancel
   */
  cancelOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const { reason } = req.body;

      // Get order to verify ownership and status
      const order = await OrderModel.findById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status: ${order.status}`
        });
      }

      // Cancel order
      const cancelled = await OrderModel.cancel(orderId, userId, reason);

      if (!cancelled) {
        return res.status(400).json({
          success: false,
          message: 'Failed to cancel order'
        });
      }

      console.log(`✅ Order cancelled: ${orderId} by user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order: cancelled
      });

    } catch (error) {
      console.error('❌ Cancel order error:', error);

      if (error.message === 'ORDER_CANNOT_BE_CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'This order cannot be cancelled'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to cancel order'
      });
    }
  },

  // ==================== TRACKING ====================

  /**
   * Get order tracking information
   * GET /api/orders/:id/tracking
   */
  getOrderTracking: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      // Verify order ownership
      const order = await OrderModel.findById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Get shipment tracking (user-friendly statuses)
      const ShipmentModel = require('../models/shipmentModel');
      let tracking = await ShipmentModel.getTrackingForUser(orderId);

      if (!tracking) {
        // No shipment yet (still pending admin approval)
        return res.status(200).json({
          success: true,
          tracking: {
            order_id: order.id,
            status: 'Pending',
            message: 'Your order is being processed. Shipment will be created soon.',
            timeline: [
              {
                status: 'pending',
                label: 'Order Placed',
                date: order.created_at,
                completed: true,
                description: 'Your order has been received'
              },
              {
                status: 'confirmed',
                label: 'Order Confirmed',
                date: null,
                completed: false,
                description: 'Awaiting confirmation'
              },
              {
                status: 'picked_up',
                label: 'Picked Up',
                date: null,
                completed: false,
                description: 'Pending pickup'
              },
              {
                status: 'in_transit',
                label: 'In Transit',
                date: null,
                completed: false,
                description: 'On the way'
              },
              {
                status: 'delivered',
                label: 'Delivered',
                date: null,
                completed: false,
                description: 'Delivery pending'
              }
            ]
          }
        });
      }

      // Build tracking timeline based on current status
      const timeline = [
        {
          status: 'pending',
          label: 'Order Placed',
          date: order.created_at,
          completed: true,
          description: 'Your order has been received'
        },
        {
          status: 'confirmed',
          label: 'Order Confirmed',
          date: tracking.created_at,
          completed: ['Confirmed', 'Processing', 'In Transit', 'Out for Delivery', 'Delivered'].includes(tracking.status),
          description: 'We are preparing your order'
        },
        {
          status: 'processing',
          label: 'Processing',
          date: null,
          completed: ['Processing', 'In Transit', 'Out for Delivery', 'Delivered'].includes(tracking.status),
          description: 'Order is being processed'
        },
        {
          status: 'in_transit',
          label: 'In Transit',
          date: null,
          completed: ['In Transit', 'Out for Delivery', 'Delivered'].includes(tracking.status),
          description: 'Moving between hubs'
        },
        {
          status: 'out_for_delivery',
          label: 'Out for Delivery',
          date: null,
          completed: ['Out for Delivery', 'Delivered'].includes(tracking.status),
          description: 'On the way to you'
        },
        {
          status: 'delivered',
          label: 'Delivered',
          date: order.delivered_at,
          completed: tracking.status === 'Delivered',
          description: 'Order delivered successfully'
        }
      ];

      // Add dates from tracking history if available
      if (tracking.tracking_history && tracking.tracking_history.length > 0) {
        tracking.tracking_history.forEach(event => {
          const statusLower = event.status?.toLowerCase();
          const timelineItem = timeline.find(t => 
            statusLower?.includes(t.status) || 
            t.status.includes(statusLower)
          );
          if (timelineItem && !timelineItem.date) {
            timelineItem.date = event.timestamp;
            timelineItem.location = event.location;
          }
        });
      }

      return res.status(200).json({
        success: true,
        tracking: {
          order_id: order.id,
          status: tracking.status,
          awb: tracking.awb,
          courier: tracking.courier || 'Delhivery',
          tracking_url: tracking.tracking_url,
          estimated_delivery: tracking.estimated_delivery,
          shipping_mode: tracking.shipping_mode,
          timeline: timeline,
          tracking_history: tracking.tracking_history || [],
          last_updated: tracking.updated_at
        }
      });

    } catch (error) {
      console.error('❌ Get tracking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tracking information'
      });
    }
  },

  // ==================== REORDER ====================

  /**
   * Reorder - Add all items from previous order to cart
   * POST /api/orders/:id/reorder
   */
  reorderItems: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      // Get order items
      const order = await OrderModel.findById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Add items to cart
      let addedCount = 0;
      for (const item of order.items) {
        try {
          await CartModel.addItem(
            userId,
            item.product_variant_id,
            item.quantity,
            {
              bundle_origin: item.bundle_origin || 'single',
              bundle_id: item.bundle_id
            }
          );
          addedCount++;
        } catch (err) {
          console.error('Failed to add item to cart:', err);
        }
      }

      console.log(`✅ Reordered: ${addedCount}/${order.items.length} items from order ${orderId}`);

      return res.status(200).json({
        success: true,
        message: `${addedCount} items added to cart successfully`,
        items_added: addedCount,
        items_failed: order.items.length - addedCount
      });

    } catch (error) {
      console.error('❌ Reorder error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reorder items'
      });
    }
  }

};

module.exports = OrderController;