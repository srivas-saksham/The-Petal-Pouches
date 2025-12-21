// frontend/src/components/order-success/OrderItemsList.jsx

import { Package, X } from 'lucide-react';

const OrderItemsList = ({ items = [] }) => {
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No items found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-tppslate px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-white" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Order Items</h2>
        </div>
        <span className="text-xs font-bold text-white/80">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item, index) => {
          const itemSubtotal = (item.price || 0) * (item.quantity || 1);
          const imgSrc = item.product_img || item.img_url || item.bundle_img;
          const title = item.product_title || item.title || item.bundle_title || 'Product';
          
          return (
            <div key={index} className="p-3 hover:bg-slate-50 transition-colors">
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  {imgSrc ? (
                    <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-tppslate text-sm mb-1.5 line-clamp-2">{title}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded">
                      <span className="text-slate-500">Qty:</span>
                      <span className="font-bold text-tppslate">{item.quantity || 1}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-600">{formatCurrency(item.price || 0)} each</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500 mb-0.5">Subtotal</p>
                  <p className="text-lg font-bold text-tpppink">{formatCurrency(itemSubtotal)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItemsList;