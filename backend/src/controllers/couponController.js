// backend/src/controllers/couponController.js
/**
 * Coupon Controller
 * Handles coupon-related API requests for customers
 */

const CouponModel = require('../models/couponModel');
const { validateCouponFormat } = require('../utils/couponHelpers');

const CouponController = {

  // ==================== VALIDATE COUPON ====================

  /**
   * Validate coupon code
   * ⭐ ENHANCED: Now passes cartItems for product-specific/BOGO validation
   * POST /api/coupons/validate
   * @body { code: string, cart_total: number, cart_items: Array }
   */
  async validateCoupon(req, res) {
    try {
      const userId = req.user?.id;
      const { code, cart_total, cart_items = [] } = req.body; // ⭐ NEW: Extract cart_items

      console.log(`🎟️ [Coupon] Validating: ${code} for user: ${userId}`);

      // Validate input
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required',
          code: 'MISSING_CODE'
        });
      }

      if (!cart_total || cart_total <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid cart total is required',
          code: 'INVALID_CART_TOTAL'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Validate coupon format
      const formatCheck = validateCouponFormat(code);
      if (!formatCheck.valid) {
        return res.status(400).json({
          success: false,
          message: formatCheck.reason,
          code: 'INVALID_FORMAT'
        });
      }

      // ⭐ NEW: Validate coupon against cart, user, AND cart items
      const validation = await CouponModel.validateCoupon(
        formatCheck.code,
        cart_total,
        userId,
        cart_items // ⭐ NEW: Pass cart items array
      );

      if (!validation.valid) {
        console.log(`❌ [Coupon] Validation failed: ${validation.reason}`);
        
        return res.status(400).json({
          success: false,
          message: validation.reason,
          code: validation.code,
          shortfall: validation.shortfall || null
        });
      }

      // Coupon is valid
      console.log(`✅ [Coupon] Valid - Type: ${validation.coupon.coupon_type || 'cart_wide'}, Discount: ₹${validation.discount}`);

      // ⭐ NEW: Include coupon_type in response
      return res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
          coupon: {
            id: validation.coupon.id,
            code: validation.coupon.code,
            description: validation.coupon.description,
            discount_type: validation.coupon.discount_type,
            discount_value: validation.coupon.discount_value,
            coupon_type: validation.coupon.coupon_type || 'cart_wide' // ⭐ NEW
          },
          discount: validation.discount,
          savings_text: `You saved ₹${validation.discount}`
        }
      });

    } catch (error) {
      console.error('❌ [Coupon] Validate error:', error);
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Unable to validate coupon. Please try again.',
        code: 'SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== GET ACTIVE COUPONS ====================

  /**
   * Get all active coupons with unlock status
   * ⭐ UPDATED: Now filters based on user's usage and sorts by min_order_value
   * GET /api/coupons/active
   * @query { cart_total?: number }
   */
  async getActiveCoupons(req, res) {
    try {
      const { cart_total } = req.query;
      const cartSubtotal = cart_total ? parseFloat(cart_total) : null;
      const userId = req.user?.id || null; // ⭐ Extract userId (optional - for guest users)

      console.log(`📋 [Coupon] Fetching active coupons for user: ${userId || 'guest'} (cart: ₹${cartSubtotal || 0})`);

      // ⭐ Pass userId to model for filtering
      const coupons = await CouponModel.getActiveCoupons({ 
        cartSubtotal,
        userId // ⭐ NEW: Pass userId for user-specific filtering
      });

      // Separate unlocked and locked coupons
      const unlocked = [];
      const locked = [];

      coupons.forEach(coupon => {
        if (!coupon.min_order_value || (cartSubtotal && cartSubtotal >= coupon.min_order_value)) {
          unlocked.push(coupon);
        } else {
          locked.push(coupon);
        }
      });

      console.log(`✅ [Coupon] Found ${coupons.length} active coupons (${unlocked.length} unlocked, ${locked.length} locked)`);

      return res.status(200).json({
        success: true,
        data: {
          all_coupons: coupons,
          unlocked_coupons: unlocked,
          locked_coupons: locked,
          total: coupons.length
        }
      });

    } catch (error) {
      console.error('❌ [Coupon] Get active coupons error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== CHECK USER USAGE ====================

  /**
   * Check if user can use a specific coupon
   * GET /api/coupons/:code/check-usage
   */
  async checkUserUsage(req, res) {
    try {
      const userId = req.user?.id;
      const { code } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      console.log(`🔍 [Coupon] Checking usage for ${code} by user ${userId}`);

      // Find coupon
      const coupon = await CouponModel.findByCode(code);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // Check user's usage
      const usageCount = await CouponModel.checkUserUsage(coupon.id, userId);
      const canUse = usageCount < coupon.usage_per_user;

      console.log(`✅ [Coupon] Usage: ${usageCount}/${coupon.usage_per_user}`);

      return res.status(200).json({
        success: true,
        data: {
          coupon_code: coupon.code,
          usage_count: usageCount,
          usage_limit: coupon.usage_per_user,
          can_use: canUse,
          remaining_uses: Math.max(0, coupon.usage_per_user - usageCount)
        }
      });

    } catch (error) {
      console.error('❌ [Coupon] Check usage error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to check coupon usage',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==================== APPLY COUPON (HELPER) ====================

  /**
   * Apply coupon to order (called internally by payment controller)
   * ⭐ ENHANCED: Now accepts and passes cartItems
   * @param {string} code - Coupon code
   * @param {number} cartSubtotal - Cart subtotal
   * @param {string} userId - User UUID
   * @param {Array} cartItems - Cart items array (optional)
   * @returns {Promise<Object>} Validation result
   */
  async applyCouponToOrder(code, cartSubtotal, userId, cartItems = []) {
    try {
      console.log(`🎟️ [Coupon] Applying to order: ${code}`);

      const validation = await CouponModel.validateCoupon(
        code.trim().toUpperCase(),
        cartSubtotal,
        userId,
        cartItems // ⭐ NEW: Pass cart items
      );

      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      return {
        success: true,
        coupon_id: validation.coupon.id,
        coupon_code: validation.coupon.code,
        discount: validation.discount
      };

    } catch (error) {
      console.error('❌ [Coupon] Apply to order error:', error);
      throw error;
    }
  },

  // ==================== RECORD COUPON USAGE ====================

  /**
   * Record coupon usage after successful payment
   * Called internally by payment controller
   * @param {Object} data - Application data
   * @returns {Promise<Object>} Application record
   */
  async recordCouponUsage(data) {
    try {
      const { order_id, coupon_id, discount_amount, user_id } = data;

      console.log(`📝 [Coupon] Recording usage for order: ${order_id}`);

      // Create application record
      const application = await CouponModel.createCouponApplication({
        order_id,
        coupon_id,
        discount_amount,
        user_id
      });

      // Increment usage count
      await CouponModel.incrementUsageCount(coupon_id);

      console.log(`✅ [Coupon] Usage recorded and count incremented`);

      return {
        success: true,
        application
      };

    } catch (error) {
      console.error('❌ [Coupon] Record usage error:', error);
      throw error;
    }
  }

};

module.exports = CouponController;