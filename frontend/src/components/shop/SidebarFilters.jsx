import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * SidebarFilters Component - Enhanced UI
 * 
 * FEATURES:
 * - Clean, compact professional design
 * - Clear All button in top right corner
 * - TPP Pink headings with collapsible sections (closed by default)
 * - TPP Pink horizontal rules for categorization
 * - Tag filtering support with counts
 * - Active filter indicators
 * - Smooth animations
 * - Sticky positioning
 * - Dynamic height container
 */
const SidebarFilters = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  availableTags = [],
  tagsLoading = false,
  metadata = {}
}) => {
  const [expandedSections, setExpandedSections] = useState({
    sort: false,
    price: false,
    stock: false,
    tags: false
  });

  // Get selected tags - Parse from comma-separated string
  const selectedTags = filters.tags
    ? filters.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [];

  const hasActiveFilters = !!(
    filters.min_price ||
    filters.max_price ||
    filters.in_stock ||
    filters.tags ||
    (filters.sort && filters.sort !== 'created_at')
  );

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle tag checkbox change
  const handleTagChange = (tagName) => {
    const normalizedTagName = tagName.toLowerCase().trim();
    const isSelected = selectedTags.includes(normalizedTagName);
    
    const newSelectedTags = isSelected
      ? selectedTags.filter(t => t !== normalizedTagName)
      : [...selectedTags, normalizedTagName];
    
    const tagsString = newSelectedTags.join(',');
    
    console.log('🏷️ Tag toggled:', {
      tagName: normalizedTagName,
      wasSelected: isSelected,
      newTags: newSelectedTags,
      tagsString
    });
    
    onFilterChange('tags', tagsString);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    onFilterChange('sort', e.target.value);
  };

  // Handle stock change
  const handleStockChange = (e) => {
    const value = e.target.checked ? 'true' : '';
    onFilterChange('in_stock', value);
  };

  // Handle price change
  const handleMinPriceChange = (e) => {
    onFilterChange('min_price', e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    onFilterChange('max_price', e.target.value);
  };

  const currentSort = filters.sort || 'created_at';
  const isStockChecked = filters.in_stock === 'true';

  const SectionHeader = ({ title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-2 text-xs font-bold text-tpppink uppercase tracking-wider hover:text-tpppink/80 transition-colors group"
    >
      <span>{title}</span>
      {expandedSections[section] ? (
        <ChevronUp size={16} className="text-tpppink/70 group-hover:text-tpppink transition-colors" />
      ) : (
        <ChevronDown size={16} className="text-tpppink/70 group-hover:text-tpppink transition-colors" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-lg overflow-hidden sticky top-40 max-h-screen flex flex-col">
      {/* Header with Clear All Button */}
      <div className="bg-gradient-to-r from-tpppeach to-white border-b-2 border-tpppink/20 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-tpppink uppercase tracking-wide">Filters</h2>
            {metadata?.totalCount !== undefined && (
              <p className="text-xs text-slate-500 mt-0.5">
                {metadata.totalCount} {metadata.totalCount === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
          
          {/* Clear All Button - Top Right */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-tpppink hover:text-white 
                hover:bg-tpppink transition-all px-3 py-1.5 rounded-lg border border-tpppink
                hover:shadow-md"
              title="Clear all active filters"
            >
              <span>Clear All</span>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">
        {/* SORT BY */}
        <div className="space-y-2">
          <SectionHeader title="Sort By" section="sort" />
          
          {expandedSections.sort && (
            <div className="animate-fade-in">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="w-full px-4 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                  hover:border-slate-300 transition-all text-slate-700 cursor-pointer font-medium
                  appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23d95669%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                  bg-[length:1.2em] bg-[right_0.7rem_center] bg-no-repeat pr-10
                  shadow-sm hover:shadow"
              >
                <option value="created_at">Newest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="title">Name: A to Z</option>
                <option value="discount_percent">Highest Discount</option>
              </select>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-tpppink/40 to-transparent" />

        {/* PRICE RANGE */}
        <div className="space-y-2">
          <SectionHeader title="Price Range" section="price" />
          
          {expandedSections.price && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-tpppink">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={handleMinPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400 font-medium
                      shadow-sm hover:shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-tpppink">₹</span>
                  <input
                    type="number"
                    placeholder="9999"
                    value={filters.max_price || ''}
                    onChange={handleMaxPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400 font-medium
                      shadow-sm hover:shadow"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-tpppink/40 to-transparent" />

        {/* AVAILABILITY */}
        <div className="space-y-2">
          <SectionHeader title="Availability" section="stock" />
          
          {expandedSections.stock && (
            <div className="animate-fade-in">
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-slate-200
                hover:border-tpppink hover:bg-tpppeach/30 transition-all cursor-pointer group
                has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/50 has-[:checked]:shadow-sm">
                <input
                  type="checkbox"
                  checked={isStockChecked}
                  onChange={handleStockChange}
                  className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink
                    focus:ring-2 focus:ring-tpppink/30 transition-all"
                />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-tpppink transition-colors">
                  In Stock Only
                </span>
              </label>
            </div>
          )}
        </div>

        {/* TAGS */}
        {availableTags && availableTags.length > 0 && (
          <>
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-tpppink/40 to-transparent" />
            
            <div className="space-y-2">
              <SectionHeader title="Tags" section="tags" />
              
              {expandedSections.tags && (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin animate-fade-in">
                  {tagsLoading ? (
                    <div className="text-center py-6">
                      <div className="w-5 h-5 border-2 border-tpppink border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 mt-2">Loading tags...</p>
                    </div>
                  ) : (
                    availableTags.map((tag) => {
                      const tagName = tag.name.toLowerCase().trim();
                      const isChecked = selectedTags.includes(tagName);
                      
                      return (
                        <label
                          key={tag.name}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 
                            cursor-pointer transition-all group border border-transparent
                            hover:border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTagChange(tag.name)}
                            className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink
                              focus:ring-2 focus:ring-tpppink/30 transition-all"
                          />
                          <span className="text-sm text-slate-700 flex-1 font-medium group-hover:text-tpppink transition-colors">
                            {tag.label || tag.name}
                          </span>
                          {tag.count !== undefined && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full
                              group-hover:bg-tpppink/10 group-hover:text-tpppink transition-all min-w-[28px] text-center">
                              {tag.count}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Active Filters Summary (bottom of scrollable area) */}
        {hasActiveFilters && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-tpppink/40 to-transparent" />
            
            <div className="bg-gradient-to-br from-tpppeach/50 to-tpppeach/30 border-2 border-tpppink/30 
              rounded-lg p-4 shadow-sm">
              <p className="text-xs font-bold text-tpppink uppercase tracking-wider mb-2">
                Active Filters
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {filters.sort && filters.sort !== 'created_at' && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded border border-tpppink/20 font-medium">
                    Sorted
                  </span>
                )}
                {filters.min_price && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded border border-tpppink/20 font-medium">
                    Min: ₹{filters.min_price}
                  </span>
                )}
                {filters.max_price && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded border border-tpppink/20 font-medium">
                    Max: ₹{filters.max_price}
                  </span>
                )}
                {filters.in_stock && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded border border-tpppink/20 font-medium">
                    In Stock
                  </span>
                )}
                {selectedTags.length > 0 && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded border border-tpppink/20 font-medium">
                    {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters;