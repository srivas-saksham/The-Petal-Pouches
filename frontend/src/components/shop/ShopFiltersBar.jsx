// frontend/src/components/shop/ShopFiltersBar.jsx
import React, { useState } from 'react';
import { LayoutGrid, Grid3x2, Grid3x3, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ShopFiltersBar Component - Tags and Layout Controls
 * 
 * FEATURES:
 * - Tag filtering with counts
 * - Show All / Show Less toggle for tags
 * - Layout switcher (4, 5, 6 columns)
 * - Matches ShopHeader.jsx UI exactly
 */
const ShopFiltersBar = ({
  availableTags = [],
  selectedTags = [],
  onTagClick,
  loading = false,
  layoutMode = '4',
  onLayoutChange,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  // Determine which tags to show
  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 3);
  const hasMoreTags = availableTags.length > 3;

  return (
    <div className="sticky top-16 z-20 px-6 py-3 bg-transparent backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Tags Pills */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          {!loading && availableTags.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {visibleTags.map((tag) => {
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
              
              {/* Show All / Show Less Toggle */}
              {hasMoreTags && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 
                    whitespace-nowrap rounded-full border-2 border-slate-300 bg-white text-slate-700
                    hover:border-tpppink hover:text-tpppink hover:bg-pink-50 transition-all shadow-md"
                >
                  <span>{showAllTags ? 'Show Less' : `Show All (${availableTags.length})`}</span>
                  {showAllTags ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
              
              {/* Clear Tags Button */}
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

        {/* Grid Layout Switcher */}
        <div className="flex items-center gap-1 bg-transparent rounded-md p-0.5 flex-shrink-0">
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

      {/* Custom Scrollbar Hide Styles */}
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