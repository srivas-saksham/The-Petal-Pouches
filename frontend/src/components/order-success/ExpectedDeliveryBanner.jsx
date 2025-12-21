// frontend/src/components/order-success/ExpectedDeliveryBanner.jsx

import { Calendar, Plane, Truck, Clock } from 'lucide-react';

const ExpectedDeliveryBanner = ({ deliveryDate, deliveryMode = 'surface', estimatedDays = 5 }) => {
  const isExpress = deliveryMode === 'express';

  const formatDeliveryDate = (dateStr) => {
    if (!dateStr) {
      const date = new Date();
      date.setDate(date.getDate() + estimatedDays);
      return date;
    }
    return new Date(dateStr);
  };

  const displayDate = formatDeliveryDate(deliveryDate);
  const formattedDate = displayDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`relative rounded-xl overflow-hidden ${
      isExpress 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
        : 'bg-gradient-to-r from-tppslate to-slate-700'
    } shadow-md`}>
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-white/80" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                Expected Delivery
              </p>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{formattedDate}</h2>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                {isExpress ? <Plane className="w-3.5 h-3.5 text-white" /> : <Truck className="w-3.5 h-3.5 text-white" />}
                <span className="font-semibold text-white text-xs">
                  {isExpress ? 'Express' : 'Standard'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium text-xs">{estimatedDays} days</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            {isExpress ? 
              <Plane className="w-12 h-12 text-white/30" /> : 
              <Truck className="w-12 h-12 text-white/30" />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpectedDeliveryBanner;