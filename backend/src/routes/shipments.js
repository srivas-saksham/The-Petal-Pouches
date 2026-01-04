// backend/src/routes/shipments.js
const express = require('express');
const router = express.Router();
const ShipmentController = require('../controllers/shipmentController');
const ShipmentEditController = require('../controllers/shipmentEditController');
const {
  validateEditRequest,
  sanitizeEditData,
  validateShipmentId,
  rateLimitEdits,
  logEditAttempt
} = require('../middleware/validateShipmentEdit');

// All routes require admin authentication (assumed to be applied at app level)

/**
 * GET /api/admin/shipments/stats
 * Get shipment statistics
 * MUST BE BEFORE /:id ROUTE
 */
router.get('/stats', ShipmentController.getShipmentStats);

/**
 * GET /api/admin/shipments/pending
 * Get pending review shipments
 * MUST BE BEFORE /:id ROUTE
 */
router.get('/pending', ShipmentController.getPendingReviewShipments);

/**
 * GET /api/admin/shipments
 * Get all shipments with filters
 * Query: ?status=pending_review&page=1&limit=20
 */
router.get('/', ShipmentController.getAllShipments);

/**
 * POST /api/admin/shipments/bulk-approve
 * Bulk approve and place shipments
 * Body: { shipment_ids: ['uuid1', 'uuid2'] }
 */
router.post('/bulk-approve', ShipmentController.bulkApproveAndPlace);

/**
 * POST /api/admin/shipments/bulk-sync
 * Bulk sync all active shipments with Delhivery
 */
router.post('/bulk-sync', ShipmentController.bulkSyncShipments);

// ==================== 🆕 EDIT ROUTES ====================

/**
 * GET /api/admin/shipments/:id/edit-eligibility
 * Check if shipment can be edited
 * MUST BE BEFORE /:id ROUTE
 */
router.get(
  '/:id/edit-eligibility',
  validateShipmentId,
  ShipmentEditController.checkEditEligibility
);

/**
 * GET /api/admin/shipments/:id/edit-history
 * Get edit history for shipment
 * MUST BE BEFORE /:id ROUTE
 */
router.get(
  '/:id/edit-history',
  validateShipmentId,
  ShipmentEditController.getEditHistory
);

/**
 * POST /api/admin/shipments/:id/validate-edit
 * Validate edit data without submitting
 * MUST BE BEFORE /:id ROUTE
 */
router.post(
  '/:id/validate-edit',
  validateShipmentId,
  validateEditRequest,
  sanitizeEditData,
  ShipmentEditController.validateEdit
);

/**
 * PUT /api/admin/shipments/:id/edit
 * Edit shipment details via Delhivery API
 * MUST BE BEFORE /:id ROUTE
 * 
 * Body:
 * {
 *   "name": "New Name",
 *   "phone": "9876543210",
 *   "address": "New Address",
 *   "weight": 1200,
 *   "shipment_height": 15,
 *   "shipment_width": 20,
 *   "shipment_length": 25,
 *   "products_desc": "Updated description",
 *   "admin_notes": "Edited due to customer request"
 * }
 */
router.put(
  '/:id/edit',
  validateShipmentId,
  rateLimitEdits,
  validateEditRequest,
  sanitizeEditData,
  logEditAttempt,
  ShipmentEditController.editShipment
);

// ==================== EXISTING ROUTES ====================

/**
 * GET /api/admin/shipments/:id/label
 * Download shipment label (server-side proxy)
 * MUST BE BEFORE /:id ROUTE
 */
router.get('/:id/label', ShipmentController.downloadLabel);

/**
 * GET /api/admin/shipments/:id/invoice
 * Download shipment invoice (server-side proxy)
 * MUST BE BEFORE /:id ROUTE
 */
router.get('/:id/invoice', ShipmentController.downloadInvoice);

/**
 * GET /api/admin/shipments/:id
 * Get single shipment details
 */
router.get('/:id', ShipmentController.getShipmentById);

/**
 * PUT /api/admin/shipments/:id
 * Update shipment details (before placing)
 * NOTE: This is for editing BEFORE Delhivery placement
 * Use PUT /api/admin/shipments/:id/edit for AFTER placement
 * 
 * Body: { weight_grams, dimensions_cm, shipping_mode, admin_notes }
 */
router.put('/:id', ShipmentController.updateShipmentDetails);

/**
 * POST /api/admin/shipments/:id/recalculate-cost
 * Recalculate shipping cost
 */
router.post('/:id/recalculate-cost', ShipmentController.recalculateCost);

/**
 * POST /api/admin/shipments/:id/approve-and-place
 * Approve and place shipment with Delhivery
 */
router.post('/:id/approve-and-place', ShipmentController.approveAndPlace);

/**
 * POST /api/admin/shipments/:id/schedule-pickup
 * Schedule pickup for placed shipment
 */
router.post('/:id/schedule-pickup', ShipmentController.schedulePickup);

/**
 * POST /api/admin/shipments/:id/sync
 * Sync shipment tracking with Delhivery
 */
router.post('/:id/sync', ShipmentController.syncShipment);

/**
 * POST /api/admin/shipments/:id/cancel
 * Cancel shipment
 * Body: { reason }
 */
router.post('/:id/cancel', ShipmentController.cancelShipment);

module.exports = router;