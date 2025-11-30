// frontend/src/utils/bundleHelpers.js

/**
 * Bundle Helper Functions
 * Utility functions for bundle operations
 */

/**
 * Format bundle price for display
 * @param {number} price - Price in rupees (no decimals)
 * @returns {string} Formatted price (e.g., "₹1,299")
 */
export const formatBundlePrice = (price) => {
  if (!price || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Calculate total items count in bundle
 * @param {Array} items - Bundle items array
 * @returns {number} Total quantity
 */
export const getTotalItemsCount = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Get unique product count in bundle
 * @param {Array} items - Bundle items array
 * @returns {number} Unique products count
 */
export const getUniqueProductsCount = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.length;
};

/**
 * Check if bundle is in stock
 * @param {Object} stockStatus - Stock status from API
 * @returns {boolean} True if in stock
 */
export const isBundleInStock = (stockStatus) => {
  return stockStatus?.in_stock === true;
};

/**
 * Get bundle stock message
 * @param {Object} stockStatus - Stock status from API
 * @returns {string} Stock message
 */
export const getBundleStockMessage = (stockStatus) => {
  if (!stockStatus) return 'Checking availability...';
  
  if (stockStatus.in_stock) {
    if (stockStatus.stock_limit && stockStatus.stock_limit <= 5) {
      return `Only ${stockStatus.stock_limit} bundles left!`;
    }
    return 'In Stock';
  }
  
  return 'Out of Stock';
};

/**
 * Get product display name (handles variants and both naming conventions)
 * @param {Object} item - Bundle item with product and variant data
 * @returns {string} Display name
 */
export const getItemDisplayName = (item) => {
  // Handle both naming conventions: Products/product and Product_variants/variant
  const product = item?.Products || item?.product;
  const variant = item?.Product_variants || item?.variant;
  
  if (!product) return 'Unknown Product';
  
  let name = product.title || 'Unknown Product';
  
  // Add variant attributes if available
  if (variant?.attributes && Object.keys(variant.attributes).length > 0) {
    const attrString = Object.entries(variant.attributes)
      .map(([key, value]) => value)
      .join(', ');
    
    if (attrString) {
      name += ` (${attrString})`;
    }
  }
  
  return name;
};

/**
 * Get product image URL (prioritize variant image, handles both naming conventions)
 * @param {Object} item - Bundle item with product and variant data
 * @returns {string} Image URL or placeholder
 */
export const getItemImageUrl = (item) => {
  // Handle both naming conventions: Products/product and Product_variants/variant
  const product = item?.Products || item?.product;
  const variant = item?.Product_variants || item?.variant;
  
  // Prioritize variant image
  if (variant?.img_url) {
    return variant.img_url;
  }
  
  // Fallback to product image
  if (product?.img_url) {
    return product.img_url;
  }
  
  // Placeholder
  return '/placeholder-product.png';
};

/**
 * Group bundle items by category
 * @param {Array} items - Bundle items array
 * @returns {Object} Grouped items { categoryName: [items] }
 */
export const groupItemsByCategory = (items) => {
  if (!items || !Array.isArray(items)) return {};
  
  return items.reduce((groups, item) => {
    // Handle both naming conventions
    const product = item?.Products || item?.product;
    const categoryName = product?.category?.name || 'Other';
    
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    
    groups[categoryName].push(item);
    return groups;
  }, {});
};

/**
 * Calculate savings (if original price data available)
 * Note: Since we don't show individual prices, this is for future use
 * @param {number} bundlePrice - Bundle price
 * @param {Array} items - Bundle items (would need price data)
 * @returns {number} Savings amount
 */
export const calculateSavings = (bundlePrice, items) => {
  // Placeholder - would need individual product prices
  return 0;
};

/**
 * Format bundle description (truncate if too long)
 * @param {string} description - Bundle description
 * @param {number} maxLength - Maximum length (default: 150)
 * @returns {string} Formatted description
 */
export const formatBundleDescription = (description, maxLength = 150) => {
  if (!description) return '';
  
  if (description.length <= maxLength) return description;
  
  return description.substring(0, maxLength).trim() + '...';
};

/**
 * Check if bundle has multiple variants
 * @param {Array} items - Bundle items array
 * @returns {boolean} True if has variants
 */
export const hasVariants = (items) => {
  if (!items || !Array.isArray(items)) return false;
  return items.some(item => {
    const variant = item?.Product_variants || item?.variant;
    return variant !== null;
  });
};

/**
 * Get bundle SKU list (for tracking)
 * @param {Array} items - Bundle items array
 * @returns {Array<string>} Array of SKUs
 */
export const getBundleSkus = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => {
    // Handle both naming conventions
    const product = item?.Products || item?.product;
    const variant = item?.Product_variants || item?.variant;
    
    if (variant?.sku) return variant.sku;
    if (product?.sku) return product.sku;
    return null;
  }).filter(Boolean);
};

/**
 * Validate bundle data structure
 * @param {Object} bundle - Bundle object
 * @returns {boolean} True if valid
 */
export const isValidBundle = (bundle) => {
  return !!(
    bundle &&
    bundle.id &&
    bundle.title &&
    bundle.price &&
    typeof bundle.price === 'number'
  );
};

/**
 * Sort bundles by various criteria
 * @param {Array} bundles - Bundles array
 * @param {string} sortBy - Sort criteria (price_asc, price_desc, newest, oldest)
 * @returns {Array} Sorted bundles
 */
export const sortBundles = (bundles, sortBy = 'newest') => {
  if (!bundles || !Array.isArray(bundles)) return [];
  
  const sorted = [...bundles];
  
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
    
    default:
      return sorted;
  }
};

/**
 * Filter bundles by price range
 * @param {Array} bundles - Bundles array
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} Filtered bundles
 */
export const filterBundlesByPrice = (bundles, minPrice, maxPrice) => {
  if (!bundles || !Array.isArray(bundles)) return [];
  
  return bundles.filter(bundle => {
    const price = bundle.price;
    
    if (minPrice && price < minPrice) return false;
    if (maxPrice && price > maxPrice) return false;
    
    return true;
  });
};

/**
 * Search bundles by term
 * @param {Array} bundles - Bundles array
 * @param {string} searchTerm - Search query
 * @returns {Array} Filtered bundles
 */
export const searchBundles = (bundles, searchTerm) => {
  if (!bundles || !Array.isArray(bundles)) return [];
  if (!searchTerm) return bundles;
  
  const term = searchTerm.toLowerCase();
  
  return bundles.filter(bundle => {
    const title = (bundle.title || '').toLowerCase();
    const description = (bundle.description || '').toLowerCase();
    
    return title.includes(term) || description.includes(term);
  });
};

/**
 * Check if bundle has low stock (less than 5 units)
 * @param {Object} bundle - Bundle object
 * @returns {boolean} True if low stock
 */
export const isBundleLowStock = (bundle) => {
  const stockLimit = bundle?.stock_limit;
  return stockLimit !== null && stockLimit !== undefined && stockLimit < 5;
};

/**
 * Get stock limit display message
 * @param {number} stockLimit - Stock limit value
 * @returns {string|null} Stock message or null
 */
export const getStockLimitMessage = (stockLimit) => {
  if (stockLimit === null || stockLimit === undefined) {
    return null;
  }
  
  if (stockLimit === 0) {
    return 'Out of stock';
  }
  
  if (stockLimit < 5) {
    return `Only ${stockLimit} left in stock!`;
  }
  
  return `${stockLimit} available`;
};