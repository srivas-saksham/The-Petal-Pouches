// backend/src/services/stockService.js
// ENHANCED: Now also deducts stock from individual products in bundles

const supabase = require('../config/supabaseClient');

/**
 * Stock Service - Manages bundle AND product stock operations
 */
const StockService = {

  /**
   * ⭐ ENHANCED: Deduct bundle stock AND product stock after order is placed
   * Reduces stock_limit for bundles AND stock for products inside bundles
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
   * Deduct stock for standalone products
   * @param {Array} productItems - [{product_id, quantity}]
   */
  async deductProductStock(productItems) {
    try {
      for (const item of productItems) {
        const { product_id, quantity } = item;
        
        // Get current stock
        const { data: product, error: fetchError } = await supabase
          .from('Products')
          .select('stock, title')
          .eq('id', product_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newStock = product.stock - quantity;
        
        if (newStock < 0) {
          console.warn(`⚠️ Product ${product.title} stock went negative: ${newStock}`);
        }
        
        // Update stock
        const { error: updateError } = await supabase
          .from('Products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', product_id);
        
        if (updateError) throw updateError;
        
        console.log(`📦 Product stock deducted: ${product.title} (${quantity} units, new stock: ${newStock})`);
      }
    } catch (error) {
      console.error('❌ Product stock deduction error:', error);
      throw error;
    }
  },

  /**
   * ⭐ ENHANCED: Deduct stock for single bundle AND its products
   * @param {string} bundleId - Bundle UUID
   * @param {number} bundleQuantity - How many bundles ordered
   * @returns {Promise<Object>} Deduction result with products info
   */
  deductBundleStockItem: async (bundleId, bundleQuantity) => {
    try {
      // ===== STEP 1: Get Bundle Info =====
      const { data: bundle, error: fetchError } = await supabase
        .from('Bundles')
        .select('id, title, stock_limit')
        .eq('id', bundleId)
        .single();

      if (fetchError || !bundle) {
        throw new Error(`Bundle ${bundleId} not found`);
      }

      const previousBundleStock = bundle.stock_limit;
      
      // ===== STEP 2: Deduct Bundle Stock (if limited) =====
      let newBundleStock = previousBundleStock;
      let bundleDeducted = false;

      if (previousBundleStock !== null) {
        newBundleStock = Math.max(0, previousBundleStock - bundleQuantity);
        
        const { error: updateError } = await supabase
          .from('Bundles')
          .update({ 
            stock_limit: newBundleStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', bundleId);

        if (updateError) throw updateError;
        
        bundleDeducted = true;
        console.log(`✅ Bundle ${bundleId} stock: ${previousBundleStock} → ${newBundleStock}`);
      } else {
        console.log(`⚠️ Bundle ${bundleId} has unlimited stock (null)`);
      }

      // ===== STEP 3: ⭐ NEW - Get Products in Bundle =====
      const { data: bundleItems, error: itemsError } = await supabase
        .from('Bundle_items')
        .select(`
          id,
          quantity,
          product_id,
          product_variant_id,
          Products!inner(
            id,
            title,
            stock,
            sku
          ),
          Product_variants(
            id,
            stock,
            sku
          )
        `)
        .eq('bundle_id', bundleId);

      if (itemsError) {
        console.error('❌ Error fetching bundle items:', itemsError);
        // Don't fail the whole operation, just log
      }

      // ===== STEP 4: ⭐ NEW - Deduct Product Stock =====
      const productsDeducted = [];
      const productsFailed = [];

      if (bundleItems && bundleItems.length > 0) {
        console.log(`📦 Deducting stock for ${bundleItems.length} products in bundle`);

        for (const bundleItem of bundleItems) {
          try {
            // Calculate how many units to deduct
            // If user orders 2 bundles, and bundle has 3 units of product A,
            // deduct 2 * 3 = 6 units of product A
            const itemQuantityPerBundle = bundleItem.quantity || 1;
            const totalToDeduct = itemQuantityPerBundle * bundleQuantity;

            // If variant exists, deduct from variant
            if (bundleItem.product_variant_id && bundleItem.Product_variants) {
              const variantResult = await StockService._deductVariantStock(
                bundleItem.product_variant_id,
                totalToDeduct,
                bundleItem.Product_variants.sku
              );
              
              productsDeducted.push({
                type: 'variant',
                ...variantResult
              });
            } 
            // Otherwise deduct from product
            else if (bundleItem.product_id) {
              const productResult = await StockService._deductProductStock(
                bundleItem.product_id,
                totalToDeduct,
                bundleItem.Products.title,
                bundleItem.Products.sku
              );
              
              productsDeducted.push({
                type: 'product',
                ...productResult
              });
            }
          } catch (itemError) {
            console.error(`❌ Failed to deduct stock for item:`, itemError);
            productsFailed.push({
              product_id: bundleItem.product_id,
              variant_id: bundleItem.product_variant_id,
              error: itemError.message
            });
            // Continue with other items
          }
        }
      }

      // ===== STEP 5: Return Result =====
      const isNowOutOfStock = newBundleStock === 0 && previousBundleStock !== null;

      return {
        success: true,
        bundle_id: bundleId,
        bundle_title: bundle.title,
        
        // Bundle stock info
        bundle_stock: {
          previous: previousBundleStock,
          new: newBundleStock,
          deducted: bundleDeducted,
          is_now_out_of_stock: isNowOutOfStock
        },
        
        // ⭐ NEW: Products stock info
        products_stock: {
          deducted: productsDeducted,
          failed: productsFailed,
          total_products: bundleItems?.length || 0
        },
        
        quantity_ordered: bundleQuantity
      };

    } catch (error) {
      console.error(`❌ Deduct bundle stock item error:`, error);
      return {
        success: false,
        bundle_id: bundleId,
        error: error.message
      };
    }
  },

  /**
   * ⭐ NEW: Deduct stock from product variant
   * @private
   */
  _deductVariantStock: async (variantId, quantity, sku) => {
    try {
      // Get current stock
      const { data: variant, error: fetchError } = await supabase
        .from('Product_variants')
        .select('id, stock, sku')
        .eq('id', variantId)
        .single();

      if (fetchError || !variant) {
        throw new Error(`Variant ${variantId} not found`);
      }

      const previousStock = variant.stock;
      const newStock = Math.max(0, previousStock - quantity);

      // Update stock
      const { error: updateError } = await supabase
        .from('Product_variants')
        .update({ 
          stock: newStock
        })
        .eq('id', variantId);

      if (updateError) throw updateError;

      console.log(`   ✅ Variant ${sku}: ${previousStock} → ${newStock} (-${quantity})`);

      return {
        variant_id: variantId,
        sku,
        previous_stock: previousStock,
        new_stock: newStock,
        quantity_deducted: quantity,
        is_now_out_of_stock: newStock === 0
      };
    } catch (error) {
      console.error(`   ❌ Variant stock deduction failed:`, error);
      throw error;
    }
  },

  /**
   * ⭐ NEW: Deduct stock from product
   * @private
   */
  _deductProductStock: async (productId, quantity, title, sku) => {
    try {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from('Products')
        .select('id, stock, title, sku')
        .eq('id', productId)
        .single();

      if (fetchError || !product) {
        throw new Error(`Product ${productId} not found`);
      }

      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - quantity);

      // Update stock
      const { error: updateError } = await supabase
        .from('Products')
        .update({ 
          stock: newStock
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      console.log(`   ✅ Product ${sku}: ${previousStock} → ${newStock} (-${quantity})`);

      return {
        product_id: productId,
        title,
        sku,
        previous_stock: previousStock,
        new_stock: newStock,
        quantity_deducted: quantity,
        is_now_out_of_stock: newStock === 0
      };
    } catch (error) {
      console.error(`   ❌ Product stock deduction failed:`, error);
      throw error;
    }
  },

  /**
   * ⭐ ENHANCED: Restore bundle AND product stock (for order cancellation)
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
          // ===== Restore Bundle Stock =====
          const { data: bundle, error: fetchError } = await supabase
            .from('Bundles')
            .select('stock_limit, title')
            .eq('id', item.bundle_id)
            .single();

          if (fetchError || !bundle) {
            throw new Error(`Bundle ${item.bundle_id} not found`);
          }

          let bundleRestored = false;
          let newBundleStock = bundle.stock_limit;

          // Restore bundle stock if limited
          if (bundle.stock_limit !== null) {
            newBundleStock = bundle.stock_limit + item.quantity;

            const { error: updateError } = await supabase
              .from('Bundles')
              .update({ 
                stock_limit: newBundleStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.bundle_id);

            if (updateError) throw updateError;
            bundleRestored = true;
            
            console.log(`✅ Bundle ${item.bundle_id} stock restored: ${bundle.stock_limit} → ${newBundleStock}`);
          }

          // ===== ⭐ NEW: Restore Product Stock =====
          const { data: bundleItems, error: itemsError } = await supabase
            .from('Bundle_items')
            .select(`
              quantity,
              product_id,
              product_variant_id
            `)
            .eq('bundle_id', item.bundle_id);

          const productsRestored = [];

          if (bundleItems && bundleItems.length > 0) {
            for (const bundleItem of bundleItems) {
              const totalToRestore = (bundleItem.quantity || 1) * item.quantity;

              try {
                if (bundleItem.product_variant_id) {
                  // Restore variant stock
                  const { data: variant } = await supabase
                    .from('Product_variants')
                    .select('stock')
                    .eq('id', bundleItem.product_variant_id)
                    .single();

                  if (variant) {
                    await supabase
                      .from('Product_variants')
                      .update({ stock: variant.stock + totalToRestore })
                      .eq('id', bundleItem.product_variant_id);

                    productsRestored.push({
                      type: 'variant',
                      id: bundleItem.product_variant_id,
                      restored: totalToRestore
                    });
                  }
                } else if (bundleItem.product_id) {
                  // Restore product stock
                  const { data: product } = await supabase
                    .from('Products')
                    .select('stock')
                    .eq('id', bundleItem.product_id)
                    .single();

                  if (product) {
                    await supabase
                      .from('Products')
                      .update({ stock: product.stock + totalToRestore })
                      .eq('id', bundleItem.product_id);

                    productsRestored.push({
                      type: 'product',
                      id: bundleItem.product_id,
                      restored: totalToRestore
                    });
                  }
                }
              } catch (restoreError) {
                console.error(`   ⚠️ Failed to restore item stock:`, restoreError);
              }
            }
          }

          restored.push({
            bundle_id: item.bundle_id,
            bundle_title: bundle.title,
            bundle_stock: {
              previous: bundle.stock_limit,
              new: newBundleStock,
              restored: bundleRestored
            },
            products_restored: productsRestored
          });

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