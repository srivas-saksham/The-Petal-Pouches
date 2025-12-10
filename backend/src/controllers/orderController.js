// backend/src/controllers/orderController.js - ENHANCED VERSION

const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const ShipmentModel = require('../models/shipmentModel');
const { calculateOrderTotals, validateOrderData } = require('../utils/orderHelpers');

/**
 * Order Controller - ENHANCED
 * Handles customer order operations with shipment auto-generation
 */
const OrderController = {

  // ==================== CREATE ORDER (ENHANCED) ====================

  /**
   * Create a new order from cart - ENHANCED
   * POST /api/orders
   * 
   * Flow:
   * 1. Validate cart & address
   * 2. Check stock availability
   * 3. Create order with items
   * 4. Auto-create pending shipment
   * 5. Clear cart
   * 6. Return order details
   */
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        address_id, 
        payment_method = 'cod', // Default to COD since no payment integration yet
        notes,
        gift_wrap = false,
        gift_message,
        coupon_code 
      } = req.body;

      console.log('📦 Creating order for user:', userId);

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

      console.log(`📋 Cart has ${cartData.items.length} items`);

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
      const totals = calculateOrderTotals(cartData.items);
      console.log('💰 Order totals:', totals);

      // ===== STEP 5: PREPARE ORDER DATA =====
      const orderData = {
        user_id: userId,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping_cost: totals.shipping,
        discount: 0, // TODO: Apply coupon if provided
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
        payment_status: 'unpaid', // Will be 'paid' after payment integration
        notes: notes || null,
        gift_wrap: gift_wrap,
        gift_message: gift_message || null,
        bundle_type: 'mixed', // All items from cart
        status: 'pending'
      };

      // ===== STEP 6: PREPARE ORDER ITEMS (HANDLE PRODUCTS WITHOUT VARIANTS) =====
      const orderItems = [];
      const supabase = require('../config/supabaseClient');
      
      for (const item of cartData.items) {
        // Get all products in this bundle
        const products = item.bundle_items || [];
        
        if (products.length === 0) {
          console.warn(`⚠️ Bundle ${item.bundle_id} has no products, skipping`);
          continue;
        }
        
        // Create order item for each product in the bundle
        for (const bundleProduct of products) {
          let variantId = bundleProduct.product_variant_id;
          
          // If no variant exists, get or create a default variant
          if (!variantId && bundleProduct.product_id) {
            // Try to get existing default variant
            const { data: variants } = await supabase
              .from('Product_variants')
              .select('id')
              .eq('product_id', bundleProduct.product_id)
              .eq('is_default', true)
              .limit(1);
            
            if (variants && variants.length > 0) {
              variantId = variants[0].id;
              console.log(`✅ Found existing variant for product ${bundleProduct.product_id}`);
            } else {
              // Create a default variant
              const { data: newVariant, error: variantError } = await supabase
                .from('Product_variants')
                .insert({
                  product_id: bundleProduct.product_id,
                  sku: `DEFAULT-${bundleProduct.product_id.substring(0, 8)}`,
                  attributes: {},
                  price: item.price, // Use bundle price
                  stock: 999, // Default stock
                  is_default: true
                })
                .select()
                .single();
              
              if (variantError) {
                console.error('❌ Failed to create variant:', variantError);
                throw new Error(`Failed to create variant for product ${bundleProduct.product_id}`);
              }
              
              variantId = newVariant.id;
              console.log(`✅ Created default variant ${variantId} for product ${bundleProduct.product_id}`);
            }
          }
          
          if (!variantId) {
            throw new Error(`Cannot find or create variant for product ${bundleProduct.product_id}`);
          }
          
          orderItems.push({
            product_variant_id: variantId,
            quantity: bundleProduct.quantity * item.quantity, // Multiply by cart quantity
            price: Math.round(item.price / products.length), // Distribute bundle price evenly
            bundle_origin: 'brand-bundle',
            bundle_id: item.bundle_id
          });
        }
      }

      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid items found in cart'
        });
      }

      console.log('📝 Order data prepared');
      console.log(`📦 Order items: ${orderItems.length} items`);

      // ===== STEP 7: CREATE ORDER =====
      const order = await OrderModel.create(orderData, orderItems);
      console.log(`✅ Order created: ${order.id}`);

      // ===== STEP 8: AUTO-CREATE SHIPMENT =====
      try {
        const shipment = await ShipmentModel.createFromOrder(order.id, {
          destination_pincode: address.zip_code,
          destination_city: address.city,
          destination_state: address.state,
          weight_grams: totals.estimated_weight || 1000 // Default 1kg
        });
        console.log(`✅ Shipment auto-created: ${shipment.id}`);
      } catch (shipmentError) {
        console.error('⚠️ Shipment creation failed:', shipmentError);
        // Don't fail order creation if shipment fails
      }

      // ===== STEP 9: CLEAR CART =====
      await CartModel.clearCart(userId);
      console.log('✅ Cart cleared');

      // ===== STEP 10: FETCH COMPLETE ORDER =====
      const completeOrder = await OrderModel.findById(order.id, userId);

      console.log(`✅ Order ${order.id} completed successfully`);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: completeOrder
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

      // Get shipment tracking
      let shipment = null;
      try {
        shipment = await ShipmentModel.getByOrderId(orderId);
      } catch (err) {
        console.warn('No shipment for order:', orderId);
      }

      // Build tracking timeline
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
          date: order.confirmed_at || null,
          completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
          description: 'We are preparing your order'
        },
        {
          status: 'processing',
          label: 'Processing',
          date: order.processing_at || null,
          completed: ['processing', 'shipped', 'delivered'].includes(order.status),
          description: 'Your order is being packed'
        },
        {
          status: 'shipped',
          label: 'Shipped',
          date: order.shipped_at || shipment?.created_at || null,
          completed: ['shipped', 'delivered'].includes(order.status),
          description: shipment?.awb ? `AWB: ${shipment.awb}` : 'Out for delivery'
        },
        {
          status: 'delivered',
          label: 'Delivered',
          date: order.delivered_at || null,
          completed: order.status === 'delivered',
          description: 'Order delivered successfully'
        }
      ];

      const tracking = {
        order_id: order.id,
        status: order.status,
        tracking_number: shipment?.awb || null,
        carrier: shipment?.courier || 'Delhivery',
        estimated_delivery: shipment?.estimated_delivery || null,
        timeline,
        shipment: shipment ? {
          awb: shipment.awb,
          courier: shipment.courier,
          status: shipment.status,
          tracking_history: shipment.tracking_history
        } : null
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