// frontend/src/components/admin/shipments/ShipmentsEmptyState.jsx
/**
 * Empty State for Shipments Page
 * Shows when no shipments match filters
 */

import { Package, Filter, RefreshCw } from 'lucide-react';

export function ShipmentsEmptyState({ 
  hasFilters, 
  onClearFilters, 
  onRefresh,
  message 
}) {
  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-12 text-center">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-tppslate/5 rounded-full flex items-center justify-center mx-auto mb-4">
          {hasFilters ? (
            <Filter className="w-10 h-10 text-tppslate/40" />
          ) : (
            <Package className="w-10 h-10 text-tppslate/40" />
          )}
        </div>

        {/* Message */}
        <h3 className="text-lg font-bold text-tppslate mb-2">
          {hasFilters ? 'No Matching Shipments' : 'No Shipments Found'}
        </h3>
        
        <p className="text-sm text-tppslate/70 mb-6">
          {message || (hasFilters 
            ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
            : 'Shipments will appear here once customers place orders.'
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {hasFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-tppslate text-white rounded-lg hover:bg-tppslate/90 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 border-2 border-tppslate/20 text-tppslate rounded-lg hover:bg-tppslate/5 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}