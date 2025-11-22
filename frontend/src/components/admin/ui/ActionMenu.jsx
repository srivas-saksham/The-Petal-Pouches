// frontend/src/components/admin/ui/ActionMenu.jsx

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ actions = [], position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate if dropdown should open upward or downward
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate space below and above
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // If not enough space below but enough space above, open upward
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute right-0 z-50 min-w-[180px] bg-white rounded-lg shadow-lg 
            border border-gray-200 py-1 animate-in fade-in duration-100
            ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}
        >
          {actions.map((action, index) => {
            // Render divider
            if (action.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="h-px bg-gray-200 my-1"
                />
              );
            }

            // Render action item
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center gap-3
                  transition-colors
                  ${action.danger 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {action.icon && (
                  <span className={action.danger ? 'text-red-600' : 'text-gray-500'}>
                    {action.icon}
                  </span>
                )}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}