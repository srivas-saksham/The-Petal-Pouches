// frontend/src/hooks/useCart.js - CART HOOK

import { useContext } from 'react';
import CartContext from '../context/CartContext';

/**
 * useCart Hook
 * Provides access to global cart state and methods
 * 
 * @returns {Object} Cart context
 * @returns {Array} cartItems - Array of cart items with bundle details
 * @returns {Object} cartTotals - Cart totals { subtotal, tax, shipping, total, item_count, total_quantity }
 * @returns {boolean} loading - Cart loading state
 * @returns {string|null} error - Error message if cart fetch failed
 * @returns {Function} refreshCart - Manually refresh cart from API
 * @returns {Function} getBundleQuantityInCart - Get quantity of specific bundle: (bundleId) => number
 * @returns {Function} isBundleInCart - Check if bundle exists in cart: (bundleId) => boolean
 * @returns {Function} getCartItemByBundleId - Get full cart item object: (bundleId) => object|undefined
 * @returns {Function} clearCartState - Clear local cart state (used on logout)
 * 
 * @example
 * ```javascript
 * import { useCart } from '../hooks/useCart';
 * 
 * function MyComponent() {
 *   const { 
 *     cartItems, 
 *     cartTotals,
 *     refreshCart, 
 *     getBundleQuantityInCart,
 *     isBundleInCart 
 *   } = useCart();
 * 
 *   const quantity = getBundleQuantityInCart('bundle-uuid');
 *   const inCart = isBundleInCart('bundle-uuid');
 * 
 *   const handleAddToCart = async () => {
 *     // ... add to cart logic
 *     await refreshCart(); // Refresh after mutation
 *   };
 * 
 *   return (
 *     <div>
 *       <p>Items in cart: {cartTotals.item_count}</p>
 *       <p>Total: ₹{cartTotals.total}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider. Make sure your component is wrapped with <CartProvider>.');
  }

  return context;
};

export default useCart;