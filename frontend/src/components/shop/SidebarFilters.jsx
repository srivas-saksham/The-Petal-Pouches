import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

/**
 * SidebarFilters Component - Enhanced Professional Version
 * 
 * FEATURES:
 * - Clean, compact professional design
 * - All filters from ShopFilters.jsx
 * - Sticky bottom: scrolls naturally until bottom is visible, then sticks
 * - Collapsible sections
 * - Tag filtering support
 * - Active filter indicators
 * - Debounced search
 */
const SidebarFilters = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  availableTags = [],
  tagsLoading = false,
  metadata = {}
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    sort: true,
    price: true,
    stock: true,
    tags: true
  });
  const debounceTimerRef = useRef(null);

  // Sync search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Get selected tags
  const selectedTags = filters.tags
    ? filters.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : [];

  const hasActiveFilters = !!(
    filters.search ||
    filters.min_price ||
    filters.max_price ||
    filters.in_stock ||
    filters.tags ||
    (filters.sort && filters.sort !== 'created_at')
  );

  // Handle search input with debouncing
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onFilterChange('search', value);
      setIsSearching(false);
    }, 500);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setIsSearching(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onFilterChange('search', '');
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle tag checkbox change
  const handleTagChange = (tagName) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];

    onFilterChange('tags', newSelectedTags.join(','));
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

  const SectionHeader = ({ title, section, icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-700 uppercase tracking-wide hover:text-tpppink transition-colors group"
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-slate-500 group-hover:text-tpppink transition-colors">{icon}</span>}
        {title}
      </span>
      {expandedSections[section] ? (
        <ChevronUp size={14} className="text-slate-400" />
      ) : (
        <ChevronDown size={14} className="text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-white border-l-2 border-slate-200 shadow-sm rounded-lg overflow-hidden sticky bottom-0 self-end">
      <div className="bg-white border-b-2 border-slate-200 px-6 py-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Filters</h2>
        {metadata?.totalCount !== undefined && (
          <p className="text-xs text-slate-500 mt-1">
            {metadata.totalCount} {metadata.totalCount === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* SEARCH */}
        <div>
          <SectionHeader title="Search" section="search" />
          {expandedSections.search && (
            <div className="mt-3">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isSearching ? 'text-tpppink animate-pulse' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search bundles..."
                  value={searchInput}
                  onChange={handleSearchInput}
                  className="w-full pl-9 pr-9 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                    hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tpppink transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200" />

        {/* SORT */}
        <div>
          <SectionHeader title="Sort By" section="sort" />
          {expandedSections.sort && (
            <div className="mt-3">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="w-full px-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                  hover:border-slate-300 transition-all text-slate-700 cursor-pointer
                  appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] 
                  bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
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

        <div className="border-t border-slate-200" />

        {/* PRICE RANGE */}
        <div>
          <SectionHeader title="Price Range" section="price" />
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={handleMinPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="9999"
                    value={filters.max_price || ''}
                    onChange={handleMaxPriceChange}
                    min="0"
                    step="1"
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent
                      hover:border-slate-300 transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200" />

        {/* STOCK */}
        <div>
          <SectionHeader title="Availability" section="stock" />
          {expandedSections.stock && (
            <div className="mt-3">
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-slate-200
                hover:border-tpppink hover:bg-slate-50 transition-all cursor-pointer
                has-[:checked]:border-tpppink has-[:checked]:bg-tpppink/5">
                <input
                  type="checkbox"
                  checked={isStockChecked}
                  onChange={handleStockChange}
                  className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink"
                />
                <span className="text-sm font-medium text-slate-700">In Stock Only</span>
              </label>
            </div>
          )}
        </div>

        {/* TAGS */}
        {availableTags && availableTags.length > 0 && (
          <>
            <div className="border-t border-slate-200" />
            <div>
              <SectionHeader title="Tags" section="tags" />
              {expandedSections.tags && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {tagsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-4 h-4 border-2 border-tpppink border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    availableTags.map((tag) => (
                      <label
                        key={tag.name}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.name)}
                          onChange={() => handleTagChange(tag.name)}
                          className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer accent-tpppink"
                        />
                        <span className="text-sm text-slate-700 flex-1">
                          {tag.name}
                        </span>
                        {tag.count !== undefined && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {tag.count}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ACTIVE FILTERS */}
        {hasActiveFilters && (
          <>
            <div className="border-t border-slate-200" />
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-tpppink" />
                  Active Filters
                </span>
              </div>
              <button
                onClick={onResetFilters}
                className="w-full text-sm font-semibold text-tpppink hover:text-white hover:bg-tpppink 
                  transition-all py-2 px-3 rounded-lg border-2 border-tpppink"
              >
                Clear All Filters
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters;