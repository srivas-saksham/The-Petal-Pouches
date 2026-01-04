// frontend/src/components/admin/shipments/EditShipmentModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Loader, Edit, History, XCircle } from 'lucide-react';
import { useShipmentEdit } from '../../../hooks/useShipmentEdit';
import EditShipmentForm from './EditShipmentForm';

/**
 * Edit Shipment Modal
 * Full-featured modal for editing shipment details via Delhivery API
 */
export default function EditShipmentModal({ 
  shipment, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  
  const {
    editData,
    isEligible,
    eligibilityMessage,
    restrictions,
    hasChanges,
    errors,
    checking,
    validating,
    submitting,
    updateField,
    resetEditData,
    validate,
    submitEdit,
    canSubmit,
    isProcessing
  } = useShipmentEdit(shipment?.id, shipment);

  const [showHistory, setShowHistory] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetEditData();
      setShowHistory(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // ✅ ONLY validate when user clicks "Save Changes"
    const validation = await validate();
    
    if (!validation.valid) {
        return;
    }

    const result = await submitEdit();
    
    if (result.success) {
        if (onSuccess) {
        onSuccess(result);
        }
        
        setTimeout(() => {
        onClose();
        }, 1500);
    }
    };

  const loadEditHistory = async () => {
    setLoadingHistory(true);
    try {
      const shipmentService = (await import('../../../services/shipmentService')).default;
      const result = await shipmentService.getEditHistory(shipment.id);
      
      if (result.success) {
        setEditHistory(result.data.history || []);
      }
    } catch (error) {
      console.error('Failed to load edit history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadEditHistory();
    }
    setShowHistory(!showHistory);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Shipment Details</h2>
              <p className="text-sm text-gray-600">AWB: {shipment?.awb || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* Checking Eligibility */}
          {checking && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Checking edit eligibility...</p>
              </div>
            </div>
          )}

          {/* Not Eligible */}
          {!checking && !isEligible && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-900 mb-2">Cannot Edit Shipment</h3>
              <p className="text-sm text-red-700 mb-4">{eligibilityMessage}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          )}

          {/* Eligible - Show Form */}
          {!checking && isEligible && (
            <>
              {/* Restrictions Info */}
              {restrictions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 mb-1">Edit Guidelines</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">{restrictions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900 mb-2">Validation Errors</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              <EditShipmentForm
                shipment={shipment}
                editData={editData}
                onFieldChange={updateField}
                errors={{}}
                disabled={isProcessing}
              />

              {/* Edit History Toggle */}
              <div className="mt-6">
                <button
                  onClick={toggleHistory}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? 'Hide Edit History' : 'View Edit History'}
                </button>

                {showHistory && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {loadingHistory ? (
                      <div className="text-center py-4">
                        <Loader className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
                      </div>
                    ) : editHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No edit history available</p>
                    ) : (
                      <div className="space-y-3">
                        {editHistory.map((edit, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-xs font-semibold text-gray-700">
                                {new Date(edit.edited_at).toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-gray-500">
                                Edited by: {edit.edited_by?.substring(0, 8)}...
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-semibold">Fields changed:</span> {edit.fields_changed?.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!checking && isEligible && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {hasChanges ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  Unsaved changes
                </span>
              ) : (
                <span>No changes yet</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : validating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}