// frontend/src/hooks/useBundleCart.js

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import bundleService from '../services/bundleService';

/**
 * Custom hook for bundle cart operations
 * Handles adding bundles to cart with proper error handling
 */
const useBundleCart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add bundle to cart
   * @param {string} bundleId - Bundle UUID
   * @param {number} quantity - Quantity (default: 1)
   * @returns {Promise<boolean>} Success status
   */
  const addBundleToCart = useCallback(async (bundleId, quantity = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Check stock first
      const stockStatus = await bundleService.checkBundleStock(bundleId);
      
      if (!stockStatus.data.in_stock) {
        toast.error('This bundle is currently out of stock');
        setError('OUT_OF_STOCK');
        return false;
      }

      // Add to cart
      await bundleService.addBundleToCart(bundleId, quantity);
      
      toast.success('Bundle added to cart!');
      return true;

    } catch (err) {
      console.error('❌ Add to cart error:', err);
      
      const errorMessage = err.message || 'Failed to add bundle to cart';
      setError(errorMessage);
      
      if (err.message === 'INSUFFICIENT_STOCK') {
        toast.error('Some items in this bundle are out of stock');
      } else if (err.message === 'BUNDLE_NOT_FOUND') {
        toast.error('Bundle not found');
      } else {
        toast.error(errorMessage);
      }
      
      return false;

    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Quick add to cart (fire and forget)
   * @param {string} bundleId - Bundle UUID
   */
  const quickAddToCart = useCallback(async (bundleId) => {
    return addBundleToCart(bundleId, 1);
  }, [addBundleToCart]);

  /**
   * Check if bundle can be added to cart
   * @param {string} bundleId - Bundle UUID
   * @returns {Promise<boolean>} Can add status
   */
  const canAddToCart = useCallback(async (bundleId) => {
    try {
      const stockStatus = await bundleService.checkBundleStock(bundleId);
      return stockStatus.data.in_stock;
    } catch (err) {
      console.error('❌ Check stock error:', err);
      return false;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    addBundleToCart,
    quickAddToCart,
    canAddToCart,
    clearError
  };
};

export default useBundleCart;