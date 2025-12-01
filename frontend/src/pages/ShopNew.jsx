// frontend/src/pages/ShopNew.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Grid3x2, Grid2x2, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';
import BundleGrid from '../components/shop/BundleGrid';
import BundleEmpty from '../components/shop/BundleEmpty';
import ShopFilters from '../components/shop/ShopFilters';
import useBundleFilters from '../hooks/useBundleFilters';
import bundleService from '../services/bundleService';
import { useCart } from '../hooks/useCart';

const BundleShop = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  
  // Layout state - load from localStorage or default to '5'
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('bundleLayoutMode') || '4';
  });
  
  // Cart Context
  const { cartItems, refreshCart } = useCart();

  const {
    filters,
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setPage,
    resetFilters,
    hasActiveFilters,
    getApiParams
  } = useBundleFilters();

  // Save layout preference to localStorage
  useEffect(() => {
    localStorage.setItem('bundleLayoutMode', layoutMode);
  }, [layoutMode]);

  // Fetch bundles
  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await bundleService.getAllBundles(getApiParams());
        setBundles(response.data || []);
        setMetadata(response.metadata);
      } catch (err) {
        console.error('Failed to fetch bundles:', err);
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

  // Handle filter changes from ShopFilters component
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'search':
        setSearch(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'min_price':
        setPriceRange(value, filters.maxPrice);
        break;
      case 'max_price':
        setPriceRange(filters.minPrice, value);
        break;
      case 'in_stock':
        setInStock(value);
        break;
      default:
        break;
    }
  };

  // Build active filters array for ShopFilters component
  const getActiveFilters = () => {
    const active = [];
    
    if (filters.search) {
      active.push({
        key: 'search',
        label: `Search: "${filters.search}"`
      });
    }
    
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || '0';
      const max = filters.maxPrice || '∞';
      active.push({
        key: 'price',
        label: `Price: ₹${min} - ₹${max}`
      });
    }

    if (filters.inStock === 'true') {
      active.push({
        key: 'in_stock',
        label: 'In Stock Only'
      });
    }
    
    if (filters.sortBy && filters.sortBy !== 'created_at') {
      const sortLabels = {
        'price': 'Price: High to Low',
        'title': 'Name: A to Z',
        'discount_percent': 'Highest Discount'
      };
      active.push({
        key: 'sort',
        label: sortLabels[filters.sortBy] || filters.sortBy
      });
    }
    
    return active;
  };

  // Handle clearing individual filter
  const handleClearFilter = (filterKey) => {
    switch (filterKey) {
      case 'search':
        setSearch('');
        break;
      case 'price':
        setPriceRange('', '');
        break;
      case 'in_stock':
        setInStock('');
        break;
      case 'sort':
        setSortBy('created_at');
        break;
      default:
        break;
    }
  };

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
      <div className="absolute inset-0 bg-white/70"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Title and Layout Switcher */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-tppgrey sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {/* Title & Results Count */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-tppslate flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-tpppink" />
                  Bundle Collections
                </h1>
                {!loading && metadata && (
                  <p className="text-xs text-tppslate/60 mt-1">
                    {bundles.length} of {metadata.total} bundles
                  </p>
                )}
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center gap-1 bg-tppslate/5 rounded-lg p-1 border border-tppgrey">
                <button
                  onClick={() => handleLayoutChange('4')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '4'
                      ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                      : 'text-tppslate/50 hover:text-tppslate hover:bg-white/50'
                  }`}
                  title="4 Column Layout"
                >
                  <Grid2x2 size={16} />
                </button>
                <button
                  onClick={() => handleLayoutChange('5')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '5'
                      ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                      : 'text-tppslate/50 hover:text-tppslate hover:bg-white/50'
                  }`}
                  title="5 Column Layout"
                >
                  <Grid3x2 size={16} />
                </button>
                <button
                  onClick={() => handleLayoutChange('6')}
                  className={`p-2 rounded transition-all ${
                    layoutMode === '6'
                      ? 'bg-white text-tpppink shadow-sm border border-tpppink'
                      : 'text-tppslate/50 hover:text-tppslate hover:bg-white/50'
                  }`}
                  title="6 Column Layout"
                >
                  <Grid3x3  size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <ShopFilters
            filters={{
              search: filters.search,
              sort: filters.sortBy,
              min_price: filters.minPrice,
              max_price: filters.maxPrice,
              in_stock: filters.inStock
            }}
            onFilterChange={handleFilterChange}
            activeFilters={getActiveFilters()}
            onClearFilter={handleClearFilter}
            onResetAll={resetFilters}
            hasActiveFilters={hasActiveFilters()}
            totalResults={metadata?.total || 0}
          />
        </div>

        {/* Bundle Grid with Layout Mode */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
            <div className="bg-white rounded-lg border border-tppgrey shadow-sm">
              <BundleEmpty
                message="No bundles match your filters"
                showReset={true}
                onReset={resetFilters}
              />
            </div>
          )}
        </div>

        {/* Compact Pagination */}
        {!loading && metadata && metadata.totalPages > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-tppgrey shadow-sm p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-xs text-tppslate/60">
                  Page <span className="font-semibold text-tppslate">{filters.page}</span> of{' '}
                  <span className="font-semibold text-tppslate">{metadata.totalPages}</span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="p-2 border border-tppgrey rounded-lg hover:bg-tppslate/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-tppslate"
                    title="Previous"
                  >
                    <ChevronLeft size={18} />
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
                            className={`min-w-[36px] h-9 px-3 text-sm font-medium border rounded-lg transition-all ${
                              page === filters.page
                                ? 'bg-tpppink text-white border-tpppink shadow-sm'
                                : 'border-tppgrey text-tppslate hover:bg-tppslate/5'
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
                          <span key={page} className="px-1 text-tppslate/40 text-sm">
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
                    className="p-2 border border-tppgrey rounded-lg hover:bg-tppslate/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-tppslate"
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleShop;