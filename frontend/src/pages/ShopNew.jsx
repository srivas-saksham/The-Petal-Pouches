// frontend/src/pages/ShopNew.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import shopService from '../services/shopService';
import useShopFilters from '../hooks/useShopFilters';
import ShopHeader from '../components/shop/ShopHeader';
import ShopFilters from '../components/shop/ShopFilters';
import ProductGrid from '../components/shop/ProductGrid';
import ShopPagination from '../components/shop/ShopPagination';
import ShopEmpty from '../components/shop/ShopEmpty';
import ShopLoading from '../components/shop/ShopLoading';

const ShopNew = () => {
  const navigate = useNavigate();
  
  // Filter state management
  const {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    getActiveFilters,
    setPage
  } = useShopFilters();

  // Local state
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState(() => {
    // Get from localStorage or default to 3 columns
    const saved = localStorage.getItem('shopGridLayout');
    return saved || '3';
  });
  const [error, setError] = useState(null);

  /**
   * Fetch products based on current filters
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await shopService.getProducts({
        search: filters.search,
        min_price: filters.min_price,
        max_price: filters.max_price,
        in_stock: filters.in_stock,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit
      });

      if (result.success) {
        setProducts(result.data);
        setMetadata(result.metadata);
      } else {
        setError(result.error);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch products when filters change
   */
  useEffect(() => {
    fetchProducts();
    // Scroll to top when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((key, value) => {
    updateFilter(key, value);
  }, [updateFilter]);

  /**
   * Handle layout toggle
   */
  const handleLayoutChange = useCallback((newLayout) => {
    setLayoutMode(newLayout);
    localStorage.setItem('shopGridLayout', newLayout);
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setPage]);

  /**
   * Handle product click - navigate to product detail page
   */
  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  /**
   * Handle reset filters
   */
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  /**
   * Handle clear single filter
   */
  const handleClearFilter = useCallback((filterKey) => {
    clearFilter(filterKey);
  }, [clearFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tpppeach/5 via-white to-tpppink/5">
      {/* Header */}
      <ShopHeader layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sticky Filters Section */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur rounded-lg shadow-sm mb-6 p-4">
          <ShopFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            activeFilters={getActiveFilters()}
            onClearFilter={handleClearFilter}
            onResetAll={handleResetFilters}
            hasActiveFilters={hasActiveFilters()}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <ShopLoading layoutMode={layoutMode} />
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error Loading Products
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
                <button
                  onClick={fetchProducts}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <ShopEmpty
            hasFilters={hasActiveFilters()}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-900">
                  {(filters.page - 1) * filters.limit + 1}
                </span>
                {' '}to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(filters.page * filters.limit, metadata?.total || products.length)}
                </span>
                {' '}of{' '}
                <span className="font-semibold text-slate-900">
                  {metadata?.total || products.length}
                </span>
                {' '}products
              </p>
              <p className="text-xs text-slate-500">
                Page {metadata?.currentPage || 1} of {metadata?.totalPages || 1}
              </p>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={products}
              layoutMode={layoutMode}
              onProductClick={handleProductClick}
            />

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
              <div className="mt-8">
                <ShopPagination
                  currentPage={metadata.currentPage || 1}
                  totalPages={metadata.totalPages || 1}
                  hasMore={metadata.hasMore || false}
                  onPageChange={handlePageChange}
                  isLoading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Spacing */}
      <div className="h-12" />
    </div>
  );
};

export default ShopNew;