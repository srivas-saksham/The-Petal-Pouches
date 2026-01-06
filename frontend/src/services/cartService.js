// frontend/src/services/cartService.js - WITH STOCK LIMIT VALIDATION

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get headers with user/session info
 * CRITICAL: Backend expects x-user-id and x-session-id headers
 */
const getCartHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Get user from localStorage
  const storedUser = localStorage.getItem('customer_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (user && user.id) {
    // Logged in user
    headers['x-user-id'] = user.id;
    console.log('🔐 Using user ID:', user.id);
  } else {
    // Guest user - use or create session ID
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_session_id', sessionId);
      console.log('🆕 Created guest session:', sessionId);
    }
    headers['x-session-id'] = sessionId;
    console.log('👤 Using session ID:', sessionId);
  }

  return headers;
};

/**
 * Get current cart
 * GET /api/cart
 */
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: getCartHeaders(),
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Get cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get cart',
      data: null,
    };
  }
};

/**
 * ⭐ NEW: Validate stock limit before adding to cart
 * @param {string} bundleId - Bundle UUID
 * @param {number} requestedQuantity - Quantity user wants to add
 * @param {number} currentQuantityInCart - Current quantity already in cart
 * @param {number} stockLimit - Bundle stock limit from API
 * @returns {Object} { valid: boolean, maxAllowed: number, message: string }
 */
export const validateStockLimit = (bundleId, requestedQuantity, currentQuantityInCart, stockLimit) => {
  console.log('🔍 Validating stock limit:', {
    bundleId,
    requestedQuantity,
    currentQuantityInCart,
    stockLimit
  });

  if (!stockLimit) {
    // No stock limit set - allow any quantity
    return {
      valid: true,
      maxAllowed: Infinity,
      message: 'No stock limit'
    };
  }

  const totalQuantity = currentQuantityInCart + requestedQuantity;

  if (totalQuantity > stockLimit) {
    const remainingStock = Math.max(0, stockLimit - currentQuantityInCart);
    return {
      valid: false,
      maxAllowed: remainingStock,
      message: remainingStock > 0
        ? `Only ${remainingStock} more unit${remainingStock === 1 ? '' : 's'} available (${stockLimit} total in stock)`
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
 * ⭐ UPDATED: Add bundle to cart with stock validation
 * POST /api/cart/items
 * 
 * @param {string} bundleId - Bundle UUID
 * @param {number} quantity - Number of bundles to add (default: 1)
 * @param {number} stockLimit - Optional stock limit to validate against
 * @param {number} currentQuantityInCart - Optional current quantity already in cart
 */
export const addBundleToCart = async (bundleId, quantity = 1, stockLimit = null, currentQuantityInCart = 0) => {
  try {
    console.log('📦 Adding bundle to cart:', {
      bundleId,
      quantity,
      stockLimit,
      currentQuantityInCart
    });

    // ⭐ Validate stock limit if provided
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

    // Backend expects: { bundle_id, quantity }
    const response = await axios.post(
      `${API_URL}/api/cart/items`,
      {
        bundle_id: bundleId,
        quantity,
      },
      {
        headers: getCartHeaders(),
      }
    );

    console.log('✅ Bundle added to cart successfully:', response.data);

    return {
      success: true,
      message: response.data.message || 'Bundle added to cart',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Add bundle to cart error:', error.response?.data || error);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to add bundle to cart',
      code: error.response?.data?.code,
    };
  }
};

/**
 * Add product to cart
 * @param {string} productId - Product UUID
 * @param {number} quantity - Quantity (default: 1)
 * @returns {Promise<Object>} Result
 */
export const addProductToCart = async (productId, quantity = 1) => {
  try {
    console.log(`🛒 Adding product ${productId} to cart (qty: ${quantity})`);

    const response = await axios.post(
      `${API_URL}/api/cart/products`,
      {
        product_id: productId,
        quantity: quantity
      },
      {
        headers: getCartHeaders()
      }
    );

    console.log('✅ Product added to cart:', response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Product added to cart'
    };
  } catch (error) {
    console.error('❌ Add product to cart error:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add product to cart'
    };
  }
};

/**
 * ⭐ UPDATED: Update cart item quantity with stock validation
 * PATCH /api/cart/items/:id
 */
export const updateCartItem = async (cartItemId, quantity, stockLimit = null) => {
  try {
    // ⭐ Validate against stock limit if provided
    if (stockLimit && quantity > stockLimit) {
      return {
        success: false,
        error: `Maximum ${stockLimit} units allowed per bundle`,
        code: 'STOCK_LIMIT_EXCEEDED',
        maxAllowed: stockLimit
      };
    }

    const response = await axios.patch(
      `${API_URL}/api/cart/items/${cartItemId}`,
      { quantity },
      {
        headers: getCartHeaders(),
      }
    );

    return {
      success: true,
      message: response.data.message || 'Cart updated',
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Update cart item error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update cart',
    };
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:id
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/cart/items/${cartItemId}`,
      {
        headers: getCartHeaders(),
      }
    );

    return {
      success: true,
      message: response.data.message || 'Item removed from cart',
    };
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to remove item',
    };
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart
 */
export const clearCart = async () => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/cart`,
      {
        headers: getCartHeaders(),
      }
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
      error: error.response?.data?.message || error.message || 'Failed to clear cart',
    };
  }
};

/**
 * Merge guest cart into user cart (called on login)
 * POST /api/cart/merge
 */
export const mergeCarts = async (userId) => {
  try {
    const sessionId = localStorage.getItem('guest_session_id');
    
    if (!sessionId) {
      return { success: true, message: 'No guest cart to merge' };
    }

    const response = await axios.post(
      `${API_URL}/api/cart/merge`,
      { session_id: sessionId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
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
      error: error.response?.data?.message || error.message || 'Failed to merge carts',
    };
  }
};

/**
 * Get cart item count (quick check)
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