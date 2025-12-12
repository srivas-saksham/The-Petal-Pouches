// frontend/src/components/user/orders/OrdersList.jsx

import OrderCard from './OrderCard';
import EmptyOrders from './EmptyOrders';

/**
 * Orders list container with skeleton loading states
 */
const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-tppslate/10 p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3 pb-3 border-b border-tppslate/5">
      <div className="space-y-2 flex-1">
        <div className="h-5 w-32 bg-tppslate/10 rounded"></div>
        <div className="h-3 w-24 bg-tppslate/10 rounded"></div>
      </div>
      <div className="h-6 w-24 bg-tppslate/10 rounded-full"></div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-16 h-16 bg-tppslate/10 rounded-lg"></div>
      <div className="w-16 h-16 bg-tppslate/10 rounded-lg"></div>
      <div className="w-16 h-16 bg-tppslate/10 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-3 py-2">
      <div className="space-y-1">
        <div className="h-3 w-12 bg-tppslate/10 rounded"></div>
        <div className="h-4 w-8 bg-tppslate/10 rounded"></div>
      </div>
      <div className="space-y-1">
        <div className="h-3 w-12 bg-tppslate/10 rounded"></div>
        <div className="h-4 w-16 bg-tppslate/10 rounded"></div>
      </div>
      <div className="space-y-1">
        <div className="h-3 w-16 bg-tppslate/10 rounded"></div>
        <div className="h-4 w-12 bg-tppslate/10 rounded"></div>
      </div>
    </div>
    <div className="flex gap-2 pt-3 border-t border-tppslate/5">
      <div className="flex-1 h-9 bg-tppslate/10 rounded-lg"></div>
      <div className="flex-1 h-9 bg-tppslate/10 rounded-lg"></div>
    </div>
  </div>
);

const OrdersList = ({ orders, loading, onReorder, emptyMessage, emptyIcon }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <EmptyOrders message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
};

export default OrdersList;