// frontend/src/pages/ShopNew.jsx - DYNAMIC TAGS FROM BUNDLES

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Grid3x2, Grid2x2, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';
import BundleGrid from '../components/shop/BundleGrid';
import BundleEmpty from '../components/shop/BundleEmpty';
import SidebarFilters from '../components/shop/SidebarFilters';
import useBundleFilters from '../hooks/useBundleFilters';
import bundleService from '../services/bundleService';
import { useCart } from '../hooks/useCart';

/**
 * BundleShop Component - FULL WIDTH LAYOUT
 * 
 * FEATURES:
 * - Extracts all unique tags from fetched bundles
 * - Shows tag counts based on actual bundle data
 * - Dynamic tag filtering that updates as bundles change
 */
const BundleShop = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Layout state - load from localStorage or default to '4'
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('bundleLayoutMode') || '4';
  });
  
  // Cart Context
  const { cartItems, refreshCart } = useCart();

  // Use filter hook
  const {
    filters,
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setPage,
    setTags,
    resetFilters,
    hasActiveFilters,
    getApiParams
  } = useBundleFilters();

  // Save layout preference to localStorage
  useEffect(() => {
    localStorage.setItem('bundleLayoutMode', layoutMode);
  }, [layoutMode]);

  // Extract unique tags from bundles
  const extractTagsFromBundles = (bundlesData) => {
    console.log('🏷️ Extracting tags from bundles...');
    
    const tagCounts = {};
    
    bundlesData.forEach(bundle => {
      if (bundle.tags && Array.isArray(bundle.tags)) {
        bundle.tags.forEach(tag => {
          if (tag && tag.trim()) {
            const normalizedTag = tag.toLowerCase().trim();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array format with counts, sorted by count (descending)
    const tagsArray = Object.entries(tagCounts)
      .map(([name, count]) => ({
        name,
        count,
        label: name.charAt(0).toUpperCase() + name.slice(1) // Capitalize first letter
      }))
      .sort((a, b) => b.count - a.count);

    console.log('✅ Extracted tags:', tagsArray);
    return tagsArray;
  };

  // Fetch bundles
  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiParams = getApiParams();
        console.log('📤 Fetching bundles with params:', apiParams);
        
        const response = await bundleService.getAllBundles(apiParams);
        
        console.log('📥 Received response:', response);
        
        const bundlesData = response.data || [];
        setBundles(bundlesData);
        setMetadata(response.metadata);

        // Extract tags from bundles
        const extractedTags = extractTagsFromBundles(bundlesData);
        setAvailableTags(extractedTags);
        
      } catch (err) {
        console.error('❌ Failed to fetch bundles:', err);
        setError(err.message || 'Failed to load bundles');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [filters, getApiParams]);

  // Handle layout change
  const handleLayoutChange = (mode) => {
    setLayoutMode(mode);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log(`🔧 Filter change: ${filterType} = ${value}`);
    
    switch (filterType) {
      case 'search':
        setSearch(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'min_price':
        setPriceRange(value, filters.max_price);
        break;
      case 'max_price':
        setPriceRange(filters.min_price, value);
        break;
      case 'in_stock':
        setInStock(value);
        break;
      case 'tags':
        setTags(value);
        break;
      default:
        console.warn('Unknown filter type:', filterType);
        break;
    }
  };

  // Handle tag click (toggle tag in filters)
  const handleTagClick = (tagName) => {
    const currentTags = filters.tags 
      ? filters.tags.split(',').filter(t => t.trim())
      : [];
    
    const isSelected = currentTags.includes(tagName);
    const newTags = isSelected
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    
    handleFilterChange('tags', newTags.join(','));
  };

  // Get currently selected tags
  const selectedTags = filters.tags 
    ? filters.tags.split(',').filter(t => t.trim())
    : [];

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/30"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* HEADER - Full Width */}
        <div className="bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4">
            {/* Title & Results Count */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <LayoutGrid className="w-7 h-7 text-tpppink" />
                  Bundle Collections
                </h1>
                {!loading && metadata && (
                  <p className="text-xs text-slate-600 mt-1.5">
                    Showing {bundles.length} of {metadata.totalCount} bundles
                    {filters.page > 1 && ` • Page ${filters.page} of ${metadata.totalPages}`}
                  </p>
                )}
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border-2 border-slate-200">
                <button
                  onClick={() => handleLayoutChange('4')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '4'
                      ? 'bg-white text-tpppink shadow-sm border-2 border-tpppink'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                  title="4 Column Layout"
                >
                  <Grid2x2 size={18} />
                </button>
                <button
                  onClick={() => handleLayoutChange('5')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '5'
                      ? 'bg-white text-tpppink shadow-sm border-2 border-tpppink'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                  title="5 Column Layout"
                >
                  <Grid3x2 size={18} />
                </button>
                <button
                  onClick={() => handleLayoutChange('6')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '6'
                      ? 'bg-white text-tpppink shadow-sm border-2 border-tpppink'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                  title="6 Column Layout"
                >
                  <Grid3x3 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA - Bundles (Left) + Sidebar (Right) */}
        <div className="flex">
          {/* LEFT SECTION - Bundles (Full Width) */}
          <div className="flex-1 px-6 py-6">
            {/* Quick Tag Access - Compact - DYNAMICALLY EXTRACTED FROM BUNDLES */}
            {!loading && availableTags && availableTags.length > 0 && (
              <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Browse by Tag
                  </span>
                  <span className="text-xs text-slate-500">
                    ({availableTags.length} {availableTags.length === 1 ? 'tag' : 'tags'})
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        onClick={() => handleTagClick(tag.name)}
                        className={`
                          group relative px-4 py-2 rounded-full text-sm font-medium transition-all
                          border-2 shadow-sm hover:shadow-md
                          ${isSelected 
                            ? 'bg-tpppink text-white border-tpppink scale-105' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-tpppink hover:text-tpppink'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          {tag.label || tag.name}
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-semibold
                            ${isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-tpppink/10 group-hover:text-tpppink'
                            }
                          `}>
                            {tag.count}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Show active tag filter count */}
                {selectedTags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Filtering by <span className="font-semibold text-tpppink">{selectedTags.length}</span> {selectedTags.length === 1 ? 'tag' : 'tags'}
                      </span>
                      <button
                        onClick={() => handleFilterChange('tags', '')}
                        className="text-tpppink hover:text-tpppink/80 font-semibold underline"
                      >
                        Clear tags
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading state for tags */}
            {loading && (
              <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-lg border-2 border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Browse by Tag
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            )}

            <BundleGrid 
              bundles={bundles} 
              loading={loading} 
              error={error}
              cartItems={cartItems}
              onCartUpdate={refreshCart}
              layoutMode={layoutMode}
            />

            {/* Empty State */}
            {!loading && bundles.length === 0 && hasActiveFilters() && (
              <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm">
                <BundleEmpty
                  message="No bundles match your filters"
                  showReset={true}
                  onReset={resetFilters}
                />
              </div>
            )}

            {/* Pagination */}
            {!loading && metadata && metadata.totalPages > 1 && (
              <div className="mt-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border-2 border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Page Info */}
                    <div className="text-sm text-slate-600">
                      Page <span className="font-semibold text-slate-900">{filters.page}</span> of{' '}
                      <span className="font-semibold text-slate-900">{metadata.totalPages}</span>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
                        title="Previous"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {[...Array(metadata.totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === metadata.totalPages ||
                            (page >= filters.page - 1 && page <= filters.page + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setPage(page)}
                                className={`min-w-[40px] h-10 px-3 text-sm font-semibold border-2 rounded-lg transition-all ${
                                  page === filters.page
                                    ? 'bg-tpppink text-white border-tpppink shadow-sm'
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === filters.page - 2 ||
                            page === filters.page + 2
                          ) {
                            return (
                              <span key={page} className="px-1 text-slate-400 text-sm">
                                ···
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => setPage(filters.page + 1)}
                        disabled={filters.page >= metadata.totalPages}
                        className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
                        title="Next"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SECTION - Filters Sidebar (Scrolls with content) */}
          <div className="flex-shrink-0 py-6 pr-6">
            <SidebarFilters
              filters={{
                search: filters.search,
                sort: filters.sort,
                min_price: filters.min_price,
                max_price: filters.max_price,
                in_stock: filters.in_stock,
                tags: filters.tags
              }}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
              availableTags={availableTags}
              tagsLoading={loading}
              metadata={metadata}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleShop;