// backend/src/models/couponModel.js
/**
 * Coupon Model
 * Handles all coupon-related database operations
 */

const supabase = require('../config/supabaseClient');
const {
  calculateDiscount,
  isCouponValid,
  checkMinimumOrderValue,
  checkUsageLimit,
  formatCouponResponse
} = require('../utils/couponHelpers');

const CouponModel = {

  // ==================== READ OPERATIONS ====================

  // ==================== NEW: ENHANCED COUPON METHODS ====================

  /**
   * Get eligible products for a coupon
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Array>} Array of product UUIDs
   */
  async getEligibleProducts(couponId) {
    try {
      const { data, error } = await supabase
        .from('Coupon_eligible_products')
        .select('product_id')
        .eq('coupon_id', couponId);

      if (error) throw error;

      return data.map(row => row.product_id);
    } catch (error) {
      console.error('[CouponModel] Get eligible products error:', error);
      throw error;
    }
  },

  /**
   * Get eligible categories for a coupon
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Array>} Array of category UUIDs
   */
  async getEligibleCategories(couponId) {
    try {
      const { data, error } = await supabase
        .from('Coupon_eligible_categories')
        .select('category_id')
        .eq('coupon_id', couponId);

      if (error) throw error;

      return data.map(row => row.category_id);
    } catch (error) {
      console.error('[CouponModel] Get eligible categories error:', error);
      throw error;
    }
  },

  /**
   * Check if user is a first-time customer (0 previous orders)
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Order count
   */
  async checkFirstOrderEligibility(userId) {
    try {
      const { count, error } = await supabase
        .from('Orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('payment_status', 'completed');

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[CouponModel] Check first order error:', error);
      throw error;
    }
  },

  // ==================== END NEW METHODS ====================

  /**
   * Find coupon by code
   * @param {string} code - Coupon code (case-insensitive)
   * @returns {Promise<Object|null>} Coupon object or null
   */
  async findByCode(code) {
    try {
      const { data, error } = await supabase
        .from('Coupons')
        .select('*')
        .ilike('code', code.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[CouponModel] Find by code error:', error);
      throw error;
    }
  },

  /**
   * Find coupon by ID
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Object|null>} Coupon object or null
   */
  async findById(couponId) {
    try {
      const { data, error } = await supabase
        .from('Coupons')
        .select('*')
        .eq('id', couponId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[CouponModel] Find by ID error:', error);
      throw error;
    }
  },

  /**
   * Get all active coupons
   * ⭐ UPDATED: Now filters out coupons user has exhausted and sorts by min_order_value
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active coupons
   */
  async getActiveCoupons(options = {}) {
    try {
      const { cartSubtotal = null, userId = null } = options;
      const now = new Date().toISOString();

      console.log(`📋 [CouponModel] Fetching active coupons for user: ${userId || 'guest'}`);

      let query = supabase
        .from('Coupons')
        .select('*')
        .eq('status', 'active'); // ⭐ Changed from is_active=true

      const { data: allCoupons, error } = await query;

      if (error) throw error;

      if (!allCoupons || allCoupons.length === 0) {
        console.log('ℹ️ [CouponModel] No active coupons found');
        return [];
      }

      // Filter by user usage if logged in
      let filteredCoupons = allCoupons;

      if (userId) {
        console.log(`🔍 [CouponModel] Filtering by user usage: ${userId}`);

        const { data: userApplications, error: appsError } = await supabase
          .from('Coupons_applied')
          .select('coupon_id, order_id')
          .eq('user_id', userId);

        if (appsError) {
          console.error('⚠️ [CouponModel] Error fetching user applications:', appsError);
        } else if (userApplications && userApplications.length > 0) {
          const usageCount = {};
          userApplications.forEach(app => {
            usageCount[app.coupon_id] = (usageCount[app.coupon_id] || 0) + 1;
          });

          filteredCoupons = allCoupons.filter(coupon => {
            const userUsage = usageCount[coupon.id] || 0;
            return userUsage < coupon.usage_per_user;
          });

          console.log(`✅ [CouponModel] After user filtering: ${filteredCoupons.length}/${allCoupons.length} coupons`);
        }
      }

      // Sort by min_order_value ascending
      filteredCoupons.sort((a, b) => {
        const minA = a.min_order_value || 0;
        const minB = b.min_order_value || 0;
        return minA - minB;
      });

      const formatted = filteredCoupons.map(coupon => 
        formatCouponResponse(coupon, cartSubtotal)
      );

      console.log(`✅ [CouponModel] Returning ${formatted.length} active coupons`);
      return formatted;
    } catch (error) {
      console.error('[CouponModel] Get active coupons error:', error);
      throw error;
    }
  },

  /**
   * Get all coupons (admin)
   * @param {Object} options - Pagination and filters
   * @returns {Promise<Object>} Paginated coupons
   */
  async getAllCoupons(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null, // 'active', 'inactive', 'expired', 'scheduled'
        search = null
      } = options;

      let query = supabase
        .from('Coupons')
        .select('*', { count: 'exact' });

      // ⭐ NEW: Filter by status enum instead of date calculations
      if (status) {
        query = query.eq('status', status);
      }

      // Search by code or description
      if (search) {
        query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Sort by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        coupons: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('[CouponModel] Get all coupons error:', error);
      throw error;
    }
  },

  // ==================== VALIDATION OPERATIONS ====================

  /**
   * Validate coupon against cart and user
   * ⭐ ENHANCED: Now supports product-specific, BOGO, category-based validation
   * @param {string} code - Coupon code
   * @param {number} cartSubtotal - Cart subtotal
   * @param {string} userId - User UUID
   * @param {Array} cartItems - Array of cart items (optional, required for advanced types)
   * @returns {Promise<Object>} Validation result with coupon and discount
   */
  async validateCoupon(code, cartSubtotal, userId, cartItems = []) {
    try {
      // Find coupon
      const coupon = await this.findByCode(code);

      if (!coupon) {
        return {
          valid: false,
          reason: 'Invalid coupon code',
          code: 'COUPON_NOT_FOUND'
        };
      }

      // Check if active and within date range
      const validityCheck = isCouponValid(coupon);
      if (!validityCheck.valid) {
        return {
          valid: false,
          reason: validityCheck.reason,
          code: 'COUPON_INVALID'
        };
      }

      // ⭐ NEW: Check first-order-only restriction
      if (coupon.first_order_only) {
        const orderCount = await this.checkFirstOrderEligibility(userId);
        if (orderCount > 0) {
          return {
            valid: false,
            reason: 'This coupon is only valid for first-time customers',
            code: 'FIRST_ORDER_ONLY'
          };
        }
      }

      // Check usage limit
      const usageLimitCheck = checkUsageLimit(coupon);
      if (!usageLimitCheck.valid) {
        return {
          valid: false,
          reason: usageLimitCheck.reason,
          code: 'USAGE_LIMIT_REACHED'
        };
      }

      // Check user's usage
      const userUsage = await this.checkUserUsage(coupon.id, userId);
      if (userUsage >= coupon.usage_per_user) {
        return {
          valid: false,
          reason: `You have already used this coupon ${coupon.usage_per_user} time${coupon.usage_per_user === 1 ? '' : 's'}`,
          code: 'USER_LIMIT_REACHED'
        };
      }

      // ⭐ NEW: Route validation based on coupon_type
      let discount = 0;
      
      if (coupon.coupon_type === 'cart_wide') {
        // Standard cart-wide coupon (existing logic)
        const minOrderCheck = checkMinimumOrderValue(coupon, cartSubtotal);
        if (!minOrderCheck.valid) {
          return {
            valid: false,
            reason: minOrderCheck.reason,
            shortfall: minOrderCheck.shortfall,
            code: 'MIN_ORDER_NOT_MET'
          };
        }

        discount = calculateDiscount(coupon, cartSubtotal);
      } else {
        // ⭐ NEW: Advanced coupon types require cartItems
        if (!cartItems || cartItems.length === 0) {
          return {
            valid: false,
            reason: 'Cart items required for this coupon type',
            code: 'CART_ITEMS_REQUIRED'
          };
        }

        // Load couponHelpers for advanced validation
        const {
          validateProductSpecificCoupon,
          validateCategoryBasedCoupon,
          validateBOGOCoupon,
          calculateBOGODiscount,
          calculateItemBasedDiscount
        } = require('../utils/couponValidators');

        if (coupon.coupon_type === 'product_specific' || coupon.coupon_type === 'bogo') {
          // Get eligible products
          const eligibleProductIds = await this.getEligibleProducts(coupon.id);
          
          const validation = validateProductSpecificCoupon(coupon, cartItems, eligibleProductIds);
          if (!validation.valid) {
            return {
              valid: false,
              reason: validation.reason,
              code: 'NO_ELIGIBLE_ITEMS'
            };
          }

          if (coupon.coupon_type === 'bogo') {
            // BOGO validation and calculation
            const bogoValidation = validateBOGOCoupon(coupon, validation.eligibleItems);
            if (!bogoValidation.valid) {
              return {
                valid: false,
                reason: bogoValidation.reason,
                code: 'BOGO_NOT_MET'
              };
            }

            discount = calculateBOGODiscount(
              coupon,
              validation.eligibleItems,
              bogoValidation.sets,
              bogoValidation.freeItems
            );
          } else {
            // Product-specific discount
            discount = calculateItemBasedDiscount(
              coupon,
              validation.eligibleItems,
              coupon.max_discount_items
            );
          }
        } else if (coupon.coupon_type === 'category_based') {
          // Get eligible categories
          const eligibleCategoryIds = await this.getEligibleCategories(coupon.id);
          
          // Note: This requires product data with category_id
          // You'll need to fetch product details in the controller before calling this
          const validation = validateCategoryBasedCoupon(coupon, cartItems, eligibleCategoryIds, {});
          if (!validation.valid) {
            return {
              valid: false,
              reason: validation.reason,
              code: 'NO_ELIGIBLE_CATEGORIES'
            };
          }

          discount = calculateItemBasedDiscount(
            coupon,
            validation.eligibleItems,
            coupon.max_discount_items
          );
        }

        // Check minimum order value for non-cart-wide coupons
        const minOrderCheck = checkMinimumOrderValue(coupon, cartSubtotal);
        if (!minOrderCheck.valid) {
          return {
            valid: false,
            reason: minOrderCheck.reason,
            shortfall: minOrderCheck.shortfall,
            code: 'MIN_ORDER_NOT_MET'
          };
        }
      }

      // All checks passed
      console.log(`✅ Coupon "${code}" validated - Type: ${coupon.coupon_type}, Discount: ₹${discount}`);

      return {
        valid: true,
        coupon: formatCouponResponse(coupon, cartSubtotal),
        discount,
        code: 'VALID'
      };

    } catch (error) {
      console.error('[CouponModel] Validate coupon error:', error);
      throw error;
    }
  },

  /**
   * Check how many times a user has used a coupon
   * @param {string} couponId - Coupon UUID
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Usage count
   */
  async checkUserUsage(couponId, userId) {
    try {
      // Join with Orders table to get user_id since Coupons_applied doesn't have it
      const { data, error } = await supabase
        .from('Coupons_applied')
        .select(`
          *,
          Orders!inner(user_id)
        `)
        .eq('coupon_id', couponId)
        .eq('Orders.user_id', userId);

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('[CouponModel] Check user usage error:', error);
      throw error;
    }
  },

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create new coupon (admin)
   * ⭐ ENHANCED: Now supports product-specific, BOGO, category-based coupons
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Object>} Created coupon
   */
  async create(couponData) {
    try {
      const {
        code, description, discount_type, discount_value,
        min_order_value, max_discount, start_date, end_date,
        usage_limit, usage_per_user,
        // ⭐ NEW FIELDS
        coupon_type = 'cart_wide',
        eligible_product_ids = [],
        eligible_category_ids = [],
        bogo_buy_quantity = null,
        bogo_get_quantity = null,
        bogo_discount_percent = 100,
        max_discount_items = null,
        first_order_only = false,
        exclude_sale_items = false
      } = couponData;

      // Check if code already exists
      const existing = await this.findByCode(code);
      if (existing) {
        throw new Error('COUPON_CODE_EXISTS');
      }

      // Calculate initial status based on dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);

      let initialStatus = 'inactive';
      if (startDate > today) {
        initialStatus = 'scheduled';
      } else {
        initialStatus = 'active';
      }

      // ⭐ NEW: Create coupon with enhanced fields
      const { data: coupon, error: couponError } = await supabase
        .from('Coupons')
        .insert([{
          code: code.trim().toUpperCase(),
          description,
          discount_type,
          discount_value,
          min_order_value,
          max_discount,
          start_date,
          end_date,
          status: initialStatus,
          usage_limit,
          usage_per_user,
          usage_count: 0,
          // ⭐ NEW FIELDS
          coupon_type,
          bogo_buy_quantity,
          bogo_get_quantity,
          bogo_discount_percent,
          max_discount_items,
          first_order_only,
          exclude_sale_items,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (couponError) throw couponError;

      // ⭐ NEW: Insert eligible products if product-specific or BOGO
      if ((coupon_type === 'product_specific' || coupon_type === 'bogo') && eligible_product_ids.length > 0) {
        const productRecords = eligible_product_ids.map(productId => ({
          coupon_id: coupon.id,
          product_id: productId
        }));

        const { error: productsError } = await supabase
          .from('Coupon_eligible_products')
          .insert(productRecords);

        if (productsError) {
          console.error('❌ Error inserting eligible products:', productsError);
          // Rollback: Delete the coupon
          await supabase.from('Coupons').delete().eq('id', coupon.id);
          throw productsError;
        }

        console.log(`✅ Inserted ${eligible_product_ids.length} eligible products`);
      }

      // ⭐ NEW: Insert eligible categories if category-based
      if (coupon_type === 'category_based' && eligible_category_ids.length > 0) {
        const categoryRecords = eligible_category_ids.map(categoryId => ({
          coupon_id: coupon.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('Coupon_eligible_categories')
          .insert(categoryRecords);

        if (categoriesError) {
          console.error('❌ Error inserting eligible categories:', categoriesError);
          // Rollback: Delete the coupon
          await supabase.from('Coupons').delete().eq('id', coupon.id);
          throw categoriesError;
        }

        console.log(`✅ Inserted ${eligible_category_ids.length} eligible categories`);
      }

      console.log(`✅ Coupon created: ${coupon.code} (Type: ${coupon.coupon_type}, Status: ${coupon.status})`);
      return coupon;

    } catch (error) {
      console.error('[CouponModel] Create coupon error:', error);
      throw error;
    }
  },

  /**
   * Record coupon application after successful order
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application record
   */
  async createCouponApplication(applicationData) {
    try {
      const {
        order_id,
        coupon_id,
        discount_amount,
        user_id
      } = applicationData;

      const { data, error } = await supabase
        .from('Coupons_applied')
        .insert([{
          order_id,
          coupon_id,
          discount_amount,
          user_id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Coupon application recorded: Order ${order_id}`);
      return data;

    } catch (error) {
      console.error('[CouponModel] Create application error:', error);
      throw error;
    }
  },

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update coupon (admin)
   * ⭐ ENHANCED: Now supports updating eligible products/categories
   * @param {string} couponId - Coupon UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated coupon
   */
  async update(couponId, updates) {
    try {
      // If updating code, check for duplicates
      if (updates.code) {
        const existing = await this.findByCode(updates.code);
        if (existing && existing.id !== couponId) {
          throw new Error('COUPON_CODE_EXISTS');
        }
        updates.code = updates.code.trim().toUpperCase();
      }

      // Handle status updates based on dates
      if (updates.start_date || updates.end_date) {
        const coupon = await this.findById(couponId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(updates.start_date || coupon.start_date);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate > today) {
          updates.status = 'scheduled';
        }
      }

      // ⭐ NEW: Extract eligible products/categories from updates
      const eligibleProductIds = updates.eligible_product_ids || null;
      const eligibleCategoryIds = updates.eligible_category_ids || null;

      // Remove these from updates object (not DB columns)
      delete updates.eligible_product_ids;
      delete updates.eligible_category_ids;

      // Update main coupon record
      const { data, error } = await supabase
        .from('Coupons')
        .update(updates)
        .eq('id', couponId)
        .select()
        .single();

      if (error) throw error;

      // ⭐ NEW: Update eligible products if provided
      if (eligibleProductIds !== null) {
        // Delete existing products
        await supabase
          .from('Coupon_eligible_products')
          .delete()
          .eq('coupon_id', couponId);

        // Insert new products
        if (eligibleProductIds.length > 0) {
          const productRecords = eligibleProductIds.map(productId => ({
            coupon_id: couponId,
            product_id: productId
          }));

          const { error: productsError } = await supabase
            .from('Coupon_eligible_products')
            .insert(productRecords);

          if (productsError) {
            console.error('❌ Error updating eligible products:', productsError);
          } else {
            console.log(`✅ Updated ${eligibleProductIds.length} eligible products`);
          }
        }
      }

      // ⭐ NEW: Update eligible categories if provided
      if (eligibleCategoryIds !== null) {
        // Delete existing categories
        await supabase
          .from('Coupon_eligible_categories')
          .delete()
          .eq('coupon_id', couponId);

        // Insert new categories
        if (eligibleCategoryIds.length > 0) {
          const categoryRecords = eligibleCategoryIds.map(categoryId => ({
            coupon_id: couponId,
            category_id: categoryId
          }));

          const { error: categoriesError } = await supabase
            .from('Coupon_eligible_categories')
            .insert(categoryRecords);

          if (categoriesError) {
            console.error('❌ Error updating eligible categories:', categoriesError);
          } else {
            console.log(`✅ Updated ${eligibleCategoryIds.length} eligible categories`);
          }
        }
      }

      console.log(`✅ Coupon updated: ${data.code}`);
      return data;

    } catch (error) {
      console.error('[CouponModel] Update coupon error:', error);
      throw error;
    }
  },

  /**
   * Increment coupon usage count
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Object>} Updated coupon
   */
  async incrementUsageCount(couponId) {
    try {
      console.log(`🔄 [CouponModel] Incrementing usage count for: ${couponId}`);
      
      // Try RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('increment_coupon_usage', {
        coupon_id: couponId
      });

      // If RPC doesn't exist (error code 42883), use manual increment
      if (rpcError && rpcError.code === '42883') {
        console.log('⚠️ [CouponModel] RPC function not found, using manual increment');
        return await this.manualIncrementUsage(couponId);
      }

      // If RPC succeeded
      if (!rpcError) {
        console.log(`✅ [CouponModel] Usage count incremented via RPC: ${couponId}`);
        return rpcData;
      }

      // Other RPC errors - fall back to manual
      console.warn('⚠️ [CouponModel] RPC error, falling back to manual increment:', rpcError.message);
      return await this.manualIncrementUsage(couponId);

    } catch (error) {
      console.error('❌ [CouponModel] Increment usage error:', error);
      
      // Last resort - try manual increment
      try {
        console.log('🔄 [CouponModel] Attempting manual increment as last resort');
        return await this.manualIncrementUsage(couponId);
      } catch (fallbackError) {
        console.error('❌ [CouponModel] Manual increment also failed:', fallbackError);
        throw new Error(`Failed to increment coupon usage: ${fallbackError.message}`);
      }
    }
  },

  /**
   * Manual increment helper (fallback)
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Object>} Updated coupon
   */
  async manualIncrementUsage(couponId) {
    console.log(`🔄 [CouponModel] Manual increment for: ${couponId}`);
    
    // Get current coupon
    const coupon = await this.findById(couponId);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    const currentCount = coupon.usage_count || 0;
    const newCount = currentCount + 1;

    console.log(`📊 [CouponModel] Current: ${currentCount}, New: ${newCount}`);

    // Update usage count
    const { data: updated, error: updateError } = await supabase
      .from('Coupons')
      .update({ 
        usage_count: newCount 
      })
      .eq('id', couponId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [CouponModel] Update error:', updateError);
      throw updateError;
    }

    console.log(`✅ [CouponModel] Manual increment success: ${updated.code} (${updated.usage_count})`);
    return updated;
  },

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete coupon (admin)
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<boolean>} Success status
   */
  async delete(couponId) {
    try {
      // Check if coupon has been used
      const { count, error: countError } = await supabase
        .from('Coupons_applied')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId);

      if (countError) throw countError;

      if (count > 0) {
        throw new Error('COUPON_IN_USE');
      }

      const { error } = await supabase
        .from('Coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      console.log(`✅ Coupon deleted: ${couponId}`);
      return true;

    } catch (error) {
      console.error('[CouponModel] Delete coupon error:', error);
      throw error;
    }
  },

  // ==================== STATISTICS ====================

  /**
   * Get coupon usage statistics
   * @param {string} couponId - Coupon UUID
   * @returns {Promise<Object>} Usage stats
   */
  async getCouponStats(couponId) {
    try {
      const { data, error } = await supabase
        .from('Coupons_applied')
        .select('discount_amount, created_at')
        .eq('coupon_id', couponId);

      if (error) throw error;

      const totalUsage = data.length;
      const totalDiscount = data.reduce((sum, item) => sum + item.discount_amount, 0);

      return {
        total_usage: totalUsage,
        total_discount: totalDiscount,
        average_discount: totalUsage > 0 ? Math.round(totalDiscount / totalUsage) : 0
      };

    } catch (error) {
      console.error('[CouponModel] Get stats error:', error);
      throw error;
    }
  }

};

module.exports = CouponModel;