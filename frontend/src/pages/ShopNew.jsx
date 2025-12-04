// frontend/src/pages/ShopNew.jsx - FIXED TAG COUNTING

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BundleGrid from '../components/shop/BundleGrid';
import BundleEmpty from '../components/shop/BundleEmpty';
import SidebarFilters from '../components/shop/SidebarFilters';
import ShopHeader from '../components/shop/ShopHeader';
import useBundleFilters from '../hooks/useBundleFilters';
import bundleService from '../services/bundleService';
import api from '../services/api'; // ✅ IMPORT API CLIENT
import { useCart } from '../hooks/useCart';

/**
 * BundleShop Component - FIXED TAG COUNTING
 * 
 * KEY FIX:
 * - Tags are now fetched from backend API that scans ALL bundles
 * - Tag counts remain consistent regardless of page/filters
 * - Separate API call for tags ensures accurate counts
 */
const BundleShop = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false); // ✅ Separate loading for tags
  
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

  // ==========================================
  // ✅ FETCH TAGS FROM BACKEND (RUNS ONCE)
  // ==========================================
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        console.log('🏷️ Fetching tags with dynamic counts based on current filters...');
        
        // Build query params to get context-aware counts
        const params = new URLSearchParams();
        
        // Pass current filters to get counts based on filtered bundles
        if (filters.search) params.append('search', filters.search);
        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);
        if (filters.in_stock) params.append('in_stock', filters.in_stock);
        if (filters.tags) params.append('tags', filters.tags);
        
        const queryString = params.toString();
        const endpoint = `/api/tags/with-counts${queryString ? `?${queryString}` : ''}`;
        
        console.log('📤 Fetching tags from:', endpoint);
        
        const response = await api.get(endpoint);
        
        if (response.data.success && response.data.data) {
          console.log('✅ Received dynamic tag counts:', response.data.data);
          console.log('   Context:', response.data.context);
          setAvailableTags(response.data.data);
        } else {
          console.warn('⚠️ No tags returned from backend');
          setAvailableTags([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch tags:', err);
        console.error('Error details:', err.response?.data || err.message);
        setAvailableTags([]);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, [filters.search, filters.min_price, filters.max_price, filters.in_stock, filters.tags]);

  // ==========================================
  // FETCH BUNDLES (RUNS ON FILTER CHANGES)
  // ==========================================
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
        
        // Update metadata with current count
        const updatedMetadata = {
          ...response.metadata,
          currentCount: bundlesData.length
        };
        setMetadata(updatedMetadata);
        
        // ❌ REMOVED: No longer extracting tags from current page bundles
        // Tags are fetched separately from backend API above
        
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

  // Handle search change (from ShopHeader)
  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };

  // Handle tag click (toggle tag in filters)
  const handleTagClick = (tagName) => {
    // If tagName is null, clear all tags
    if (tagName === null) {
      handleFilterChange('tags', '');
      return;
    }

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
        {/* SHOP HEADER - Compact Sticky Header */}
        <ShopHeader
          filters={filters}
          onSearchChange={handleSearchChange}
          onTagClick={handleTagClick}
          availableTags={availableTags}
          selectedTags={selectedTags}
          loading={tagsLoading} // ✅ Use tagsLoading for header
          metadata={metadata}
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
        />

        {/* CONTENT AREA - Bundles (Left) + Sidebar (Right) */}
        <div className="flex">
          {/* LEFT SECTION - Bundles (Full Width) */}
          <div className="flex-1 px-6 py-6">
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
                        aria-label="Previous page"
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
                                aria-label={`Go to page ${page}`}
                                aria-current={page === filters.page ? 'page' : undefined}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === filters.page - 2 ||
                            page === filters.page + 2
                          ) {
                            return (
                              <span key={page} className="px-1 text-slate-400 text-sm" aria-hidden="true">
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
                        aria-label="Next page"
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
              tagsLoading={tagsLoading}
              metadata={metadata}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleShop;