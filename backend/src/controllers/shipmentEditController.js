// backend/src/controllers/shipmentEditController.js
/**
 * Shipment Edit Controller
 * Handles shipment editing via Delhivery API
 */

const ShipmentModel = require('../models/shipmentModel');
const delhiveryService = require('../services/delhiveryService');
const ShipmentEditValidator = require('../utils/shipmentEditValidator');

const ShipmentEditController = {

  /**
   * Check if shipment is editable
   * GET /api/admin/shipments/:id/edit-eligibility
   */
  async checkEditEligibility(req, res) {
    try {
      const { id } = req.params;

      const shipment = await ShipmentModel.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      // Check if shipment has AWB
      if (!shipment.awb) {
        return res.status(400).json({
          success: false,
          eligible: false,
          message: 'Shipment must be placed first before editing',
          reason: 'No AWB assigned yet'
        });
      }

      // Check local status eligibility
      const paymentMode = shipment.Orders?.payment_method === 'cod' ? 'COD' : 'Prepaid';
      const statusCheck = ShipmentEditValidator.isStatusEditable(
        shipment.status,
        paymentMode
      );

      if (!statusCheck.allowed) {
        return res.status(400).json({
          success: false,
          eligible: false,
          message: statusCheck.reason,
          current_status: shipment.status,
          payment_mode: paymentMode
        });
      }

      // Check Delhivery eligibility
      const delhiveryCheck = await delhiveryService.validateEditEligibility(shipment.awb);

      if (!delhiveryCheck.eligible) {
        return res.status(400).json({
          success: false,
          eligible: false,
          message: delhiveryCheck.reason,
          current_status: shipment.status,
          delhivery_status: delhiveryCheck.current_status
        });
      }

      // Return eligible response
      res.status(200).json({
        success: true,
        eligible: true,
        message: 'Shipment can be edited',
        shipment: {
          id: shipment.id,
          awb: shipment.awb,
          status: shipment.status,
          delhivery_status: delhiveryCheck.current_status,
          payment_mode: paymentMode
        },
        editable_fields: [
          'name',
          'phone',
          'address',
          'weight',
          'dimensions',
          'product_description',
          'payment_mode'
        ],
        restrictions: ShipmentEditValidator.getEditRestrictionsMessage(
          shipment.status,
          paymentMode
        )
      });

    } catch (error) {
      console.error('❌ Check edit eligibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check edit eligibility',
        error: error.message
      });
    }
  },

  /**
   * Edit shipment details
   * PUT /api/admin/shipments/:id/edit
   */
  async editShipment(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id || req.user?.id;
      const updateData = req.body;

      console.log(`📝 [EditController] Edit request for shipment: ${id}`);
      console.log('   Update data:', updateData);

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate that at least one field is being updated
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No update data provided'
        });
      }

      // Perform edit via model
      const result = await ShipmentModel.editShipmentViaAPI(
        id,
        updateData,
        adminId
      );

      res.status(200).json({
        success: true,
        message: 'Shipment updated successfully',
        data: result.shipment,
        changes: {
          fields_changed: result.changes.fields_changed,
          edited_at: result.changes.edited_at,
          edited_by: adminId
        }
      });

    } catch (error) {
      console.error('❌ Edit shipment error:', error);

      // Handle specific error types
      if (error.message.includes('AWB')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'NO_AWB'
        });
      }

      if (error.message.includes('not eligible') || error.message.includes('not allowed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'NOT_ELIGIBLE'
        });
      }

      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      if (error.message.includes('Delhivery')) {
        return res.status(502).json({
          success: false,
          message: 'Failed to update shipment with Delhivery',
          error: error.message,
          code: 'DELHIVERY_API_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to edit shipment',
        error: error.message
      });
    }
  },

  /**
   * Get edit history for shipment
   * GET /api/admin/shipments/:id/edit-history
   */
  async getEditHistory(req, res) {
    try {
      const { id } = req.params;

      const shipment = await ShipmentModel.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      const editHistory = shipment.edit_history || [];

      res.status(200).json({
        success: true,
        data: {
          shipment_id: shipment.id,
          awb: shipment.awb,
          total_edits: editHistory.length,
          history: editHistory.sort((a, b) => 
            new Date(b.edited_at) - new Date(a.edited_at)
          )
        }
      });

    } catch (error) {
      console.error('❌ Get edit history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch edit history',
        error: error.message
      });
    }
  },

  /**
   * Validate edit data without submitting
   * POST /api/admin/shipments/:id/validate-edit
   */
  async validateEdit(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const shipment = await ShipmentModel.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      // Validate fields
      const fieldValidation = ShipmentEditValidator.validateEditFields(updateData);

      if (!fieldValidation.valid) {
        return res.status(400).json({
          success: false,
          valid: false,
          errors: fieldValidation.errors
        });
      }

      // Validate payment mode change if applicable
      if (updateData.pt) {
        const paymentMode = shipment.Orders?.payment_method === 'cod' ? 'COD' : 'Prepaid';
        const codAmount = updateData.cod_amount || 0;
        
        const paymentValidation = ShipmentEditValidator.validatePaymentModeChange(
          paymentMode,
          updateData.pt,
          codAmount
        );

        if (!paymentValidation.valid) {
          return res.status(400).json({
            success: false,
            valid: false,
            errors: [paymentValidation.reason]
          });
        }
      }

      res.status(200).json({
        success: true,
        valid: true,
        message: 'Edit data is valid',
        fields_to_update: Object.keys(updateData)
      });

    } catch (error) {
      console.error('❌ Validate edit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate edit data',
        error: error.message
      });
    }
  }

};

module.exports = ShipmentEditController;