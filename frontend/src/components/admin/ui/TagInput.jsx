// frontend/src/components/admin/u/TagInput.jsx - INTERACTIVE TAG INPUT FOR ADMINS

import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * TagInput Component
 * 
 * FEATURES:
 * - Admin types tag and presses Enter to add
 * - Each tag displays as a small div with X button
 * - First tag is primary (can be styled differently)
 * - Returns CSV string when needed
 * - Beautiful, responsive UI
 * 
 * @param {Array<string>} initialTags - Initial tags (default: [])
 * @param {Function} onChange - Callback when tags change, returns CSV string
 * @param {string} placeholder - Input placeholder
 * @param {number} maxTags - Maximum tags allowed (default: 10)
 * 
 * @example
 * <TagInput 
 *   initialTags={["birthday", "gift"]}
 *   onChange={(tagsCSV) => console.log(tagsCSV)}
 *   placeholder="Enter tag and press Enter"
 *   maxTags={10}
 * />
 */
const TagInput = ({ 
  initialTags = [], 
  onChange, 
  placeholder = "Enter tag and press Enter",
  maxTags = 10,
  label = "Tags"
}) => {
  const [tags, setTags] = useState(initialTags || []);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  /**
   * Handle Enter key - add tag
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  /**
   * Add tag from input value
   */
  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    // Validation
    if (!trimmedValue) {
      setError('Tag cannot be empty');
      return;
    }

    if (trimmedValue.length < 2) {
      setError('Tag must be at least 2 characters');
      return;
    }

    if (trimmedValue.length > 20) {
      setError('Tag must be less than 20 characters');
      return;
    }

    if (tags.includes(trimmedValue)) {
      setError('This tag already exists');
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Check if only letters, numbers, hyphens
    if (!/^[a-z0-9-]+$/.test(trimmedValue)) {
      setError('Tags can only contain letters, numbers, and hyphens');
      return;
    }

    // Add tag
    const newTags = [...tags, trimmedValue];
    setTags(newTags);
    setInputValue('');
    setError('');

    // Call onChange with CSV format
    if (onChange) {
      onChange(newTags.join(','));
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  /**
   * Remove tag by index
   */
  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setError('');

    // Call onChange with CSV format
    if (onChange) {
      onChange(newTags.join(','));
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  /**
   * Clear all tags
   */
  const clearAllTags = () => {
    setTags([]);
    setInputValue('');
    setError('');

    if (onChange) {
      onChange('');
    }
  };

  const primaryTag = tags[0] || null;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-semibold text-tppslate mb-2">
        {label}
        <span className="text-xs text-slate-500 ml-1">(First tag is primary)</span>
      </label>

      {/* Main Container */}
      <div className="border-2 border-slate-200 rounded-lg p-4 bg-white focus-within:border-tpppink transition-colors">
        
        {/* Tags Display Area */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
          {tags.length === 0 ? (
            <span className="text-slate-400 text-sm py-1">No tags yet</span>
          ) : (
            tags.map((tag, index) => (
              <div
                key={index}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${
                    index === 0
                      ? 'bg-tpppink text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }
                  hover:shadow-md
                `}
              >
                {/* Tag Label */}
                <span>
                  {tag}
                  {index === 0 && (
                    <span className="ml-1 text-xs opacity-75">(primary)</span>
                  )}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() => removeTag(index)}
                  className={`
                    flex items-center justify-center w-5 h-5 rounded-full
                    transition-all duration-200
                    ${
                      index === 0
                        ? 'hover:bg-white/20 text-white'
                        : 'hover:bg-slate-300 text-slate-700'
                    }
                    active:scale-90
                  `}
                  title={`Remove ${tag}`}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(''); // Clear error on new input
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength="20"
            className={`
              flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
              transition-all duration-200
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
            `}
          />

          {/* Add Button */}
          <button
            onClick={addTag}
            disabled={tags.length >= maxTags}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm
              transition-all duration-200
              ${
                tags.length >= maxTags
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-tpppink text-white hover:bg-tpppink/90 active:scale-95'
              }
            `}
            type="button"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠️</span>
            {error}
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
          <span>
            {tags.length} / {maxTags} tags
          </span>
          {tags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="text-tpppink hover:text-tpppink/80 font-medium transition-colors"
              type="button"
            >
              Clear all
            </button>
          )}
        </div>

        {/* CSV Output (for debugging - can be removed) */}
        {tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-500 mb-1">CSV Output:</div>
            <div className="bg-slate-50 px-3 py-2 rounded border border-slate-200 font-mono text-xs text-slate-700 break-all">
              {tags.join(',')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput;