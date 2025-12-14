// frontend/src/pages/user/OrderDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Truck, MapPin, Calendar, 
  Clock, Loader, RefreshCw, AlertCircle, Download,
  ExternalLink, CheckCircle, XCircle
} from 'lucide-react';

import { getOrderById, getOrderTracking, refreshTracking } from '../../services/orderService';
import TrackingTimeline from '../../components/user/orders/TrackingTimeline';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    
    const orderResult = await getOrderById(id);
    if (orderResult.success) {
      setOrder(orderResult.data);
      
      // ✅ Load tracking ONLY if order is confirmed or later
      if (['confirmed', 'shipped', 'delivered'].includes(orderResult.data.status)) {
        const trackingResult = await getOrderTracking(id);
        if (trackingResult.success) {
          setTracking(trackingResult.tracking);
        }
      }
    }
    
    setLoading(false);
  };

  const handleRefreshTracking = async () => {
    setRefreshing(true);
    const result = await refreshTracking(id);
    if (result.success) {
      setTracking(result.tracking);
    }
    setRefreshing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-tpppink" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Order not found</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="mt-4 text-tpppink hover:underline"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shipping_address;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/user/orders')}
          className="flex items-center gap-2 text-tppslate hover:text-tpppink mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Orders</span>
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-tppslate mb-2">
                Order #{order.id.substring(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600 text-sm">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
              <p className="font-semibold text-tppslate">{order.payment_method?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <p className={`font-semibold ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.payment_status?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="font-bold text-tpppink text-lg">{formatCurrency(order.final_total)}</p>
            </div>
          </div>
        </div>
        {/* ✅ SHIPMENT INFO - Show AWB and labels when available */}
        {shipment && order.status !== 'pending' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-tpppink" />
            <h2 className="text-xl font-bold text-tppslate">Shipment Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AWB */}
            {shipment.awb && (
                <div>
                <p className="text-xs text-gray-500 mb-1">Tracking Number (AWB)</p>
                <p className="font-mono font-bold text-tppink text-lg">{shipment.awb}</p>
                </div>
            )}
            
            {/* Courier */}
            {shipment.courier && (
                <div>
                <p className="text-xs text-gray-500 mb-1">Courier Partner</p>
                <p className="font-semibold text-tppslate">{shipment.courier}</p>
                </div>
            )}
            
            {/* Estimated Delivery */}
            {shipment.estimated_delivery && (
                <div>
                <p className="text-xs text-gray-500 mb-1">Estimated Delivery</p>
                <p className="font-semibold text-tppslate">{formatDate(shipment.estimated_delivery)}</p>
                </div>
            )}
            
            {/* Shipping Mode */}
            {shipment.shipping_mode && (
                <div>
                <p className="text-xs text-gray-500 mb-1">Shipping Mode</p>
                <p className="font-semibold text-tppslate">{shipment.shipping_mode}</p>
                </div>
            )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {shipment.tracking_url && (
                <a
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors text-sm font-semibold"
                    >
                    <ExternalLink className="w-4 h-4" />
                    Track on {shipment.courier || 'Courier Website'}
                </a>
            )}
            
            {shipment.label_url && (
                <a
                    href={shipment.label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-tppslate text-tppslate rounded-lg hover:bg-tppslate hover:text-white transition-colors text-sm font-semibold"
                    >
                    <Download className="w-4 h-4" />
                    Download Label
                </a>
            )}
            
            {shipment.invoice_url && (
                <a
                    href={shipment.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                    >
                    <Download className="w-4 h-4" />
                    Download Invoice
                </a>
            )}
            </div>
        </div>
        )}

        {/* ✅ TRACKING SECTION - Only show if confirmed or later */}
        {order.status !== 'pending' && (
        <div className="mb-6">
            {tracking ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-tppslate">Tracking Details</h2>
                <button
                    onClick={handleRefreshTracking}
                    disabled={refreshing}
                    className="flex items-center gap-2 text-sm text-tpppink hover:text-tpppink/80 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
                </div>
                <TrackingTimeline tracking={tracking} />
            </div>
            ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-blue-800">Order Confirmed</p>
                    <p className="text-sm text-blue-600 mt-1">
                    Your order has been confirmed. Tracking information will be available once the shipment is picked up by the courier.
                    </p>
                    {shipment?.estimated_delivery && (
                    <p className="text-sm text-blue-700 mt-2 font-semibold">
                        Expected delivery: {formatDate(shipment.estimated_delivery)}
                    </p>
                    )}
                </div>
                </div>
            </div>
            )}
        </div>
        )}

        {/* PENDING STATUS MESSAGE */}
        {order.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold text-yellow-800">Order Being Processed</p>
                <p className="text-sm text-yellow-600 mt-1">
                Your order is being reviewed by our team. You will receive tracking information once it's confirmed and shipped.
                </p>
            </div>
            </div>
        </div>
        )}

        {/* PENDING STATUS MESSAGE */}
        {order.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Order Received</p>
                <p className="text-sm text-blue-600 mt-1">
                  Your order is being processed. You will receive tracking information once it's confirmed and shipped.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-tpppink" />
            <h2 className="text-xl font-bold text-tppslate">Delivery Address</h2>
          </div>
          {shippingAddress && (
            <div className="text-gray-700">
              <p className="font-semibold">{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              {shippingAddress.landmark && <p className="text-sm text-gray-600">Near: {shippingAddress.landmark}</p>}
              <p className="mt-2">
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip_code}
              </p>
              {shippingAddress.phone && (
                <p className="mt-2 text-sm">
                  <span className="text-gray-600">Phone:</span> {shippingAddress.phone}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-tpppink" />
            <h2 className="text-xl font-bold text-tppslate">Order Items</h2>
          </div>
          
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.bundle_img}
                  alt={item.bundle_title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-tppslate">{item.bundle_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  <p className="text-sm font-bold text-tpppink mt-1">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.express_charge > 0 && (
              <div className="flex justify-between text-sm text-tpppink">
                <span>Express Delivery</span>
                <span className="font-semibold">+{formatCurrency(order.express_charge)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-semibold">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span className="text-tppslate">Total</span>
              <span className="text-tpppink">{formatCurrency(order.final_total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;