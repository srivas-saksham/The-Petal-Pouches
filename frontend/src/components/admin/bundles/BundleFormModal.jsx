// frontend/src/components/admin/bundles/BundleFormModal.jsx

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import BundleForm from '../../adminComps/BundleForm';
import { getBundleById } from '../../../services/adminBundleService';

/**
 * Wrapper component for BundleForm to work with new modal system
 * Handles both create and edit modes
 */
export default function BundleFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  bundleId = null // If provided, opens in edit mode
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [error, setError] = useState('');

  const isEditMode = !!bundleId;

  useEffect(() => {
    if (isOpen && bundleId) {
      fetchBundle();
    } else {
      setBundle(null);
      setError('');
    }
  }, [isOpen, bundleId]);

  const fetchBundle = async () => {
    setLoading(true);
    setError('');

    const result = await getBundleById(bundleId);

    if (result.success) {
      setBundle(result.data.data || result.data);
    } else {
      setError(result.error || 'Failed to load bundle');
    }

    setLoading(false);
  };

  const handleSuccess = (message) => {
    setIsSubmitting(false);
    if (onSuccess) {
      onSuccess(message || (isEditMode ? 'Bundle updated successfully!' : 'Bundle created successfully!'));
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
      title={isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
      size="xl"
    >
      <div className="bundle-form-modal-wrapper">
        {/* Loading State (for edit mode) */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-admin-pink"></div>
            <span className="ml-3 text-text-secondary">Loading bundle...</span>
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
            <Button variant="outline" onClick={fetchBundle}>
              Try Again
            </Button>
          </div>
        )}

        {/* Form Content - Create Mode */}
        {!loading && !error && !isEditMode && (
          <div className="max-h-[75vh] overflow-y-auto scrollbar-custom px-1">
            <BundleForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Form Content - Edit Mode */}
        {!loading && !error && isEditMode && bundle && (
          <div className="max-h-[75vh] overflow-y-auto scrollbar-custom px-1">
            <BundleForm 
              bundleId={bundleId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Edit mode but no bundle loaded yet */}
        {!loading && !error && isEditMode && !bundle && (
          <div className="p-6 text-center text-text-secondary">
            Loading bundle data...
          </div>
        )}
      </div>

      {/* Custom styles to adapt old form to new design */}
      <style jsx>{`
        .bundle-form-modal-wrapper :global(.admin-form-container),
        .bundle-form-modal-wrapper :global(.bundle-form-container) {
          background: transparent;
          box-shadow: none;
          padding: 0;
          margin: 0;
        }
        
        .bundle-form-modal-wrapper :global(input),
        .bundle-form-modal-wrapper :global(textarea),
        .bundle-form-modal-wrapper :global(select) {
          border-radius: 0.5rem;
          border-color: var(--color-border);
          transition: all 0.2s;
        }
        
        .bundle-form-modal-wrapper :global(input:focus),
        .bundle-form-modal-wrapper :global(textarea:focus),
        .bundle-form-modal-wrapper :global(select:focus) {
          border-color: var(--color-admin-pink);
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }
        
        .bundle-form-modal-wrapper :global(label) {
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .bundle-form-modal-wrapper :global(.form-group) {
          margin-bottom: 1.5rem;
        }
        
        .bundle-form-modal-wrapper :global(button[type="submit"]),
        .bundle-form-modal-wrapper :global(.btn-primary) {
          background-color: var(--color-admin-pink);
          color: white;
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .bundle-form-modal-wrapper :global(button[type="submit"]:hover),
        .bundle-form-modal-wrapper :global(.btn-primary:hover) {
          background-color: var(--color-admin-pink-dark, #db2777);
        }
        
        .bundle-form-modal-wrapper :global(.btn-cancel),
        .bundle-form-modal-wrapper :global(.btn-secondary),
        .bundle-form-modal-wrapper :global(button[type="button"]) {
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }

        .bundle-form-modal-wrapper :global(.bundle-item),
        .bundle-form-modal-wrapper :global(.product-selector-item) {
          border-radius: 0.5rem;
          border-color: var(--color-border);
          transition: all 0.2s;
        }

        .bundle-form-modal-wrapper :global(.bundle-item:hover),
        .bundle-form-modal-wrapper :global(.product-selector-item:hover) {
          border-color: var(--color-admin-pink);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </Modal>
  );
}

/**
 * Hook for managing bundle form modal state
 */
export function useBundleFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [bundleId, setBundleId] = useState(null);

  const openCreateModal = () => {
    setBundleId(null);
    setIsOpen(true);
  };

  const openEditModal = (id) => {
    setBundleId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setBundleId(null);
  };

  return {
    isOpen,
    bundleId,
    isEditMode: !!bundleId,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}