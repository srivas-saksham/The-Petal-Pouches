// frontend/src/components/user/orders/OrderItemsCard.jsx

import { Package, Truck, Calendar, ExternalLink, Download } from 'lucide-react';

/**
 * Order Items Card Component
 * Shows all items with pricing breakdown and shipment tracking
 */
const OrderItemsCard = ({ order, shipment }) => {
  // Add safety check
  if (!order) {
    return (
      <div className="bg-white rounded-2xl border-2 border-tppslate/20 p-6 text-center">
        <p className="text-tppslate/70">Loading order details...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-tppslate/20 overflow-hidden shadow-sm">
      <div className="bg-tppslate px-6 py-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Items ({order.items?.length || 0})
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-tppslate/10 last:border-0">
              {/* Item Image */}
              <div className="w-16 h-16 bg-tppslate/5 rounded-lg overflow-hidden flex-shrink-0 border border-tppslate/20">
                {item.bundle_img ? (
                  <img
                    src={item.bundle_img}
                    alt={item.bundle_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-tppslate/30" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-tppslate mb-1 text-sm">
                  {item.bundle_title}
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-tppslate/70">Qty: <span className="font-semibold text-tppslate">{item.quantity}</span></span>
                  <span className="text-tppslate/40">•</span>
                  <span className="text-tppslate/70">Price: <span className="font-semibold text-tpppink">{formatCurrency(item.price)}</span></span>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="text-lg font-bold text-tpppink">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipment Info - Compact */}
        {shipment && (shipment.courier || shipment.estimated_delivery) && (
          <div className="bg-tppslate/5 rounded-lg p-3 border border-tppslate/20">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-tppslate/70" />
              <span className="text-xs font-bold text-tppslate/70 uppercase tracking-wide">Shipment</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              {shipment.courier && (
                <div className="flex items-center gap-2">
                  <span className="text-tppslate/70">Courier:</span>
                  <span className="font-semibold text-tppslate">{shipment.courier}</span>
                </div>
              )}
              {shipment.estimated_delivery && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-tppslate/70">Est. Delivery:</span>
                  <span className="font-semibold text-green-700">{formatDateShort(shipment.estimated_delivery)}</span>
                </div>
              )}
            </div>
            
            {/* AWB */}
            {shipment.awb && (
              <div className="mt-2 pt-2 border-t border-tppslate/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tppslate/70">AWB: <span className="font-mono font-semibold text-tppslate">{shipment.awb}</span></span>
                  <div className="flex gap-2">
                    {shipment.tracking_url && (
                      <a
                        href={shipment.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-tpppink hover:bg-tpppink/90 text-white rounded-md transition-all font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Track
                      </a>
                    )}
                    {shipment.invoice_url && (
                      <a
                        href={shipment.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-tppslate hover:bg-tppslate/90 text-white rounded-md transition-all font-medium"
                      >
                        <Download className="w-3 h-3" />
                        Invoice
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-tppslate/5 rounded-lg p-3 border border-tppslate/20">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-tppslate/70">Subtotal</span>
              <span className="font-semibold text-tppslate">{formatCurrency(order.subtotal)}</span>
            </div>
            
            {order.express_charge > 0 && (
              <div className="flex justify-between text-tpppink">
                <span>Express Delivery</span>
                <span className="font-semibold">+{formatCurrency(order.express_charge)}</span>
              </div>
            )}
            
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-semibold">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-tppslate/20">
              <span className="font-bold text-tppslate">Total Amount</span>
              <span className="text-xl font-bold text-tpppink">
                {formatCurrency(order.final_total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsCard;