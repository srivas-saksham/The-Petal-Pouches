// frontend/src/components/admin/ui/SearchBar.jsx

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
  debounceDelay = 500, // Add configurable delay (default 500ms)
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value); // Local state for immediate UI update

  // Sync local value when prop changes (for external resets)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce effect - triggers onChange after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange({ target: { value: localValue } });
      }
    }, debounceDelay);

    // Cleanup: clear timeout if user keeps typing
    return () => clearTimeout(timer);
  }, [localValue, debounceDelay]); // Runs when localValue changes

  const handleClear = () => {
    setLocalValue(''); // Clear local state
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
        flex items-center gap-2 px-3 py-2 bg-white border rounded-lg
        transition-all duration-200
        ${isFocused ? 'border-admin-pink ring-2 ring-admin-pink ring-opacity-20' : 'border-border'}
      `}
      >
        <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
        <input
          type="text"
          value={localValue} // Use local state for instant feedback
          onChange={(e) => setLocalValue(e.target.value)} // Update local state immediately
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-text-primary placeholder:text-text-muted bg-transparent"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-0.5 hover:bg-surface rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
          </button>
        )}
      </div>
    </div>
  );
}