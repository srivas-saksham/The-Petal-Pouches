// frontend/src/components/admin/products/ProductEditModal.jsx
/**
 * Wrapper component for UpdateProductForm to work with new modal system
 * Fetches product data and provides consistent styling
 * Maintains all existing functionality
 */

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import UpdateProductForm from '../../adminComps/UpdateProductForm';
import { getProductById } from '../../../services/adminProductService';

export default function ProductEditModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  productId 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    } else {
      setProduct(null);
      setError('');
    }
  }, [isOpen, productId]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    const result = await getProductById(productId);

    if (result.success) {
      setProduct(result.data.data || result.data);
    } else {
      setError(result.error || 'Failed to load product');
    }

    setLoading(false);
  };

  const handleSuccess = (data) => {
    setIsSubmitting(false);
    if (onSuccess) {
      onSuccess(data);
    }
    onClose();
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Product"
      size="lg"
    >
      <div className="product-edit-modal-wrapper">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-admin-pink"></div>
            <span className="ml-3 text-text-secondary">Loading product...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProduct}>
              Try Again
            </Button>
          </div>
        )}

        {/* Form Content */}
        {!loading && !error && product && (
          <div className="max-h-[70vh] overflow-y-auto scrollbar-custom px-1">
            <UpdateProductForm 
              productId={productId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              onSubmitStart={() => setIsSubmitting(true)}
              onSubmitEnd={() => setIsSubmitting(false)}
            />
          </div>
        )}

        {/* No Product ID */}
        {!loading && !error && !product && !productId && (
          <div className="p-6 text-center text-text-secondary">
            No product selected
          </div>
        )}
      </div>

      {/* Custom styles to adapt old form to new design */}
      <style jsx>{`
        .product-edit-modal-wrapper :global(.admin-form-container) {
          background: transparent;
          box-shadow: none;
          padding: 0;
          margin: 0;
        }
        
        .product-edit-modal-wrapper :global(input),
        .product-edit-modal-wrapper :global(textarea),
        .product-edit-modal-wrapper :global(select) {
          border-radius: 0.5rem;
          border-color: var(--color-border);
          transition: all 0.2s;
        }
        
        .product-edit-modal-wrapper :global(input:focus),
        .product-edit-modal-wrapper :global(textarea:focus),
        .product-edit-modal-wrapper :global(select:focus) {
          border-color: var(--color-admin-pink);
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }
        
        .product-edit-modal-wrapper :global(label) {
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .product-edit-modal-wrapper :global(.form-group) {
          margin-bottom: 1.5rem;
        }
        
        .product-edit-modal-wrapper :global(button[type="submit"]) {
          background-color: var(--color-admin-pink);
          color: white;
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .product-edit-modal-wrapper :global(button[type="submit"]:hover) {
          background-color: var(--color-admin-pink-dark, #db2777);
        }
        
        .product-edit-modal-wrapper :global(.btn-cancel),
        .product-edit-modal-wrapper :global(button[type="button"]) {
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }
      `}</style>
    </Modal>
  );
}

/**
 * Hook for managing product edit modal state
 */
export function useProductEditModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState(null);

  const openModal = (id) => {
    setProductId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setProductId(null);
  };

  return {
    isOpen,
    productId,
    openModal,
    closeModal,
  };
}