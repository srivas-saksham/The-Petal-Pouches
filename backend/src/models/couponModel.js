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
   * @param {string} code - Coupon code
   * @param {number} cartSubtotal - Cart subtotal
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Validation result with coupon and discount
   */
  async validateCoupon(code, cartSubtotal, userId) {
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

      // Check minimum order value
      const minOrderCheck = checkMinimumOrderValue(coupon, cartSubtotal);
      if (!minOrderCheck.valid) {
        return {
          valid: false,
          reason: minOrderCheck.reason,
          shortfall: minOrderCheck.shortfall,
          code: 'MIN_ORDER_NOT_MET'
        };
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

      // Calculate discount
      const discount = calculateDiscount(coupon, cartSubtotal);

      // All checks passed
      console.log(`✅ Coupon "${code}" validated - Discount: ₹${discount}`);

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
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Object>} Created coupon
   */
  async create(couponData) {
    try {
      const {
        code, description, discount_type, discount_value,
        min_order_value, max_discount, start_date, end_date,
        usage_limit, usage_per_user
      } = couponData;

      // Check if code already exists
      const existing = await this.findByCode(code);
      if (existing) {
        throw new Error('COUPON_CODE_EXISTS');
      }

      // ⭐ NEW: Calculate initial status based on dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);

      let initialStatus = 'inactive';
      if (startDate > today) {
        initialStatus = 'scheduled'; // Future start date
      } else {
        initialStatus = 'active'; // Can be active now
      }

      const { data, error } = await supabase
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
          status: initialStatus, // ⭐ NEW: Use calculated status
          usage_limit,
          usage_per_user,
          usage_count: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Coupon created: ${data.code} (Status: ${data.status})`);
      return data;

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

      // ⭐ NEW: Handle status updates based on dates
      if (updates.start_date || updates.end_date) {
        const coupon = await this.findById(couponId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(updates.start_date || coupon.start_date);
        startDate.setHours(0, 0, 0, 0);
        
        // If start date is in future, force scheduled
        if (startDate > today) {
          updates.status = 'scheduled';
        }
      }

      const { data, error } = await supabase
        .from('Coupons')
        .update(updates)
        .eq('id', couponId)
        .select()
        .single();

      if (error) throw error;

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