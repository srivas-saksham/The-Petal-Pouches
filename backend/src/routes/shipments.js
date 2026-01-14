// backend/src/routes/shipments.js
// ⭐ SERVERLESS-READY + SECURITY-HARDENED

const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/adminAuth'); // ⭐ ADD THIS
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

// ⭐ CRITICAL: Apply authentication to all routes
router.use(verifyAdminToken);

// All route handlers remain unchanged...
router.get('/stats', ShipmentController.getShipmentStats);
router.get('/pending', ShipmentController.getPendingReviewShipments);
router.get('/eligible-for-pickup', PickupController.getEligibleShipments);
router.get('/', ShipmentController.getAllShipments);
router.post('/bulk-approve', ShipmentController.bulkApproveAndPlace);
router.post('/bulk-sync', ShipmentController.bulkSyncShipments);
router.post('/bulk-pickup', PickupController.createBulkPickup);
router.get('/:id/edit-eligibility', validateShipmentId, ShipmentEditController.checkEditEligibility);
router.get('/:id/edit-history', validateShipmentId, ShipmentEditController.getEditHistory);
router.post('/:id/validate-edit', validateShipmentId, validateEditRequest, sanitizeEditData, ShipmentEditController.validateEdit);
router.put('/:id/edit', validateShipmentId, rateLimitEdits, validateEditRequest, sanitizeEditData, logEditAttempt, ShipmentEditController.editShipment);
router.get('/:id/label', ShipmentController.downloadLabel);
router.get('/:id/invoice', ShipmentController.downloadInvoice);
router.post('/:id/recalculate-cost', ShipmentController.recalculateCost);
router.post('/:id/approve-and-place', ShipmentController.approveAndPlace);
router.post('/:id/sync', ShipmentController.syncShipment);
router.post('/:id/cancel', ShipmentController.cancelShipment);
router.get('/:id', ShipmentController.getShipmentById);
router.put('/:id', ShipmentController.updateShipmentDetails);

module.exports = router;