// frontend/src/components/admin/dashboard/DashboardSkeleton.jsx

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border-2 border-tppslate/10 p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonOrdersList() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProductsList() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md animate-pulse">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRevenueChart() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-md animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
          <div className="h-16 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonStats,
  SkeletonOrdersList,
  SkeletonProductsList,
  SkeletonRevenueChart,
};