// frontend/src/utils/shopHelpers.js

/**
 * Shop Helper Utilities
 * Functions for formatting, filtering, sorting, and URL management
 */

/**
 * Format price as Indian Rupees
 * @param {number} price - Price value
 * @returns {string} Formatted price (₹1,000)
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₹0';
  return `₹${parseFloat(price).toLocaleString('en-IN')}`;
};

/**
 * Format price range for display
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {string} Formatted range (₹100 - ₹5,000)
 */
export const formatPriceRange = (min, max) => {
  if (!min && !max) return 'All Prices';
  if (min && !max) return `₹${min.toLocaleString('en-IN')} and above`;
  if (!min && max) return `Up to ₹${max.toLocaleString('en-IN')}`;
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add (default: ...)
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Get sort label from sort value
 * @param {string} sortValue - Sort value (created_at, price_asc, price_desc)
 * @returns {string} Human-readable label
 */
export const getSortLabel = (sortValue) => {
  const labels = {
    created_at: 'Newest First',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    title_asc: 'Name: A to Z',
    title_desc: 'Name: Z to A',
    popularity: 'Most Popular',
    rating: 'Highest Rated'
  };

  return labels[sortValue] || 'Sort By';
};

/**
 * Build query string from filter object
 * @param {Object} filters - Filter object
 * @returns {string} Query string (?key=value&key=value)
 */
export const buildQueryString = (filters = {}) => {
  if (!filters || Object.keys(filters).length === 0) return '';

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '' && value !== null && value !== undefined) {
      // Don't include default values
      if (key === 'page' && value === 1) return;
      if (key === 'limit' && value === 12) return;
      if (key === 'sort' && value === 'created_at') return;

      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Parse URL query params into filter object
 * @param {string} queryString - Query string from URL
 * @returns {Object} Filter object
 */
export const parseQueryParams = (queryString) => {
  const params = new URLSearchParams(queryString);
  const filters = {
    search: params.get('search') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    in_stock: params.get('in_stock') || '',
    sort: params.get('sort') || 'created_at',
    page: parseInt(params.get('page') || '1'),
    limit: parseInt(params.get('limit') || '12')
  };

  return filters;
};

/**
 * Check if product is in stock
 * @param {Object} product - Product object
 * @returns {boolean} True if in stock
 */
export const isProductInStock = (product) => {
  if (!product) return false;
  return product.stock > 0;
};

/**
 * Get stock status text
 * @param {number} stock - Stock quantity
 * @returns {string} Status text
 */
export const getStockStatus = (stock) => {
  if (stock > 10) return 'In Stock';
  if (stock > 0) return `Only ${stock} left`;
  return 'Out of Stock';
};

/**
 * Get stock color class
 * @param {number} stock - Stock quantity
 * @returns {string} Tailwind color class
 */
export const getStockColorClass = (stock) => {
  if (stock > 10) return 'text-emerald-600 bg-emerald-50';
  if (stock > 0) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage (0-100)
 */
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice) return 0;
  if (salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (Jan 15, 2024)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Check if filters are empty (no active filters)
 * @param {Object} filters - Filter object
 * @returns {boolean} True if no filters applied
 */
export const areFiltersEmpty = (filters = {}) => {
  return (
    !filters.search &&
    !filters.min_price &&
    !filters.max_price &&
    filters.in_stock !== 'true' &&
    filters.sort === 'created_at'
  );
};

/**
 * Get filter summary text for display
 * @param {Object} filters - Filter object
 * @returns {string} Summary text
 */
export const getFilterSummary = (filters = {}) => {
  const parts = [];

  if (filters.search) parts.push(`"${filters.search}"`);
  if (filters.min_price || filters.max_price) {
    parts.push(formatPriceRange(filters.min_price, filters.max_price));
  }
  if (filters.in_stock === 'true') parts.push('in stock');

  if (parts.length === 0) return 'All Products';
  return parts.join(' • ');
};

/**
 * Validate price input
 * @param {string|number} price - Price to validate
 * @returns {boolean} True if valid
 */
export const isValidPrice = (price) => {
  if (!price && price !== 0) return false;
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0;
};

/**
 * Compare products for sorting
 * @param {Object} a - First product
 * @param {Object} b - Second product
 * @param {string} sortBy - Sort criteria
 * @returns {number} Comparison result
 */
export const compareProducts = (a, b, sortBy = 'created_at') => {
  switch (sortBy) {
    case 'price_asc':
      return a.price - b.price;
    case 'price_desc':
      return b.price - a.price;
    case 'title_asc':
      return (a.title || '').localeCompare(b.title || '');
    case 'title_desc':
      return (b.title || '').localeCompare(a.title || '');
    case 'created_at':
    default:
      return new Date(b.created_at) - new Date(a.created_at);
  }
};

/**
 * Filter products based on criteria
 * @param {Array} products - Array of products
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered products
 */
export const filterProducts = (products = [], criteria = {}) => {
  let filtered = [...products];

  // Filter by search
  if (criteria.search) {
    const query = criteria.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }

  // Filter by price range
  if (criteria.min_price) {
    filtered = filtered.filter(p => p.price >= criteria.min_price);
  }
  if (criteria.max_price) {
    filtered = filtered.filter(p => p.price <= criteria.max_price);
  }

  // Filter by stock
  if (criteria.in_stock === 'true') {
    filtered = filtered.filter(p => p.stock > 0);
  }

  return filtered;
};

/**
 * Get paginated results
 * @param {Array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated data with metadata
 */
export const getPaginatedResults = (items = [], page = 1, limit = 12) => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    metadata: {
      currentPage: page,
      totalPages,
      total,
      hasMore: page < totalPages,
      itemsPerPage: limit,
      startIndex,
      endIndex: Math.min(endIndex, total)
    }
  };
};

/**
 * Debounce function for API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 500) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for frequent events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 500) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  formatPrice,
  formatPriceRange,
  truncateText,
  getSortLabel,
  buildQueryString,
  parseQueryParams,
  isProductInStock,
  getStockStatus,
  getStockColorClass,
  calculateDiscount,
  formatDate,
  areFiltersEmpty,
  getFilterSummary,
  isValidPrice,
  compareProducts,
  filterProducts,
  getPaginatedResults,
  debounce,
  throttle
};