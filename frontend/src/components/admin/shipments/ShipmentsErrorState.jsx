// frontend/src/components/admin/shipments/ShipmentsErrorState.jsx
/**
 * Error State for Shipments Page
 * Shows when data fetch fails
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

export function ShipmentsErrorState({ error, onRetry }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Message */}
        <h3 className="text-lg font-bold text-red-900 mb-2">
          Failed to Load Shipments
        </h3>
        
        <p className="text-sm text-red-700 mb-1">
          {error || 'An unexpected error occurred while fetching shipments.'}
        </p>
        
        <p className="text-xs text-red-600 mb-6">
          Please try again or contact support if the problem persists.
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}