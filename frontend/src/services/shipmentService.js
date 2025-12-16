import api from './api';

/**
 * Shipment Service - Frontend
 * API calls for admin shipment management
 */
const shipmentService = {

  /**
   * Get all shipments with filters
   */
  getAllShipments: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/shipments', { params });
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
      const response = await api.get('/api/admin/shipments/pending');
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
      const response = await api.get(`/api/admin/shipments/${shipmentId}`);
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
   * Update shipment details
   */
  updateShipment: async (shipmentId, updateData) => {
    try {
      const response = await api.put(`/api/admin/shipments/${shipmentId}`, updateData);
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
      const response = await api.post(`/api/admin/shipments/${shipmentId}/recalculate-cost`);
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
      const response = await api.post(`/api/admin/shipments/${shipmentId}/approve-and-place`);
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
      const response = await api.post(`/api/admin/shipments/${shipmentId}/schedule-pickup`, { 
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
      const response = await api.post('/api/admin/shipments/bulk-approve', {
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
      const response = await api.post(`/api/admin/shipments/${shipmentId}/cancel`, { reason });
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
      const response = await api.get('/api/admin/shipments/stats');
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
  }

};

export default shipmentService;