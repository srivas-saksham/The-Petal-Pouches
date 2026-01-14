// frontend/src/services/cartService.js
// ⭐ SERVERLESS-COMPATIBLE + SECURE

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Generate UUID v4 format session ID
 * Backend requires strict UUID format
 */
const generateSessionId = () => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get authentication headers
 * For logged-in users: JWT token in Authorization header
 * For guests: x-session-id header (UUID v4 format)
 */
const getCartHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Check if user is logged in
  const token = localStorage.getItem('customer_token');
  
  if (token) {
    // ✅ Authenticated user - send JWT token
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Using JWT token for authenticated user');
  } else {
    // ✅ Guest user - send UUID v4 session ID
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();  // ⭐ FIX: Use proper UUID v4
      localStorage.setItem('guest_session_id', sessionId);
      console.log('🆕 Created guest session (UUID v4):', sessionId);
    }
    headers['x-session-id'] = sessionId;
    console.log('👤 Using session ID:', sessionId);
  }

  return headers;
};

/**
 * Validate stock limit before adding to cart
 */
export const validateStockLimit = (bundleId, requestedQuantity, currentQuantityInCart, stockLimit) => {
  if (!stockLimit) {
    return { valid: true, maxAllowed: Infinity, message: 'No stock limit' };
  }

  const totalQuantity = currentQuantityInCart + requestedQuantity;

  if (totalQuantity > stockLimit) {
    const remainingStock = Math.max(0, stockLimit - currentQuantityInCart);
    return {
      valid: false,
      maxAllowed: remainingStock,
      message: remainingStock > 0
        ? `Only ${remainingStock} more unit${remainingStock === 1 ? '' : 's'} available`
        : `Maximum ${stockLimit} units allowed per bundle`
    };
  }

  return {
    valid: true,
    maxAllowed: stockLimit - currentQuantityInCart,
    message: 'Stock available'
  };
};

/**
 * Get current cart
 */
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: getCartHeaders(),
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('❌ Get cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get cart',
      data: null,
    };
  }
};

/**
 * Add bundle to cart with stock validation
 */
export const addBundleToCart = async (bundleId, quantity = 1, stockLimit = null, currentQuantityInCart = 0) => {
  try {
    if (stockLimit) {
      const validation = validateStockLimit(bundleId, quantity, currentQuantityInCart, stockLimit);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message,
          code: 'STOCK_LIMIT_EXCEEDED',
          maxAllowed: validation.maxAllowed
        };
      }
    }

    const response = await axios.post(
      `${API_URL}/api/cart/items`,
      { bundle_id: bundleId, quantity },
      { headers: getCartHeaders() }
    );

    return {
      success: true,
      message: response.data.message || 'Bundle added to cart',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Add bundle error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add bundle',
      code: error.response?.data?.code,
    };
  }
};

/**
 * Add product to cart
 */
export const addProductToCart = async (productId, quantity = 1) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/cart/products`,
      { product_id: productId, quantity },
      { headers: getCartHeaders() }
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Product added to cart'
    };
  } catch (error) {
    console.error('❌ Add product error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add product'
    };
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (cartItemId, quantity, stockLimit = null) => {
  try {
    if (stockLimit && quantity > stockLimit) {
      return {
        success: false,
        error: `Maximum ${stockLimit} units allowed`,
        code: 'STOCK_LIMIT_EXCEEDED',
        maxAllowed: stockLimit
      };
    }

    const response = await axios.patch(
      `${API_URL}/api/cart/items/${cartItemId}`,
      { quantity },
      { headers: getCartHeaders() }
    );

    return {
      success: true,
      message: response.data.message || 'Cart updated',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Update cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update cart',
    };
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/cart/items/${cartItemId}`,
      { headers: getCartHeaders() }
    );
    return {
      success: true,
      message: response.data.message || 'Item removed',
    };
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove item',
    };
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/cart`,
      { headers: getCartHeaders() }
    );
    return {
      success: true,
      message: response.data.message || 'Cart cleared',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to clear cart',
    };
  }
};

/**
 * Merge guest cart into user cart (called on login)
 * ⭐ FIXED: No parameters - reads token from localStorage
 */
export const mergeCarts = async () => {
  try {
    const sessionId = localStorage.getItem('guest_session_id');
    
    if (!sessionId) {
      return { success: true, message: 'No guest cart to merge' };
    }

    const token = localStorage.getItem('customer_token');
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await axios.post(
      `${API_URL}/api/cart/merge`,
      { session_id: sessionId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // Clear guest session after successful merge
    localStorage.removeItem('guest_session_id');

    return {
      success: true,
      message: response.data.message || 'Carts merged',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Merge carts error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to merge carts',
    };
  }
};

/**
 * Get cart item count
 */
export const getCartItemCount = async () => {
  try {
    const result = await getCart();
    if (result.success && result.data) {
      return {
        success: true,
        count: result.data.totals?.item_count || 0,
      };
    }
    return { success: false, count: 0 };
  } catch (error) {
    return { success: false, count: 0 };
  }
};

export default {
  getCart,
  addBundleToCart,
  addProductToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts,
  getCartItemCount,
  validateStockLimit,
};