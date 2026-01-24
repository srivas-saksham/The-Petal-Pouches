import { Eye, Truck, Package, Clock, CheckCircle, XCircle, RotateCcw, X, MapPin, Calendar } from 'lucide-react';

/**
 * Complete order card with all details properly displayed
 * Mobile: Vertical stacking | Desktop: 30% Image | 40% Details | 30% Actions
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
      in_transit: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        label: 'In Transit',
        icon: Truck
      },
      out_for_delivery: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        label: 'Out for Delivery',
        icon: Truck
      },
      failed: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        label: 'Delivery Failed',
        icon: XCircle
      },
      rto_initiated: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        label: 'Return Initiated',
        icon: RotateCcw
      },
      rto_delivered: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        label: 'Returned',
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
    if (order.shipment?.estimated_delivery) {
      return formatDateShort(order.shipment.estimated_delivery);
    }
    if (order.delivery_metadata?.expected_delivery_date) {
      return formatDateShort(order.delivery_metadata.expected_delivery_date);
    }
    if (order.delivery_metadata?.estimated_days) {
      const orderDate = new Date(order.created_at);
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(orderDate.getDate() + order.delivery_metadata.estimated_days);
      return formatDateShort(estimatedDate);
    }
    return 'Within 7 days';
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

  const getDeliveryMode = () => {
    if (order.delivery_metadata?.mode === 'express') {
      return 'Express Delivery';
    }
    return 'Standard Delivery';
  };

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

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const orderId = order.id?.substring(0, 8).toUpperCase() || '#N/A';
  const itemCount = order.items?.length || order.items_preview?.length || order.item_count || 0;
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canTrack = ['processing', 'in_transit', 'out_for_delivery', 'shipped'].includes(order.status);
  const firstItem = order.items_preview?.[0] || order.items?.[0];
  const shippingAddress = parseShippingAddress();
  const deliverTo = shippingAddress?.line1 || 'Address not available';
  const cityState = shippingAddress 
    ? `${shippingAddress.city || ''}, ${shippingAddress.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
    : '';

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 hover:border-tpppink/30 hover:shadow-md transition-all overflow-hidden group">
      
      {/* MOBILE LAYOUT - Vertical Stacking */}
      <div className="md:hidden">
        {/* Image Section */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
          {firstItem?.bundle_img ? (
            <>
              <img
                src={firstItem.bundle_img}
                alt={firstItem.bundle_title || 'Order'}
                className="w-full h-full object-cover"
              />
              
              {/* Cancelled Badge */}
              {order.status === 'cancelled' && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Cancelled
                </div>
              )}
              
              {/* Item count badge */}
              {itemCount > 1 && (
                <div className="absolute bottom-2 right-2 bg-tppslate/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                  +{itemCount - 1} more
                </div>
              )}
              
              {/* Express badge */}
              {order.status !== 'cancelled' && order.delivery_metadata?.mode === 'express' && (
                <div className="absolute top-2 right-2 bg-tpppink text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-lg">
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

        {/* Content Section */}
        <div className="p-3 space-y-2.5">
          {/* Order Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-tppslate/80">Order #{orderId}</h3>
              <h4 className="text-sm font-bold text-tppslate line-clamp-1 mt-0.5">
                {firstItem?.bundle_title || 'Order Bundle'}
                {itemCount > 1 && (
                  <span className="text-xs text-tppslate/60 font-normal ml-1">
                    +{itemCount - 1}
                  </span>
                )}
              </h4>
            </div>
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text} whitespace-nowrap`}>
              <StatusIcon className="w-2.5 h-2.5" />
              {statusConfig.label}
            </span>
          </div>

          {/* Order Meta */}
          <div className="space-y-1 text-[11px] text-tppslate/70">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Ordered {formatDate(order.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 flex-shrink-0" />
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} • {getDeliveryMode()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          {shippingAddress && (
            <div className="flex items-start gap-1 text-[11px] bg-tppslate/5 rounded-lg p-2">
              <MapPin className="w-3 h-3 text-tppslate/60 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-tppslate/60 text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                  {order.status === 'cancelled' ? 'Was Delivering to' : (order.status === 'delivered' ? 'Delivered to' : 'Delivering to')}
                </p>
                <p className="text-tppslate font-semibold line-clamp-1">{deliverTo}</p>
                {cityState && <p className="text-tppslate/70 line-clamp-1">{cityState}</p>}
              </div>
            </div>
          )}

          {/* AWB Tracking */}
          {order.status !== 'pending' && order.shipment?.awb && (
            <div className="flex items-center gap-1 text-[11px] bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-200">
              <Truck className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-[10px] uppercase tracking-wide font-semibold">Tracking #</p>
                <p className="text-blue-900 font-mono font-bold text-xs truncate">{order.shipment.awb}</p>
              </div>
            </div>
          )}

          {/* Delivery Status */}
          {order.status === 'cancelled' ? (
            <div className="flex items-center gap-1 text-[11px] bg-red-50 rounded-lg px-2 py-1">
              <XCircle className="w-3 h-3 text-red-600" />
              <span className="text-red-700 font-semibold">Cancelled</span>
            </div>
          ) : order.status === 'delivered' ? (
            <div className="flex items-center gap-1 text-[11px] bg-green-50 rounded-lg px-2 py-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-700 font-semibold">
                Delivered {order.delivered_at ? `on ${formatDate(order.delivered_at)}` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] bg-tppslate/10 rounded-lg px-2 py-1">
              <Truck className="w-3 h-3 text-tppslate" />
              <span className="text-tppslate font-semibold">Expected by {getEstimatedDelivery()}</span>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-tppslate/20 rounded-lg p-2 space-y-1">
            <div className="flex justify-between text-[11px] text-tppslate/70">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.express_charge > 0 && (
              <div className="flex justify-between text-[11px] text-tpppink">
                <span>Express:</span>
                <span>+{formatCurrency(order.express_charge)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-[11px] text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-tppslate/10">
              <span className="text-xs text-tppslate/70 font-semibold">Total</span>
              <span className="text-base font-bold text-tpppink">{formatCurrency(order.final_total)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-tppslate/60 uppercase tracking-wide">Payment</span>
              <div className="flex items-center gap-1">
                <span className={`font-bold px-1.5 py-0.5 rounded-full ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                  order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment_status?.toUpperCase() || 'PENDING'}
                </span>
                <span className="text-tppslate/60">via {order.payment_method?.toUpperCase() || 'COD'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <a
              href={`/user/orders/${order.id}`}
              className="px-2 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <Eye className="w-3 h-3" />
              Details
            </a>

            {canTrack && (
              <a
                href={`/user/orders/${order.id}`}
                className="px-2 py-2 bg-tpppink text-white text-xs rounded-lg hover:bg-tpppink/90 font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Truck className="w-3 h-3" />
                Track
              </a>
            )}

            {order.status === 'delivered' && onReorder && (
              <button
                onClick={() => onReorder(order.id)}
                className="px-2 py-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg hover:bg-green-100 font-bold transition-all flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Buy Again
              </button>
            )}

            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="px-2 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-100 font-bold transition-all flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT - Original 3-Column (UNCHANGED) */}
      <div className="hidden md:grid grid-cols-10 gap-0 min-h-[200px]">
        {/* LEFT: Large Image - 30% */}
        <div className="col-span-3 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {firstItem?.bundle_img ? (
            <>
              <img
                src={firstItem.bundle_img}
                alt={firstItem.bundle_title || 'Order'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {order.status === 'cancelled' && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </div>
              )}
              
              {itemCount > 1 && (
                <div className="absolute bottom-2 right-2 bg-tppslate/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  +{itemCount - 1} more
                </div>
              )}
              
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-tppslate">Order #{orderId}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>

            <h4 className="text-base font-bold text-tppslate mb-2 line-clamp-1">
              {firstItem?.bundle_title || 'Order Bundle'}
              {itemCount > 1 && (
                <span className="text-xs text-tppslate/80 font-normal ml-1.5">
                  +{itemCount - 1} more
                </span>
              )}
            </h4>

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

          <div className="space-y-1.5 mt-3">
            {shippingAddress && (
              <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3 h-3 text-tppslate/80 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-tppslate/80 text-[10px] uppercase tracking-wide font-semibold mb-0.5">
                    {order.status === 'cancelled'? 'WAS Delivering to' : (order.status === 'delivered' ? 'Delivered to' : 'Delivering to')}
                  </p>
                  <p className="text-tppslate font-semibold line-clamp-1">{deliverTo}</p>
                  {cityState && <p className="text-tppslate/80 text-[11px] line-clamp-1">{cityState}</p>}
                </div>
              </div>
            )}

            {order.status !== 'pending' && order.shipment?.awb && (
              <div className="flex items-center gap-1.5 text-xs bg-blue-50 rounded px-2 py-1.5 border border-blue-200">
                <Truck className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-600 text-[10px] uppercase tracking-wide font-semibold mb-0.5">Tracking Number</p>
                  <p className="text-blue-900 font-mono font-bold text-xs">{order.shipment.awb}</p>
                </div>
              </div>
            )}

            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-1.5 text-xs bg-red-50 rounded px-2 py-1">
                <XCircle className="w-3 h-3 text-red-600" />
                <span className="text-red-700 font-semibold">Cancelled</span>
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
                <span className="text-tppslate font-semibold">Expected by {getEstimatedDelivery()}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions & Summary - 30% */}
        <div className="col-span-3 bg-gradient-to-br from-gray-50 to-white border-l-2 border-tppslate/30 border-dashed p-4 flex flex-col justify-between">
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
                <span className="text-lg font-bold text-tpppink">{formatCurrency(order.final_total)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-tppslate/80 uppercase tracking-wide">Payment</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                  order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment_status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              
              <div className="text-[11px] text-tppslate/80 mt-0.5">
                via {order.payment_method?.toUpperCase() || 'COD'}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-3">
            <a
              href={`/user/orders/${order.id}`}
              className="w-full px-3 py-2 bg-tppslate text-white text-xs rounded-lg hover:bg-tppslate/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </a>

            {canTrack && (
              <a
                href={`/user/orders/${order.id}`}
                className="w-full px-3 py-2 bg-tpppink text-white text-xs rounded-lg hover:bg-tpppink/90 font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                Track Order
              </a>
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