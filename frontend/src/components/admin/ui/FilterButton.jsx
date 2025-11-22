// frontend/src/components/admin/ui/FilterButton.jsx

import { Filter, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function FilterButton({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== '' && activeFilters[key] !== null
  ).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const handleClearAll = () => {
    if (onClearFilters) {
      onClearFilters();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          btn btn-outline flex items-center gap-2 relative
          ${activeCount > 0 ? 'border-admin-pink text-admin-pink' : ''}
        `}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-admin-pink text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-hover border border-border z-50 animate-scale-in">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Filters</h3>
              {activeCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-admin-pink hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Filter Options */}
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {filter.label}
                  </label>
                  {filter.type === 'select' ? (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="form-input w-full text-sm"
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'range' ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={activeFilters[`${filter.key}_min`] || ''}
                        onChange={(e) =>
                          handleFilterChange(`${filter.key}_min`, e.target.value)
                        }
                        className="form-input w-full text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={activeFilters[`${filter.key}_max`] || ''}
                        onChange={(e) =>
                          handleFilterChange(`${filter.key}_max`, e.target.value)
                        }
                        className="form-input w-full text-sm"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Apply Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}