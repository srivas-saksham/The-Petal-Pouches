// frontend/src/pages/user/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, CreditCard, Truck, 
  RefreshCw, Download, Phone, Mail, ExternalLink
} from 'lucide-react';
import { getOrderById, getOrderTracking, refreshTracking } from '../../services/orderService';
import TrackingTimeline from '../../components/user/orders/TrackingTimeline';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Load order details
      const orderResult = await getOrderById(orderId);
      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }
      setOrder(orderResult.data);

      // Load tracking info ONLY if order is confirmed or later
      if (['confirmed', 'shipped', 'delivered'].includes(orderResult.data.status)) {
        const trackingResult = await getOrderTracking(orderId);
        if (trackingResult.success) {
          setTracking(trackingResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      alert('Failed to load order details');
      navigate('/user/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTracking = async () => {
    try {
      setRefreshing(true);
      const result = await refreshTracking(orderId);
      if (result.success) {
        setTracking(result.data);
        alert('✅ Tracking updated!');
      } else {
        alert('❌ Failed to refresh tracking');
      }
    } catch (error) {
      console.error('Refresh tracking error:', error);
      alert('Failed to refresh tracking');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Order not found</p>
          <Link to="/user/orders" className="text-tpppink hover:underline mt-4 inline-block">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderId8 = order.id?.substring(0, 8).toUpperCase();
  const shipment = order.shipment;

  return (
    <div className="min-h-screen bg-tppslate/15">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/user/orders')}
            className="flex items-center gap-2 text-tppslate hover:text-tpppink transition-colors mb-4 pt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Orders</span>
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-tppslate mb-1">
                Order #{orderId8}
              </h1>
              <p className="text-sm text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Tracking & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipment Information - Show AWB and labels when available */}
            {shipment && order.status !== 'pending' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-tppslate px-5 py-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipment Information
                  </h3>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AWB */}
                    {shipment.awb && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tracking Number (AWB)</p>
                        <p className="font-mono font-bold text-tpppink text-lg">{shipment.awb}</p>
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
                        className="font-inter flex items-center gap-2 px-4 py-2 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors text-sm font-semibold"
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
              </div>
            )}

            {/* Tracking Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-tppslate">Order Tracking</h2>
                {tracking?.awb && (
                  <button
                    onClick={handleRefreshTracking}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Updating...' : 'Refresh'}
                  </button>
                )}
              </div>
              
              <TrackingTimeline tracking={tracking} />
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-tppslate px-5 py-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h3>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.bundle_img ? (
                          <img
                            src={item.bundle_img}
                            alt={item.bundle_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-tppslate mb-1">
                          {item.bundle_title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="font-semibold">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-tpppink">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="mt-5 pt-5 border-t-2 border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  
                  {order.express_charge > 0 && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Express Delivery</span>
                      <span className="font-medium">+{formatCurrency(order.express_charge)}</span>
                    </div>
                  )}
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-tppslate">Total</span>
                    <span className="text-2xl font-bold text-tpppink">
                      {formatCurrency(order.final_total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-tppslate px-4 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h3>
              </div>
              <div className="p-4">
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-tppslate">{order.shipping_address?.line1}</p>
                  {order.shipping_address?.line2 && (
                    <p className="text-gray-600">{order.shipping_address.line2}</p>
                  )}
                  <p className="text-gray-600">
                    {order.shipping_address?.city}, {order.shipping_address?.state}
                  </p>
                  <p className="text-gray-600">{order.shipping_address?.zip_code}</p>
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{order.shipping_address?.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-tppslate px-4 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Details
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold text-tppslate uppercase">
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
                {order.payment_method === 'cod' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 font-medium mb-1">
                      Cash on Delivery
                    </p>
                    <p className="text-lg font-bold text-amber-900">
                      {formatCurrency(order.final_total)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-br from-tpppink/10 to-tpppink/5 rounded-lg border border-tpppink/20 p-4">
              <h4 className="font-semibold text-tppslate mb-2 text-sm">Need Help?</h4>
              <p className="text-xs text-gray-600 mb-3">
                Contact our support team for any questions about your order.
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:support@petalpouches.com" 
                  className="flex items-center gap-2 text-xs text-tpppink hover:underline"
                >
                  <Mail className="w-3 h-3" />
                  support@petalpouches.com
                </a>
                <a 
                  href="tel:+919999999999" 
                  className="flex items-center gap-2 text-xs text-tpppink hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  +91 99999 99999
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;