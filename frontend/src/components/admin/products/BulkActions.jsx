// frontend/src/components/admin/products/BulkActions.jsx

import { X } from 'lucide-react';
import { useState } from 'react';

export default function BulkActions({
  selectedCount,
  actions = [],
  onClearSelection,
  className = '',
}) {
  const [selectedAction, setSelectedAction] = useState('');

  const handleActionChange = (e) => {
    setSelectedAction(e.target.value);
  };

  const handleApply = () => {
    if (!selectedAction) return;

    const action = actions.find((a) => a.value === selectedAction);
    if (action && action.onClick) {
      action.onClick();
    }

    setSelectedAction('');
  };

  if (selectedCount === 0) return null;

  return (
    <div
      className={`
        flex items-center justify-between gap-4 p-4 
        bg-admin-peach border border-admin-pink rounded-lg
        animate-slide-in
        ${className}
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-white rounded transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAction}
            onChange={handleActionChange}
            className="form-input text-sm py-1.5"
          >
            <option value="">Choose action...</option>
            {actions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleApply}
            disabled={!selectedAction}
            className="btn btn-primary btn-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}