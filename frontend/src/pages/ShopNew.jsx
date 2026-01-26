// frontend/src/pages/ShopNew.jsx - CLEANED UP VERSION

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MixedShopGrid from '../components/shop/MixedShopGrid';
import BundleEmpty from '../components/shop/BundleEmpty';
import SidebarFilters from '../components/shop/SidebarFilters';
import CommonHeader from '../components/common/CommonHeader';
import ShopFiltersBar from '../components/shop/ShopFiltersBar';
import useBundleFilters from '../hooks/useBundleFilters';
import shopService from '../services/shopService';
import { getTagsWithCounts } from '../services/tagsService';
import { useCart } from '../hooks/useCart';
import SEO from '../components/seo/SEO';

const BundleShop = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ⭐ SCROLL HIDE/SHOW STATE
  const [isFiltersBarVisible, setIsFiltersBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('bundleLayoutMode') || '4';
  });
  
  const { cartItems, refreshCart } = useCart();

  const {
    filters,
    itemType,
    setItemType,
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

  // Save layout preference
  useEffect(() => {
    localStorage.setItem('bundleLayoutMode', layoutMode);
  }, [layoutMode]);

  // ⭐ SCROLL DETECTION FOR HIDE/SHOW FILTERS BAR
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }

      // Scrolling down - hide
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsFiltersBarVisible(false);
      } 
      // Scrolling up - show immediately
      else if (currentScrollY < lastScrollY.current) {
        setIsFiltersBarVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch tags with counts
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const filterContext = {
          tags: filters.tags || '',
          search: filters.search || '',
          min_price: filters.min_price || '',
          max_price: filters.max_price || '',
          in_stock: filters.in_stock || '',
          type: itemType || 'all'
        };

        const response = await getTagsWithCounts(filterContext);
        
        if (response.success && response.data) {
          setAvailableTags(response.data);
        } else {
          setAvailableTags([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch tags:', err);
        setAvailableTags([]);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, [filters.search, filters.min_price, filters.max_price, filters.in_stock, filters.tags, itemType]);

  // Fetch bundles/products
  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiParams = getApiParams();
        apiParams.type = itemType;
        
        const response = await shopService.getAllItems(apiParams);
        
        const bundlesData = response.data || [];
        setBundles(bundlesData);
        
        const updatedMetadata = {
          ...response.metadata,
          currentCount: bundlesData.length
        };
        setMetadata(updatedMetadata);
        
      } catch (err) {
        console.error('❌ Failed to fetch bundles:', err);
        setError(err.message || 'Failed to load bundles');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [filters, getApiParams, itemType]);

  // Handlers
  const handleLayoutChange = (mode) => {
    setLayoutMode(mode);
  };

  const handleTypeChange = (type) => {
    console.log('🔧 Type changed to:', type);
    setItemType(type);
  };

  const handleFilterChange = (filterType, value) => {
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
        break;
    }
  };

  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };

  const handleTagClick = (tagName) => {
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

  const handleOpenMobileFilters = () => {
    setShowMobileFilters(true);
  };

  const selectedTags = filters.tags 
    ? filters.tags.split(',').filter(t => t.trim())
    : [];

  return (
    <>
    <SEO
      title="Shop Luxury Jewelry & Gift Bundles"
      description="Explore Rizara Luxe's curated collection of luxury jewelry and premium gifting experiences. Find the perfect gift for any occasion."
      canonical="https://www.rizara.in/shop"
      keywords="buy luxury jewelry, shop gift bundles, premium jewelry online"
    />
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/assets/doodle_bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <div className="absolute inset-0 bg-white/30"></div>

      <div className="relative z-10">
        
        {/* HEADER */}
        <CommonHeader
          filters={filters}
          onSearchChange={handleSearchChange}
          onTagClick={handleTagClick}
          availableTags={availableTags}
          selectedTags={selectedTags}
          loading={tagsLoading}
          metadata={metadata}
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
        />

        {/* ⭐ UNIFIED FILTERS BAR (Mobile + Desktop) - WITH SCROLL HIDE/SHOW */}
        <div
          className={`sticky md:top-16 top-28 z-30 transition-transform duration-300 ease-in-out ${
            isFiltersBarVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <ShopFiltersBar
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
            loading={tagsLoading}
            layoutMode={layoutMode}
            onLayoutChange={handleLayoutChange}
            itemType={itemType}
            onTypeChange={handleTypeChange}
            onOpenFilters={handleOpenMobileFilters}
            hasActiveFilters={hasActiveFilters()}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="flex">
          
          {/* BUNDLES GRID */}
          <div className="flex-1 px-3 py-3 lg:px-6 lg:py-6">
            <MixedShopGrid 
              items={bundles} 
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
                  message="No items match your filters"
                  showReset={true}
                  onReset={resetFilters}
                />
              </div>
            )}

            {/* PAGINATION */}
            {!loading && metadata && metadata.totalPages > 1 && (
              <div className="mt-4 lg:mt-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border-2 border-slate-200 shadow-sm p-3 lg:p-4">
                  <div className="flex items-center justify-between gap-2 lg:gap-4">
                    
                    {/* Page Info */}
                    <div className="text-xs lg:text-sm text-slate-600">
                      Page <span className="font-semibold text-slate-900">{filters.page}</span> of{' '}
                      <span className="font-semibold text-slate-900">{metadata.totalPages}</span>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-1 lg:gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setPage(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="p-1.5 lg:p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {/* Page Numbers - Desktop Only */}
                      <div className="hidden md:flex items-center gap-1">
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
                                className={`min-w-[32px] lg:min-w-[40px] h-8 lg:h-10 px-2 lg:px-3 text-xs lg:text-sm font-semibold border-2 rounded-lg transition-all ${
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
                              <span key={page} className="px-1 text-slate-400 text-xs" aria-hidden="true">
                                ···
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setPage(filters.page + 1)}
                        disabled={filters.page >= metadata.totalPages}
                        className="p-1.5 lg:p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ⭐ DESKTOP: Sidebar Filters */}
          <div className="hidden lg:block flex-shrink-0 py-6 pr-6">
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
              itemType={itemType}
              onTypeChange={handleTypeChange}
            />
          </div>
        </div>
      </div>

      {/* ⭐ MOBILE: Framer Motion Filter Sidebar */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-tpppeach to-white border-b-2 border-tpppink/20 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-tpppink uppercase">Filters</h2>
                  {metadata?.totalCount !== undefined && (
                    <p className="text-[10px] text-slate-500">{metadata.totalCount} results</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {hasActiveFilters() && (
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold text-tpppink hover:text-white hover:bg-tpppink px-2 py-1 rounded border border-tpppink transition-all active:scale-95"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto">
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
                  itemType={itemType}
                  onTypeChange={handleTypeChange}
                />
              </div>

              {/* Apply Button */}
              <div className="border-t border-slate-200 p-3 flex-shrink-0">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-tpppink text-white py-2.5 rounded-lg font-bold text-sm active:scale-95 transition-transform shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </>
  );
};

export default BundleShop;