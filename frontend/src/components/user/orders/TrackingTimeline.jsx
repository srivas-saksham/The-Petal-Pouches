import { CheckCircle, Clock, Package, Truck, Home, XCircle } from 'lucide-react';

/**
 * Tracking Timeline Component
 * Shows order status progression with user-friendly labels
 */
const TrackingTimeline = ({ tracking }) => {
  
  if (!tracking) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-semibold">Tracking Information Unavailable</p>
        <p className="text-yellow-600 text-sm mt-1">
          Tracking details will be available once your order is shipped.
        </p>
      </div>
    );
  }

  // If order is cancelled
  if (tracking.status === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-semibold">Order Cancelled</p>
        </div>
        <p className="text-red-600 text-sm">
          This order has been cancelled and will not be processed.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  const getStatusIcon = (status, isCompleted, isActive) => {
    const iconMap = {
      'pending': Clock,
      'confirmed': CheckCircle,
      'picked_up': Package,
      'in_transit': Truck,
      'out_for_delivery': Truck,
      'delivered': Home
    };

    const Icon = iconMap[status] || Clock;
    
    return (
      <Icon className={`w-6 h-6 ${
        isCompleted || isActive ? 'text-tppslate' : 'text-gray-400'
      }`} />
    );
  };

  const timeline = tracking.timeline || [];
  const currentStatus = tracking.status;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-tppslate mb-1">Shipment Tracking</h3>
        {tracking.awb && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Tracking Number:</span>
            <span className="font-mono font-bold text-tpppink">{tracking.awb}</span>
            {tracking.tracking_url && (
              <a 
                href={tracking.tracking_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-tpppink hover:underline text-xs ml-2"
              >
                Track on {tracking.courier} →
              </a>
            )}
          </div>
        )}
        {tracking.estimated_delivery && (
          <p className="text-sm text-gray-600 mt-1">
            Estimated Delivery: <span className="font-semibold text-tppslate">
              {formatDate(tracking.estimated_delivery)}
            </span>
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        
        {timeline.map((step, index) => {
          const isActive = step.label === currentStatus || step.status === currentStatus;
          const isCompleted = step.completed;
          const hasDate = step.date !== null;

          return (
            <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
              
              {/* Vertical Line */}
              {index < timeline.length - 1 && (
                <div 
                  className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${
                    isCompleted ? 'bg-tpppink' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon Circle */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0 ${
                isCompleted 
                  ? 'bg-tpppink border-tpppink' 
                  : isActive
                  ? 'bg-white border-tpppink animate-pulse'
                  : 'bg-white border-gray-300'
              }`}>
                {getStatusIcon(step.status, isCompleted, isActive)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className={`font-semibold ${
                      isCompleted || isActive ? 'text-tppslate' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-sm mt-0.5 ${
                      isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                    {step.location && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        📍 {step.location}
                      </p>
                    )}
                  </div>
                  
                  {/* Date */}
                  {hasDate && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && !isCompleted && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-yellow-800">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking History Details */}
      {tracking.tracking_history && tracking.tracking_history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-tppslate hover:text-tpppink transition-colors list-none flex items-center justify-between">
              <span>View Detailed Tracking History</span>
              <span className="text-xs text-gray-500 group-open:hidden">
                ({tracking.tracking_history.length} updates)
              </span>
            </summary>
            
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
              {tracking.tracking_history.map((event, idx) => (
                <div key={idx} className="flex gap-3 text-sm border-l-2 border-gray-200 pl-3 py-1">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.status}</p>
                    {event.location && (
                      <p className="text-xs text-gray-600">📍 {event.location}</p>
                    )}
                    {event.instructions && (
                      <p className="text-xs text-gray-500 italic mt-0.5">{event.instructions}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Last Updated */}
      {tracking.last_updated && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Last updated: {formatDate(tracking.last_updated)}
        </p>
      )}
    </div>
  );
};

export default TrackingTimeline;