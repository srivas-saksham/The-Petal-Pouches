// frontend/src/components/user/orders/OrdersLayout.jsx

import { Package } from 'lucide-react';

/**
 * Main layout wrapper for orders page
 * 70-30 split: Orders list (70%) | Buy Again sidebar (30%)
 */
const OrdersLayout = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-tppslate flex items-center gap-3">
            <Package className="w-7 h-7 text-tpppink" />
            My Orders
          </h1>
          <p className="text-sm text-tppslate/80 mt-1">
            Track and manage your orders
          </p>
        </div>

        {/* 70-30 Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-4">
            {children}
          </div>

          {/* Sidebar - 30% */}
          <div className="lg:col-span-3">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersLayout;