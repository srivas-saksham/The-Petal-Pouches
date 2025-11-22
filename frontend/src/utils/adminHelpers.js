// frontend/src/utils/adminHelpers.js

import { CURRENCY, STATUS_COLORS, STATUS_LABELS } from './constants';

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${CURRENCY.symbol}0` : '0';
  }

  const formatted = parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `${CURRENCY.symbol}${formatted}` : formatted;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full', 'time')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    time: { hour: '2-digit', minute: '2-digit' },
  };

  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Calculate bundle savings
 * @param {number} originalPrice - Sum of individual prices
 * @param {number} bundlePrice - Bundle price
 * @returns {object} { savings, discountPercent }
 */
export const calculateBundleSavings = (originalPrice, bundlePrice) => {
  const savings = originalPrice - bundlePrice;
  const discountPercent = calculateDiscount(originalPrice, bundlePrice);
  return { savings, discountPercent };
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {string} Badge color class
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status?.toLowerCase()] || 'neutral';
};

/**
 * Get status label
 * @param {string} status - Status value
 * @returns {string} Human-readable status label
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status?.toLowerCase()] || status;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if stock is low
 * @param {number} stock - Current stock
 * @param {number} threshold - Low stock threshold
 * @returns {boolean} True if stock is low
 */
export const isLowStock = (stock, threshold = 10) => {
  return stock > 0 && stock <= threshold;
};

/**
 * Check if product is out of stock
 * @param {number} stock - Current stock
 * @returns {boolean} True if out of stock
 */
export const isOutOfStock = (stock) => {
  return stock <= 0;
};

/**
 * Calculate pagination info
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Items per page
 * @returns {object} Pagination info
 */
export const getPaginationInfo = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    totalPages,
    from,
    to,
    hasNext,
    hasPrev,
    currentPage,
    itemsPerPage,
    totalItems,
  };
};

/**
 * Generate page numbers for pagination
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {number} maxVisible - Max visible page numbers
 * @returns {array} Array of page numbers
 */
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if at the start
  if (currentPage <= halfVisible) {
    endPage = Math.min(totalPages, maxVisible);
  }

  // Adjust if at the end
  if (currentPage > totalPages - halfVisible) {
    startPage = Math.max(1, totalPages - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
};

/**
 * Sort array of objects by key
 * @param {array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} Sorted array
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search term
 * @param {array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {array} keys - Keys to search in
 * @returns {array} Filtered array
 */
export const filterBySearch = (array, searchTerm, keys = []) => {
  if (!searchTerm) return array;

  const term = searchTerm.toLowerCase();
  return array.filter((item) => {
    return keys.some((key) => {
      const value = item[key];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(term);
    });
  });
};

/**
 * Download data as CSV
 * @param {array} data - Array of objects
 * @param {string} filename - File name
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Promise that resolves when copied
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number (Indian format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{5})(\d{5})$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return phone;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get color for avatar based on name
 * @param {string} name - Name
 * @returns {string} Color class
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-admin-pink',
    'bg-admin-mint',
    'bg-admin-grey',
    'bg-blue-400',
    'bg-purple-400',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Format variant attributes to readable string
 * @param {object} attributes - Variant attributes object
 * @returns {string} Formatted string
 */
export const formatVariantAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return '';
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === 'object' && Object.keys(obj).length === 0) ||
    (typeof obj === 'string' && obj.trim().length === 0)
  );
};

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Group array by key
 * @param {array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export default {
  formatCurrency,
  formatDate,
  getRelativeTime,
  calculateDiscount,
  calculateBundleSavings,
  getStatusColor,
  getStatusLabel,
  formatFileSize,
  truncateText,
  debounce,
  generateId,
  isLowStock,
  isOutOfStock,
  getPaginationInfo,
  generatePageNumbers,
  sortByKey,
  filterBySearch,
  downloadCSV,
  copyToClipboard,
  isValidEmail,
  isValidPhone,
  formatPhone,
  calculatePercentage,
  getInitials,
  getAvatarColor,
  formatVariantAttributes,
  isEmpty,
  deepClone,
  groupBy,
};