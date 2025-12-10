// frontend/src/components/orders/OrderTimeline.jsx

import { CheckCircle, Circle, Clock, Package, Truck, Home } from 'lucide-react';

const OrderTimeline = ({ status, createdAt, confirmedAt, shippedAt, deliveredAt }) => {
  
  const steps = [
    {
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: Clock,
      date: createdAt,
      completed: true
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      description: 'We are preparing your order',
      icon: CheckCircle,
      date: confirmedAt,
      completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status)
    },
    {
      status: 'processing',
      label: 'Processing',
      description: 'Your order is being packed',
      icon: Package,
      date: null,
      completed: ['processing', 'shipped', 'delivered'].includes(status)
    },
    {
      status: 'shipped',
      label: 'Shipped',
      description: 'Out for delivery',
      icon: Truck,
      date: shippedAt,
      completed: ['shipped', 'delivered'].includes(status)
    },
    {
      status: 'delivered',
      label: 'Delivered',
      description: 'Order delivered successfully',
      icon: Home,
      date: deliveredAt,
      completed: status === 'delivered'
    }
  ];

  // If order is cancelled, show only first step
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Order Cancelled</p>
        <p className="text-red-600 text-sm mt-1">
          This order has been cancelled and will not be processed.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      
      {/* Timeline */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.status === status;
          const isCompleted = step.completed;

          return (
            <div key={step.status} className="relative flex gap-4">
              
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${
                    isCompleted ? 'bg-[#c1ff72]' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-[#c1ff72] border-[#c1ff72]' 
                  : isActive
                  ? 'bg-white border-[#c1ff72] animate-pulse'
                  : 'bg-white border-gray-300'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isCompleted || isActive ? 'text-black' : 'text-gray-400'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${
                      isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Date */}
                  {step.date && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && !isCompleted && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                    <Circle className="w-3 h-3 text-yellow-600 fill-current" />
                    <span className="text-xs font-medium text-yellow-800">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OrderTimeline;