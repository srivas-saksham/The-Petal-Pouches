// backend/src/controllers/orderController.js

const OrderModel = require('../models/orderModel');

/**
 * Order Controller
 * Handles customer order operations - create, view, cancel, track
 */
const OrderController = {

  // ==================== CREATE ORDER ====================

  /**
   * Create a new order from cart
   * POST /api/orders
   */
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        address_id, 
        payment_method, 
        notes,
        gift_wrap,
        gift_message,
        coupon_code 
      } = req.body;

      // Validation
      if (!address_id) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required'
        });
      }

      if (!payment_method || !['razorpay', 'stripe', 'cod'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Valid payment method is required (razorpay/stripe/cod)'
        });
      }

      // Create order
      const order = await OrderModel.createOrder(
        userId,
        address_id,
        payment_method,
        {
          notes,
          gift_wrap,
          gift_message,
          coupon_code
        }
      );

      console.log(`✅ Order created: ${order.id} for user ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      });

    } catch (error) {
      console.error('❌ Create order error:', error);

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
        message: 'Failed to create order'
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

      const result = await OrderModel.getOrdersByUser(
        userId,
        parseInt(page),
        parseInt(limit),
        filters
      );

      return res.status(200).json({
        success: true,
        orders: result.orders,
        pagination: result.pagination
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

      const order = await OrderModel.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        order
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

      const stats = await OrderModel.getOrderStats(userId);

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
      const order = await OrderModel.getOrderById(orderId, userId);

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
      const cancelled = await OrderModel.cancelOrder(orderId, userId, reason);

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
      const order = await OrderModel.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Get tracking info
      const tracking = {
        order_id: order.id,
        status: order.status,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        estimated_delivery: order.estimated_delivery_date,
        timeline: [
          {
            status: 'pending',
            label: 'Order Placed',
            date: order.created_at,
            completed: true
          },
          {
            status: 'confirmed',
            label: 'Order Confirmed',
            date: order.confirmed_at,
            completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'processing',
            label: 'Processing',
            date: order.processing_at,
            completed: ['processing', 'shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'shipped',
            label: 'Shipped',
            date: order.shipped_at,
            completed: ['shipped', 'delivered'].includes(order.status)
          },
          {
            status: 'delivered',
            label: 'Delivered',
            date: order.delivered_at,
            completed: order.status === 'delivered'
          }
        ]
      };

      return res.status(200).json({
        success: true,
        tracking
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
      const order = await OrderModel.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Add items to cart (using CartModel)
      const CartModel = require('../models/cartModel');
      
      for (const item of order.items) {
        await CartModel.addItem(
          userId,
          null, // no session for logged-in user
          item.product_variant_id,
          item.quantity,
          item.bundle_origin || 'single',
          item.bundle_id
        );
      }

      console.log(`✅ Reordered: ${order.items.length} items from order ${orderId}`);

      return res.status(200).json({
        success: true,
        message: 'Items added to cart successfully',
        items_added: order.items.length
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