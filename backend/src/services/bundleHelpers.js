// backend/src/services/bundleHelpers.js
// UPDATED: Added validateBundleImages function

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
 * Calculate discount or markup percentage
 * 
 * @param {number} originalPrice - Sum of individual item prices
 * @param {number} bundlePrice - Bundle selling price
 * @returns {Object} - {discount_percent: number|null, markup_percent: number|null}
 */
const calculateDiscountAndMarkup = (originalPrice, bundlePrice) => {
  if (originalPrice <= 0) {
    return { discount_percent: null, markup_percent: null };
  }
  
  if (bundlePrice < originalPrice) {
    // Customer gets a discount
    const discount = ((originalPrice - bundlePrice) / originalPrice) * 100;
    return {
      discount_percent: Math.round(discount),
      markup_percent: null
    };
  } else if (bundlePrice > originalPrice) {
    // Premium bundle - markup
    const markup = ((bundlePrice - originalPrice) / originalPrice) * 100;
    return {
      discount_percent: null,
      markup_percent: Math.round(markup)
    };
  } else {
    // Equal price - no discount or markup
    return {
      discount_percent: 0,
      markup_percent: null
    };
  }
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

// ==================== NEW: IMAGE VALIDATION ====================

/**
 * Validate bundle images
 * Checks file count, types, and sizes
 * 
 * @param {Array} files - Multer files array
 * @param {Object} options - Validation options
 * @param {number} options.maxCount - Max number of images (default: 5)
 * @param {number} options.maxSize - Max file size in bytes (default: 5MB)
 * @param {Array} options.allowedTypes - Allowed MIME types
 * @returns {Object} - {valid: boolean, errors: Array}
 */
const validateBundleImages = (files, options = {}) => {
  const {
    maxCount = 8,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  const errors = [];

  // Check if files exist
  if (!files) {
    return { valid: true, errors: [] }; // Images are optional
  }

  // Convert to array if single file
  const fileArray = Array.isArray(files) ? files : [files];

  // Check count
  if (fileArray.length > maxCount) {
    errors.push(`Maximum ${maxCount} images allowed, received ${fileArray.length}`);
  }

  // Validate each file
  fileArray.forEach((file, index) => {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Image ${index + 1}: Invalid file type "${file.mimetype}". Allowed: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      errors.push(`Image ${index + 1}: File size ${sizeMB}MB exceeds maximum ${maxSizeMB}MB`);
    }

    // Check if buffer exists
    if (!file.buffer) {
      errors.push(`Image ${index + 1}: File buffer is missing`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate image update operation
 * @param {number} currentImageCount - Current number of images
 * @param {number} newImagesCount - Number of new images to add
 * @param {number} deleteCount - Number of images to delete
 * @param {Object} options - Validation options
 * @returns {Object} - {valid: boolean, errors: Array}
 */
const validateImageUpdate = (currentImageCount, newImagesCount, deleteCount, options = {}) => {
  const { maxCount = 8, minCount = 1 } = options;
  const errors = [];

  const finalCount = currentImageCount + newImagesCount - deleteCount;

  if (finalCount > maxCount) {
    errors.push(`Total images would be ${finalCount}, which exceeds maximum of ${maxCount}`);
  }

  if (finalCount < minCount) {
    errors.push(`Bundle must have at least ${minCount} image. Final count would be ${finalCount}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    finalCount
  };
};

module.exports = {
  calculateBundlePrice,
  calculateDiscountAndMarkup,
  validateBundleStock,
  validateBundleItems,
  validateBundleImages,        // NEW
  validateImageUpdate          // NEW
};