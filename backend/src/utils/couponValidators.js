// backend/src/utils/couponValidators.js
/**
 * Coupon Validators
 * Advanced validation logic for product-specific, BOGO, category-based coupons
 */

/**
 * Validate product-specific coupon
 * Checks if cart contains eligible products
 * @param {Object} coupon - Coupon object with eligible products
 * @param {Array} cartItems - Array of cart items
 * @param {Array} eligibleProductIds - Array of eligible product UUIDs
 * @returns {Object} { valid: boolean, reason: string, eligibleItems: Array }
 */
const validateProductSpecificCoupon = (coupon, cartItems, eligibleProductIds) => {
  if (!eligibleProductIds || eligibleProductIds.length === 0) {
    return {
      valid: false,
      reason: 'No products are eligible for this coupon',
      eligibleItems: []
    };
  }

  // Filter cart items to find eligible ones
  const eligibleItems = cartItems.filter(item => {
    // For bundle items, check if bundle_id matches
    if (item.type === 'bundle' && item.bundle_id) {
      return eligibleProductIds.includes(item.bundle_id);
    }
    // For product items, check if product_id matches
    if (item.type === 'product' && item.product_id) {
      return eligibleProductIds.includes(item.product_id);
    }
    return false;
  });

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      reason: 'None of the items in your cart are eligible for this coupon',
      eligibleItems: []
    };
  }

  console.log(`✅ [ProductSpecific] Found ${eligibleItems.length} eligible items`);

  return {
    valid: true,
    eligibleItems: eligibleItems
  };
};

/**
 * Validate category-based coupon
 * Checks if cart contains products from eligible categories
 * @param {Object} coupon - Coupon object
 * @param {Array} cartItems - Array of cart items
 * @param {Array} eligibleCategoryIds - Array of eligible category UUIDs
 * @param {Object} productsData - Map of product/bundle data with categories
 * @returns {Object} { valid: boolean, reason: string, eligibleItems: Array }
 */
const validateCategoryBasedCoupon = (coupon, cartItems, eligibleCategoryIds, productsData) => {
  if (!eligibleCategoryIds || eligibleCategoryIds.length === 0) {
    return {
      valid: false,
      reason: 'No categories are eligible for this coupon',
      eligibleItems: []
    };
  }

  // Filter cart items based on their category
  const eligibleItems = cartItems.filter(item => {
    let productData = null;

    if (item.type === 'bundle' && item.bundle_id) {
      productData = productsData[item.bundle_id];
    } else if (item.type === 'product' && item.product_id) {
      productData = productsData[`product_${item.product_id}`];
    }

    if (!productData || !productData.category_id) {
      return false;
    }

    return eligibleCategoryIds.includes(productData.category_id);
  });

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      reason: 'None of the items in your cart belong to eligible categories',
      eligibleItems: []
    };
  }

  console.log(`✅ [CategoryBased] Found ${eligibleItems.length} eligible items`);

  return {
    valid: true,
    eligibleItems: eligibleItems
  };
};

/**
 * Validate BOGO (Buy X Get Y) coupon
 * Checks if user has enough eligible items for the offer
 * @param {Object} coupon - Coupon object with BOGO settings
 * @param {Array} eligibleItems - Array of eligible cart items
 * @returns {Object} { valid: boolean, reason: string, sets: number, freeItems: number }
 */
const validateBOGOCoupon = (coupon, eligibleItems) => {
  const buyQty = coupon.bogo_buy_quantity || 0;
  const getQty = coupon.bogo_get_quantity || 0;

  if (buyQty === 0 || getQty === 0) {
    return {
      valid: false,
      reason: 'Invalid BOGO configuration',
      sets: 0,
      freeItems: 0
    };
  }

  // Calculate total quantity of eligible items
  const totalEligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if user has enough items to qualify
  const requiredQty = buyQty + getQty;

  if (totalEligibleQty < requiredQty) {
    const shortfall = requiredQty - totalEligibleQty;
    return {
      valid: false,
      reason: `Add ${shortfall} more eligible item${shortfall === 1 ? '' : 's'} to unlock this offer (Buy ${buyQty} Get ${getQty})`,
      sets: 0,
      freeItems: 0
    };
  }

  // Calculate how many complete sets user qualifies for
  const completeSets = Math.floor(totalEligibleQty / requiredQty);
  const totalFreeItems = completeSets * getQty;

  console.log(`✅ [BOGO] User qualifies for ${completeSets} set(s) - ${totalFreeItems} free items`);

  return {
    valid: true,
    sets: completeSets,
    freeItems: totalFreeItems
  };
};

/**
 * Calculate BOGO discount
 * Applies discount to the cheapest items in the "get" quantity
 * @param {Object} coupon - Coupon object
 * @param {Array} eligibleItems - Eligible cart items
 * @param {number} sets - Number of complete BOGO sets
 * @param {number} freeItems - Number of items to discount
 * @returns {number} Total discount amount
 */
const calculateBOGODiscount = (coupon, eligibleItems, sets, freeItems) => {
  if (sets === 0 || freeItems === 0) {
    return 0;
  }

  const discountPercent = coupon.bogo_discount_percent || 100; // Default 100% = free

  // Flatten items into individual units with prices
  const allUnits = [];
  eligibleItems.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      allUnits.push({
        price: item.price || 0,
        itemId: item.id
      });
    }
  });

  // Sort by price ascending (discount cheapest items first)
  allUnits.sort((a, b) => a.price - b.price);

  // Apply discount to the cheapest 'freeItems' units
  let totalDiscount = 0;
  for (let i = 0; i < Math.min(freeItems, allUnits.length); i++) {
    const itemDiscount = allUnits[i].price * (discountPercent / 100);
    totalDiscount += itemDiscount;
  }

  console.log(`💰 [BOGO] Discount calculated: ₹${Math.round(totalDiscount)} (${discountPercent}% off ${freeItems} items)`);

  return Math.round(totalDiscount);
};

/**
 * Check if user is eligible for first-order-only coupon
 * @param {string} userId - User UUID
 * @param {Function} checkOrdersFunc - Async function to check user's order count
 * @returns {Promise<Object>} { valid: boolean, reason: string }
 */
const validateFirstOrderCoupon = async (userId, checkOrdersFunc) => {
  try {
    const orderCount = await checkOrdersFunc(userId);

    if (orderCount > 0) {
      return {
        valid: false,
        reason: 'This coupon is only valid for first-time customers'
      };
    }

    console.log(`✅ [FirstOrder] User ${userId} is a first-time customer`);

    return {
      valid: true
    };
  } catch (error) {
    console.error('❌ [FirstOrder] Error checking order history:', error);
    return {
      valid: false,
      reason: 'Unable to verify first-order eligibility'
    };
  }
};

/**
 * Filter eligible items based on max_discount_items limit
 * Selects the most expensive items up to the limit
 * @param {Array} eligibleItems - Array of eligible items
 * @param {number} maxItems - Maximum number of items to apply discount to
 * @returns {Array} Filtered items
 */
const applyMaxItemsLimit = (eligibleItems, maxItems) => {
  if (!maxItems || maxItems <= 0) {
    return eligibleItems; // No limit
  }

  // Flatten items into individual units
  const allUnits = [];
  eligibleItems.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      allUnits.push({
        ...item,
        quantity: 1
      });
    }
  });

  // Sort by price descending (discount most expensive items first)
  allUnits.sort((a, b) => (b.price || 0) - (a.price || 0));

  // Take only the top maxItems
  const limitedUnits = allUnits.slice(0, maxItems);

  console.log(`📊 [MaxItems] Limited to ${limitedUnits.length} items (max: ${maxItems})`);

  return limitedUnits;
};

/**
 * Calculate discount for product-specific or category-based coupons
 * @param {Object} coupon - Coupon object
 * @param {Array} eligibleItems - Eligible cart items
 * @param {number} maxItems - Max items to apply discount (optional)
 * @returns {number} Total discount amount
 */
const calculateItemBasedDiscount = (coupon, eligibleItems, maxItems = null) => {
  // Apply max items limit if specified
  let itemsToDiscount = eligibleItems;
  if (maxItems) {
    itemsToDiscount = applyMaxItemsLimit(eligibleItems, maxItems);
  }

  // Calculate subtotal of eligible items
  const eligibleSubtotal = itemsToDiscount.reduce((sum, item) => {
    const itemTotal = (item.price || 0) * item.quantity;
    return sum + itemTotal;
  }, 0);

  if (eligibleSubtotal === 0) {
    return 0;
  }

  let discount = 0;

  if (coupon.discount_type === 'Percent') {
    discount = eligibleSubtotal * (coupon.discount_value / 100);
    
    // Apply max_discount cap if specified
    if (coupon.max_discount) {
      discount = Math.min(discount, coupon.max_discount);
    }
  } else if (coupon.discount_type === 'Fixed') {
    // Fixed discount cannot exceed eligible subtotal
    discount = Math.min(coupon.discount_value, eligibleSubtotal);
  }

  console.log(`💰 [ItemBasedDiscount] Eligible subtotal: ₹${eligibleSubtotal}, Discount: ₹${Math.round(discount)}`);

  return Math.round(discount);
};

module.exports = {
  validateProductSpecificCoupon,
  validateCategoryBasedCoupon,
  validateBOGOCoupon,
  calculateBOGODiscount,
  validateFirstOrderCoupon,
  applyMaxItemsLimit,
  calculateItemBasedDiscount
};