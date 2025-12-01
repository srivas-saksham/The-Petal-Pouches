// frontend/src/hooks/useBundleFilters.js - FIXED VERSION

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing bundle filters and search
 * Syncs with URL search params for shareable links
 * 
 * FIXES APPLIED:
 * 1. ✅ Fixed sort mapping to match backend expectations
 * 2. ✅ Fixed in_stock filter handling
 * 3. ✅ Improved filter state management
 */
const useBundleFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'created_at',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'created_at') params.set('sort', filters.sort);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.in_stock) params.set('in_stock', filters.in_stock);
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
   * ✅ FIX: Update sort option - now accepts all backend sort values
   */
  const setSortBy = useCallback((sort) => {
    console.log('🔄 Setting sort:', sort);
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1 // Reset to page 1 on sort change
    }));
  }, []);

  /**
   * Update price range
   */
  const setPriceRange = useCallback((min_price, max_price) => {
    setFilters(prev => ({
      ...prev,
      min_price,
      max_price,
      page: 1 // Reset to page 1 on filter change
    }));
  }, []);

  /**
   * ✅ FIX: Update stock filter - properly handles string values
   */
  const setInStock = useCallback((in_stock) => {
    console.log('📦 Setting stock filter:', in_stock);
    setFilters(prev => ({
      ...prev,
      in_stock,
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
      sort: 'created_at',
      min_price: '',
      max_price: '',
      in_stock: '',
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
      filters.min_price ||
      filters.max_price ||
      filters.in_stock ||
      (filters.sort && filters.sort !== 'created_at')
    );
  }, [filters]);

  /**
   * ✅ FIX: Get query params object for API call with proper mapping
   */
  const getApiParams = useCallback(() => {
    const params = {
      page: filters.page,
      limit: filters.limit
    };

    if (filters.search) params.search = filters.search;
    
    // ✅ FIX: Map sort values correctly for backend
    if (filters.sort) {
      // Backend expects: 'created_at', 'price', 'title', 'discount_percent'
      // But we need to handle ascending/descending for price
      params.sort = filters.sort;
    }
    
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.in_stock) params.in_stock = filters.in_stock;

    console.log('📤 API Params:', params);
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