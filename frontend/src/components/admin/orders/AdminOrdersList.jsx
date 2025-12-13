// frontend/src/components/admin/orders/AdminOrdersList.jsx
import AdminOrderCard from './AdminOrderCard';
import { Package } from 'lucide-react';

export default function AdminOrdersList({ 
  orders, 
  loading, 
  onViewOrder, 
  onStatusUpdate,
  emptyMessage = "No orders found" 
}) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white rounded-lg border border-tppslate/10 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-tppslate/10 rounded"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-tppslate/10 rounded w-1/4"></div>
                <div className="h-3 bg-tppslate/10 rounded w-1/2"></div>
                <div className="h-3 bg-tppslate/10 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-tppslate/10 p-12 text-center">
        <Package className="w-16 h-16 text-tppslate/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-tppslate mb-2">No Orders</h3>
        <p className="text-sm text-tppslate/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <AdminOrderCard
          key={order.id}
          order={order}
          onViewOrder={onViewOrder}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
}