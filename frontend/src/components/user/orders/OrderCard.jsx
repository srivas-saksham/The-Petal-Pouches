// frontend/src/components/user/orders/OrderCard.jsx - COMPLETE FIX

import { Eye, Truck, Package, Clock, CheckCircle, XCircle, RotateCcw, X, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Complete order card with all details properly displayed
 * Layout: 30% Image | 40% Details | 30% Actions
 */
const OrderCard = ({ order, onReorder, onCancel }) => {
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
        bg: 'bg-tpppink/10',
        border: 'border-tpppink/30', 
        text: 'text-tpppink', 
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getEstimatedDelivery = () => {
    // Use delivery_metadata.expected_delivery_date
    if (order.delivery_metadata?.expected_delivery_date) {
      return formatDate(order.delivery_metadata.expected_delivery_date);
    }
    
    // Fallback: calculate based on estimated_days
    if (order.delivery_metadata?.estimated_days) {
      const orderDate = new Date(order.created_at);
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(orderDate.getDate() + order.delivery_metadata.estimated_days);
      return formatDate(estimatedDate);
    }
    
    // Default fallback
    return 'Within 7 days';
  };

  const getDeliveryMode = () => {
    if (order.delivery_metadata?.mode === 'express') {
      return 'Express Delivery';
    }
    return 'Standard Delivery';
  };

  // Parse shipping_address (JSONB)
  const parseShippingAddress = () => {
    if (!order.shipping_address) {
      return null;
    }

    // If it's already an object, return it
    if (typeof order.shipping_address === 'object') {
      return order.shipping_address;
    }

    // If it's a string, try to parse it
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

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const orderId = order.id?.substring(0, 8).toUpperCase() || '#N/A';
  
  // ✅ FIXED: Get item count from items array OR items_preview
  const itemCount = order.items?.length || order.items_preview?.length || order.item_count || 0;
  
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canTrack = ['processing', 'shipped'].includes(order.status);
  
  // Get first item for display (check both items and items_preview)
  const firstItem = order.items_preview?.[0] || order.items?.[0];
  
  // Parse shipping_address properly
  const shippingAddress = parseShippingAddress();
  
  const deliverTo = shippingAddress?.line1 || 'Address not available';
  const cityState = shippingAddress 
    ? `${shippingAddress.city || ''}, ${shippingAddress.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
    : '';

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 hover:border-tpppink/30 hover:shadow-md transition-all overflow-hidden group">
      <div className="grid grid-cols-10 gap-0 min-h-[200px]">
        
        {/* LEFT: Large Image - 30% */}
        <div className="col-span-3 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {firstItem?.bundle_img ? (
            <>
              <img
                src={firstItem.bundle_img}
                alt={firstItem.bundle_title || 'Order'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* ✅ CANCELLED BADGE - Top Left Corner */}
              {order.status === 'cancelled' && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </div>
              )}
              
              {/* Item count badge */}
              {itemCount > 1 && (
                <div className="absolute bottom-2 right-2 bg-tppslate/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  +{itemCount - 1} more
                </div>
              )}
              
              {/* Delivery mode badge - only if not cancelled */}
              {order.status !== 'cancelled' && order.delivery_metadata?.mode === 'express' && (
                <div className="absolute top-2 left-2 bg-tpppink text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-lg">
                  Express
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-tppslate/20" />
            </div>
          )}
        </div>

        {/* CENTER: Order Details - 40% */}
        <div className="col-span-4 p-4 flex flex-col justify-between">
          
          {/* Top Section: Order ID & Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-tppslate">
                Order #{orderId}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>

            {/* Bundle Title */}
            <h4 className="text-base font-bold text-tppslate mb-2 line-clamp-1">
              {firstItem?.bundle_title || 'Order Bundle'}
              {itemCount > 1 && (
                <span className="text-xs text-tppslate/80 font-normal ml-1.5">
                  +{itemCount - 1} more
                </span>
              )}
            </h4>

            {/* Order Meta */}
            <div className="space-y-1 text-xs text-tppslate/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>Ordered on {formatDate(order.created_at)}</span>
              </div>
              <div className={getDeliveryMode() === 'Express Delivery' ? "text-tpppink flex items-center gap-1.5" : "flex items-center gap-1.5"}>
                <Package className="w-3 h-3" />
                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} • {getDeliveryMode()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Delivery Info */}
          <div className="space-y-1.5 mt-3">
            {/* Delivery Address */}
            {shippingAddress && (
              <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3 h-3 text-tppslate/80 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-tppslate/80 text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                    {order.status === 'cancelled'? 'WAS Delivering to' : (order.status === 'delivered' ? 'Delivered to' : 'Delivering to')}
                  </p>
                  <p className="text-tppslate font-semibold line-clamp-1">{deliverTo}</p>
                  {cityState && (
                    <p className="text-tppslate/80 text-[11px] line-clamp-1">{cityState}</p>
                  )}
                </div>
              </div>
            )}

            {/* AWB Tracking Number - Only show when confirmed or later */}
            {order.status !== 'pending' && order.shipment?.awb && (
              <div className="flex items-center gap-1.5 text-xs bg-blue-50 rounded px-2 py-1.5 border border-blue-200">
                <Truck className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-600 text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                    Tracking Number
                  </p>
                  <p className="text-blue-900 font-mono font-bold text-xs">
                    {order.shipment.awb}
                  </p>
                </div>
              </div>
            )}

            {/* Expected Delivery - Show even if AWB not available yet */}
            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-1.5 text-xs bg-red-50 rounded px-2 py-1">
                <XCircle className="w-3 h-3 text-red-600" />
                <span className="text-red-700 font-semibold">
                  Cancelled
                </span>
              </div>
            ) : order.status === 'delivered' ? (
              <div className="flex items-center gap-1.5 text-xs bg-green-50 rounded px-2 py-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-semibold">
                  Delivered {order.delivered_at ? `on ${formatDate(order.delivered_at)}` : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs bg-tppslate/10 rounded px-2 py-1">
                <Truck className="w-3 h-3 text-tppslate" />
                <span className="text-tppslate font-semibold">
                  Expected by {order.shipment?.estimated_delivery ? formatDate(order.shipment.estimated_delivery) : getEstimatedDelivery()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions & Summary - 30% */}
        <div className="col-span-3 bg-gradient-to-br from-gray-50 to-white border-l-2 border-tppslate/30 border-dashed p-4 flex flex-col justify-between">
          
          {/* Top: Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="text-xs text-tppslate/80 w-full">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.express_charge > 0 && (
                  <div className="flex justify-between text-tpppink">
                    <span>Express:</span>
                    <span>+{formatCurrency(order.express_charge)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-2 border-t border-tppslate/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-tppslate/80 font-semibold">Total</span>
                <span className="text-lg font-bold text-tpppink">
                  {formatCurrency(order.final_total)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-tppslate/80 uppercase tracking-wide">Payment</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : order.payment_status === 'refunded'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment_status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              
              <div className="text-[11px] text-tppslate/80 mt-0.5">
                via {order.payment_method?.toUpperCase() || 'COD'}
              </div>
            </div>
          </div>

          {/* Bottom: Action Buttons */}
          <div className="space-y-1.5 mt-3">
            <Link
              to={`/user/orders/${order.id}`}
              className="w-full px-3 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </Link>

            {canTrack && (
              <Link
                to={`/user/orders/${order.id}`}
                className="w-full px-3 py-2 bg-tpppink text-white text-xs rounded-lg hover:bg-tpppink/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                Track Order
              </Link>
            )}

            {order.status === 'delivered' && onReorder && (
              <button
                onClick={() => onReorder(order.id)}
                className="w-full px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg hover:bg-green-100 font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Buy Again
              </button>
            )}

            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-100 font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;