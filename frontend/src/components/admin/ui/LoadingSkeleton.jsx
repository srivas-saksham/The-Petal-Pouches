// frontend/src/components/admin/ui/LoadingSkeleton.jsx

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

export function SkeletonCircle({ className = '' }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
      <div className="flex gap-3 pt-2">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <SkeletonLine className="w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  {colIndex === 0 ? (
                    <SkeletonBox className="h-12 w-12" />
                  ) : (
                    <SkeletonLine className="w-full" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <SkeletonCircle className="h-10 w-10" />
            <SkeletonLine className="w-16 h-6" />
          </div>
          <SkeletonLine className="w-32 h-8 mb-2" />
          <SkeletonLine className="w-24 h-4" />
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonLine,
  SkeletonCircle,
  SkeletonBox,
  SkeletonCard,
  SkeletonTable,
  SkeletonStats,
};