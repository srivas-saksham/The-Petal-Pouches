// frontend/src/components/admin/products/ProductFormModal.jsx

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CreateProductForm from '../../adminComps/CreateProductForm';

/**
 * Wrapper component for CreateProductForm to work with new modal system
 * Provides consistent styling and handles modal state
 */
export default function ProductFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData = null 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title="Create New Product"
      size="lg"
    >
      <div className="product-form-modal-wrapper">
        {/* Scrollable content area */}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-custom px-1">
          <CreateProductForm 
            onSuccess={handleSuccess}
            onSubmitStart={() => setIsSubmitting(true)}
            onSubmitEnd={() => setIsSubmitting(false)}
            initialData={initialData}
          />
        </div>
      </div>

      {/* Custom styles to adapt old form to new design */}
      <style jsx>{`
        .product-form-modal-wrapper :global(.admin-form-container) {
          background: transparent;
          box-shadow: none;
          padding: 0;
          margin: 0;
        }
        
        .product-form-modal-wrapper :global(input),
        .product-form-modal-wrapper :global(textarea),
        .product-form-modal-wrapper :global(select) {
          border-radius: 0.5rem;
          border-color: var(--color-border);
          transition: all 0.2s;
        }
        
        .product-form-modal-wrapper :global(input:focus),
        .product-form-modal-wrapper :global(textarea:focus),
        .product-form-modal-wrapper :global(select:focus) {
          border-color: var(--color-admin-pink);
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }
        
        .product-form-modal-wrapper :global(label) {
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .product-form-modal-wrapper :global(.form-group) {
          margin-bottom: 1.5rem;
        }
        
        .product-form-modal-wrapper :global(button[type="submit"]) {
          background-color: var(--color-admin-pink);
          color: white;
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .product-form-modal-wrapper :global(button[type="submit"]:hover) {
          background-color: var(--color-admin-pink-dark, #db2777);
        }
      `}</style>
    </Modal>
  );
}

/**
 * Hook for managing product form modal state
 */
export function useProductFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const openModal = (data = null) => {
    setInitialData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setInitialData(null);
  };

  return {
    isOpen,
    initialData,
    openModal,
    closeModal,
  };
}