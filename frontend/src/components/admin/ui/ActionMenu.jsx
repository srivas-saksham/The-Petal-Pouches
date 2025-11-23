// frontend/src/components/admin/ui/ActionMenu.jsx

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ActionMenu({ actions = [], position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const rowRef = useRef(null);

  // Find and store reference to parent table row
  useEffect(() => {
    if (buttonRef.current) {
      rowRef.current = buttonRef.current.closest('tr');
    }
  }, []);

  // Calculate dropdown position - ALWAYS opens downward
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      setDropdownPosition({
        top: buttonRect.bottom + 8, // Always 8px below the button
        left: buttonRect.right - 180, // Align to right edge
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  // Apply hover effect to row when hovering menu or menu is open
  useEffect(() => {
    if (rowRef.current) {
      if (isHoveringMenu || isOpen) {
        // Add peach background
        rowRef.current.classList.add('!bg-tpppeach', '!bg-opacity-100');
      } else {
        // Remove peach background
        rowRef.current.classList.remove('!bg-tpppeach', '!bg-opacity-100');
      }
    }
  }, [isHoveringMenu, isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsHoveringMenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        setIsHoveringMenu(false);
      };
    }
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
    setIsHoveringMenu(false);
  };

  return (
    <>
      <div className="relative inline-block">
        {/* Three dots button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHoveringMenu(true)}
          onMouseLeave={() => setIsHoveringMenu(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Actions menu"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Dropdown menu - rendered with portal, ALWAYS opens downward */}
      {isOpen && dropdownPosition && createPortal(
        <div
          ref={menuRef}
          onMouseEnter={() => setIsHoveringMenu(true)}
          onMouseLeave={() => setIsHoveringMenu(false)}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999,
          }}
          className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in duration-100"
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
        </div>,
        document.body
      )}
    </>
  );
}