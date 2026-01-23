// frontend/src/services/checkoutService.js

import api from './api';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Create order from checkout
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/api/orders', orderData);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order',
    };
  }
};

/**
 * Apply promo code
 */
export const validatePromoCode = async (code) => {
  try {
    const response = await api.post('/api/coupons/validate', { code });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid promo code',
    };
  }
};

export default {
  createOrder,
  validatePromoCode,
};