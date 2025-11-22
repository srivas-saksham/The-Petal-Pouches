// frontend/src/components/admin/ui/StatusBadge.jsx

export default function StatusBadge({ status }) {
  const statusConfig = {
    active: {
      label: 'In Stock',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500'
    },
    low_stock: {
      label: 'Low Stock',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      dotColor: 'bg-amber-500'
    },
    out_of_stock: {
      label: 'Out of Stock',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500'
    },
    draft: {
      label: 'Draft',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      dotColor: 'bg-gray-500'
    },
    archived: {
      label: 'Archived',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      dotColor: 'bg-gray-400'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${config.bgColor} ${config.textColor}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}