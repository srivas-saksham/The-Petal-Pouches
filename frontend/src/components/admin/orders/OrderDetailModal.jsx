// frontend/src/components/admin/orders/OrderDetailModal.jsx - PROFESSIONAL REDESIGN
/**
 * Enhanced Order Detail Modal with Modern, Clean Design
 * Professional layout with clear information hierarchy
 */

import { 
  X, User, MapPin, Package, CreditCard, Calendar, Truck, 
  Clock, CheckCircle, XCircle, Phone, Mail, Hash, FileText,
  DollarSign, Tag, Gift, AlertCircle, TrendingUp, Info
} from 'lucide-react';
import { useEffect, useState } from 'react';
import adminApi from '../../../services/adminApi';

export default function OrderDetailModal({ order: initialOrder, isOpen, onClose, onStatusUpdate }) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialOrder?.id) {
      fetchOrderDetails();
    }
  }, [isOpen, initialOrder?.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get(`/api/admin/orders/${initialOrder.id}`);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200',
        icon: Clock
      },
      confirmed: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: CheckCircle
      },
      processing: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-700', 
        border: 'border-purple-200',
        icon: Package
      },
      shipped: { 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-700', 
        border: 'border-indigo-200',
        icon: Truck
      },
      delivered: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: CheckCircle
      },
      cancelled: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        border: 'border-red-200',
        icon: XCircle
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      unpaid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      refunded: 'bg-blue-100 text-blue-700 border-blue-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Parse shipping address
  const shippingAddress = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address;

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const orderId = order.id?.substring(0, 8).toUpperCase() || '#N/A';
  const deliveryMode = order.delivery_metadata?.mode || 'surface';

  // ==================== RENDER ====================

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ==================== HEADER ==================== */}
        <div className="bg-gradient-to-r from-tppslate via-tppslate/90 to-tpppink p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Order Details</h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-mono font-bold">{orderId}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex items-center gap-1.5`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {order.status?.toUpperCase()}
                </span>
                {deliveryMode === 'express' && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-tpppink/20 text-white border border-white/30">
                    EXPRESS DELIVERY
                  </span>
                )}
              </div>
              <div className="text-sm text-white/80 mt-2">
                Placed on {formatDate(order.created_at)}
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-tppslate/10">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-tppslate/60">Loading order details...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              
              {/* ==================== LEFT COLUMN: CUSTOMER & DELIVERY ==================== */}
              <div className="col-span-1 space-y-4">
                
                {/* Customer Information */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                    <div className="p-2 bg-tppslate/10 rounded-lg">
                      <User className="w-4 h-4 text-tppslate" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Customer</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-tppslate/60 mb-1">Name</div>
                      <div className="text-sm font-bold text-tppslate">{order.customer_name || 'Guest User'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-tppslate/60 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </div>
                      <div className="text-xs text-tppslate break-all">{order.customer_email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-tppslate/60 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone
                      </div>
                      <div className="text-xs font-semibold text-tppslate">{order.customer_phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-tppslate/60 mb-1">User ID</div>
                      <div className="text-xs font-mono text-tppslate/70 truncate">{order.user_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                    <div className="p-2 bg-tppslate/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-tppslate" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">
                      {order.status === 'delivered' ? 'Delivered To' : 'Delivering To'}
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs text-tppslate leading-relaxed">
                    <div className="font-semibold">{shippingAddress?.line1}</div>
                    {shippingAddress?.line2 && (
                      <div className="text-tppslate/80">{shippingAddress.line2}</div>
                    )}
                    {shippingAddress?.landmark && (
                      <div className="text-tppslate/70 italic">Near: {shippingAddress.landmark}</div>
                    )}
                    <div className="font-semibold pt-1">
                      {shippingAddress?.city}, {shippingAddress?.state}
                    </div>
                    <div className="text-tppslate/80">PIN: {shippingAddress?.zip_code}</div>
                    {shippingAddress?.phone && (
                      <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-tppslate/10">
                        <Phone className="w-3 h-3" />
                        <span className="font-semibold">{shippingAddress.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                    <div className="p-2 bg-tppslate/10 rounded-lg">
                      <Truck className="w-4 h-4 text-tppslate" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Delivery</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-tppslate/60">Mode</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        deliveryMode === 'express' 
                          ? 'bg-tpppink/10 text-tpppink' 
                          : 'bg-tppslate/10 text-tppslate'
                      }`}>
                        {deliveryMode?.toUpperCase() || 'SURFACE'}
                      </span>
                    </div>
                    {order.delivery_metadata?.estimated_days && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tppslate/60">Est. Days</span>
                        <span className="text-xs font-semibold text-tppslate">
                          {order.delivery_metadata.estimated_days} days
                        </span>
                      </div>
                    )}
                    {order.delivery_metadata?.expected_delivery_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tppslate/60">Expected</span>
                        <span className="text-xs font-semibold text-tppslate">
                          {formatDateShort(order.delivery_metadata.expected_delivery_date)}
                        </span>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-green-200">
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Delivered On
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          {formatDateShort(order.delivered_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                    <div className="p-2 bg-tppslate/10 rounded-lg">
                      <CreditCard className="w-4 h-4 text-tppslate" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Payment</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-tppslate/60">Method</span>
                      <span className="text-xs font-bold text-tppslate uppercase">
                        {order.payment_method || 'COD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-tppslate/60">Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    {order.payment_id && (
                      <div className="pt-2 mt-2 border-t border-tppslate/10">
                        <div className="text-xs text-tppslate/60 mb-1">Transaction ID</div>
                        <div className="text-xs font-mono text-tppslate break-all">{order.payment_id}</div>
                      </div>
                    )}
                    {order.payment_method === 'cod' && order.payment_status === 'unpaid' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-yellow-700 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Collect: {formatCurrency(order.final_total)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ==================== MIDDLE COLUMN: ORDER ITEMS ==================== */}
              <div className="col-span-1 space-y-4">
                
                {/* Order Items */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-tppslate/10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-tppslate/10 rounded-lg">
                        <Package className="w-4 h-4 text-tppslate" />
                      </div>
                      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Order Items</h3>
                    </div>
                    <span className="text-xs font-bold text-tppslate/60">
                      {order.items_preview?.length || 0} items
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {order.items_preview?.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-tppslate/10 hover:border-tpppink/30 transition-all">
                        <div className="flex gap-3">
                          {item.bundle_img && (
                            <img 
                              src={item.bundle_img} 
                              alt={item.bundle_title} 
                              className="w-16 h-16 object-cover rounded border border-tppslate/10 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-tppslate mb-1 break-words line-clamp-2">
                              {item.bundle_title || 'Bundle Item'}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs text-tppslate/60">
                                Qty: <span className="font-semibold text-tppslate">{item.quantity}</span>
                              </div>
                              <div className="text-xs text-tppslate/60">
                                @ {formatCurrency(item.price)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-tppslate/10">
                              <span className="text-xs text-tppslate/60">Subtotal</span>
                              <span className="text-sm font-bold text-tpppink">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Notes */}
                {(order.gift_wrap || order.gift_message || order.notes) && (
                  <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                      <div className="p-2 bg-tppslate/10 rounded-lg">
                        <FileText className="w-4 h-4 text-tppslate" />
                      </div>
                      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Special Instructions</h3>
                    </div>
                    <div className="space-y-3">
                      {order.gift_wrap && (
                        <div className="flex items-center gap-2 text-xs">
                          <Gift className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 font-semibold">Gift Wrap Requested</span>
                        </div>
                      )}
                      {order.gift_message && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                          <div className="text-xs text-pink-700 font-semibold mb-1">Gift Message:</div>
                          <div className="text-xs text-pink-900 italic">{order.gift_message}</div>
                        </div>
                      )}
                      {order.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-xs text-blue-700 font-semibold mb-1">Order Notes:</div>
                          <div className="text-xs text-blue-900">{order.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ==================== RIGHT COLUMN: SUMMARY & TIMELINE ==================== */}
              <div className="col-span-1 space-y-4">
                
                {/* Order Summary */}
                <div className="bg-white rounded-xl p-5 border-2 border-tpppink/20 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tpppink/20">
                    <div className="p-2 bg-tpppink/10 rounded-lg">
                      <DollarSign className="w-4 h-4 text-tpppink" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Order Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-tppslate/70">Subtotal</span>
                      <span className="text-sm font-semibold text-tppslate">{formatCurrency(order.subtotal)}</span>
                    </div>
                    
                    {order.express_charge > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-tppslate/70 flex items-center gap-1">
                          Express Charge
                          <Truck className="w-3 h-3 text-tpppink" />
                        </span>
                        <span className="text-sm font-semibold text-tpppink">
                          +{formatCurrency(order.express_charge)}
                        </span>
                      </div>
                    )}
                    
                    {order.discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-tppslate/70 flex items-center gap-1">
                          Discount
                          <Tag className="w-3 h-3 text-green-600" />
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          -{formatCurrency(order.discount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 mt-3 border-t-2 border-tpppink/30">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-tppslate">Final Total</span>
                        <span className="text-2xl font-bold text-tpppink">
                          {formatCurrency(order.final_total)}
                        </span>
                      </div>
                    </div>

                    {order.final_total > 2000 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-semibold">High Value Order</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                    <div className="p-2 bg-tppslate/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-tppslate" />
                    </div>
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Order Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-xs text-tppslate/60">Order Placed</div>
                        <div className="text-xs font-semibold text-tppslate">{formatDate(order.created_at)}</div>
                      </div>
                    </div>
                    
                    {order.placed_at && order.placed_at !== order.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-xs text-tppslate/60">Confirmed</div>
                          <div className="text-xs font-semibold text-tppslate">{formatDate(order.placed_at)}</div>
                        </div>
                      </div>
                    )}
                    
                    {order.updated_at && order.updated_at !== order.created_at && (
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full mt-1.5 flex-shrink-0`}></div>
                        <div className="flex-1">
                          <div className={`text-xs ${order.status === 'cancelled' ? 'text-red-600' : 'text-tppslate/60'}`}>
                            {order.status === 'cancelled' ? 'Cancelled' : 'Last Updated'}
                          </div>
                          <div className={`text-xs font-semibold ${order.status === 'cancelled' ? 'text-red-600' : 'text-tppslate'}`}>
                            {formatDate(order.updated_at)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {order.delivered_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-xs text-green-600 font-semibold">Delivered</div>
                          <div className="text-xs font-semibold text-green-700">{formatDate(order.delivered_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Actions */}
                {onStatusUpdate && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="bg-white rounded-xl p-5 border-2 border-tppslate/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-tppslate/10">
                      <div className="p-2 bg-tppslate/10 rounded-lg">
                        <Info className="w-4 h-4 text-tppslate" />
                      </div>
                      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Quick Actions</h3>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onStatusUpdate(order.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-tppslate/20 rounded-lg text-sm font-semibold text-tppslate hover:border-tpppink transition-all cursor-pointer"
                    >
                      <option value="">Update Order Status</option>
                      {order.status === 'pending' && <option value="confirmed">✓ Confirm Order</option>}
                      {(order.status === 'pending' || order.status === 'confirmed') && <option value="processing">📦 Start Processing</option>}
                      {order.status !== 'cancelled' && <option value="shipped">🚚 Mark as Shipped</option>}
                      {order.status === 'shipped' && <option value="delivered">✓ Mark as Delivered</option>}
                      {order.status !== 'shipped' && <option value="cancelled">✕ Cancel Order</option>}
                    </select>
                  </div>
                )}

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold">Order ID:</span> {order.id}
                      <br />
                      <span className="font-semibold">User ID:</span> {order.user_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}