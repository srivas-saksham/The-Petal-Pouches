// frontend/src/hooks/useShipmentEdit.js
import { useState, useEffect } from 'react';
import shipmentService from '../services/shipmentService';

/**
 * Custom hook for managing shipment edit state
 * Handles eligibility checking, validation, and submission
 * 
 * @param {string} shipmentId - Shipment UUID
 * @param {Object} initialShipment - Initial shipment data
 * @returns {Object} Edit state and handlers
 */
export const useShipmentEdit = (shipmentId, initialShipment = null) => {
  const [shipment, setShipment] = useState(initialShipment);
  const [editData, setEditData] = useState({});
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [restrictions, setRestrictions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Check if shipment is editable
   */
  const checkEligibility = async () => {
    try {
      setChecking(true);
      setErrors([]);

      const result = await shipmentService.checkEditEligibility(shipmentId);

      if (result.success && result.eligible) {
        setIsEligible(true);
        setEligibilityMessage(result.message);
        setRestrictions(result.data?.restrictions || '');
        
        if (result.data?.shipment) {
          setShipment(result.data.shipment);
        }
        
        return { eligible: true, message: result.message };
      } else {
        setIsEligible(false);
        setEligibilityMessage(result.error || result.reason || 'Not eligible for editing');
        
        return { 
          eligible: false, 
          message: result.error || result.reason 
        };
      }
    } catch (error) {
      setIsEligible(false);
      setEligibilityMessage('Failed to check eligibility');
      setErrors([error.message]);
      
      return { eligible: false, message: error.message };
    } finally {
      setChecking(false);
    }
  };

  /**
   * Update edit data for a specific field
   */
  const updateField = (field, value) => {
    setEditData(prev => {
        const updated = { ...prev };
        
        // ✅ FIXED: Only delete if value is truly empty AND field exists
        if ((value === '' || value === null || value === undefined) && prev[field] !== undefined) {
        delete updated[field];
        } else if (value !== '' && value !== null && value !== undefined) {
        // ✅ Only add non-empty values
        updated[field] = value;
        }
        console.log('📦 New editData:', updated); // ✅ ADD THIS
        return updated;
    });
    
    setHasChanges(Object.keys(editData).length > 0 || value !== '');
    
    // Clear field-specific error
    if (fieldErrors[field]) {
        setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
        });
    }
    };

  /**
   * Update multiple fields at once
   */
  const updateFields = (fields) => {
    setEditData(prev => ({ ...prev, ...fields }));
    setHasChanges(true);
  };

  /**
   * Reset edit data to initial state
   */
  const resetEditData = () => {
    setEditData({});
    setHasChanges(false);
    setErrors([]);
    setFieldErrors({});
  };

  /**
   * Validate current edit data
   */
  const validate = async () => {
    try {
      setValidating(true);
      setErrors([]);
      setFieldErrors({});

      if (Object.keys(editData).length === 0) {
        setErrors(['No changes to validate']);
        return { valid: false, errors: ['No changes to validate'] };
      }

      const result = await shipmentService.validateEdit(shipmentId, editData);

      if (result.success && result.valid) {
        return { valid: true, fields: result.fields_to_update };
      } else {
        const validationErrors = result.errors || [result.error];
        setErrors(validationErrors);
        
        return { valid: false, errors: validationErrors };
      }
    } catch (error) {
      const errorMsg = error.message || 'Validation failed';
      setErrors([errorMsg]);
      
      return { valid: false, errors: [errorMsg] };
    } finally {
      setValidating(false);
    }
  };

  /**
   * Submit edit to API
   */
  const submitEdit = async () => {
    try {
      setSubmitting(true);
      setErrors([]);
      setFieldErrors({});

      if (Object.keys(editData).length === 0) {
        throw new Error('No changes to submit');
      }

      console.log('📤 Submitting edit:', editData);

      const result = await shipmentService.editShipment(shipmentId, editData);

      if (result.success) {
        // Update local shipment data
        if (result.data) {
          setShipment(result.data);
        }
        
        // Clear edit data after successful submission
        resetEditData();
        
        return {
          success: true,
          data: result.data,
          changes: result.changes,
          message: result.message
        };
      } else {
        const errorMsg = result.error || 'Failed to edit shipment';
        setErrors([errorMsg]);
        
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        }
        
        return {
          success: false,
          error: errorMsg,
          errors: result.errors
        };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to submit edit';
      setErrors([errorMsg]);
      
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Get edit history for shipment
   */
  const getEditHistory = async () => {
    try {
      setLoading(true);
      const result = await shipmentService.getEditHistory(shipmentId);
      
      if (result.success) {
        return {
          success: true,
          history: result.data.history,
          totalEdits: result.data.total_edits
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Auto-check eligibility on mount
  useEffect(() => {
    if (shipmentId) {
      checkEligibility();
    }
  }, [shipmentId]);

  return {
    // State
    shipment,
    editData,
    isEligible,
    eligibilityMessage,
    restrictions,
    hasChanges,
    errors,
    fieldErrors,
    
    // Loading states
    loading,
    checking,
    validating,
    submitting,
    
    // Actions
    checkEligibility,
    updateField,
    updateFields,
    resetEditData,
    validate,
    submitEdit,
    getEditHistory,
    
    // Helpers
    canSubmit: isEligible && hasChanges && Object.keys(editData).length > 0,
    isProcessing: checking || validating || submitting
  };
};

export default useShipmentEdit;