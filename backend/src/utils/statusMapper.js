// backend/src/utils/statusMapper.js

/**
 * Maps Delhivery shipment statuses to internal system statuses
 * 
 * Delhivery sends various status names based on shipment type:
 * - Forward shipments: Manifested → Picked Up → In Transit → Delivered
 * - Return shipments (RTO): RTO Initiated → RTO Delivered
 * - Reverse pickups: Open → Scheduled → Picked Up → DTO
 * 
 * @param {string} delhiveryStatus - Status string from Delhivery API/webhook
 * @returns {string} - Internal system status
 */
function mapDelhiveryStatus(delhiveryStatus) {
  if (!delhiveryStatus) {
    console.warn('⚠️ [Mapper] Empty status received, defaulting to in_transit');
    return 'in_transit';
  }

  const statusMap = {
    // ========================================
    // FORWARD SHIPMENT STATUSES
    // ========================================
    
    // Order Created (Initial)
    'Manifested': 'placed',
    'Booked': 'placed',
    
    // Pickup Phase
    'Not Picked': 'pending_pickup',
    'Pickup Scheduled': 'pending_pickup',
    'Picked Up': 'picked_up',
    
    // Transit Phase
    'In Transit': 'in_transit',
    'Pending': 'in_transit', // Reached destination hub but not dispatched
    
    // Delivery Phase
    'Dispatched': 'out_for_delivery',
    'Out for Delivery': 'out_for_delivery',
    'Delivered': 'delivered',
    
    // ========================================
    // RETURN SHIPMENT STATUSES (RTO)
    // ========================================
    
    'RTO Initiated': 'rto_initiated',
    'RTO': 'rto_delivered',
    'RTO Delivered': 'rto_delivered',
    'Undelivered': 'failed',
    
    // ========================================
    // REVERSE PICKUP STATUSES
    // ========================================
    
    'Open': 'pending_pickup',
    'Scheduled': 'pending_pickup',
    'DTO': 'delivered', // Delivered To Origin
    
    // ========================================
    // CANCELLATION/FAILURE STATUSES
    // ========================================
    
    'Cancelled': 'cancelled',
    'Canceled': 'cancelled',
    'Closed': 'cancelled'
  };

  // Get mapped status or default to in_transit for unknown statuses
  const mappedStatus = statusMap[delhiveryStatus];
  
  if (!mappedStatus) {
    console.warn(
      `⚠️ [Mapper] Unknown Delhivery status: "${delhiveryStatus}", defaulting to "in_transit"`,
      '\nPlease add this status to statusMapper.js if it\'s a valid Delhivery status'
    );
    return 'in_transit';
  }

  // Log successful mapping (only in verbose mode)
  if (process.env.LOG_STATUS_MAPPING === 'true') {
    console.log(`🔄 [Mapper] ${delhiveryStatus} → ${mappedStatus}`);
  }

  return mappedStatus;
}

/**
 * Get human-readable status display info
 * 
 * @param {string} internalStatus - Internal system status
 * @returns {object} - Display information with label, description, icon, color
 */
function getStatusDisplay(internalStatus) {
  const displays = {
    pending_review: {
      label: 'Under Review',
      description: 'Your order is being reviewed by our team',
      icon: '⏳',
      color: 'yellow',
      progress: 10
    },
    approved: {
      label: 'Approved',
      description: 'Order approved, placing with courier...',
      icon: '✅',
      color: 'blue',
      progress: 20
    },
    placed: {
      label: 'Order Confirmed',
      description: 'Shipment created with courier, waiting for pickup',
      icon: '📋',
      color: 'blue',
      progress: 30
    },
    pending_pickup: {
      label: 'Pickup Scheduled',
      description: 'Courier will pick up your order soon',
      icon: '📅',
      color: 'blue',
      progress: 40
    },
    picked_up: {
      label: 'Picked Up',
      description: 'Package picked up by courier',
      icon: '📦',
      color: 'green',
      progress: 50
    },
    in_transit: {
      label: 'In Transit',
      description: 'Your package is on the way',
      icon: '🚚',
      color: 'green',
      progress: 70
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      description: 'Package is out for delivery today',
      icon: '🚴',
      color: 'green',
      progress: 90
    },
    delivered: {
      label: 'Delivered',
      description: 'Package delivered successfully',
      icon: '✅',
      color: 'green',
      progress: 100
    },
    rto_initiated: {
      label: 'Return Initiated',
      description: 'Package is being returned to origin',
      icon: '↩️',
      color: 'orange',
      progress: 60
    },
    rto_delivered: {
      label: 'Returned',
      description: 'Package returned to warehouse',
      icon: '📦',
      color: 'orange',
      progress: 100
    },
    failed: {
      label: 'Delivery Failed',
      description: 'Delivery attempt unsuccessful',
      icon: '❌',
      color: 'red',
      progress: 80
    },
    cancelled: {
      label: 'Cancelled',
      description: 'Shipment has been cancelled',
      icon: '🚫',
      color: 'gray',
      progress: 0
    }
  };

  return displays[internalStatus] || {
    label: 'Processing',
    description: 'Order is being processed',
    icon: '⏳',
    color: 'gray',
    progress: 50
  };
}

/**
 * Check if a status is terminal (final state, no more updates expected)
 * 
 * @param {string} status - Internal system status
 * @returns {boolean}
 */
function isTerminalStatus(status) {
  const terminalStatuses = ['delivered', 'cancelled', 'rto_delivered'];
  return terminalStatuses.includes(status);
}

/**
 * Get all valid internal statuses
 * Useful for database constraints and validation
 * 
 * @returns {string[]}
 */
function getValidStatuses() {
  return [
    'pending_review',
    'approved',
    'placed',
    'pending_pickup',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'rto_initiated',
    'rto_delivered',
    'failed',
    'cancelled'
  ];
}

module.exports = {
  mapDelhiveryStatus,
  getStatusDisplay,
  isTerminalStatus,
  getValidStatuses
};