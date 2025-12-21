// frontend/src/hooks/useRazorpay.js
/**
 * useRazorpay Hook
 * Custom React hook for handling Razorpay payments
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

      console.log('💳 Initiating payment...');

      // Process payment
      const result = await processPayment(orderData, {
        onSuccess: (data) => {
          console.log('✅ Payment successful:', data);
          setPaymentData(data);
          setIsProcessing(false);

          // ⭐ FIXED: Always navigate, even if custom callback exists
          if (options.onSuccess) {
            options.onSuccess(data);
          }
          
          // Navigate to success page
          console.log('🚀 Navigating to order success page:', data.order_id);
          navigate(`/order-success/${data.order_id}`, {
            state: { paymentData: data },
            replace: true // ⭐ Replace history to prevent back navigation
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
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);

      if (options.onError) {
        options.onError(err.message);
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
   */
  const retryPayment = useCallback((orderData, options = {}) => {
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