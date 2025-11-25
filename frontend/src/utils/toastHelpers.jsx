// frontend/src/utils/toastHelpers.js

/**
 * Toast type constants
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Default toast durations (in milliseconds)
 */
export const TOAST_DURATIONS = {
  SHORT: 3000,    // 3 seconds
  NORMAL: 5000,   // 5 seconds (default)
  LONG: 8000,     // 8 seconds
  PERSISTENT: 0,  // Stays until manually closed
};

/**
 * Toast color configuration
 */
export const TOAST_COLORS = {
  success: {
    border: 'tppmint',
    icon: 'tppmint',
    bg: 'tppmint/20',
    progress: 'tppmint',
  },
  error: {
    border: 'red-500',
    icon: 'red-500',
    bg: 'red-500/20',
    progress: 'red-500',
  },
  warning: {
    border: 'yellow-500',
    icon: 'yellow-500',
    bg: 'yellow-500/20',
    progress: 'yellow-500',
  },
  info: {
    border: 'tpppink',
    icon: 'tpppink',
    bg: 'tpppink/20',
    progress: 'tpppink',
  },
};

/**
 * Common toast messages for reuse
 */
export const TOAST_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: (item) => `${item} created successfully!`,
  UPDATE_SUCCESS: (item) => `${item} updated successfully!`,
  DELETE_SUCCESS: (item) => `${item} deleted successfully!`,
  SAVE_SUCCESS: 'Changes saved successfully!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  
  // Error messages
  CREATE_ERROR: (item) => `Failed to create ${item}`,
  UPDATE_ERROR: (item) => `Failed to update ${item}`,
  DELETE_ERROR: (item) => `Failed to delete ${item}`,
  SAVE_ERROR: 'Failed to save changes',
  UPLOAD_ERROR: 'Failed to upload file',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  
  // Warning messages
  LOW_STOCK: (item) => `${item} is running low on stock`,
  UNSAVED_CHANGES: 'You have unsaved changes',
  
  // Info messages
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
};

/**
 * Helper to show API error toast
 * @param {Object} error - Error object from API
 * @param {Function} toast - Toast function
 */
export const showApiError = (error, toast) => {
  const message = error?.response?.data?.message || 
                  error?.message || 
                  TOAST_MESSAGES.UNKNOWN_ERROR;
  
  toast.error(message);
};

/**
 * Helper to show success toast for CRUD operations
 * @param {string} operation - 'create', 'update', or 'delete'
 * @param {string} itemName - Name of the item
 * @param {Function} toast - Toast function
 */
export const showCrudSuccess = (operation, itemName, toast) => {
  const messages = {
    create: TOAST_MESSAGES.CREATE_SUCCESS(itemName),
    update: TOAST_MESSAGES.UPDATE_SUCCESS(itemName),
    delete: TOAST_MESSAGES.DELETE_SUCCESS(itemName),
  };
  
  toast.success(messages[operation] || TOAST_MESSAGES.SAVE_SUCCESS);
};

/**
 * Helper to show error toast for CRUD operations
 * @param {string} operation - 'create', 'update', or 'delete'
 * @param {string} itemName - Name of the item
 * @param {Function} toast - Toast function
 */
export const showCrudError = (operation, itemName, toast) => {
  const messages = {
    create: TOAST_MESSAGES.CREATE_ERROR(itemName),
    update: TOAST_MESSAGES.UPDATE_ERROR(itemName),
    delete: TOAST_MESSAGES.DELETE_ERROR(itemName),
  };
  
  toast.error(messages[operation] || TOAST_MESSAGES.SAVE_ERROR);
};

/**
 * Format validation errors for toast display
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return 'Validation failed';
  }
  
  const errorMessages = Object.values(errors).flat();
  return errorMessages.join(', ');
};