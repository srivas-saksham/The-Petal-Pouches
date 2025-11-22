// frontend/src/components/admin/ui/StatusBadge.jsx

import { getStatusColor, getStatusLabel } from '../../../utils/adminHelpers';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const colorMap = {
    success: 'bg-admin-mint text-white',
    warning: 'bg-admin-pink text-white',
    neutral: 'bg-admin-grey text-admin-slate',
    danger: 'bg-red-500 text-white',
    secondary: 'bg-admin-slate text-white',
  };

  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const colorClass = colorMap[color] || colorMap.neutral;

  return (
    <span
      className={`
        badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${colorClass}
        ${className}
      `}
    >
      {label}
    </span>
  );
}