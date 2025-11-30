// frontend/src/context/CartContext.jsx - GLOBAL CART STATE MANAGEMENT

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getCart } from '../services/cartService';
import { useUserAuth } from './UserAuthContext';

const CartContext = createContext();

/**
 * CartProvider - Global cart state management
 * Provides cart data and refresh function to all components
 */
export function CartProvider({ children }) {
  const { user, isAuthenticated } = useUserAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    item_count: 0,
    total_quantity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch cart data from API
   */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCart();

      if (result.success && result.data) {
        setCartItems(result.data.items || []);
        setCartTotals(result.data.totals || {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          item_count: 0,
          total_quantity: 0
        });
        console.log('✅ Cart loaded:', result.data.items?.length || 0, 'items');
      } else {
        console.error('❌ Cart fetch failed:', result.error);
        setError(result.error);
        setCartItems([]);
        setCartTotals({
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          item_count: 0,
          total_quantity: 0
        });
      }
    } catch (err) {
      console.error('❌ Cart fetch error:', err);
      setError(err.message || 'Failed to load cart');
      setCartItems([]);
      setCartTotals({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        item_count: 0,
        total_quantity: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh cart (call this after any cart operation)
   */
  const refreshCart = useCallback(async () => {
    console.log('🔄 Refreshing cart...');
    await fetchCart();
  }, [fetchCart]);

  /**
   * Get quantity of a specific bundle in cart
   */
  const getBundleQuantityInCart = useCallback((bundleId) => {
    const item = cartItems.find(item => item.bundle_id === bundleId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  /**
   * Check if bundle is in cart
   */
  const isBundleInCart = useCallback((bundleId) => {
    return cartItems.some(item => item.bundle_id === bundleId);
  }, [cartItems]);

  /**
   * Get cart item by bundle ID
   */
  const getCartItemByBundleId = useCallback((bundleId) => {
    return cartItems.find(item => item.bundle_id === bundleId);
  }, [cartItems]);

  /**
   * Clear cart state (on logout)
   */
  const clearCartState = useCallback(() => {
    setCartItems([]);
    setCartTotals({
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      item_count: 0,
      total_quantity: 0
    });
    setError(null);
  }, []);

  // Initial cart load on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Reload cart when user logs in/out
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔐 User logged in, refreshing cart');
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const value = {
    // State
    cartItems,
    cartTotals,
    loading,
    error,

    // Methods
    refreshCart,
    getBundleQuantityInCart,
    isBundleInCart,
    getCartItemByBundleId,
    clearCartState,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart hook - Access cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartContext;