// frontend/src/pages/ShopNew.jsx - WITH CART INTEGRATION

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import BundleGrid from '../components/shop/BundleGrid';
import BundleEmpty from '../components/shop/BundleEmpty';
import useBundleFilters from '../hooks/useBundleFilters';
import bundleService from '../services/bundleService';
import { getCart } from '../services/cartService';

const BundleShop = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // 🛒 Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const {
    filters,
    setSearch,
    setSortBy,
    setPriceRange,
    setPage,
    resetFilters,
    hasActiveFilters,
    getApiParams
  } = useBundleFilters();

  // Local state for filter inputs
  const [searchInput, setSearchInput] = useState(filters.search);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  // 🛒 Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      setCartLoading(true);
      try {
        const result = await getCart();
        if (result.success && result.data) {
          setCartItems(result.data.items || []);
          console.log('✅ Cart loaded:', result.data.items?.length || 0, 'items');
        }
      } catch (err) {
        console.error('❌ Failed to fetch cart:', err);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, []);

  // 🛒 Refresh cart function (call this after cart updates)
  const refreshCart = async () => {
    try {
      const result = await getCart();
      if (result.success && result.data) {
        setCartItems(result.data.items || []);
      }
    } catch (err) {
      console.error('❌ Failed to refresh cart:', err);
    }
  };

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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // Handle price filter
  const handlePriceFilter = () => {
    setPriceRange(minPrice, maxPrice);
    setShowFilters(false);
  };

  // Handle reset
  const handleReset = () => {
    resetFilters();
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Bundle Collections
          </h1>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search bundles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={20} />
              Filters
              {hasActiveFilters() && (
                <span className="ml-1 w-2 h-2 bg-pink-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters() && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                  Search: {filters.search}
                  <button onClick={() => setSearch('')} className="hover:bg-pink-200 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                  Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                  <button onClick={() => setPriceRange('', '')} className="hover:bg-pink-200 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={handleReset}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Price Filter Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handlePriceFilter}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!loading && metadata && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm text-gray-600">
            Showing {bundles.length} of {metadata.total} bundles
          </p>
        </div>
      )}

      {/* Bundle Grid - NOW WITH CART ITEMS */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BundleGrid 
          bundles={bundles} 
          loading={loading} 
          error={error}
          cartItems={cartItems}
          onCartUpdate={refreshCart}
        />

        {/* Empty with filters */}
        {!loading && bundles.length === 0 && hasActiveFilters() && (
          <BundleEmpty
            message="No bundles match your filters"
            showReset={true}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && metadata && metadata.totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(metadata.totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === metadata.totalPages ||
                (page >= filters.page - 1 && page <= filters.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      page === filters.page
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === filters.page - 2 ||
                page === filters.page + 2
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setPage(filters.page + 1)}
              disabled={filters.page >= metadata.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleShop;