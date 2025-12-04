// ============================================
// FILE: frontend/src/hooks/useCartSidebar.jsx
// GLOBAL CART SIDEBAR STATE MANAGEMENT
// ============================================

import { createContext, useContext, useState, useCallback } from 'react';

const CartSidebarContext = createContext();

/**
 * CartSidebarProvider - Global state for cart sidebar
 * Wrap your app with this provider to use cart sidebar anywhere
 */
export function CartSidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => {
    setIsOpen(true);
    // Prevent body scroll when cart is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);

  const toggleCart = useCallback(() => {
    if (isOpen) {
      closeCart();
    } else {
      openCart();
    }
  }, [isOpen, openCart, closeCart]);

  return (
    <CartSidebarContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartSidebarContext.Provider>
  );
}

/**
 * useCartSidebar Hook
 * Access cart sidebar state from any component
 */
export function useCartSidebar() {
  const context = useContext(CartSidebarContext);
  if (!context) {
    throw new Error('useCartSidebar must be used within CartSidebarProvider');
  }
  return context;
}

export default CartSidebarContext;