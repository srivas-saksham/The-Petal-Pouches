// backend/src/services/bundleHelpers.js

const supabase = require('../config/supabaseClient');

/**
 * Calculate total original price for bundle items
 * Fetches current prices from products/variants and multiplies by quantity
 * 
 * @param {Array} items - Array of {product_id, variant_id, quantity}
 * @returns {Promise<{original_price: number, items_with_prices: Array}>}
 */
const calculateBundlePrice = async (items) => {
  let totalPrice = 0;
  const itemsWithPrices = [];

  for (const item of items) {
    let price = 0;

    // If variant is specified, use variant price
    if (item.variant_id) {
      const { data: variant, error } = await supabase
        .from('Product_variants')
        .select('price, product_id')
        .eq('id', item.variant_id)
        .single();

      if (error || !variant) {
        throw new Error(`Variant ${item.variant_id} not found`);
      }

      price = variant.price;
    } 
    // Otherwise, use base product price
    else if (item.product_id) {
      const { data: product, error } = await supabase
        .from('Products')
        .select('price')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      price = product.price;
    }

    const itemTotal = price * (item.quantity || 1);
    totalPrice += itemTotal;

    itemsWithPrices.push({
      ...item,
      unit_price: price,
      total_price: itemTotal
    });
  }

  return {
    original_price: totalPrice,
    items_with_prices: itemsWithPrices
  };
};

/**
 * Calculate discount percentage
 * 
 * @param {number} originalPrice - Sum of individual item prices
 * @param {number} bundlePrice - Discounted bundle price
 * @returns {number} - Discount percentage (rounded to 2 decimals)
 */
const calculateDiscount = (originalPrice, bundlePrice) => {
  if (originalPrice <= 0) return 0;
  if (bundlePrice >= originalPrice) return 0;
  
  const discount = ((originalPrice - bundlePrice) / originalPrice) * 100;
  return Math.round(discount * 100) / 100; // Round to 2 decimals
};

/**
 * Validate stock availability for all bundle items
 * Checks if variants have sufficient stock
 * 
 * @param {Array} items - Array of {product_id, variant_id, quantity}
 * @returns {Promise<{available: boolean, out_of_stock: Array, items_stock: Array}>}
 */
const validateBundleStock = async (items) => {
  const outOfStock = [];
  const itemsStock = [];

  for (const item of items) {
    let stock = 0;
    let itemInfo = {};

    if (item.variant_id) {
      const { data: variant, error } = await supabase
        .from('Product_variants')
        .select('stock, sku, product_id, Products(title)')
        .eq('id', item.variant_id)
        .single();

      if (error || !variant) {
        outOfStock.push({
          item,
          reason: 'Variant not found'
        });
        continue;
      }

      stock = variant.stock || 0;
      itemInfo = {
        product_id: variant.product_id,
        variant_id: item.variant_id,
        product_title: variant.Products?.title,
        sku: variant.sku,
        available_stock: stock,
        required_quantity: item.quantity || 1
      };
    } else if (item.product_id) {
      const { data: product, error } = await supabase
        .from('Products')
        .select('stock, title, sku')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        outOfStock.push({
          item,
          reason: 'Product not found'
        });
        continue;
      }

      stock = product.stock || 0;
      itemInfo = {
        product_id: item.product_id,
        variant_id: null,
        product_title: product.title,
        sku: product.sku,
        available_stock: stock,
        required_quantity: item.quantity || 1
      };
    }

    itemsStock.push(itemInfo);

    // Check if stock is sufficient
    if (stock < (item.quantity || 1)) {
      outOfStock.push(itemInfo);
    }
  }

  return {
    available: outOfStock.length === 0,
    out_of_stock: outOfStock,
    items_stock: itemsStock
  };
};

/**
 * Validate bundle items for duplicates and required fields
 * 
 * @param {Array} items - Array of {product_id, variant_id, quantity}
 * @returns {Object} - {valid: boolean, errors: Array}
 */
const validateBundleItems = (items) => {
  const errors = [];

  if (!items || items.length === 0) {
    errors.push('Bundle must have at least one item');
    return { valid: false, errors };
  }

  if (items.length < 2) {
    errors.push('Bundle must have at least 2 items');
    return { valid: false, errors };
  }

  // Check for duplicates (same product_id + variant_id combination)
  const seen = new Set();
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Validate required fields
    if (!item.product_id) {
      errors.push(`Item ${i + 1}: product_id is required`);
      continue;
    }

    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${i + 1}: quantity must be at least 1`);
    }

    // Create unique key for duplicate checking
    const key = `${item.product_id}_${item.variant_id || 'null'}`;
    
    if (seen.has(key)) {
      errors.push(`Duplicate item: product_id ${item.product_id} with variant_id ${item.variant_id || 'none'}`);
    }
    
    seen.add(key);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  calculateBundlePrice,
  calculateDiscount,
  validateBundleStock,
  validateBundleItems
};