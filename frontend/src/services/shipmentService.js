// frontend/src/services/shipmentService.js
import adminApi from './adminApi'; // ✅ FIXED: Use admin API instance

/**
 * Shipment Service - Frontend
 * API calls for admin shipment management
 * ✅ SECURITY: Uses adminApi to ensure admin_token is sent
 */
const shipmentService = {

  /**
   * Get all shipments with filters
   */
  getAllShipments: async (params = {}) => {
    try {
      const response = await adminApi.get('/api/admin/shipments', { params });
      return {
        success: true,
        data: response.data.data,
        metadata: response.data.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch shipments'
      };
    }
  },

  /**
   * Get pending review shipments
   */
  getPendingShipments: async () => {
    try {
      const response = await adminApi.get('/api/admin/shipments/pending');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pending shipments'
      };
    }
  },

  /**
   * Get single shipment details
   */
  getShipmentById: async (shipmentId) => {
    try {
      const response = await adminApi.get(`/api/admin/shipments/${shipmentId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch shipment'
      };
    }
  },

  /**
   * Update shipment details (before placing)
   */
  updateShipment: async (shipmentId, updateData) => {
    try {
      const response = await adminApi.put(`/api/admin/shipments/${shipmentId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update shipment'
      };
    }
  },

  /**
   * Recalculate shipment cost
   */
  recalculateCost: async (shipmentId) => {
    try {
      const response = await adminApi.post(`/api/admin/shipments/${shipmentId}/recalculate-cost`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to recalculate cost'
      };
    }
  },

  /**
   * Approve and place shipment
   */
  approveAndPlace: async (shipmentId) => {
    try {
      const response = await adminApi.post(`/api/admin/shipments/${shipmentId}/approve-and-place`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve shipment',
        code: error.response?.data?.code
      };
    }
  },

  /**
   * Schedule pickup for shipment
   */
  schedulePickup: async (shipmentId, pickupDate = null) => {
    try {
      const response = await adminApi.post(`/api/admin/shipments/${shipmentId}/schedule-pickup`, { 
        pickup_date: pickupDate 
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to schedule pickup'
      };
    }
  },

  /**
   * Bulk approve shipments
   */
  bulkApprove: async (shipmentIds) => {
    try {
      const response = await adminApi.post('/api/admin/shipments/bulk-approve', {
        shipment_ids: shipmentIds
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Bulk approval failed'
      };
    }
  },

  /**
   * Cancel shipment
   */
  cancelShipment: async (shipmentId, reason) => {
    try {
      const response = await adminApi.post(`/api/admin/shipments/${shipmentId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel shipment'
      };
    }
  },

  /**
   * Get shipment statistics
   */
  getShipmentStats: async () => {
    try {
      const response = await adminApi.get('/api/admin/shipments/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  },

  // ==================== 🆕 EDIT METHODS ====================

  /**
   * Check if shipment is editable
   */
  checkEditEligibility: async (shipmentId) => {
    try {
      const response = await adminApi.get(`/api/admin/shipments/${shipmentId}/edit-eligibility`);
      return {
        success: true,
        eligible: response.data.eligible,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        eligible: false,
        error: error.response?.data?.message || 'Failed to check eligibility',
        reason: error.response?.data?.reason
      };
    }
  },

  /**
   * Edit shipment details via Delhivery API
   */
  editShipment: async (shipmentId, updateData) => {
    try {
      const response = await adminApi.put(`/api/admin/shipments/${shipmentId}/edit`, updateData);
      return {
        success: true,
        data: response.data.data,
        changes: response.data.changes,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to edit shipment',
        code: error.response?.data?.code,
        errors: error.response?.data?.errors
      };
    }
  },

  /**
   * Validate edit data without submitting
   */
  validateEdit: async (shipmentId, updateData) => {
    try {
      const response = await adminApi.post(`/api/admin/shipments/${shipmentId}/validate-edit`, updateData);
      return {
        success: true,
        valid: response.data.valid,
        message: response.data.message,
        fields_to_update: response.data.fields_to_update
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.response?.data?.message || 'Validation failed',
        errors: error.response?.data?.errors || []
      };
    }
  },

  /**
   * Get edit history for shipment
   */
  getEditHistory: async (shipmentId) => {
    try {
      const response = await adminApi.get(`/api/admin/shipments/${shipmentId}/edit-history`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch edit history'
      };
    }
  }

};

export default shipmentService;