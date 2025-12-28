// frontend/src/components/order-success/OrderActionsBar.jsx

import { Package, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderActionsBar = () => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Link
        to="/user/orders"
        className="font-inter text-center bg-tpppink text-white font-semibold py-2 px-4 rounded-xl hover:bg-tpppink/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
      >
        View All Orders
      </Link>
      
      <Link
        to="/shop"
        className="font-inter text-center bg-white text-tppslate font-semibold py-2 px-4 rounded-xl border-2 border-slate-200 hover:border-tpppink hover:bg-tpppink/5 transition-all flex items-center justify-center gap-2 text-sm"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderActionsBar;