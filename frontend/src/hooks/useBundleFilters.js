// frontend/src/hooks/useBundleFilters.js

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing bundle filters and search
 * Syncs with URL search params for shareable links
 */
const useBundleFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'created_at',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    inStock: searchParams.get('in_stock') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy && filters.sortBy !== 'created_at') params.set('sort', filters.sortBy);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.inStock) params.set('in_stock', filters.inStock);
    if (filters.page > 1) params.set('page', filters.page);
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  /**
   * Update search query
   */
  const setSearch = useCallback((search) => {
    setFilters(prev => ({
      ...prev,
      search,
      page: 1 // Reset to page 1 on search
    }));
  }, []);

  /**
   * Update sort option
   */
  const setSortBy = useCallback((sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      page: 1 // Reset to page 1 on sort change
    }));
  }, []);

  /**
   * Update price range
   */
  const setPriceRange = useCallback((minPrice, maxPrice) => {
    setFilters(prev => ({
      ...prev,
      minPrice,
      maxPrice,
      page: 1 // Reset to page 1 on filter change
    }));
  }, []);

  /**
   * Update stock filter
   */
  const setInStock = useCallback((inStock) => {
    setFilters(prev => ({
      ...prev,
      inStock,
      page: 1 // Reset to page 1 on filter change
    }));
  }, []);

  /**
   * Update page number
   */
  const setPage = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'created_at',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      page: 1,
      limit: 12
    });
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock ||
      (filters.sortBy && filters.sortBy !== 'created_at')
    );
  }, [filters]);

  /**
   * Get query params object for API call
   */
  const getApiParams = useCallback(() => {
    const params = {
      page: filters.page,
      limit: filters.limit
    };

    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sort = filters.sortBy;
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    if (filters.inStock) params.in_stock = filters.inStock;

    return params;
  }, [filters]);

  return {
    // Current filter values
    filters,
    
    // Update functions
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setPage,
    resetFilters,
    
    // Utility functions
    hasActiveFilters,
    getApiParams
  };
};

export default useBundleFilters;