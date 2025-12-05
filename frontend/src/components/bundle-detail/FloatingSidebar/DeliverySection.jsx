// frontend/src/components/bundle-detail/FloatingSidebar/DeliverySection.jsx
import React from 'react';
import { Truck, MapPin, Calendar } from 'lucide-react';

/**
 * DeliverySection - Delivery info and shipping details
 * Compact minimal design
 */
const DeliverySection = () => {
  // Calculate estimated delivery (5-7 days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    const options = { month: 'short', day: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide flex items-center gap-1.5">
        <Truck size={14} className="text-tpppink" />
        Delivery
      </h3>

      {/* Estimated Delivery */}
      <div className="flex items-start gap-2 text-sm">
        <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-slate-500 font-medium">Estimated Delivery</p>
          <p className="text-sm font-bold text-tppslate">{getDeliveryDate()}</p>
        </div>
      </div>

      {/* Free Shipping Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
        <Truck size={16} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-green-700">FREE SHIPPING</p>
          <p className="text-xs text-green-600">On all orders</p>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <MapPin size={12} className="mt-0.5 flex-shrink-0" />
        <p>Ships to all locations in India</p>
      </div>
    </div>
  );
};

export default DeliverySection;