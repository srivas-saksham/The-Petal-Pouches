// backend/src/models/paymentModel.js
/**
 * Payment Model
 * Handles payment records in the Payments table
 */

const supabase = require('../config/supabaseClient');

const PaymentModel = {

  /**
   * Create a payment record
   * @param {Object} paymentData - Payment details
   * @returns {Object} Created payment record
   */
  async createPaymentRecord(paymentData) {
    const {
      order_id,
      user_id,
      provider = 'Razorpay',
      payment_id, // Razorpay payment ID (pay_xxx)
      amount,
      currency = 'INR',
      status,
      is_success = true,
      failure_msg = null
    } = paymentData;

    console.log('💾 [PaymentModel] Creating payment record:', {
      order_id,
      payment_id,
      amount,
      status
    });

    try {
      const { data, error } = await supabase
        .from('Payments')
        .insert({
          order_id,
          user_id,
          provider,
          payment_id,
          amount,
          currency,
          status,
          is_success,
          failure_msg,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [PaymentModel] Error creating payment:', error);
        throw error;
      }

      console.log('✅ [PaymentModel] Payment record created:', data.id);
      return data;

    } catch (error) {
      console.error('❌ [PaymentModel] Create payment error:', error);
      throw error;
    }
  },

  /**
   * Get payment by order ID
   * @param {string} orderId - Order UUID
   * @returns {Object|null} Payment record
   */
  async getByOrderId(orderId) {
    try {
      const { data, error } = await supabase
        .from('Payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [PaymentModel] Get payment error:', error);
      return null;
    }
  },

  /**
   * Get payment by Razorpay payment ID
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Object|null} Payment record
   */
  async getByPaymentId(paymentId) {
    try {
      const { data, error } = await supabase
        .from('Payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [PaymentModel] Get payment error:', error);
      return null;
    }
  },

  /**
   * Update payment status
   * @param {string} paymentId - Razorpay payment ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated payment
   */
  async updatePaymentStatus(paymentId, updates) {
    try {
      const { data, error } = await supabase
        .from('Payments')
        .update(updates)
        .eq('payment_id', paymentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ [PaymentModel] Payment updated:', data.id);
      return data;

    } catch (error) {
      console.error('❌ [PaymentModel] Update payment error:', error);
      throw error;
    }
  },

  /**
   * Get user's payment history
   * @param {string} userId - User UUID
   * @param {Object} options - Query options
   * @returns {Array} Payment records
   */
  async getUserPayments(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status = null
    } = options;

    try {
      let query = supabase
        .from('Payments')
        .select('*, Orders!inner(*)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        payments: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

    } catch (error) {
      console.error('❌ [PaymentModel] Get user payments error:', error);
      throw error;
    }
  }
};

module.exports = PaymentModel;