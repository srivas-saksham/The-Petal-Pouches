// frontend/src/components/user/orders/OrdersLayout.jsx

import { Package } from 'lucide-react';

const OrdersLayout = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-tppslate dark:text-tppdarkwhite flex items-center gap-3">
            <Package className="w-7 h-7 text-tpppink dark:text-tppdarkwhite" />
            My Orders
          </h1>
          <p className="text-sm text-tppslate/80 dark:text-tppdarkwhite/60 mt-1">Track and manage your orders</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7 space-y-4">{children}</div>
          <div className="lg:col-span-3">{sidebar}</div>
        </div>
      </div>
    </div>
  );
};

export default OrdersLayout;