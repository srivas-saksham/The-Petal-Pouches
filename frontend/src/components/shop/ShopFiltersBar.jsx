// frontend/src/components/shop/ShopFiltersBar.jsx - MOBILE OPTIMIZED

import React, { useState } from 'react';
import { LayoutGrid, Grid3x2, Grid3x3, ChevronDown, ChevronUp, Package, Box, Filter, X } from 'lucide-react';

/**
 * ShopFiltersBar Component - MOBILE OPTIMIZED
 * 
 * MOBILE:
 * - Type tabs at top (ALL/PRODUCTS/BUNDLES)
 * - Top 3 tags + "Show All" button
 * - Filter button to open sidebar
 * - Layout switcher HIDDEN
 * 
 * DESKTOP:
 * - All tags visible
 * - Layout switcher visible
 * - Type filter integrated
 */
const ShopFiltersBar = ({
  availableTags = [],
  selectedTags = [],
  onTagClick,
  loading = false,
  layoutMode = '5',
  onLayoutChange,
  itemType = 'all',
  onTypeChange,
  onOpenFilters, // NEW: Callback to open mobile filter sidebar
  hasActiveFilters = false, // NEW: Show indicator on filter button
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  // Mobile: Show only top 3 tags
  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 3);
  const hasMoreTags = availableTags.length > 3;

  return (
    <div className="sticky top-12 lg:top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      
      {/* ⭐ MOBILE LAYOUT */}
      <div className="lg:hidden px-3 py-2">
        
        {/* Row 1: Type Tabs + Filter Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Type Tabs */}
          {onTypeChange && (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-1">
              <button
                onClick={() => onTypeChange('all')}
                className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 ${
                  itemType === 'all'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => onTypeChange('products')}
                className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 ${
                  itemType === 'products'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                PRODUCTS
              </button>
              <button
                onClick={() => onTypeChange('bundles')}
                className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 ${
                  itemType === 'bundles'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                BUNDLES
              </button>
            </div>
          )}

          {/* Filter Button */}
          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-tpppink text-white rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-transform relative"
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-white text-tpppink rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold border border-tpppink shadow-sm">
                  !
                </span>
              )}
            </button>
          )}
        </div>

        {/* Row 2: Top 3 Tags */}
        {!loading && availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {visibleTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.name}
                  onClick={() => onTagClick(tag.name)}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
                    isSelected 
                      ? 'bg-tpppink text-white shadow-sm' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-tpppink hover:text-tpppink'
                  }`}
                >
                  {tag.label}
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/30' : 'bg-slate-100'
                  }`}>
                    {tag.count}
                  </span>
                </button>
              );
            })}
            
            {/* Show All Button */}
            {hasMoreTags && !showAllTags && (
              <button
                onClick={() => setShowAllTags(true)}
                className="flex-shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
              >
                +{availableTags.length - 3} more
              </button>
            )}

            {/* Show Less Button */}
            {showAllTags && (
              <button
                onClick={() => setShowAllTags(false)}
                className="flex-shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
              >
                Show Less
              </button>
            )}

            {/* Clear All */}
            {selectedTags.length > 0 && (
              <button
                onClick={() => onTagClick(null)}
                className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 active:scale-95 transition-all"
              >
                <X size={10} />
                Clear
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 h-7 w-20 bg-slate-100 rounded-full animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* ⭐ DESKTOP LAYOUT */}
      <div className="hidden lg:block px-6 py-3">
        <div className="flex items-center gap-3">
          
          {/* Type Toggle - Desktop */}
          {onTypeChange && (
            <div className="flex items-center gap-1 bg-white backdrop-blur-md rounded-lg p-1 border-2 border-slate-200 shadow-md flex-shrink-0">
              <button
                onClick={() => onTypeChange('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  itemType === 'all'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Box size={14} />
                All
              </button>
              <button
                onClick={() => onTypeChange('products')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  itemType === 'products'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package size={14} />
                Products
              </button>
              <button
                onClick={() => onTypeChange('bundles')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  itemType === 'bundles'
                    ? 'bg-tpppink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package size={14} />
                Bundles
              </button>
            </div>
          )}

          {/* Tags Pills - Desktop */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            {!loading && availableTags.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.name}
                      onClick={() => onTagClick(tag.name)}
                      className={`
                        flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold
                        transition-all whitespace-nowrap shadow-md backdrop-blur-md
                        ${isSelected 
                          ? 'bg-tpppink text-white border-2 border-tpppink' 
                          : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-pink-50 hover:shadow-lg'
                        }
                      `}
                    >
                      <span>{tag.label}</span>
                      <span className={`
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${isSelected 
                          ? 'bg-white/30 text-white' 
                          : 'bg-slate-100 text-slate-600'
                        }
                      `}>
                        {tag.count}
                      </span>
                    </button>
                  );
                })}
                
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => onTagClick(null)}
                    className="flex-shrink-0 text-xs text-white font-bold px-3 py-1.5 whitespace-nowrap 
                      bg-tpppink backdrop-blur-md rounded-full shadow-md border-2 border-tpppink 
                      hover:bg-tpppink/90 hover:shadow-lg transition-all"
                  >
                    Clear all
                  </button>
                )}
              </div>
            ) : loading ? (
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 h-8 w-20 bg-white backdrop-blur-md rounded-full animate-pulse shadow-md border-2 border-slate-200"
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Grid Layout Switcher - Desktop Only */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 border border-slate-200 flex-shrink-0">
            <button
              onClick={() => onLayoutChange('4')}
              className={`p-1.5 rounded transition-all ${
                layoutMode === '4'
                  ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
              title="4 Column Layout"
              aria-label="4 Column Layout"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onLayoutChange('5')}
              className={`p-1.5 rounded transition-all ${
                layoutMode === '5'
                  ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
              title="5 Column Layout"
              aria-label="5 Column Layout"
            >
              <Grid3x2 size={16} />
            </button>
            <button
              onClick={() => onLayoutChange('6')}
              className={`p-1.5 rounded transition-all ${
                layoutMode === '6'
                  ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
              title="6 Column Layout"
              aria-label="6 Column Layout"
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ShopFiltersBar;