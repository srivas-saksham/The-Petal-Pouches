// frontend/src/pages/OrderSuccess.jsx - COMPLETE REDESIGN
// ✅ Modern, compact, detailed layout
// ✅ Component-based architecture
// ✅ Defensive data handling

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { useToast } from '../hooks/useToast';

// Import all components
import SuccessHeader from '../components/order-success/SuccessHeader';
import ExpectedDeliveryBanner from '../components/order-success/ExpectedDeliveryBanner';
import OrderItemsList from '../components/order-success/OrderItemsList';
import PriceBreakdown from '../components/order-success/PriceBreakdown';
import DeliveryTimeline from '../components/order-success/DeliveryTimeline';
import ShippingAddressCard from '../components/order-success/ShippingAddressCard';
import PaymentDetailsCard from '../components/order-success/PaymentDetailsCard';
import OrderActionsBar from '../components/order-success/OrderActionsBar';
import SEO from '../components/seo/SEO';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [orderMetadata, setOrderMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    loadOrderMetadata();
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
      console.error('❌ Error loading order:', error);
      toast.error('Order not found');
      navigate('/user/orders');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Defensive localStorage handling
  const loadOrderMetadata = () => {
    try {
      const savedMetadata = localStorage.getItem('tpp_last_order');
      
      if (!savedMetadata || savedMetadata === 'undefined' || savedMetadata === 'null') {
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(savedMetadata);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        localStorage.removeItem('tpp_last_order');
        return;
      }

      if (!parsed || typeof parsed !== 'object') {
        localStorage.removeItem('tpp_last_order');
        return;
      }

      if (parsed.orderId === orderId) {
        setOrderMetadata(parsed);
        console.log('✅ Loaded metadata:', parsed);
      }
      
    } catch (error) {
      console.error('❌ Error loading metadata:', error);
    }
  };

  // ✅ Smart data fallback: metadata → order → defaults
  const getDeliveryInfo = () => {
    const mode = orderMetadata?.deliveryMode || 
                 order?.delivery_metadata?.mode || 
                 'surface';
    
    const estimatedDays = orderMetadata?.deliveryModeData?.estimatedDays || 
                          order?.delivery_metadata?.estimated_days || 
                          5;
    
    const expectedDate = orderMetadata?.deliveryModeData?.deliveryDate || 
                        orderMetadata?.deliveryModeData?.expectedDeliveryDate ||
                        order?.delivery_metadata?.expected_delivery_date;
    
    const expressCharge = orderMetadata?.orderTotals?.expressCharge || 
                         order?.express_charge ||
                         order?.delivery_metadata?.express_charge || 
                         0;

    return { mode, estimatedDays, expectedDate, expressCharge };
  };

  // ✅ Calculate estimated delivery date
  const getEstimatedDeliveryDate = () => {
    const { expectedDate, estimatedDays } = getDeliveryInfo();
    
    if (expectedDate) {
      return expectedDate;
    }
    
    const date = new Date(order?.created_at || Date.now());
    date.setDate(date.getDate() + estimatedDays);
    return date.toISOString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-tpppink animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="text-tpppink hover:underline font-semibold"
          >
            View all orders
          </button>
        </div>
      </div>
    );
  }

  const deliveryInfo = getDeliveryInfo();
  const estimatedDelivery = getEstimatedDeliveryDate();

  return (
    <>
    <SEO
      title="Order Confirmed"
      description="Your order has been successfully placed. Thank you for shopping with Rizara Luxe."
      canonical={`https://www.rizara.in/order-success/${order.id}`}
      noindex={true}
    />

    <div 
      className="min-h-screen py-6 bg-slate-50 relative"
      style={{
        backgroundImage: 'url(/assets/doodle_bg_f.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {/* Help Section + Action Buttons - Fixed Top Right Corner (Desktop Only) */}
      <div className="hidden lg:block fixed top-6 right-6 w-64 z-50 space-y-3">
        {/* Help Section */}
        <div className="bg-gradient-to-b from-tpppink/10 to-white rounded-xl border border-tpppink/20 p-4 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-bold text-tppslate mb-2">Need Help?</p>
          <p className="text-xs text-slate-600 mb-3">
            Contact our support team for any questions about your order.
          </p>
          <button className="w-full text-xs font-semibold text-tpppink hover:text-tpppink/80 transition-colors py-2 px-3 border border-tpppink/30 rounded-lg hover:bg-tpppink/5">
            Contact Support →
          </button>
        </div>

        {/* Action Buttons */}
        <OrderActionsBar />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        
        {/* Success Header - Full Width */}
        <div className="mb-4">
          <SuccessHeader 
            orderId={order.id}
            status={order.status}
            orderDate={order.created_at}
          />
        </div>

        {/* Main Grid Layout: 50% Left | 50% Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* LEFT COLUMN - 50% width */}
          <div className="space-y-4">
            
            {/* Expected Delivery Banner */}
            <ExpectedDeliveryBanner 
              deliveryDate={estimatedDelivery}
              deliveryMode={deliveryInfo.mode}
              estimatedDays={deliveryInfo.estimatedDays}
            />

            {/* Order Items List */}
            <OrderItemsList items={order.items || []} />

            {/* Delivery Timeline */}
            <DeliveryTimeline 
              status={order.status}
              estimatedDelivery={estimatedDelivery}
              deliveryMode={deliveryInfo.mode}
            />

          </div>

          {/* RIGHT COLUMN - 50% width */}
          <div className="space-y-4">
            
            {/* Price Breakdown */}
            <PriceBreakdown 
              subtotal={order.subtotal || 0}
              expressCharge={deliveryInfo.expressCharge}
              discount={order.discount || 0}
              finalTotal={order.final_total || 0}
            />

            {/* Shipping Address */}
            <ShippingAddressCard address={order.shipping_address || {}} />

            {/* Payment Details */}
            <PaymentDetailsCard 
              paymentMethod={order.payment_method}
              paymentStatus={order.payment_status}
              finalTotal={order.final_total || 0}
            />

            {/* Help Section - Mobile Only */}
            <div className="lg:hidden bg-gradient-to-br from-tpppink/10 to-tpppink/5 rounded-xl border border-tpppink/20 p-4">
              <p className="text-xs font-bold text-tppslate mb-2">Need Help?</p>
              <p className="text-xs text-slate-600 mb-3">
                Contact our support team for any questions about your order.
              </p>
              <button className="w-full text-xs font-semibold text-tpppink hover:text-tpppink/80 transition-colors py-2 px-3 border border-tpppink/30 rounded-lg hover:bg-tpppink/5">
                Contact Support →
              </button>
            </div>

          </div>
        </div>

        {/* Action Buttons - Mobile Only (Full Width at Bottom) */}
        <div className="mt-6 lg:hidden">
          <OrderActionsBar />
        </div>

      </div>
    </div>
    </>
  );
};

export default OrderSuccess;