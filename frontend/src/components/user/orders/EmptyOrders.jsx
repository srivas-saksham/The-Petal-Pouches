// frontend/src/components/user/orders/EmptyOrders.jsx

import { Package, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Empty state for orders list
 */
const EmptyOrders = ({ message, icon: Icon = Package, showShopButton = true }) => {
  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-12 text-center">
      <div className="w-20 h-20 bg-tppslate/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-tppslate/30" />
      </div>
      <h3 className="text-lg font-bold text-tppslate mb-2">
        {message || 'No orders yet'}
      </h3>
      <p className="text-sm text-tppslate/60 mb-6">
        {showShopButton 
          ? "You haven't placed any orders yet. Start shopping now!"
          : "Try adjusting your filters to see more results."
        }
      </p>
      {showShopButton && (
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tpppink text-white text-sm rounded-lg hover:bg-tpppink/90 transition-colors font-semibold shadow-sm hover:shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Link>
      )}
    </div>
  );
};

export default EmptyOrders;