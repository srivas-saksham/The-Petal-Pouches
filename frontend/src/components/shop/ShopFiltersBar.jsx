// frontend/src/components/shop/ShopFiltersBar.jsx - MOBILE OPTIMIZED WITH FRAMER MOTION

import React, { useState } from 'react';
import { LayoutGrid, Grid3x2, Grid3x3, ChevronDown, ChevronUp, Package, Box, Filter, X, Signature, PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ShopFiltersBar Component - MOBILE OPTIMIZED WITH ANIMATED TAB SWITCHER
 * 
 * MOBILE:
 * - Type tabs at top (ALL/PRODUCTS/BUNDLES) with sliding background animation
 * - Top 3 tags + "Show All" button
 * - Filter button to open sidebar
 * - Layout switcher HIDDEN
 * 
 * DESKTOP:
 * - All tags visible
 * - Layout switcher visible
 * - Type filter integrated with sliding background animation
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
    <div className="sticky top-12 lg:top-16 z-20 bg-white/95 dark:bg-tppdark/95 backdrop-blur-sm border-b border-slate-200 dark:border-tppdarkwhite/10 shadow-sm">
      
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden px-3 py-2">
        
        <div className="flex items-center justify-between gap-2 mb-2">
          {onTypeChange && (
            <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-tppdarkgray rounded-lg p-0.5 flex-1">
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute bg-tpppink dark:bg-tppdarkwhite rounded shadow-sm"
                style={{ height: 'calc(100% - 4px)', top: '2px' }}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                animate={{
                  left: itemType === 'all' ? '2px' : itemType === 'products' ? 'calc(33.333% + 1px)' : 'calc(66.666%)',
                  width: 'calc(33.333% - 4px)'
                }}
              />
              
              <button
                onClick={() => onTypeChange('all')}
                className={`relative z-10 flex-1 px-2 py-1.5 rounded text-[11px] font-bold transition-colors duration-200 active:scale-95 ${
                  itemType === 'all' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => onTypeChange('products')}
                className={`relative z-10 flex-1 px-2 py-1.5 rounded text-[11px] font-bold transition-colors duration-200 active:scale-95 ${
                  itemType === 'products' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                SIGNATURES
              </button>
              <button
                onClick={() => onTypeChange('bundles')}
                className={`relative z-10 flex-1 px-2 py-1.5 rounded text-[11px] font-bold transition-colors duration-200 active:scale-95 ${
                  itemType === 'bundles' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                HAMPERS
              </button>
            </div>
          )}

          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-transform relative"
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-white dark:bg-tppdark text-tpppink dark:text-tppdarkwhite rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold border border-tpppink dark:border-tppdarkwhite shadow-sm">
                  !
                </span>
              )}
            </button>
          )}
        </div>

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
                      ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark shadow-sm' 
                      : 'bg-white dark:bg-tppdarkgray text-slate-700 dark:text-tppdarkwhite/70 border border-slate-300 dark:border-tppdarkwhite/20 hover:border-tpppink dark:hover:border-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite'
                  }`}
                >
                  {tag.label}
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/30 dark:bg-tppdark/30' : 'bg-slate-100 dark:bg-tppdarkwhite/10'
                  }`}>
                    {tag.count}
                  </span>
                </button>
              );
            })}
            
            {hasMoreTags && !showAllTags && (
              <button
                onClick={() => setShowAllTags(true)}
                className="flex-shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-tppdarkgray text-slate-600 dark:text-tppdarkwhite/60 rounded-full hover:bg-slate-200 dark:hover:bg-tppdarkwhite/10 active:scale-95 transition-all"
              >
                +{availableTags.length - 3} more
              </button>
            )}

            {showAllTags && (
              <button
                onClick={() => setShowAllTags(false)}
                className="flex-shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-tppdarkgray text-slate-600 dark:text-tppdarkwhite/60 rounded-full hover:bg-slate-200 dark:hover:bg-tppdarkwhite/10 active:scale-95 transition-all"
              >
                Show Less
              </button>
            )}

            {selectedTags.length > 0 && (
              <button
                onClick={() => onTagClick(null)}
                className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/30 active:scale-95 transition-all"
              >
                <X size={10} />
                Clear
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 h-7 w-20 bg-slate-100 dark:bg-tppdarkwhite/10 rounded-full animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block px-6 py-3">
        <div className="flex items-center gap-3">
          
          {onTypeChange && (
            <div className="relative flex items-center gap-1 bg-white dark:bg-tppdarkgray backdrop-blur-md rounded-lg p-1 border-2 border-slate-200 dark:border-tppdarkwhite/10 shadow-md flex-shrink-0">
              <button
                onClick={() => onTypeChange('all')}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                  itemType === 'all' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                {itemType === 'all' && (
                  <motion.div
                    layoutId="desktop-tab-bg"
                    className="absolute inset-0 bg-tpppink dark:bg-tppdarkwhite rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
                  />
                )}
                <Box size={14} className="relative z-10" />
                <span className="relative z-10">All</span>
              </button>
              <button
                onClick={() => onTypeChange('products')}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                  itemType === 'products' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                {itemType === 'products' && (
                  <motion.div
                    layoutId="desktop-tab-bg"
                    className="absolute inset-0 bg-tpppink dark:bg-tppdarkwhite rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
                  />
                )}
                <Signature size={14} className="relative z-10" />
                <span className="relative z-10">Signatures</span>
              </button>
              <button
                onClick={() => onTypeChange('bundles')}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                  itemType === 'bundles' ? 'text-white dark:text-tppdark' : 'text-slate-600 dark:text-tppdarkwhite/60'
                }`}
              >
                {itemType === 'bundles' && (
                  <motion.div
                    layoutId="desktop-tab-bg"
                    className="absolute inset-0 bg-tpppink dark:bg-tppdarkwhite rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
                  />
                )}
                <PackageOpen size={14} className="relative z-10" />
                <span className="relative z-10">Hampers</span>
              </button>
            </div>
          )}

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
                          ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark border-2 border-tpppink dark:border-tppdarkwhite' 
                          : 'bg-white dark:bg-tppdarkgray text-slate-700 dark:text-tppdarkwhite/70 border-2 border-slate-300 dark:border-tppdarkwhite/20 hover:border-tpppink dark:hover:border-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite hover:bg-pink-50 dark:hover:bg-tppdarkwhite/5 hover:shadow-lg'
                        }
                      `}
                    >
                      <span>{tag.label}</span>
                      <span className={`
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${isSelected 
                          ? 'bg-white/30 dark:bg-tppdark/30 text-white dark:text-tppdarkwhite' 
                          : 'bg-slate-100 dark:bg-tppdarkwhite/10 text-slate-600 dark:text-tppdarkwhite/50'
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
                    className="flex-shrink-0 text-xs text-white dark:text-tppdark font-bold px-3 py-1.5 whitespace-nowrap 
                      bg-tpppink dark:bg-tppdarkwhite backdrop-blur-md rounded-full shadow-md border-2 border-tpppink dark:border-tppdarkwhite 
                      hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 hover:shadow-lg transition-all"
                  >
                    Clear all
                  </button>
                )}
              </div>
            ) : loading ? (
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 h-8 w-20 bg-white dark:bg-tppdarkgray backdrop-blur-md rounded-full animate-pulse shadow-md border-2 border-slate-200 dark:border-tppdarkwhite/10" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-tppdarkgray rounded-md p-0.5 border border-slate-200 dark:border-tppdarkwhite/10 flex-shrink-0">
            <button
              onClick={() => onLayoutChange('4')}
              className={`p-1.5 rounded transition-all ${
                layoutMode === '4'
                  ? 'bg-white dark:bg-tppdark text-tpppink dark:text-tppdarkwhite shadow-sm border border-tpppink dark:border-tppdarkwhite'
                  : 'text-slate-500 dark:text-tppdarkwhite/40 hover:text-slate-700 dark:hover:text-tppdarkwhite hover:bg-white/50 dark:hover:bg-tppdarkwhite/5'
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
                  ? 'bg-white dark:bg-tppdark text-tpppink dark:text-tppdarkwhite shadow-sm border border-tpppink dark:border-tppdarkwhite'
                  : 'text-slate-500 dark:text-tppdarkwhite/40 hover:text-slate-700 dark:hover:text-tppdarkwhite hover:bg-white/50 dark:hover:bg-tppdarkwhite/5'
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
                  ? 'bg-white dark:bg-tppdark text-tpppink dark:text-tppdarkwhite shadow-sm border border-tpppink dark:border-tppdarkwhite'
                  : 'text-slate-500 dark:text-tppdarkwhite/40 hover:text-slate-700 dark:hover:text-tppdarkwhite hover:bg-white/50 dark:hover:bg-tppdarkwhite/5'
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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ShopFiltersBar;