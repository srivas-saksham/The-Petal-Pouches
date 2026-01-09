// backend/src/routes/shipments.js
const express = require('express');
const router = express.Router();
const ShipmentController = require('../controllers/shipmentController');
const ShipmentEditController = require('../controllers/shipmentEditController');
const PickupController = require('../controllers/pickupController');
const {
  validateEditRequest,
  sanitizeEditData,
  validateShipmentId,
  rateLimitEdits,
  logEditAttempt
} = require('../middleware/validateShipmentEdit');

// ==================== 🔥 CRITICAL RULE 🔥 ====================
// ALL specific routes MUST come BEFORE generic /:id routes
// Express matches routes in order - first match wins
// =========================================================

// ==================== STATISTICS & AGGREGATES ====================

/**
 * GET /api/admin/shipments/stats
 * Get shipment statistics
 * ✅ MUST BE BEFORE /:id
 */
router.get('/stats', ShipmentController.getShipmentStats);

// ==================== FILTERED LISTS ====================

/**
 * GET /api/admin/shipments/pending
 * Get pending review shipments
 * ✅ MUST BE BEFORE /:id
 */
router.get('/pending', ShipmentController.getPendingReviewShipments);

/**
 * GET /api/admin/shipments/eligible-for-pickup
 * Get shipments ready for pickup (placed status with AWB)
 * ✅ MUST BE BEFORE /:id
 * 🔧 FIX: Moved above /:id to prevent UUID parsing error
 */
router.get('/eligible-for-pickup', PickupController.getEligibleShipments);

/**
 * GET /api/admin/shipments
 * Get all shipments with filters
 * Query: ?status=pending_review&page=1&limit=20
 * ✅ Root route, safe position
 */
router.get('/', ShipmentController.getAllShipments);

// ==================== BULK OPERATIONS ====================

/**
 * POST /api/admin/shipments/bulk-approve
 * Bulk approve and place shipments
 * Body: { shipment_ids: ['uuid1', 'uuid2'] }
 * ✅ MUST BE BEFORE /:id
 */
router.post('/bulk-approve', ShipmentController.bulkApproveAndPlace);

/**
 * POST /api/admin/shipments/bulk-sync
 * Bulk sync all active shipments with Delhivery
 * ✅ MUST BE BEFORE /:id
 */
router.post('/bulk-sync', ShipmentController.bulkSyncShipments);

/**
 * POST /api/admin/shipments/bulk-pickup
 * Create bulk pickup request for multiple shipments
 * Body: { shipment_ids: ['uuid1', 'uuid2'], pickup_date: 'YYYY-MM-DD', pickup_location: 'WAREHOUSE' }
 * ✅ MUST BE BEFORE /:id
 */
router.post('/bulk-pickup', PickupController.createBulkPickup);

// ==================== INDIVIDUAL SHIPMENT OPERATIONS (with :id) ====================
// These use /:id in the path but have additional path segments, so they're safe above generic /:id

/**
 * GET /api/admin/shipments/:id/edit-eligibility
 * Check if shipment can be edited via Delhivery API
 * Returns: { eligible: boolean, reason: string, current_status: string }
 * ✅ MUST BE BEFORE generic /:id
 */
router.get(
  '/:id/edit-eligibility',
  validateShipmentId,
  ShipmentEditController.checkEditEligibility
);

/**
 * GET /api/admin/shipments/:id/edit-history
 * Get edit history for shipment
 * Returns: Array of edit records with timestamp, admin, fields changed
 * ✅ MUST BE BEFORE generic /:id
 */
router.get(
  '/:id/edit-history',
  validateShipmentId,
  ShipmentEditController.getEditHistory
);

/**
 * POST /api/admin/shipments/:id/validate-edit
 * Validate edit data without submitting to Delhivery
 * Body: { name, phone, address, weight, dimensions, etc. }
 * ✅ MUST BE BEFORE generic /:id
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
 * Edit shipment details via Delhivery API (after placement)
 * Body: { name, phone, address, weight, shipment_height, shipment_width, shipment_length, products_desc, admin_notes }
 * ✅ MUST BE BEFORE generic /:id
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

/**
 * GET /api/admin/shipments/:id/label
 * Download shipment label PDF (server-side proxy)
 * Fetches from Delhivery with authentication
 * ✅ MUST BE BEFORE generic /:id
 */
router.get('/:id/label', ShipmentController.downloadLabel);

/**
 * GET /api/admin/shipments/:id/invoice
 * Download shipment invoice PDF (server-side proxy)
 * Fetches from Delhivery with authentication
 * ✅ MUST BE BEFORE generic /:id
 */
router.get('/:id/invoice', ShipmentController.downloadInvoice);

/**
 * POST /api/admin/shipments/:id/recalculate-cost
 * Recalculate shipping cost using Delhivery API
 * Updates estimated_cost and cost_breakdown
 * ✅ MUST BE BEFORE generic /:id
 */
router.post('/:id/recalculate-cost', ShipmentController.recalculateCost);

/**
 * POST /api/admin/shipments/:id/approve-and-place
 * Approve and place shipment with Delhivery
 * - Changes status: pending_review → approved → placed
 * - Generates AWB, label_url, invoice_url
 * - Locks editing (editable = false)
 * - Updates order status to 'confirmed'
 * ✅ MUST BE BEFORE generic /:id
 */
router.post('/:id/approve-and-place', ShipmentController.approveAndPlace);

/**
 * POST /api/admin/shipments/:id/sync
 * Sync shipment tracking with Delhivery
 * Fetches latest tracking status and updates database
 * ✅ MUST BE BEFORE generic /:id
 */
router.post('/:id/sync', ShipmentController.syncShipment);

/**
 * POST /api/admin/shipments/:id/cancel
 * Cancel shipment (both locally and with Delhivery if placed)
 * Body: { reason: 'cancellation reason' }
 * ✅ MUST BE BEFORE generic /:id
 */
router.post('/:id/cancel', ShipmentController.cancelShipment);

// ==================== GENERIC ROUTES (MUST BE LAST) ====================

/**
 * GET /api/admin/shipments/:id
 * Get single shipment details with full order and customer data
 * ⚠️ MUST BE LAST - catches any GET /:id that didn't match above
 */
router.get('/:id', ShipmentController.getShipmentById);

/**
 * PUT /api/admin/shipments/:id
 * Update shipment details (BEFORE placing with Delhivery)
 * Body: { weight_grams, dimensions_cm, shipping_mode, admin_notes }
 * NOTE: For editing AFTER placement, use PUT /:id/edit
 * ⚠️ MUST BE LAST - catches any PUT /:id that didn't match above
 */
router.put('/:id', ShipmentController.updateShipmentDetails);

module.exports = router;