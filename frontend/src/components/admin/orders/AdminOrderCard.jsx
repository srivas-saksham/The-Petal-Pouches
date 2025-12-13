// frontend/src/components/admin/orders/AdminOrderCard.jsx - ENHANCED VERSION
/**
 * Enhanced Admin Order Card with Complete Details
 * Layout: 30% Image | 40% Details | 30% Actions & Summary
 * Matches customer order card design with admin-specific information
 */

import { 
  Eye, User, Package, MapPin, Calendar, CreditCard, Truck, ChevronRight,
  Clock, CheckCircle, XCircle, Phone, Tag, Gift, FileText, DollarSign,
  AlertCircle, TrendingUp, Hash, Mail
} from 'lucide-react';

export default function AdminOrderCard({ order, onViewOrder, onStatusUpdate }) {
  
  // ==================== UTILITY FUNCTIONS ====================
  
  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const orderDate = new Date(dateStr);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200',
        text: 'text-yellow-700', 
        label: 'Pending',
        icon: Clock
      },
      confirmed: { 
        bg: 'bg-blue-50',
        border: 'border-blue-200', 
        text: 'text-blue-700', 
        label: 'Confirmed',
        icon: CheckCircle
      },
      processing: { 
        bg: 'bg-purple-50',
        border: 'border-purple-200', 
        text: 'text-purple-700', 
        label: 'Processing',
        icon: Package
      },
      shipped: { 
        bg: 'bg-indigo-50',
        border: 'border-indigo-200', 
        text: 'text-indigo-700', 
        label: 'Shipped',
        icon: Truck
      },
      delivered: { 
        bg: 'bg-green-50',
        border: 'border-green-200', 
        text: 'text-green-700', 
        label: 'Delivered',
        icon: CheckCircle
      },
      cancelled: { 
        bg: 'bg-red-50',
        border: 'border-red-200', 
        text: 'text-red-600', 
        label: 'Cancelled',
        icon: XCircle
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityIndicator = () => {
    // 🔴 HIGH PRIORITY: Express + Unpaid + Recent
    if (order.delivery_metadata?.mode === 'express' && 
        order.payment_status === 'unpaid' && 
        order.status === 'pending') {
      return { color: 'bg-red-500', label: 'High Priority', show: true };
    }
    
    // 🟡 MEDIUM: High value + Unpaid
    if (order.final_total > 5000 && order.payment_status === 'unpaid') {
      return { color: 'bg-orange-500', label: 'High Value', show: true };
    }
    
    // 🟢 NORMAL
    return { color: 'bg-green-500', label: 'Normal', show: false };
  };

  // ==================== PARSE DATA ====================
  
  const parseShippingAddress = () => {
    if (!order.shipping_address) return null;
    if (typeof order.shipping_address === 'object') return order.shipping_address;
    if (typeof order.shipping_address === 'string') {
      try {
        return JSON.parse(order.shipping_address);
      } catch (error) {
        console.error('Failed to parse shipping_address:', error);
        return null;
      }
    }
    return null;
  };

  const getEstimatedDelivery = () => {
    if (order.delivery_metadata?.expected_delivery_date) {
      return formatDateShort(order.delivery_metadata.expected_delivery_date);
    }
    if (order.delivery_metadata?.estimated_days) {
      const orderDate = new Date(order.created_at);
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(orderDate.getDate() + order.delivery_metadata.estimated_days);
      return formatDateShort(estimatedDate);
    }
    return 'TBD';
  };

  // ==================== COMPONENT DATA ====================
  
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const orderId = order.id?.substring(0, 8).toUpperCase() || '#N/A';
  const shippingAddress = parseShippingAddress();
  const firstItem = order.items_preview?.[0];
  const itemCount = order.items_preview?.length || order.item_count || 0;
  const deliveryMode = order.delivery_metadata?.mode || 'surface';
  const priority = getPriorityIndicator();

  // Format address for display
  const getFullAddress = () => {
    if (!shippingAddress) return 'Address not available';
    const parts = [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.landmark ? `Near: ${shippingAddress.landmark}` : null,
      `${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip_code}`
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Special handling flags
  const hasSpecialHandling = order.gift_wrap || order.gift_message || order.notes || deliveryMode === 'express';

  // ==================== RENDER ====================

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 hover:border-tpppink/30 hover:shadow-md transition-all overflow-hidden group">
      <div className="flex gap-0 min-h-[200px]">
        
        {/* ==================== LEFT SIDEBAR: IMAGE + DELIVERY INFO ==================== */}
        <div className="w-64 flex-shrink-0 flex flex-col">
          {/* Image - 1:1 Ratio */}
          <div className="w-64 h-64 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0">
            {firstItem?.bundle_img ? (
              <>
                <img
                  src={firstItem.bundle_img}
                  alt={firstItem.bundle_title || 'Order'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Badge (Top Left) */}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1 shadow-lg`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>

                {/* Priority Indicator (Below Status if needed) */}
                {priority.show && !['cancelled', 'delivered'].includes(order.status) && (
                  <div className={`absolute top-11 left-2 ${priority.color} text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1`}>
                    <AlertCircle className="w-3 h-3" />
                    {priority.label}
                  </div>
                )}
                
                {/* Item Count Badge */}
                {itemCount > 1 && (
                  <div className="absolute bottom-2 right-2 bg-tppslate/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </div>
                )}
                
                {/* Express Badge */}
                {order.status !== 'cancelled' && deliveryMode === 'express' && (
                  <div className="absolute top-2 right-2 bg-tpppink text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-lg">
                    EXPRESS
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-tppslate/20" />
              </div>
            )}
          </div>

          {/* Delivery Info Below Image */}
          <div className="flex-1 p-3 bg-gradient-to-b from-gray-50 to-white border-t border-tppslate/10">
            <div className="space-y-2">
              {/* Timeline */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-tppslate/70">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <div>
                    <span className="text-tppslate/80">Placed:</span>
                    <span className="ml-1 text-tppslate font-semibold">{formatDate(order.created_at)}</span>
                  </div>
                </div>
                
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex items-center gap-1.5 text-tppslate/70">
                    {order.status === 'cancelled' ? (
                      <>
                        <XCircle className="w-3 h-3 flex-shrink-0 text-red-600" />
                        <div>
                          <span className="text-red-600/80">Cancelled:</span>
                          <span className="ml-1 text-red-600 font-semibold">{formatDate(order.updated_at)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <div>
                          <span className="text-tppslate/80">Updated:</span>
                          <span className="ml-1 text-tppslate font-semibold">{formatDate(order.updated_at)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {order.delivered_at && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    <div>
                      <span className="text-green-600/80">Delivered:</span>
                      <span className="ml-1 font-semibold">{formatDate(order.delivered_at)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expected Delivery Status */}
              {order.status === 'cancelled' ? (
                <div className="flex items-center gap-1.5 text-xs bg-red-50 rounded px-2 py-1.5 border border-red-100">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-red-700 font-semibold">Cancelled</span>
                </div>
              ) : order.status === 'delivered' ? (
                <div className="flex items-center gap-1.5 text-xs bg-green-50 rounded px-2 py-1.5 border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700 font-semibold">
                    Delivered on {formatDateShort(order.delivered_at)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs bg-tppslate/10 rounded px-2 py-1.5">
                  <Truck className="w-3.5 h-3.5 text-tppslate" />
                  <span className="text-tppslate font-semibold">
                    Expected: {getEstimatedDelivery()}
                    {deliveryMode === 'express' && (
                      <span className="text-tpppink ml-1">(Express)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== CENTER: ORDER DETAILS ==================== */}
        <div className="w-72 flex-shrink-0 p-4 flex flex-col justify-between">
          
          {/* Top Section: Order ID & Customer */}
          <div>
            {/* Order Header */}
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-3.5 h-3.5 text-tppslate/80" />
              <h3 className="text-sm font-bold text-tppslate">
                {orderId}
              </h3>
              <span className="text-xs text-tppslate/80">•</span>
              <span className="text-xs text-tppslate/80">
                {getTimeSince(order.created_at)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-3 p-2 bg-tppslate/5 rounded-lg">
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-tppslate/80 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-tppslate truncate">
                      {order.customer_name || 'Guest'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-tppslate/70 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{order.customer_email}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-2 text-xs text-tppslate/70 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="mb-3">
              <div className="text-[10px] text-tppslate/80 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                <Package className="w-3 h-3" />
                Order Contents ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </div>
              <div className="space-y-1">
                {order.items_preview?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white border border-tppslate/10 rounded px-2 py-1">
                    <span className="text-tppslate font-medium flex-1 min-w-0 mr-2 break-words line-clamp-2">
                      {item.bundle_title || 'Bundle Item'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-tppslate/80 text-[11px]">×{item.quantity}</span>
                      <span className="text-tppslate/80 font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
                {itemCount > 3 && (
                  <div className="text-xs text-tppslate/80 text-center py-1">
                    +{itemCount - 3} more items
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Full Shipping Address */}
          <div className="pt-3 border-t border-tppslate/10">
            {shippingAddress && (
              <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-tppslate/80 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-tppslate/80 text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                    {order.status === 'cancelled' ? 'Was Delivering to' : 
                     order.status === 'delivered' ? 'Delivered to' : 'Delivering to'}
                  </p>
                  <p className="text-tppslate font-medium text-[11px] leading-relaxed break-words">
                    {shippingAddress.line1}
                    {shippingAddress.line2 && `, ${shippingAddress.line2}`}
                  </p>
                  {shippingAddress.landmark && (
                    <p className="text-tppslate/70 text-[11px] break-words">Near: {shippingAddress.landmark}</p>
                  )}
                  <p className="text-tppslate/70 text-[11px]">
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip_code}
                  </p>
                  {shippingAddress.phone && (
                    <p className="text-tppslate/70 text-[11px] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Special Handling Indicators */}
            {hasSpecialHandling && (
              <div className="flex flex-wrap gap-1 pt-2 mt-2 border-t border-tppslate/5">
                {order.gift_wrap && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Gift Wrap
                  </span>
                )}
                {order.gift_message && (
                  <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Message
                  </span>
                )}
                {order.notes && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Notes
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================== RIGHT: ACTIONS & SUMMARY ==================== */}
        <div className="w-64 flex-shrink-0 bg-gradient-to-br from-gray-50 to-white border-l-2 border-tppslate/30 border-dashed p-4 flex flex-col justify-between">
          
          {/* Top: Financial Summary */}
          <div className="space-y-2">
            <div className="text-[10px] text-tppslate/80 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Order Summary
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1 text-xs text-tppslate/80">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
              </div>
              
              {order.express_charge > 0 && (
                <div className="flex justify-between text-tpppink">
                  <span>Express Charge:</span>
                  <span className="font-semibold">+{formatCurrency(order.express_charge)}</span>
                </div>
              )}
              
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                </div>
              )}
            </div>
            
            {/* Total */}
            <div className="pt-2 border-t border-tppslate/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-tppslate/80 font-semibold">Final Total</span>
                <span className="text-xl font-bold text-tpppink">
                  {formatCurrency(order.final_total)}
                </span>
              </div>
              
              {/* Payment Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-tppslate/80 uppercase tracking-wide">Payment</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-tppslate/80">Method:</span>
                  <span className="text-tppslate font-semibold">
                    {order.payment_method?.toUpperCase() || 'COD'}
                  </span>
                </div>

                {order.payment_id && (
                  <div className="text-[10px] text-tppslate/80 mt-1">
                    ID: {order.payment_id.substring(0, 16)}...
                  </div>
                )}

                {/* COD Amount Highlight */}
                {order.payment_method === 'cod' && order.payment_status === 'unpaid' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-1">
                    <div className="flex items-center gap-1 text-[11px] text-yellow-700 font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      COD to Collect: {formatCurrency(order.final_total)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profit Indicator (if high value) */}
            {order.final_total > 2000 && (
              <div className="bg-green-50 rounded px-2 py-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[11px] text-green-700 font-semibold">High Value Order</span>
              </div>
            )}
          </div>

          {/* Bottom: Action Buttons */}
          <div className="space-y-1.5 mt-4">
            <button
              onClick={() => onViewOrder(order.id)}
              className="w-full px-3 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Details
            </button>

            {order.status !== 'delivered' && order.status !== 'cancelled' && onStatusUpdate && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onStatusUpdate(order.id, e.target.value);
                    e.target.value = ''; // Reset
                  }
                }}
                value=""
                className="w-full px-3 py-2 border border-tppslate/20 text-xs rounded-lg hover:border-tpppink transition-all cursor-pointer font-semibold text-tppslate bg-white"
              >
                <option value="">Quick Update Status</option>
                {order.status === 'pending' && <option value="confirmed">Confirm Order</option>}
                {(order.status === 'pending' || order.status === 'confirmed') && <option value="processing">Start Processing</option>}
                {order.status !== 'cancelled' && <option value="shipped">Mark as Shipped</option>}
                {order.status === 'shipped' && <option value="delivered">Mark as Delivered</option>}
                {order.status !== 'shipped' && <option value="cancelled">Cancel Order</option>}
              </select>
            )}

            {/* Print Invoice (placeholder) */}
            <button
              onClick={() => console.log('Print invoice:', order.id)}
              className="w-full px-3 py-2 bg-white border border-tppslate/20 text-tppslate text-xs rounded-lg hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}