// backend/src/utils/shipmentEditValidator.js
/**
 * Shipment Edit Validator
 * Validates edit eligibility based on Delhivery rules
 */

class ShipmentEditValidator {
  
  /**
   * Check if shipment status allows editing
   * @param {string} status - Current shipment status
   * @param {string} paymentMode - Payment mode (COD/Prepaid/Pickup/REPL)
   * @returns {Object} { allowed, reason }
   */
  static isStatusEditable(status, paymentMode) {
    const editableStatuses = {
      'COD': ['placed', 'pending_pickup', 'picked_up'], // Manifested, In Transit, Pending
      'Prepaid': ['placed', 'pending_pickup', 'picked_up'],
      'Pickup': ['pending_pickup'], // RVP: Scheduled only
      'REPL': ['placed', 'pending_pickup', 'picked_up']
    };

    const mode = this._normalizePaymentMode(paymentMode);
    const allowedStatuses = editableStatuses[mode] || [];

    if (!allowedStatuses.includes(status)) {
      return {
        allowed: false,
        reason: `Editing not allowed for status '${status}' with payment mode '${mode}'. Allowed statuses: ${allowedStatuses.join(', ')}`
      };
    }

    // Check terminal statuses
    const terminalStatuses = ['delivered', 'failed', 'rto_delivered', 'cancelled'];
    if (terminalStatuses.includes(status)) {
      return {
        allowed: false,
        reason: `Shipment is in terminal status '${status}' and cannot be edited`
      };
    }

    return { allowed: true, reason: null };
  }

  /**
   * Validate payment mode conversion
   * @param {string} currentMode - Current payment mode
   * @param {string} newMode - New payment mode
   * @param {number} codAmount - COD amount (if converting to COD)
   * @returns {Object} { valid, reason }
   */
  static validatePaymentModeChange(currentMode, newMode, codAmount = 0) {
    const current = this._normalizePaymentMode(currentMode);
    const target = this._normalizePaymentMode(newMode);

    // No change
    if (current === target) {
      return {
        valid: false,
        reason: 'Payment mode is already set to this value'
      };
    }

    // Allowed conversions
    const allowedConversions = {
      'COD': ['Prepaid'], // COD → Prepaid allowed
      'Prepaid': ['COD'], // Prepaid → COD allowed (with COD amount)
      'Pickup': [], // Pickup cannot be changed
      'REPL': [] // REPL cannot be changed
    };

    const allowed = allowedConversions[current] || [];
    
    if (!allowed.includes(target)) {
      return {
        valid: false,
        reason: `Payment mode conversion from '${current}' to '${target}' is not allowed by Delhivery`
      };
    }

    // If converting to COD, amount is mandatory
    if (target === 'COD' && (!codAmount || codAmount <= 0)) {
      return {
        valid: false,
        reason: 'COD amount must be provided when converting to COD'
      };
    }

    return { valid: true, reason: null };
  }

  /**
   * Validate editable fields
   * @param {Object} updateData - Fields to update
   * @returns {Object} { valid, errors }
   */
  static validateEditFields(updateData) {
    const errors = [];
    const editableFields = [
      'name', 'phone', 'add', 'products_desc',
      'weight', 'shipment_height', 'shipment_width', 'shipment_length',
      'pt', 'cod_amount', 'admin_notes'
    ];

    // Check for non-editable fields
    const attemptedFields = Object.keys(updateData);
    const invalidFields = attemptedFields.filter(f => !editableFields.includes(f));
    
    if (invalidFields.length > 0) {
      errors.push(`These fields cannot be edited: ${invalidFields.join(', ')}`);
    }

    // Validate field constraints
    if (updateData.name && updateData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (updateData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(String(updateData.phone).replace(/\D/g, ''))) {
        errors.push('Phone must be a valid 10-digit number');
      }
    }

    if (updateData.weight) {
      const weight = parseFloat(updateData.weight);
      if (isNaN(weight) || weight <= 0) {
        errors.push('Weight must be a positive number');
      }
      if (weight > 50000) { // 50kg max
        errors.push('Weight cannot exceed 50kg (50000g)');
      }
    }

    if (updateData.shipment_height || updateData.shipment_width || updateData.shipment_length) {
      ['shipment_height', 'shipment_width', 'shipment_length'].forEach(field => {
        if (updateData[field]) {
          const value = parseFloat(updateData[field]);
          if (isNaN(value) || value <= 0) {
            errors.push(`${field} must be a positive number`);
          }
          if (value > 200) { // 200cm max per dimension
            errors.push(`${field} cannot exceed 200cm`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalize payment mode to Delhivery format
   * @private
   */
  static _normalizePaymentMode(mode) {
    const normalized = String(mode).toUpperCase();
    
    const modeMap = {
      'COD': 'COD',
      'PREPAID': 'Prepaid',
      'PRE-PAID': 'Prepaid',
      'PICKUP': 'Pickup',
      'REPL': 'REPL'
    };

    return modeMap[normalized] || normalized;
  }

  /**
   * Get user-friendly edit restrictions message
   * @param {string} status - Current status
   * @param {string} paymentMode - Payment mode
   * @returns {string} Message
   */
  static getEditRestrictionsMessage(status, paymentMode) {
    const eligibility = this.isStatusEditable(status, paymentMode);
    
    if (!eligibility.allowed) {
      return eligibility.reason;
    }

    return `You can edit customer details, package dimensions, and weight. Payment mode can be converted between COD and Prepaid. Pickup details cannot be changed here.`;
  }
}

module.exports = ShipmentEditValidator;