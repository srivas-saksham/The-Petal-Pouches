// frontend/src/hooks/useShopFilters.js

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing shop filter state
 * Syncs with URL query parameters for persistence
 * Handles filter changes, resets, and query param management
 */
export const useShopFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    sort: searchParams.get('sort') || 'created_at',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12')
  });

  /**
   * Update a single filter and sync to URL
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        [key]: value,
        page: 1 // Reset to page 1 when filters change
      };

      // Build query params object
      const params = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        // Only add to URL if not empty/default
        if (v) {
          if (k === 'page' && v === 1) return; // Don't add page 1
          if (k === 'limit' && v === 12) return; // Don't add default limit
          if (k === 'sort' && v === 'created_at') return; // Don't add default sort
          params.append(k, v);
        }
      });

      // Update URL
      setSearchParams(params);
      return updated;
    });
  }, [setSearchParams]);

  /**
   * Update multiple filters at once
   */
  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1
      };

      // Build query params
      const params = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v) {
          if (k === 'page' && v === 1) return;
          if (k === 'limit' && v === 12) return;
          if (k === 'sort' && v === 'created_at') return;
          params.append(k, v);
        }
      });

      setSearchParams(params);
      return updated;
    });
  }, [setSearchParams]);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: '',
      min_price: '',
      max_price: '',
      in_stock: '',
      sort: 'created_at',
      page: 1,
      limit: 12
    };

    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  /**
   * Reset specific filter
   */
  const clearFilter = useCallback((key) => {
    updateFilter(key, '');
  }, [updateFilter]);

  /**
   * Check if any filters are active (excluding defaults)
   */
  const hasActiveFilters = useCallback(() => {
    return (
      filters.search ||
      filters.min_price ||
      filters.max_price ||
      filters.in_stock ||
      filters.sort !== 'created_at'
    );
  }, [filters]);

  /**
   * Get all active filters as array (for displaying badges)
   */
  const getActiveFilters = useCallback(() => {
    const active = [];

    if (filters.search) {
      active.push({
        key: 'search',
        label: `Search: "${filters.search}"`,
        value: filters.search
      });
    }

    if (filters.min_price) {
      active.push({
        key: 'min_price',
        label: `Min: ₹${filters.min_price}`,
        value: filters.min_price
      });
    }

    if (filters.max_price) {
      active.push({
        key: 'max_price',
        label: `Max: ₹${filters.max_price}`,
        value: filters.max_price
      });
    }

    if (filters.in_stock === 'true') {
      active.push({
        key: 'in_stock',
        label: 'In Stock Only',
        value: 'true'
      });
    }

    if (filters.sort && filters.sort !== 'created_at') {
      const sortLabels = {
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        created_at: 'Newest First'
      };
      active.push({
        key: 'sort',
        label: `Sort: ${sortLabels[filters.sort] || filters.sort}`,
        value: filters.sort
      });
    }

    return active;
  }, [filters]);

  /**
   * Change page
   */
  const setPage = useCallback((newPage) => {
    setFilters(prev => {
      const updated = { ...prev, page: newPage };
      const params = new URLSearchParams();

      Object.entries(updated).forEach(([k, v]) => {
        if (v) {
          if (k === 'page' && v === 1) return;
          if (k === 'limit' && v === 12) return;
          if (k === 'sort' && v === 'created_at') return;
          params.append(k, v);
        }
      });

      setSearchParams(params);
      return updated;
    });
  }, [setSearchParams]);

  /**
   * Change items per page
   */
  const setLimit = useCallback((newLimit) => {
    updateFilter('limit', newLimit);
  }, [updateFilter]);

  return {
    // State
    filters,

    // Update methods
    updateFilter,
    updateMultipleFilters,
    setPage,
    setLimit,

    // Reset methods
    resetFilters,
    clearFilter,

    // Query methods
    hasActiveFilters,
    getActiveFilters
  };
};

export default useShopFilters;