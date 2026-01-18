import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Package, Box, Star, DollarSign, CheckCircle } from 'lucide-react';

/**
 * SidebarFilters Component - MOBILE OPTIMIZED
 * 
 * MOBILE CHANGES:
 * - Compact spacing and text sizes
 * - Touch-friendly tap targets
 * - Full-width modal layout
 * - Simplified visual hierarchy
 * - Collapsible sections with icons
 */
const SidebarFilters = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  availableTags = [],
  tagsLoading = false,
  metadata = {},
  itemType = 'all',
  onTypeChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    sort: true,
    price: true,
    stock: true,
    tags: true
  });

  const selectedTags = filters.tags
    ? filters.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
    : [];

  const hasActiveFilters = !!(
    filters.min_price ||
    filters.max_price ||
    filters.in_stock ||
    filters.tags ||
    (filters.sort && filters.sort !== 'created_at') ||
    (itemType && itemType !== 'all')
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTagChange = (tagName) => {
    const normalizedTagName = tagName.toLowerCase().trim();
    const isSelected = selectedTags.includes(normalizedTagName);
    
    const newSelectedTags = isSelected
      ? selectedTags.filter(t => t !== normalizedTagName)
      : [...selectedTags, normalizedTagName];
    
    const tagsString = newSelectedTags.join(',');
    
    onFilterChange('tags', tagsString);
  };

  const handleSortChange = (e) => {
    onFilterChange('sort', e.target.value);
  };

  const handleStockChange = (e) => {
    const value = e.target.checked ? 'true' : '';
    onFilterChange('in_stock', value);
  };

  const handleMinPriceChange = (e) => {
    onFilterChange('min_price', e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    onFilterChange('max_price', e.target.value);
  };

  const currentSort = filters.sort || 'created_at';
  const isStockChecked = filters.in_stock === 'true';

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-2.5 px-3 text-xs font-bold text-tppslate uppercase tracking-wide 
        hover:bg-tpppeach/20 transition-colors rounded-lg group active:scale-98"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-tpppink" />}
        <span>{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp size={14} className="text-tpppink group-hover:text-tppslate transition-colors" />
      ) : (
        <ChevronDown size={14} className="text-tpppink group-hover:text-tppslate transition-colors" />
      )}
    </button>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        
        {/* ITEM TYPE */}
        {onTypeChange && (
          <div className="space-y-2">
            <SectionHeader title="Item Type" section="type" icon={Box} />
            
            {expandedSections.type && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200 px-1">
                <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-slate-200
                  hover:border-tpppink hover:bg-tpppeach/20 transition-all cursor-pointer group
                  has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/30 has-[:checked]:shadow-sm active:scale-98">
                  <input
                    type="radio"
                    name="itemType"
                    value="all"
                    checked={itemType === 'all'}
                    onChange={() => onTypeChange('all')}
                    className="w-4 h-4 cursor-pointer accent-tpppink"
                  />
                  <Box size={14} className="text-tpppink flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-tpppink transition-colors">
                    All Items
                  </span>
                </label>

                <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-slate-200
                  hover:border-tpppink hover:bg-tpppeach/20 transition-all cursor-pointer group
                  has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/30 has-[:checked]:shadow-sm active:scale-98">
                  <input
                    type="radio"
                    name="itemType"
                    value="products"
                    checked={itemType === 'products'}
                    onChange={() => onTypeChange('products')}
                    className="w-4 h-4 cursor-pointer accent-tpppink"
                  />
                  <Package size={14} className="text-tpppink flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-tpppink transition-colors">
                    Products Only
                  </span>
                </label>

                <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-slate-200
                  hover:border-tpppink hover:bg-tpppeach/20 transition-all cursor-pointer group
                  has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/30 has-[:checked]:shadow-sm active:scale-98">
                  <input
                    type="radio"
                    name="itemType"
                    value="bundles"
                    checked={itemType === 'bundles'}
                    onChange={() => onTypeChange('bundles')}
                    className="w-4 h-4 cursor-pointer accent-tpppink"
                  />
                  <Package size={14} className="text-tpppink flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-tpppink transition-colors">
                    Bundles Only
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-tpppink/30 to-transparent" />

        {/* SORT BY */}
        <div className="space-y-2">
          <SectionHeader title="Sort By" section="sort" icon={Star} />
          
          {expandedSections.sort && (
            <div className="animate-in slide-in-from-top-2 duration-200 px-1">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="w-full px-3 py-2.5 text-xs bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                  hover:border-slate-300 transition-all text-slate-700 cursor-pointer font-bold
                  appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23d95669%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                  bg-[length:1.2em] bg-[right_0.7rem_center] bg-no-repeat pr-10
                  shadow-sm hover:shadow active:scale-98"
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

        <div className="h-px bg-gradient-to-r from-transparent via-tpppink/30 to-transparent" />

        {/* PRICE RANGE */}
        <div className="space-y-2">
          <SectionHeader title="Price Range" section="price" icon={DollarSign} />
          
          {expandedSections.price && (
            <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-200 px-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-tpppink">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={handleMinPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-7 pr-3 py-2.5 text-xs bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400 font-bold
                      shadow-sm hover:shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-tpppink">₹</span>
                  <input
                    type="number"
                    placeholder="9999"
                    value={filters.max_price || ''}
                    onChange={handleMaxPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-7 pr-3 py-2.5 text-xs bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink/50 focus:border-tpppink
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400 font-bold
                      shadow-sm hover:shadow"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-tpppink/30 to-transparent" />

        {/* AVAILABILITY */}
        <div className="space-y-2">
          <SectionHeader title="Availability" section="stock" icon={CheckCircle} />
          
          {expandedSections.stock && (
            <div className="animate-in slide-in-from-top-2 duration-200 px-1">
              <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-slate-200
                hover:border-tpppink hover:bg-tpppeach/20 transition-all cursor-pointer group
                has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/30 has-[:checked]:shadow-sm active:scale-98">
                <input
                  type="checkbox"
                  checked={isStockChecked}
                  onChange={handleStockChange}
                  className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink
                    focus:ring-2 focus:ring-tpppink/30 transition-all"
                />
                <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-tpppink transition-colors">
                  In Stock Only
                </span>
              </label>
            </div>
          )}
        </div>

        {/* TAGS */}
        {availableTags && availableTags.length > 0 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-tpppink/30 to-transparent" />
            
            <div className="space-y-2">
              <SectionHeader title="Tags" section="tags" icon={Package} />
              
              {expandedSections.tags && (
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200 px-1
                  scrollbar-thin scrollbar-thumb-tpppink/30 scrollbar-track-transparent">
                  {tagsLoading ? (
                    <div className="text-center py-6">
                      <div className="w-5 h-5 border-2 border-tpppink border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">Loading tags...</p>
                    </div>
                  ) : (
                    availableTags.map((tag) => {
                      const tagName = tag.name.toLowerCase().trim();
                      const isChecked = selectedTags.includes(tagName);
                      
                      return (
                        <label
                          key={tag.name}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 
                            cursor-pointer transition-all group border-2 border-transparent
                            hover:border-slate-200 has-[:checked]:border-tpppink has-[:checked]:bg-tpppeach/20 active:scale-98"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTagChange(tag.name)}
                            className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink
                              focus:ring-2 focus:ring-tpppink/30 transition-all"
                          />
                          <span className="text-xs text-slate-700 flex-1 font-medium group-hover:text-tpppink transition-colors">
                            {tag.label || tag.name}
                          </span>
                          {tag.count !== undefined && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full
                              group-hover:bg-tpppink/10 group-hover:text-tpppink transition-all min-w-[24px] text-center">
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

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-tpppink/30 to-transparent" />
            
            <div className="bg-gradient-to-br from-tpppeach/50 to-tpppeach/30 border-2 border-tpppink/30 
              rounded-lg p-3 shadow-sm">
              <p className="text-[10px] font-bold text-tpppink uppercase tracking-wider mb-2">
                Active Filters
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {itemType && itemType !== 'all' && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    {itemType === 'products' ? 'Products' : 'Bundles'}
                  </span>
                )}
                {filters.sort && filters.sort !== 'created_at' && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    Sorted
                  </span>
                )}
                {filters.min_price && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    Min: ₹{filters.min_price}
                  </span>
                )}
                {filters.max_price && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    Max: ₹{filters.max_price}
                  </span>
                )}
                {filters.in_stock && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    In Stock
                  </span>
                )}
                {selectedTags.length > 0 && (
                  <span className="px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-tpppink/20 font-bold">
                    {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>

      <style jsx>{`
        .active-scale-98:active {
          transform: scale(0.98);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SidebarFilters;