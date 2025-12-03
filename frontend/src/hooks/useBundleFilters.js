// frontend/src/hooks/useBundleFilters.js - UPDATED WITH TAGS SUPPORT

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing bundle filters and search
 * Syncs with URL search params for shareable links
 * 
 * UPDATED FEATURES:
 * 1. ✅ Tag filtering support
 * 2. ✅ Multiple tags can be selected
 * 3. ✅ Tags stored in URL as comma-separated: ?tags=birthday,anniversary
 * 4. ✅ Proper URL sync
 * 5. ✅ All existing filter functionality preserved
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
    tags: searchParams.get('tags') || '', // NEW: tags as comma-separated string
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12
  });

  /**
   * Update URL when filters change
   */
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'created_at') params.set('sort', filters.sort);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.in_stock) params.set('in_stock', filters.in_stock);
    if (filters.tags) params.set('tags', filters.tags); // NEW: sync tags to URL
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
      page: 1
    }));
  }, []);

  /**
   * Update sort option
   */
  const setSortBy = useCallback((sort) => {
    console.log('🔄 Setting sort:', sort);
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1
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
      page: 1
    }));
  }, []);

  /**
   * Update stock filter
   */
  const setInStock = useCallback((in_stock) => {
    console.log('📦 Setting stock filter:', in_stock);
    setFilters(prev => ({
      ...prev,
      in_stock,
      page: 1
    }));
  }, []);

  /**
   * NEW: Update tags filter
   * @param {Array<string>} selectedTags - Array of tag names to filter by
   * 
   * @example
   * setTags(['birthday'])                    // Filter by birthday tag only
   * setTags(['birthday', 'anniversary'])     // Filter by birthday OR anniversary
   * setTags([])                              // Clear all tag filters
   */
  const setTags = useCallback((selectedTags = []) => {
    // Convert array to comma-separated string for URL
    const tagsString = selectedTags
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => tag.length > 0)
      .join(',');

    console.log('🏷️ Setting tags filter:', selectedTags, '→', tagsString);

    setFilters(prev => ({
      ...prev,
      tags: tagsString,
      page: 1 // Reset to page 1 when tags change
    }));
  }, []);

  /**
   * NEW: Get tags as array (for UI checkboxes/selections)
   * @returns {Array<string>} Array of selected tag names
   * 
   * @example
   * const selectedTags = getSelectedTags();
   * // ["birthday", "anniversary"]
   */
  const getSelectedTags = useCallback(() => {
    if (!filters.tags) return [];
    return filters.tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  }, [filters.tags]);

  /**
   * NEW: Toggle single tag on/off
   * @param {string} tagName - Tag name to toggle
   * 
   * @example
   * toggleTag('birthday')  // If not selected, select it. If selected, deselect it.
   */
  const toggleTag = useCallback((tagName) => {
    const tagLower = tagName.toLowerCase().trim();
    const currentTags = getSelectedTags();

    if (currentTags.includes(tagLower)) {
      // Remove tag
      const newTags = currentTags.filter(t => t !== tagLower);
      setTags(newTags);
      console.log(`➖ Removed tag: ${tagLower}`);
    } else {
      // Add tag
      const newTags = [...currentTags, tagLower];
      setTags(newTags);
      console.log(`➕ Added tag: ${tagLower}`);
    }
  }, [getSelectedTags, setTags]);

  /**
   * NEW: Check if specific tag is selected
   * @param {string} tagName - Tag name to check
   * @returns {boolean} True if tag is selected
   */
  const isTagSelected = useCallback((tagName) => {
    const tagLower = tagName.toLowerCase().trim();
    return getSelectedTags().includes(tagLower);
  }, [getSelectedTags]);

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
      tags: '', // Reset tags too
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
      (filters.sort && filters.sort !== 'created_at') ||
      filters.tags // NEW: check for active tags
    );
  }, [filters]);

  /**
   * Get query params object for API call
   * Converts all filter values to proper format for backend
   */
  const getApiParams = useCallback(() => {
    const params = {
      page: filters.page,
      limit: filters.limit
    };

    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.in_stock) params.in_stock = filters.in_stock;
    if (filters.tags) params.tags = filters.tags; // NEW: include tags

    console.log('📤 API Params:', params);
    return params;
  }, [filters]);

  /**
   * NEW: Clear only tag filters (keep other filters)
   */
  const clearTagFilters = useCallback(() => {
    setTags([]);
  }, [setTags]);

  /**
   * NEW: Clear all filters except tags
   */
  const clearNonTagFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: '',
      sort: 'created_at',
      min_price: '',
      max_price: '',
      in_stock: '',
      page: 1
    }));
  }, []);

  return {
    // ==================== STATE ====================
    filters,
    
    // ==================== SETTERS ====================
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setTags,        // NEW
    setPage,
    resetFilters,
    
    // ==================== TAG UTILITIES (NEW) ====================
    getSelectedTags,      // Get selected tags as array
    toggleTag,            // Toggle single tag
    isTagSelected,        // Check if tag is selected
    clearTagFilters,      // Clear only tags
    clearNonTagFilters,   // Clear everything except tags
    
    // ==================== UTILITY FUNCTIONS ====================
    hasActiveFilters,
    getApiParams
  };
};

export default useBundleFilters;