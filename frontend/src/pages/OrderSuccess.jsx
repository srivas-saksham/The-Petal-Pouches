// frontend/src/pages/OrderSuccess.jsx - WITH ACTUAL DELIVERY DETAILS

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, Home, Truck, Calendar, DollarSign, Box, Clock, Plane } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { useToast } from '../hooks/useToast';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryMetadata, setDeliveryMetadata] = useState(null);

  useEffect(() => {
    loadOrder();
    loadDeliveryMetadata();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error('Failed to load order details');
        navigate('/user/orders');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Order not found');
      navigate('/user/orders');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load delivery metadata from localStorage
  const loadDeliveryMetadata = () => {
    try {
      const savedMetadata = localStorage.getItem('tpp_last_order');
      if (savedMetadata) {
        const parsed = JSON.parse(savedMetadata);
        if (parsed.orderId === orderId) {
          setDeliveryMetadata(parsed);
          console.log('✅ [OrderSuccess] Loaded delivery metadata:', parsed);
        }
      }
    } catch (error) {
      console.error('❌ [OrderSuccess] Error loading delivery metadata:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // ✅ Calculate delivery dates from metadata
  const deliveryMode = deliveryMetadata?.deliveryMode || order.delivery_metadata?.mode || 'surface';
  const estimatedDays = deliveryMetadata?.deliveryModeData?.estimatedDays || 
                        order.delivery_metadata?.estimated_days || 
                        5;
  const expectedDeliveryDate = deliveryMetadata?.deliveryModeData?.deliveryDate || 
                               deliveryMetadata?.deliveryModeData?.expectedDeliveryDate ||
                               order.delivery_metadata?.expected_delivery_date;

  const estimatedDelivery = expectedDeliveryDate 
    ? new Date(expectedDeliveryDate)
    : (() => {
        const date = new Date(order.created_at);
        date.setDate(date.getDate() + estimatedDays);
        return date;
      })();

  const isExpressDelivery = deliveryMode === 'express';

  return (
    <div 
      className="min-h-screen py-8"
      style={{
        backgroundImage: 'url(/assets/doodle_bg_f.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            
            <h1 className="text-3xl font-bold text-tppslate mb-2">
              Order Placed Successfully!
            </h1>
            
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Thank you for your order. We've sent a confirmation email with all the details.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-slate-50 rounded-xl py-3 px-5 border border-slate-200">
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Order ID</p>
                <p className="text-lg font-mono font-bold text-tppslate">
                  #{order.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-green-600">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Box className="w-5 h-5 text-tpppink mx-auto mb-2" />
            <p className="text-2xl font-bold text-tppslate">{order.items?.length || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Items</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <DollarSign className="w-5 h-5 text-tpppink mx-auto mb-2" />
            <p className="text-2xl font-bold text-tppslate">₹{order.final_total?.toFixed(0)}</p>
            <p className="text-xs text-slate-500 font-medium">Total Amount</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            {isExpressDelivery ? (
              <Plane className="w-5 h-5 text-tpppink mx-auto mb-2" />
            ) : (
              <Truck className="w-5 h-5 text-tpppink mx-auto mb-2" />
            )}
            <p className="text-2xl font-bold text-tppslate">{estimatedDays}</p>
            <p className="text-xs text-slate-500 font-medium">
              {estimatedDays === 1 ? 'Day' : 'Days'} Delivery
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bundle Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-5 py-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">Your Order</h2>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-200">
                        {item.product_img || item.img_url ? (
                          <img
                            src={item.product_img || item.img_url}
                            alt={item.product_title || item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-tppslate text-sm mb-1 line-clamp-2">
                          {item.product_title || item.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Qty:</span> {item.quantity}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-tppslate">₹{item.price?.toFixed(0)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-tppslate">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 pt-5 border-t-2 border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{order.subtotal?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {order.shipping_cost === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${order.shipping_cost?.toFixed(0)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax (GST 18%)</span>
                    <span className="font-medium">₹{order.tax?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-base font-bold text-tppslate">Total Amount</span>
                    <span className="text-2xl font-bold text-tpppink">₹{order.final_total?.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Enhanced Delivery Timeline with Actual Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                {isExpressDelivery ? (
                  <>
                    <Plane className="w-4 h-4 text-tpppink" />
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Express Delivery Timeline</h3>
                    <span className="ml-auto px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      FAST
                    </span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-tpppink" />
                    <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide">Standard Delivery Timeline</h3>
                  </>
                )}
              </div>

              {/* ✅ Estimated Delivery Info Box */}
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                isExpressDelivery 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isExpressDelivery ? 'text-amber-600' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${
                      isExpressDelivery ? 'text-amber-800' : 'text-blue-800'
                    }`}>
                      Expected Delivery
                    </p>
                    <p className={`text-lg font-bold ${isExpressDelivery ? 'text-amber-900' : 'text-blue-900'}`}>
                      {estimatedDelivery.toLocaleDateString('en-IN', { 
                        weekday: 'long',
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className={`text-xs ${isExpressDelivery ? 'text-amber-700' : 'text-blue-700'}`}>
                      {estimatedDays} {estimatedDays === 1 ? 'business day' : 'business days'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-slate-200"></div>
                
                <div className="space-y-6">
                  {/* Order Confirmed */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center flex-shrink-0 relative z-10">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-tppslate">Order Confirmed</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center flex-shrink-0 relative z-10">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-slate-600">Processing</p>
                      <p className="text-xs text-slate-400">In progress</p>
                    </div>
                  </div>

                  {/* Shipped */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center flex-shrink-0 relative z-10">
                      {isExpressDelivery ? (
                        <Plane className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Truck className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-slate-600">
                        {isExpressDelivery ? 'Express Shipped' : 'Shipped'}
                      </p>
                      <p className="text-xs text-slate-400">Pending</p>
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center flex-shrink-0 relative z-10">
                      <Home className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-slate-600">Delivered</p>
                      <p className="text-xs text-slate-400">
                        Est. {estimatedDelivery.toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-4 py-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Delivery To</h3>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-slate-700 space-y-1">
                  <p className="font-semibold text-tppslate">{order.shipping_address?.line1}</p>
                  {order.shipping_address?.line2 && (
                    <p className="text-slate-600">{order.shipping_address.line2}</p>
                  )}
                  <p className="text-slate-600">
                    {order.shipping_address?.city}, {order.shipping_address?.state}
                  </p>
                  <p className="text-slate-600">{order.shipping_address?.zip_code}</p>
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Contact</p>
                    <p className="font-medium text-tppslate">{order.shipping_address?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-4 py-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Payment</h3>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">Method</span>
                  <span className="text-sm font-bold text-tppslate uppercase">{order.payment_method}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-yellow-700">Pending</span>
                  </span>
                </div>
                
                {order.payment_method === 'cod' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 font-medium mb-1">Cash on Delivery</p>
                    <p className="text-lg font-bold text-amber-900">₹{order.final_total?.toFixed(0)}</p>
                    <p className="text-xs text-amber-700 mt-1">Pay when you receive</p>
                  </div>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-tpppink/10 to-tpppink/5 rounded-xl border border-tpppink/20 p-4">
              <p className="text-xs font-semibold text-tppslate mb-2">Need Help?</p>
              <p className="text-xs text-slate-600 mb-3">Contact our support team for any questions about your order.</p>
              <button className="w-full text-xs font-semibold text-tpppink hover:text-tpppink/80 transition-colors">
                Contact Support →
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Link
            to="/user/orders"
            className="bg-tpppink text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-tpppink/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <Package className="w-4 h-4" />
            View All Orders
          </Link>
          
          <Link
            to="/shop"
            className="bg-white text-tppslate font-semibold py-3.5 px-6 rounded-xl border-2 border-slate-200 hover:border-tpppink hover:bg-tpppink/5 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default OrderSuccess;