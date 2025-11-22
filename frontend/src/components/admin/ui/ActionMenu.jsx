// frontend/src/components/admin/ui/ActionMenu.jsx

import { MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ActionMenu({ actions = [], position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const positionClasses = {
    'bottom-right': 'right-0 mt-2',
    'bottom-left': 'left-0 mt-2',
    'top-right': 'right-0 bottom-full mb-2',
    'top-left': 'left-0 bottom-full mb-2',
  };

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-surface rounded transition-colors text-text-secondary hover:text-text-primary"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute ${positionClasses[position]} z-50
            min-w-[160px] bg-white rounded-lg shadow-hover border border-border
            animate-scale-in py-1
          `}
        >
          {actions.map((action, index) => {
            if (action.divider) {
              return <div key={index} className="my-1 border-t border-border" />;
            }

            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                  transition-colors
                  ${
                    action.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-text-primary hover:bg-surface'
                  }
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                <span className="flex-1">{action.label}</span>
                {action.badge && (
                  <span className="text-xs px-2 py-0.5 bg-admin-grey rounded-full">
                    {action.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}