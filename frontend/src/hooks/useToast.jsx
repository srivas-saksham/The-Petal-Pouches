// frontend/src/hooks/useToast.js

import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Custom hook to access toast notifications
 * 
 * @returns {Object} Toast methods
 * @returns {Function} toast.success - Show success toast (green mint)
 * @returns {Function} toast.error - Show error toast (red)
 * @returns {Function} toast.warning - Show warning toast (yellow)
 * @returns {Function} toast.info - Show info toast (pink)
 * @returns {Function} toast.show - Show custom toast
 * @returns {Function} toast.remove - Remove specific toast
 * @returns {Function} toast.clear - Clear all toasts
 * 
 * @example
 * import { useToast } from '../hooks/useToast';
 * 
 * function MyComponent() {
 *   const toast = useToast();
 * 
 *   const handleSave = () => {
 *     toast.success('Product created successfully!');
 *   };
 * 
 *   const handleError = () => {
 *     toast.error('Failed to save changes');
 *   };
 * 
 *   return <button onClick={handleSave}>Save</button>;
 * }
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export default useToast;