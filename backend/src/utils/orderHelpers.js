// backend/src/utils/orderHelpers.js

/**
 * Order Helper Functions
 * Utilities for order calculations and validations
 */

/**
 * Calculate order totals from cart items
 * @param {Array} cartItems - Array of cart items with prices
 * @returns {Object} Totals breakdown
 */
const calculateOrderTotals = (cartItems, deliveryMode = 'surface', expressCharge = 0) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      tax: 0,  // ✅ NO TAX
      shipping: 0,  // ✅ FREE STANDARD SHIPPING
      express_charge: 0,
      discount: 0,
      total: 0,
      item_count: 0,
      total_quantity: 0,
      estimated_weight: 0
    };
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate total quantity
  const total_quantity = cartItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  // ✅ NO BASE SHIPPING COST - Always free
  const shipping = 0;

  // ✅ NO TAX - As per your requirement
  const tax = 0;

  // ✅ Express charge only if express mode selected
  const express_charge = deliveryMode === 'express' ? expressCharge : 0;

  // Discount (applied via coupons)
  const discount = 0;

  // ✅ CORRECT TOTAL: subtotal + express_charge only
  const total = subtotal + express_charge - discount;

  // Estimate total weight
  const estimated_weight = cartItems.reduce((sum, item) => {
    const itemWeight = item.weight || 200;
    return sum + (itemWeight * item.quantity);
  }, 0);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: 0,  // ✅ Always 0
    shipping: 0,  // ✅ Always 0 (free standard)
    express_charge: parseFloat(express_charge.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    item_count: cartItems.length,
    total_quantity,
    estimated_weight
  };
};

/**
 * Validate order data before creation
 * @param {Object} orderData - Order data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateOrderData = (orderData) => {
  const errors = [];

  // Check required fields
  if (!orderData.user_id) {
    errors.push('User ID is required');
  }

  if (!orderData.shipping_address) {
    errors.push('Shipping address is required');
  } else {
    // Validate address fields
    const addr = orderData.shipping_address;
    if (!addr.line1) errors.push('Address line 1 is required');
    if (!addr.city) errors.push('City is required');
    if (!addr.state) errors.push('State is required');
    if (!addr.zip_code) errors.push('ZIP code is required');
    if (!addr.phone) errors.push('Phone number is required');
  }

  // Validate amounts
  if (orderData.subtotal <= 0) {
    errors.push('Subtotal must be greater than 0');
  }

  if (orderData.final_total <= 0) {
    errors.push('Final total must be greater than 0');
  }

  // Validate payment method
  const validPaymentMethods = ['cod', 'online', 'razorpay', 'stripe'];
  if (!validPaymentMethods.includes(orderData.payment_method)) {
    errors.push('Invalid payment method');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format order for API response
 * @param {Object} order - Raw order from database
 * @returns {Object} Formatted order
 */
const formatOrderResponse = (order) => {
  return {
    id: order.id,
    order_number: order.order_number || order.id.substring(0, 8).toUpperCase(),
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    
    // Amounts
    subtotal: order.subtotal,
    tax: order.tax,
    shipping_cost: order.shipping_cost,
    discount: order.discount,
    final_total: order.final_total,
    
    // Address
    shipping_address: order.shipping_address,
    
    // Items (if included)
    items: order.items || [],
    items_preview: order.items_preview || [],
    
    // Timestamps
    created_at: order.created_at,
    confirmed_at: order.confirmed_at,
    shipped_at: order.shipped_at,
    delivered_at: order.delivered_at,
    cancelled_at: order.cancelled_at,
    
    // Additional info
    notes: order.notes,
    gift_wrap: order.gift_wrap,
    gift_message: order.gift_message,
    cancellation_reason: order.cancellation_reason
  };
};

/**
 * Determine if order can be cancelled
 * @param {string} status - Order status
 * @returns {boolean} Can cancel
 */
const canCancelOrder = (status) => {
  return ['pending', 'confirmed'].includes(status);
};

/**
 * Get status display info
 * @param {string} status - Order status
 * @returns {Object} Display info with label and color
 */
const getStatusDisplay = (status) => {
  const statusMap = {
    pending: { label: 'Pending', color: 'yellow', icon: 'Clock' },
    confirmed: { label: 'Confirmed', color: 'blue', icon: 'CheckCircle' },
    processing: { label: 'Processing', color: 'purple', icon: 'Package' },
    shipped: { label: 'Shipped', color: 'indigo', icon: 'Truck' },
    delivered: { label: 'Delivered', color: 'green', icon: 'CheckCircle' },
    cancelled: { label: 'Cancelled', color: 'red', icon: 'XCircle' }
  };

  return statusMap[status] || { label: status, color: 'gray', icon: 'Circle' };
};

/**
 * Generate order number from order ID
 * @param {string} orderId - UUID
 * @returns {string} Human-readable order number
 */
const generateOrderNumber = (orderId) => {
  // Take first 8 chars of UUID and convert to uppercase
  return `ORD-${orderId.substring(0, 8).toUpperCase()}`;
};

module.exports = {
  calculateOrderTotals,
  validateOrderData,
  formatOrderResponse,
  canCancelOrder,
  getStatusDisplay,
  generateOrderNumber
};