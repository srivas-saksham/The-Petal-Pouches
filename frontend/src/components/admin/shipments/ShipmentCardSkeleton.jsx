// frontend/src/components/admin/shipments/ShipmentCardSkeleton.jsx
/**
 * Skeleton Loader for Shipment Card
 * Matches the exact layout structure
 */

export function ShipmentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-tppslate/10 overflow-hidden animate-pulse">
      <div className="flex gap-0 min-h-[200px]">
        
        {/* Left Section */}
        <div className="w-64 flex-shrink-0 flex flex-col">
          {/* Image Box */}
          <div className="w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-100"></div>
          
          {/* Timeline */}
          <div className="flex-1 p-3 bg-gray-50 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="space-y-1.5">
              <div className="h-2.5 bg-gray-200 rounded w-full"></div>
              <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2.5 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="w-72 flex-shrink-0 p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="flex-1"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>

        {/* Right Section */}
        <div className="w-64 flex-shrink-0 bg-gray-50 p-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex-1"></div>
          <div className="space-y-1.5">
            <div className="h-9 bg-gray-200 rounded"></div>
            <div className="h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}