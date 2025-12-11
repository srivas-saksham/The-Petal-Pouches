// backend/src/services/stockService.js
// Stock management service - handles deduction of bundle stock on order

const supabase = require('../config/supabaseClient');

/**
 * Stock Service - Manages bundle stock operations
 */
const StockService = {

  /**
   * Deduct bundle stock after order is placed
   * Reduces stock_limit for each bundle by the quantity ordered
   * 
   * @param {Array} orderItems - Array of {bundle_id, quantity}
   * @returns {Promise<Object>} { success: boolean, deducted: Array, failed: Array }
   */
  deductBundleStock: async (orderItems) => {
    try {
      console.log('📦 Deducting stock for', orderItems.length, 'bundles');
      
      const deducted = [];
      const failed = [];

      for (const item of orderItems) {
        try {
          const result = await StockService.deductBundleStockItem(
            item.bundle_id, 
            item.quantity
          );
          
          if (result.success) {
            deducted.push(result);
          } else {
            failed.push({
              bundle_id: item.bundle_id,
              quantity: item.quantity,
              error: result.error
            });
          }
        } catch (error) {
          console.error(`❌ Error deducting stock for bundle ${item.bundle_id}:`, error);
          failed.push({
            bundle_id: item.bundle_id,
            quantity: item.quantity,
            error: error.message
          });
        }
      }

      console.log(`✅ Stock deduction complete: ${deducted.length} success, ${failed.length} failed`);

      return {
        success: failed.length === 0,
        deducted,
        failed
      };
    } catch (error) {
      console.error('❌ Deduct bundle stock error:', error);
      throw error;
    }
  },

  /**
   * Deduct stock for single bundle
   * @param {string} bundleId - Bundle UUID
   * @param {number} quantity - Quantity to deduct
   * @returns {Promise<Object>} { success, bundle_id, previous_stock, new_stock, is_now_out_of_stock }
   */
  deductBundleStockItem: async (bundleId, quantity) => {
    try {
      // Get current bundle stock
      const { data: bundle, error: fetchError } = await supabase
        .from('Bundles')
        .select('id, title, stock_limit')
        .eq('id', bundleId)
        .single();

      if (fetchError || !bundle) {
        throw new Error(`Bundle ${bundleId} not found`);
      }

      const previousStock = bundle.stock_limit;
      
      // If stock_limit is null, skip deduction (unlimited stock)
      if (previousStock === null) {
        console.log(`⚠️ Bundle ${bundleId} has unlimited stock (null), skipping deduction`);
        return {
          success: true,
          bundle_id: bundleId,
          bundle_title: bundle.title,
          previous_stock: null,
          new_stock: null,
          is_now_out_of_stock: false,
          skipped_reason: 'unlimited_stock'
        };
      }

      // Calculate new stock
      const newStock = Math.max(0, previousStock - quantity);
      const isNowOutOfStock = newStock === 0;

      // Update bundle stock
      const { error: updateError } = await supabase
        .from('Bundles')
        .update({ 
          stock_limit: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', bundleId);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Bundle ${bundleId} stock: ${previousStock} → ${newStock}${isNowOutOfStock ? ' (OUT OF STOCK)' : ''}`);

      return {
        success: true,
        bundle_id: bundleId,
        bundle_title: bundle.title,
        previous_stock: previousStock,
        new_stock: newStock,
        quantity_deducted: quantity,
        is_now_out_of_stock: isNowOutOfStock
      };
    } catch (error) {
      console.error(`❌ Deduct single bundle stock error:`, error);
      return {
        success: false,
        bundle_id: bundleId,
        error: error.message
      };
    }
  },

  /**
   * Restore bundle stock (for order cancellation)
   * @param {Array} orderItems - Array of {bundle_id, quantity}
   * @returns {Promise<Object>} { success, restored: Array, failed: Array }
   */
  restoreBundleStock: async (orderItems) => {
    try {
      console.log('🔄 Restoring stock for', orderItems.length, 'bundles');
      
      const restored = [];
      const failed = [];

      for (const item of orderItems) {
        try {
          const { data: bundle, error: fetchError } = await supabase
            .from('Bundles')
            .select('stock_limit, title')
            .eq('id', item.bundle_id)
            .single();

          if (fetchError || !bundle) {
            throw new Error(`Bundle ${item.bundle_id} not found`);
          }

          // Skip if unlimited stock
          if (bundle.stock_limit === null) {
            restored.push({
              bundle_id: item.bundle_id,
              skipped: true,
              reason: 'unlimited_stock'
            });
            continue;
          }

          const newStock = bundle.stock_limit + item.quantity;

          const { error: updateError } = await supabase
            .from('Bundles')
            .update({ 
              stock_limit: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.bundle_id);

          if (updateError) throw updateError;

          restored.push({
            bundle_id: item.bundle_id,
            bundle_title: bundle.title,
            previous_stock: bundle.stock_limit,
            new_stock: newStock,
            quantity_restored: item.quantity
          });

          console.log(`✅ Bundle ${item.bundle_id} stock restored: ${bundle.stock_limit} → ${newStock}`);
        } catch (error) {
          console.error(`❌ Error restoring stock for bundle ${item.bundle_id}:`, error);
          failed.push({
            bundle_id: item.bundle_id,
            error: error.message
          });
        }
      }

      return {
        success: failed.length === 0,
        restored,
        failed
      };
    } catch (error) {
      console.error('❌ Restore bundle stock error:', error);
      throw error;
    }
  },

  /**
   * Check if bundles have sufficient stock before order
   * @param {Array} orderItems - Array of {bundle_id, quantity}
   * @returns {Promise<Object>} { all_available: boolean, items: Array }
   */
  checkBundlesStock: async (orderItems) => {
    try {
      const items = [];
      let allAvailable = true;

      for (const item of orderItems) {
        const { data: bundle, error } = await supabase
          .from('Bundles')
          .select('id, title, stock_limit')
          .eq('id', item.bundle_id)
          .single();

        if (error || !bundle) {
          items.push({
            bundle_id: item.bundle_id,
            available: false,
            reason: 'bundle_not_found'
          });
          allAvailable = false;
          continue;
        }

        const isAvailable = bundle.stock_limit === null || bundle.stock_limit >= item.quantity;

        items.push({
          bundle_id: item.bundle_id,
          bundle_title: bundle.title,
          required_quantity: item.quantity,
          available_stock: bundle.stock_limit,
          available: isAvailable
        });

        if (!isAvailable) {
          allAvailable = false;
        }
      }

      return {
        all_available: allAvailable,
        items
      };
    } catch (error) {
      console.error('❌ Check bundles stock error:', error);
      throw error;
    }
  }
};

module.exports = StockService;