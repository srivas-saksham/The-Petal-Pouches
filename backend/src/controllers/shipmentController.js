const ShipmentModel = require('../models/shipmentModel');

const ShipmentController = {

  /**
   * Get all shipments (admin)
   * GET /api/admin/shipments
   */
  async getAllShipments(req, res) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        search,
        from_date,
        to_date,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      const filters = {
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        from_date,
        to_date,
        sort,
        order
      };

      const result = await ShipmentModel.getAllShipments(filters);

      res.status(200).json({
        success: true,
        data: result.shipments,
        metadata: {
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('❌ Get all shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shipments',
        error: error.message
      });
    }
  },

  /**
   * Get pending review shipments
   * GET /api/admin/shipments/pending
   */
  async getPendingReviewShipments(req, res) {
    try {
      const shipments = await ShipmentModel.getPendingReviewShipments();

      res.status(200).json({
        success: true,
        data: shipments,
        count: shipments.length
      });
    } catch (error) {
      console.error('❌ Get pending shipments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending shipments',
        error: error.message
      });
    }
  },

  /**
   * Get single shipment details
   * GET /api/admin/shipments/:id
   */
  async getShipmentById(req, res) {
    try {
      const { id } = req.params;

      const shipment = await ShipmentModel.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: shipment
      });
    } catch (error) {
      console.error('❌ Get shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shipment',
        error: error.message
      });
    }
  },

  /**
   * Update shipment details (admin edit)
   * PUT /api/admin/shipments/:id
   */
  async updateShipmentDetails(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin.id;
      const updateData = req.body;

      const updatedShipment = await ShipmentModel.updateShipmentDetails(
        id,
        updateData,
        adminId
      );

      res.status(200).json({
        success: true,
        message: 'Shipment updated successfully',
        data: updatedShipment
      });
    } catch (error) {
      console.error('❌ Update shipment error:', error);
      
      if (error.message === 'SHIPMENT_NOT_EDITABLE') {
        return res.status(400).json({
          success: false,
          message: 'Shipment cannot be edited after being placed'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update shipment',
        error: error.message
      });
    }
  },

  /**
   * Recalculate shipment cost
   * POST /api/admin/shipments/:id/recalculate-cost
   */
  async recalculateCost(req, res) {
    try {
      const { id } = req.params;

      const shipment = await ShipmentModel.recalculateShipmentCost(id);

      res.status(200).json({
        success: true,
        message: 'Cost recalculated successfully',
        data: shipment
      });
    } catch (error) {
      console.error('❌ Recalculate cost error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to recalculate cost',
        error: error.message
      });
    }
  },

  /**
   * Approve and place shipment
   * POST /api/admin/shipments/:id/approve-and-place
   */
  async approveAndPlace(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin.id;

      const placedShipment = await ShipmentModel.approveAndPlace(id, adminId);

      res.status(200).json({
        success: true,
        message: 'Shipment approved and placed successfully',
        data: placedShipment
      });
    } catch (error) {
      console.error('❌ Approve and place error:', error);

      if (error.message.includes('Delhivery')) {
        return res.status(502).json({
          success: false,
          message: 'Failed to create shipment with Delhivery',
          error: error.message,
          code: 'DELHIVERY_API_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to approve and place shipment',
        error: error.message
      });
    }
  },
  
  /**
   * Bulk approve and place shipments
   * POST /api/admin/shipments/bulk-approve
   */
  async bulkApproveAndPlace(req, res) {
    try {
      const { shipment_ids } = req.body;
      const adminId = req.admin.id;

      if (!Array.isArray(shipment_ids) || shipment_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'shipment_ids array is required'
        });
      }

      const result = await ShipmentModel.bulkApproveAndPlace(shipment_ids, adminId);

      res.status(200).json({
        success: true,
        message: `Bulk approval complete: ${result.success.length} success, ${result.failed.length} failed`,
        data: result
      });
    } catch (error) {
      console.error('❌ Bulk approve error:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk approval failed',
        error: error.message
      });
    }
  },

  /**
   * Cancel shipment
   * POST /api/admin/shipments/:id/cancel
   */
  async cancelShipment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cancelledShipment = await ShipmentModel.cancelShipment(id, reason);

      res.status(200).json({
        success: true,
        message: 'Shipment cancelled successfully',
        data: cancelledShipment
      });
    } catch (error) {
      console.error('❌ Cancel shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel shipment',
        error: error.message
      });
    }
  },

  /**
   * Get shipment statistics
   * GET /api/admin/shipments/stats
   */
  async getShipmentStats(req, res) {
    try {
      const stats = await ShipmentModel.getShipmentStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Get shipment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  /**
   * Sync shipment with Delhivery
   * POST /api/admin/shipments/:id/sync
   */
  async syncShipment(req, res) {
    try {
      const { id } = req.params;

      const updatedShipment = await ShipmentModel.syncWithDelhivery(id);

      res.status(200).json({
        success: true,
        message: 'Shipment synced successfully',
        data: updatedShipment
      });
    } catch (error) {
      console.error('❌ Sync shipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync shipment',
        error: error.message
      });
    }
  },

  /**
   * Bulk sync all active shipments
   * POST /api/admin/shipments/bulk-sync
   */
  async bulkSyncShipments(req, res) {
    try {
      const result = await ShipmentModel.bulkSyncActiveShipments();

      res.status(200).json({
        success: true,
        message: `Synced ${result.success.length} shipments, ${result.failed.length} failed`,
        data: result
      });
    } catch (error) {
      console.error('❌ Bulk sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync shipments',
        error: error.message
      });
    }
  },

  /**
   * Generate and download invoice
   * GET /api/admin/shipments/:id/invoice
   */
  async downloadInvoice(req, res) {
    try {
      const { id } = req.params;

      console.log(`📄 Generating invoice for shipment: ${id}`);

      // Get shipment details
      const supabase = require('../config/supabaseClient');
      const { data: shipment, error } = await supabase
        .from('Shipments')
        .select('awb, id')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error: ' + error.message
        });
      }

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }

      if (!shipment.awb) {
        return res.status(400).json({
          success: false,
          message: 'Shipment does not have AWB yet. Cannot generate invoice.'
        });
      }

      console.log(`📦 AWB: ${shipment.awb}`);

      // Generate invoice using Delhivery service
      const delhiveryService = require('../services/delhiveryService');
      const invoiceResult = await delhiveryService.generateInvoice(shipment.awb);

      if (!invoiceResult.success) {
        console.error('❌ Invoice generation failed:', invoiceResult.error);
        return res.status(500).json({
          success: false,
          message: invoiceResult.error || 'Failed to generate invoice'
        });
      }

      console.log(`✅ Invoice URL generated: ${invoiceResult.invoice_url.substring(0, 100)}...`);

      // ✅ FIX: Fetch the PDF from the SIGNED URL (no auth header needed!)
      const axios = require('axios');
      const pdfResponse = await axios.get(invoiceResult.invoice_url, {
        // ❌ DON'T ADD Authorization header - AWS signed URLs don't need it!
        headers: {
          'Accept': 'application/pdf'
        },
        responseType: 'stream',
        timeout: 30000,
        validateStatus: (status) => status < 500
      });

      if (pdfResponse.status !== 200) {
        console.error(`❌ PDF fetch failed: HTTP ${pdfResponse.status}`);
        return res.status(502).json({
          success: false,
          message: `Failed to fetch PDF from Delhivery: HTTP ${pdfResponse.status}`,
          code: 'DELHIVERY_FETCH_ERROR'
        });
      }

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${shipment.awb}.pdf"`);

      // Pipe the PDF stream to response
      pdfResponse.data.pipe(res);

      console.log(`✅ Invoice streaming to client: ${shipment.awb}`);

    } catch (error) {
      console.error('❌ Download invoice error:', error);
      
      // Check if headers already sent (streaming started)
      if (res.headersSent) {
        console.error('❌ Error occurred during streaming, connection terminated');
        return res.end();
      }

      if (error.code === 'ECONNREFUSED') {
        return res.status(502).json({
          success: false,
          message: 'Cannot connect to Delhivery API',
          code: 'DELHIVERY_CONNECTION_ERROR'
        });
      }

      if (error.response?.status === 401) {
        return res.status(502).json({
          success: false,
          message: 'Delhivery authentication failed',
          code: 'DELHIVERY_AUTH_ERROR'
        });
      }

      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found at Delhivery. It may not be generated yet.',
          code: 'INVOICE_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to download invoice',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // backend/src/controllers/shipmentController.js
// ✅ FINAL FIX: Use pdf_encoding from Delhivery response

/**
 * Generate and download shipping label
 * GET /api/admin/shipments/:id/label
 * ✅ FIXED: Uses pdf_encoding directly from Delhivery response
 */
async downloadLabel(req, res) {
  try {
    const { id } = req.params;
    const { pdf_size = '4R' } = req.query;

    console.log(`📄 [Controller] Generating label for shipment: ${id}, size: ${pdf_size}`);

    // Get shipment details
    const supabase = require('../config/supabaseClient');
    const { data: shipment, error } = await supabase
      .from('Shipments')
      .select('awb, id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error: ' + error.message
      });
    }

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    if (!shipment.awb) {
      return res.status(400).json({
        success: false,
        message: 'Shipment does not have AWB yet. Cannot generate label.'
      });
    }

    console.log(`📦 [Controller] AWB: ${shipment.awb}`);

    // ✅ Generate label and get response
    const delhiveryService = require('../services/delhiveryService');
    const labelResult = await delhiveryService.generateLabel(shipment.awb, { 
      pdf: true, 
      pdf_size 
    });

    if (!labelResult.success) {
      console.error('❌ Label generation failed:', labelResult.error);
      return res.status(500).json({
        success: false,
        message: labelResult.error || 'Failed to generate label'
      });
    }

    // ✅ CRITICAL: Check if we have pdf_encoding (base64) in response
    if (labelResult.pdf_encoding) {
      console.log('✅ [Controller] Using pdf_encoding from response');
      
      // Decode base64 to buffer
      const pdfBuffer = Buffer.from(labelResult.pdf_encoding, 'base64');
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="label-${shipment.awb}-${pdf_size}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
      console.log(`✅ [Controller] Label sent to client: ${shipment.awb} (${pdfBuffer.length} bytes)`);
      return;
    }

    // ✅ Fallback: Use S3 URL if no pdf_encoding
    const labelUrl = labelResult.label_url;
    console.log(`⚠️ [Controller] No pdf_encoding, using S3 URL: ${labelUrl.substring(0, 100)}...`);
    
    const axios = require('axios');
    const pdfResponse = await axios.get(labelUrl, {
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0'
      },
      responseType: 'arraybuffer', // ✅ Changed from 'stream' to 'arraybuffer'
      timeout: 30000,
      validateStatus: (status) => status < 500,
      maxRedirects: 5
    });

    if (pdfResponse.status !== 200) {
      console.error(`❌ PDF fetch failed: HTTP ${pdfResponse.status}`);
      return res.status(502).json({
        success: false,
        message: `Failed to fetch PDF: HTTP ${pdfResponse.status}`,
        code: 'PDF_FETCH_ERROR'
      });
    }

    // ✅ Send buffer directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="label-${shipment.awb}-${pdf_size}.pdf"`);
    res.setHeader('Content-Length', pdfResponse.data.length);
    
    res.send(pdfResponse.data);
    
    console.log(`✅ [Controller] Label sent to client: ${shipment.awb}`);

  } catch (error) {
    console.error('❌ [Controller] Download label error:', error);
    
    if (res.headersSent) {
      console.error('❌ Headers already sent, terminating connection');
      return res.end();
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        success: false,
        message: 'Cannot connect to Delhivery/S3 servers',
        code: 'CONNECTION_ERROR'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Request timed out',
        code: 'TIMEOUT_ERROR'
      });
    }

    if (error.response?.status === 403) {
      return res.status(502).json({
        success: false,
        message: 'Access denied. The signed URL may have expired.',
        code: 'ACCESS_DENIED'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Label not found',
        code: 'LABEL_NOT_FOUND'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to download label',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'DOWNLOAD_ERROR'
    });
  }
},

/**
 * Generate and download invoice
 * GET /api/admin/shipments/:id/invoice
 * ✅ FIXED: Uses pdf_encoding directly from Delhivery response
 */
async downloadInvoice(req, res) {
  try {
    const { id } = req.params;

    console.log(`📄 [Controller] Generating invoice for shipment: ${id}`);

    // Get shipment details
    const supabase = require('../config/supabaseClient');
    const { data: shipment, error } = await supabase
      .from('Shipments')
      .select('awb, id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error: ' + error.message
      });
    }

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    if (!shipment.awb) {
      return res.status(400).json({
        success: false,
        message: 'Shipment does not have AWB yet. Cannot generate invoice.'
      });
    }

    console.log(`📦 [Controller] AWB: ${shipment.awb}`);

    // ✅ Generate invoice and get response
    const delhiveryService = require('../services/delhiveryService');
    const invoiceResult = await delhiveryService.generateInvoice(shipment.awb);

    if (!invoiceResult.success) {
      console.error('❌ Invoice generation failed:', invoiceResult.error);
      return res.status(500).json({
        success: false,
        message: invoiceResult.error || 'Failed to generate invoice'
      });
    }

    // ✅ CRITICAL: Check if we have pdf_encoding (base64) in response
    if (invoiceResult.pdf_encoding) {
      console.log('✅ [Controller] Using pdf_encoding from response');
      
      // Decode base64 to buffer
      const pdfBuffer = Buffer.from(invoiceResult.pdf_encoding, 'base64');
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${shipment.awb}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
      console.log(`✅ [Controller] Invoice sent to client: ${shipment.awb} (${pdfBuffer.length} bytes)`);
      return;
    }

    // ✅ Fallback: Use S3 URL if no pdf_encoding
    const invoiceUrl = invoiceResult.invoice_url;
    console.log(`⚠️ [Controller] No pdf_encoding, using S3 URL: ${invoiceUrl.substring(0, 100)}...`);
    
    const axios = require('axios');
    const pdfResponse = await axios.get(invoiceUrl, {
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0'
      },
      responseType: 'arraybuffer', // ✅ Changed from 'stream' to 'arraybuffer'
      timeout: 30000,
      validateStatus: (status) => status < 500,
      maxRedirects: 5
    });

    if (pdfResponse.status !== 200) {
      console.error(`❌ PDF fetch failed: HTTP ${pdfResponse.status}`);
      return res.status(502).json({
        success: false,
        message: `Failed to fetch PDF: HTTP ${pdfResponse.status}`,
        code: 'PDF_FETCH_ERROR'
      });
    }

    // ✅ Send buffer directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${shipment.awb}.pdf"`);
    res.setHeader('Content-Length', pdfResponse.data.length);
    
    res.send(pdfResponse.data);
    
    console.log(`✅ [Controller] Invoice sent to client: ${shipment.awb}`);

  } catch (error) {
    console.error('❌ [Controller] Download invoice error:', error);
    
    if (res.headersSent) {
      console.error('❌ Headers already sent, terminating connection');
      return res.end();
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        success: false,
        message: 'Cannot connect to Delhivery/S3 servers',
        code: 'CONNECTION_ERROR'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Request timed out',
        code: 'TIMEOUT_ERROR'
      });
    }

    if (error.response?.status === 403) {
      return res.status(502).json({
        success: false,
        message: 'Access denied. The signed URL may have expired.',
        code: 'ACCESS_DENIED'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to download invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'DOWNLOAD_ERROR'
    });
  }
}
};

module.exports = ShipmentController;