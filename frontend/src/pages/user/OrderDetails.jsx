// frontend/src/pages/user/OrderDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { getOrderById, getOrderTracking, refreshTracking } from '../../services/orderService';

import OrderStatusHeader from '../../components/user/orders/OrderStatusHeader';
import OrderItemsCard from '../../components/user/orders/OrderItemsCard';
import DeliveryAddressCard from '../../components/user/orders/DeliveryAddressCard';
import OrderHelpCard from '../../components/user/orders/OrderHelpCard';
import TrackingTimeline from '../../components/user/orders/TrackingTimeline';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadOrderDetails(); }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderResult = await getOrderById(orderId);
      if (!orderResult.success) throw new Error(orderResult.error);
      setOrder(orderResult.data);
      if (['confirmed', 'processing', 'shipped', 'delivered', 'in_transit', 'out_for_delivery'].includes(orderResult.data.status)) {
        const trackingResult = await getOrderTracking(orderId);
        if (trackingResult.success) setTracking(trackingResult.data);
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
      if (result.success) { setTracking(result.data); alert('✅ Tracking updated!'); }
      else { alert('❌ Failed to refresh tracking'); }
    } catch (error) {
      console.error('Refresh tracking error:', error);
      alert('Failed to refresh tracking');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tppslate/5 dark:bg-tppdark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tpppink dark:border-tppdarkwhite border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-tppslate/80 dark:text-tppdarkwhite/60">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-tppslate/5 dark:bg-tppdark flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-tppslate/80 dark:text-tppdarkwhite/60">Order not found</p>
          <Link to="/user/orders" className="text-tpppink dark:text-tppdarkwhite hover:underline mt-4 inline-block">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tppslate/5 dark:bg-transparent p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/user/orders')}
          className="flex items-center gap-2 text-tppslate dark:text-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite/80 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="mb-6">
          <OrderStatusHeader order={order} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderItemsCard order={order} shipment={order.shipment} />
            {tracking && (
              <div className="bg-white dark:bg-tppdarkgray rounded-2xl border-2 border-tppslate/20 dark:border-tppdarkwhite/10 overflow-hidden shadow-sm p-6">
                <h3 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-tpppink dark:text-tppdarkwhite" />
                  Tracking History
                </h3>
                <TrackingTimeline tracking={tracking} order={order} />
              </div>
            )}
          </div>
          <div className="space-y-6">
            <DeliveryAddressCard address={order.shipping_address} />
            <OrderHelpCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;