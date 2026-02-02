// frontend/src/components/admin/coupons/CategorySelector.jsx
/**
 * Category Selector Component
 * Multi-select dropdown for selecting eligible categories
 * ⭐ FIXED: Uses correct API base URL
 */

import React, { useState, useEffect } from 'react';
import { Tag, X, Loader, AlertCircle } from 'lucide-react';

const CategorySelector = ({ 
  selectedCategoryIds = [], 
  onChange, 
  disabled = false 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ⭐ Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rizarabackend.vercel.app';

  // Fetch all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      // ⭐ FIXED: Use full backend URL
      const response = await fetch(`${API_BASE_URL}/api/categories`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get selected categories details
  const selectedCategories = categories.filter(c => 
    selectedCategoryIds.includes(c.id)
  );

  // Toggle category selection
  const handleToggleCategory = (categoryId) => {
    if (selectedCategoryIds.includes(categoryId)) {
      // Remove from selection
      onChange(selectedCategoryIds.filter(id => id !== categoryId));
    } else {
      // Add to selection
      onChange([...selectedCategoryIds, categoryId]);
    }
  };

  // Remove category chip
  const handleRemoveCategory = (categoryId) => {
    onChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-tppslate">
          Eligible Categories *
        </label>
        {selectedCategoryIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
          >
            Clear All ({selectedCategoryIds.length})
          </button>
        )}
      </div>

      {/* Selected Categories Chips */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-2 border-slate-200 rounded-lg">
          {selectedCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-tpppink/30 rounded-lg text-sm"
            >
              <Tag className="w-3 h-3 text-tpppink" />
              <span className="text-slate-700 font-medium">{category.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                disabled={disabled}
                className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category List */}
      <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled || loading}
          className="w-full px-4 py-3 bg-white text-left text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:bg-slate-50 disabled:text-slate-400 flex items-center justify-between"
        >
          <span>
            {selectedCategoryIds.length > 0 
              ? `${selectedCategoryIds.length} category selected` + (selectedCategoryIds.length !== 1 ? 'ies' : '')
              : 'Select categories...'}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Content */}
        {showDropdown && !loading && !error && (
          <div className="border-t-2 border-slate-200 max-h-64 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No categories found
              </div>
            ) : (
              categories.map(category => {
                const isSelected = selectedCategoryIds.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 disabled:opacity-50 ${
                      isSelected ? 'bg-tpppink/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected 
                          ? 'bg-tpppink border-tpppink' 
                          : 'border-slate-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {category.description}
                          </p>
                        )}
                      </div>

                      {/* Product Count (if available) */}
                      {category.product_count !== undefined && (
                        <div className="text-xs text-slate-400">
                          {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 text-center">
          <Loader className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">Loading categories...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">
              Failed to load categories
            </p>
            <p className="text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchCategories}
              className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Select one or more categories eligible for this coupon. All products in these categories will be eligible.
      </p>
    </div>
  );
};

export default CategorySelector;