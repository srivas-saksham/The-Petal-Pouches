// frontend/src/hooks/useRazorpay.js
/**
 * useRazorpay Hook
 * Custom React hook for handling Razorpay payments
 * ⭐ UPDATED: Now supports coupon_code in payment flow
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { processPayment, loadRazorpayScript } from '../services/paymentService';

/**
 * useRazorpay Hook
 * @returns {Object} Payment methods and state
 */
export const useRazorpay = () => {
  const navigate = useNavigate();
  
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  /**
   * Initialize Razorpay (load script)
   */
  const initializeRazorpay = useCallback(async () => {
    if (isScriptLoaded) return true;

    try {
      console.log('📥 Initializing Razorpay...');
      const loaded = await loadRazorpayScript();
      setIsScriptLoaded(loaded);
      
      if (!loaded) {
        setError('Failed to load payment gateway. Please refresh the page.');
      }
      
      return loaded;
    } catch (err) {
      console.error('❌ Razorpay initialization error:', err);
      setError('Failed to initialize payment system');
      return false;
    }
  }, [isScriptLoaded]);

  /**
   * Process payment with order data
   * ⭐ UPDATED: Now passes coupon_code to payment service
   * 
   * @param {Object} orderData - Order data including address, notes, coupon_code, etc.
   * @param {Object} options - Callbacks { onSuccess, onError }
   */
  const initiatePayment = useCallback(async (orderData, options = {}) => {
    // Reset state
    setError(null);
    setPaymentData(null);
    setIsProcessing(true);

    try {
      // Ensure Razorpay script is loaded
      const scriptLoaded = await initializeRazorpay();
      
      if (!scriptLoaded) {
        throw new Error('Payment gateway not available');
      }

      console.log('💳 Initiating payment with order data:', {
        address_id: orderData.address_id,
        coupon_code: orderData.coupon_code || 'none', // ⭐ Log coupon
        delivery_mode: orderData.delivery_metadata?.mode || 'surface'
      });

      // ⭐ Validate order data
      if (!orderData.address_id) {
        throw new Error('Delivery address is required');
      }

      // Process payment (payment service will handle coupon)
      const result = await processPayment(orderData, {
        onSuccess: (data) => {
          console.log('✅ Payment successful:', data);
          
          // ⭐ Log coupon usage if applied
          if (data.coupon_code) {
            console.log(`🎟️ Coupon applied: ${data.coupon_code} - Discount: ₹${data.discount}`);
          }
          
          setPaymentData(data);
          setIsProcessing(false);

          // Call custom success callback if provided
          if (options.onSuccess) {
            options.onSuccess(data);
          }
          
          // Navigate to success page
          console.log('🚀 Navigating to order success page:', data.order_id);
          navigate(`/order-success/${data.order_id}`, {
            state: { 
              paymentData: data,
              couponApplied: data.coupon_code || null, // ⭐ Pass coupon info
              discountAmount: data.discount || 0 // ⭐ Pass discount amount
            },
            replace: true // Replace history to prevent back navigation
          });
        },
        onFailure: (errorMsg) => {
          console.error('❌ Payment failed:', errorMsg);
          setError(errorMsg);
          setIsProcessing(false);

          if (options.onError) {
            options.onError(errorMsg);
          }
        },
        onDismiss: () => {
          console.log('⚠️ Payment dismissed');
          setError('Payment cancelled. Your cart is still saved.');
          setIsProcessing(false);
        }
      });

      return result;

    } catch (err) {
      console.error('❌ Payment initiation error:', err);
      
      // ⭐ Enhanced error messages for coupon-related errors
      let errorMessage = err.message || 'Payment failed. Please try again.';
      
      if (err.message?.includes('coupon')) {
        errorMessage = err.message; // Show coupon-specific errors as-is
      } else if (err.message?.includes('Cart is empty')) {
        errorMessage = 'Your cart is empty';
      } else if (err.message?.includes('out of stock')) {
        errorMessage = 'Some items are out of stock';
      }
      
      setError(errorMessage);
      setIsProcessing(false);

      if (options.onError) {
        options.onError(errorMessage);
      }

      throw err;
    }
  }, [initializeRazorpay, navigate]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setError(null);
    setPaymentData(null);
    setIsProcessing(false);
  }, []);

  /**
   * Retry payment
   * ⭐ UPDATED: Maintains coupon_code in retry
   */
  const retryPayment = useCallback((orderData, options = {}) => {
    console.log('🔄 Retrying payment...');
    
    // ⭐ Log if coupon is being retried
    if (orderData.coupon_code) {
      console.log(`🎟️ Retrying payment with coupon: ${orderData.coupon_code}`);
    }
    
    resetPayment();
    return initiatePayment(orderData, options);
  }, [resetPayment, initiatePayment]);

  return {
    // Methods
    initializeRazorpay,
    initiatePayment,
    resetPayment,
    retryPayment,
    
    // State
    isProcessing,
    isScriptLoaded,
    error,
    paymentData,
  };
};

export default useRazorpay;