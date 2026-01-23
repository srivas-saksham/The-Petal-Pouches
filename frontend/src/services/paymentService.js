// frontend/src/services/paymentService.js
/**
 * Payment Service
 * Handles Razorpay payment operations on frontend
 */

import api from './api';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get auth token helper
 */
const getAuthToken = () => {
  return localStorage.getItem('customer_token');
};

/**
 * Create Razorpay payment order
 * @param {Object} orderData - Order details
 * @param {string} orderData.address_id - Delivery address ID
 * @param {string} [orderData.notes] - Order notes
 * @param {boolean} [orderData.gift_wrap] - Gift wrap option
 * @param {string} [orderData.gift_message] - Gift message
 * @param {Object} [orderData.delivery_metadata] - Delivery preferences
 * @returns {Promise<Object>} Payment order details
 */
export const createPaymentOrder = async (orderData) => {
  try {
    console.log('💳 Creating payment order...');

    const response = await api.post('/api/payments/create-order', orderData);

    console.log('✅ Payment order created:', response.data.data.razorpay_order_id);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Create payment order failed:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create payment order',
      code: error.response?.data?.code,
    };
  }
};

/**
 * Verify payment after successful Razorpay transaction
 * @param {Object} paymentData - Payment verification data
 * @param {string} paymentData.razorpay_order_id - Razorpay order ID
 * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {string} paymentData.razorpay_signature - Payment signature
 * @param {Object} orderData - Order data from create-order response
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (paymentData, orderData) => {
  try {
    console.log('🔐 Verifying payment...');

    const response = await api.post('/api/payments/verify', {
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      order_data: orderData, // ⭐ Send order data for database order creation
    });

    console.log('✅ Payment verified:', response.data);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Payment verification failed',
    };
  }
};

/**
 * Get payment status for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await api.get(`/api/payments/status/${orderId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Get payment status failed:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get payment status',
    };
  }
};

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      console.log('✅ Razorpay script already loaded');
      resolve(true);
      return;
    }

    console.log('📥 Loading Razorpay script...');

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      resolve(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay payment modal
 * @param {Object} options - Razorpay options
 * @returns {Object} Razorpay instance
 */
export const openRazorpayModal = (options) => {
  if (!window.Razorpay) {
    console.error('❌ Razorpay script not loaded');
    throw new Error('Razorpay script not loaded');
  }

  console.log('🚀 Opening Razorpay modal...');

  const razorpay = new window.Razorpay(options);
  razorpay.open();

  return razorpay;
};

/**
 * Complete payment flow (convenience function)
 * Combines createPaymentOrder + openRazorpayModal + verifyPayment
 * 
 * @param {Object} orderData - Order details
 * @param {Object} callbacks - Success/failure callbacks
 * @param {Function} callbacks.onSuccess - Called after successful payment
 * @param {Function} callbacks.onFailure - Called if payment fails
 * @param {Function} callbacks.onDismiss - Called if user closes modal
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (orderData, callbacks = {}) => {
  try {
    // Step 1: Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Step 2: Create payment order
    const orderResult = await createPaymentOrder(orderData);
    
    if (!orderResult.success) {
      throw new Error(orderResult.error);
    }

    const paymentOrderData = orderResult.data;

    // Step 3: Open Razorpay modal
    return new Promise((resolve, reject) => {
      const options = {
        key: paymentOrderData.key_id,
        amount: paymentOrderData.amount * 100, // Convert to paise
        currency: paymentOrderData.currency,
        order_id: paymentOrderData.razorpay_order_id,
        name: 'The Petal Pouches',
        description: `Order Payment - ₹${paymentOrderData.amount}`, // ⭐ FIXED: No order_id reference
        image: '/logo.png',
        prefill: {
          name: paymentOrderData.customer.name,
          email: paymentOrderData.customer.email,
          contact: paymentOrderData.customer.phone,
        },
        theme: {
          color: '#F43F5E',
        },
        handler: async (response) => {
          // Payment successful - verify signature
          console.log('✅ Payment successful:', response.razorpay_payment_id);

          try {
            // ⭐ FIXED: Pass order_data to verification
            const verifyResult = await verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              paymentOrderData.order_data // ⭐ Pass order data for DB order creation
            );

            if (verifyResult.success) {
              if (callbacks.onSuccess) {
                callbacks.onSuccess(verifyResult.data);
              }
              resolve(verifyResult);
            } else {
              if (callbacks.onFailure) {
                callbacks.onFailure(verifyResult.error);
              }
              reject(new Error(verifyResult.error));
            }
          } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
            if (callbacks.onFailure) {
              callbacks.onFailure(verifyError.message);
            }
            reject(verifyError);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ Payment modal dismissed by user');
            if (callbacks.onDismiss) {
              callbacks.onDismiss();
            }
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      openRazorpayModal(options);
    });

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    
    if (callbacks.onFailure) {
      callbacks.onFailure(error.message);
    }
    
    throw error;
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  loadRazorpayScript,
  openRazorpayModal,
  processPayment,
};