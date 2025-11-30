// frontend/src/services/checkoutService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Create order from checkout
 */
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('customer_token');
    const response = await axios.post(
      `${API_URL}/api/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
    const response = await axios.post(
      `${API_URL}/api/coupons/validate`,
      { code }
    );

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