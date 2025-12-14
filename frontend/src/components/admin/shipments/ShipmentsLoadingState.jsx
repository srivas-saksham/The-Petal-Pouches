// frontend/src/components/admin/shipments/ShipmentsLoadingState.jsx
/**
 * Full Page Loading State
 * Shows while initial data loads
 */

export function ShipmentsLoadingState() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-tpppink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-tppslate/70 font-medium">Loading shipments...</p>
        <p className="text-tppslate/50 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
}