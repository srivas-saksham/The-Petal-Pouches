// frontend/src/components/order-success/DeliveryTimeline.jsx

import { CheckCircle, Package, Truck, Home, Clock } from 'lucide-react';

const DeliveryTimeline = ({ status = 'pending', estimatedDelivery, deliveryMode = 'surface' }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const steps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, completed: true },
    { status: 'processing', label: 'Processing', icon: Package, completed: status !== 'pending' },
    { status: 'shipped', label: deliveryMode === 'express' ? 'Express Shipped' : 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(status) },
    { status: 'delivered', label: 'Delivered', icon: Home, completed: status === 'delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-bold text-tppslate uppercase tracking-wide mb-4">Delivery Status</h3>
      
      <div className="relative">
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-slate-200"></div>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = step.completed;
            
            return (
              <div key={step.status} className="relative flex items-start gap-3">
                <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500' 
                    : isActive
                    ? 'bg-white border-tpppink animate-pulse'
                    : 'bg-white border-slate-300'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isCompleted ? 'text-white' : isActive ? 'text-tpppink' : 'text-slate-400'
                  }`} />
                </div>
                
                <div className="pt-1">
                  <p className={`text-sm font-semibold ${
                    isCompleted || isActive ? 'text-tppslate' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isCompleted ? '✓ Complete' : isActive ? 'In Progress' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {estimatedDelivery && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-tpppink" />
          <span className="text-slate-600">Est. delivery: </span>
          <span className="font-semibold text-tppslate">{formatDate(estimatedDelivery)}</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryTimeline;