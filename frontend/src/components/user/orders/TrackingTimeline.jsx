// frontend/src/components/user/orders/TrackingTimeline.jsx

import { CheckCircle, Clock, Package, Truck, Home, XCircle, Plane } from 'lucide-react';

const TrackingTimeline = ({ tracking, order }) => {
  if (tracking?.status === 'Cancelled' || order?.status === 'cancelled') {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-400 font-semibold">Order Cancelled</p>
        </div>
        <p className="text-red-600 dark:text-red-400/80 text-sm">This order has been cancelled and will not be processed.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return null; }
  };

  const currentStatus = (order?.status || tracking?.status || 'pending').toLowerCase();
  const isExpress = order?.delivery_metadata?.mode === 'express';
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  const buildTimeline = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed', description: 'Your order has been received', icon: Clock, date: order?.created_at },
      { status: 'confirmed', label: 'Order Confirmed', description: 'Order verified and approved', icon: CheckCircle, date: order?.confirmed_at || null },
      { status: 'processing', label: 'Processing', description: 'Preparing your order for shipment', icon: Package, date: order?.processing_at || null },
      { status: 'shipped', label: isExpress ? 'Express Shipped' : 'Shipped', description: 'Order is on the way', icon: isExpress ? Plane : Truck, date: order?.shipped_at || null },
      { status: 'delivered', label: 'Delivered', description: 'Order delivered successfully', icon: Home, date: order?.delivered_at || null },
    ];
    return steps.map((step) => {
      const stepIndex = statusOrder.indexOf(step.status);
      return { ...step, completed: stepIndex < currentStatusIndex, isActive: step.status === currentStatus };
    });
  };

  const timeline = buildTimeline();

  const getStatusIcon = (step, isCompleted, isActive) => {
    const Icon = step.icon || Clock;
    return <Icon className={`w-6 h-6 ${isCompleted || isActive ? 'text-white' : 'text-gray-400 dark:text-tppdarkwhite/30'}`} />;
  };

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-gray-200 dark:border-tppdarkwhite/10 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite mb-1">
          {tracking ? 'Shipment Tracking' : 'Order Progress'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-tppdarkwhite/60 mb-2">
          Current Status: <span className="font-semibold text-tpppink dark:text-tppdarkwhite capitalize">{currentStatus}</span>
        </p>
        {tracking?.awb && (
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-gray-600 dark:text-tppdarkwhite/60">Tracking Number:</span>
            <span className="font-mono font-bold text-tpppink dark:text-tppdarkwhite">{tracking.awb}</span>
            {tracking.tracking_url && (
              <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer" className="text-tpppink dark:text-tppdarkwhite hover:underline text-xs ml-2">
                Track on {tracking.courier} →
              </a>
            )}
          </div>
        )}
        {(tracking?.estimated_delivery || order?.delivery_metadata?.expected_delivery_date) && (
          <p className="text-sm text-gray-600 dark:text-tppdarkwhite/60 mt-1">
            Estimated Delivery: <span className="font-semibold text-tppslate dark:text-tppdarkwhite">
              {formatDate(tracking?.estimated_delivery || order?.delivery_metadata?.expected_delivery_date)}
            </span>
          </p>
        )}
      </div>

      <div className="relative">
        {timeline.map((step, index) => {
          const isActive = step.isActive;
          const isCompleted = step.completed;
          return (
            <div key={`${step.status}-${index}`} className="relative flex gap-4 pb-8 last:pb-0">
              {index < timeline.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-tppdarkwhite/10'}`} />
              )}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0 transition-all ${
                isCompleted ? 'bg-green-500 border-green-500 shadow-md'
                : isActive ? 'bg-tpppink dark:bg-tppdarkwhite border-tpppink dark:border-tppdarkwhite shadow-lg'
                : 'bg-white dark:bg-tppdarkgray border-gray-300 dark:border-tppdarkwhite/20'
              }`}>
                {getStatusIcon(step, isCompleted, isActive)}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className={`font-semibold ${isCompleted || isActive ? 'text-tppslate dark:text-tppdarkwhite' : 'text-gray-400 dark:text-tppdarkwhite/30'}`}>
                      {step.label}
                    </h4>
                    <p className={`text-sm mt-0.5 ${isCompleted || isActive ? 'text-gray-600 dark:text-tppdarkwhite/60' : 'text-gray-400 dark:text-tppdarkwhite/30'}`}>
                      {step.description}
                    </p>
                    {step.location && <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40 mt-0.5">📍 {step.location}</p>}
                  </div>
                  {step.date && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">{formatDate(step.date)}</p>
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg px-3 py-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">In Progress</span>
                  </div>
                )}
                {isCompleted && !isActive && (
                  <div className="mt-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-semibold">Complete</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tracking?.tracking_history && tracking.tracking_history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-tppdarkwhite/10">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-tppslate dark:text-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite/80 transition-colors list-none flex items-center justify-between">
              <span>View Detailed Tracking History</span>
              <span className="text-xs text-gray-500 dark:text-tppdarkwhite/40 group-open:hidden">({tracking.tracking_history.length} updates)</span>
            </summary>
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
              {tracking.tracking_history.map((event, idx) => (
                <div key={idx} className="flex gap-3 text-sm border-l-2 border-gray-200 dark:border-tppdarkwhite/10 pl-3 py-1">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-tppdarkwhite">{event.status}</p>
                    {event.location && <p className="text-xs text-gray-600 dark:text-tppdarkwhite/50">📍 {event.location}</p>}
                    {event.instructions && <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40 italic mt-0.5">{event.instructions}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {tracking?.last_updated && (
        <p className="text-xs text-gray-400 dark:text-tppdarkwhite/30 mt-4 text-center">Last updated: {formatDate(tracking.last_updated)}</p>
      )}

      {!tracking && currentStatus === 'pending' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-tppdarkwhite/10">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-400 font-semibold">
              Tracking information will be available once your order is confirmed and shipped.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;