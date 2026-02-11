// frontend/src/hooks/useBundleFilters.js - FIXED TAGS SUPPORT WITH ITEM TYPE

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing bundle filters and search
 * Syncs with URL search params for shareable links
 * 
 * FIXED FEATURES:
 * 1. ✅ Tag filtering support - ACCEPTS BOTH STRING AND ARRAY
 * 2. ✅ Multiple tags can be selected
 * 3. ✅ Tags stored in URL as comma-separated: ?tags=birthday,anniversary
 * 4. ✅ Proper URL sync
 * 5. ✅ All existing filter functionality preserved
 * 6. ✅ Flexible setTags() that handles both string and array input
 * 7. 🆕 NEW: Item type filter (all | products | bundles)
 */
const useBundleFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🆕 NEW: Item type state
  const [itemType, setItemTypeState] = useState(
    searchParams.get('type') || 'all'
  );

  // Initialize state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'created_at',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    tags: searchParams.get('tags') || '', // tags as comma-separated string
    page: parseInt(searchParams.get('page') || '1'),
    limit: 32
  });

  // ⭐ NEW: Sync URL params to state when URL changes externally
  useEffect(() => {
    const urlTags = searchParams.get('tags') || '';
    const urlType = searchParams.get('type') || 'all';
    const urlSearch = searchParams.get('search') || '';
    const urlMinPrice = searchParams.get('min_price') || '';
    const urlMaxPrice = searchParams.get('max_price') || '';
    const urlInStock = searchParams.get('in_stock') || '';
    const urlSort = searchParams.get('sort') || 'created_at';
    const urlPage = parseInt(searchParams.get('page') || '1');

    setFilters(prev => {
      // Only update if values actually changed
      const hasChanges = 
        prev.tags !== urlTags ||
        prev.search !== urlSearch ||
        prev.min_price !== urlMinPrice ||
        prev.max_price !== urlMaxPrice ||
        prev.in_stock !== urlInStock ||
        prev.sort !== urlSort ||
        prev.page !== urlPage;

      if (hasChanges) {
        console.log('🔗 [URL → State] Syncing from URL:', { urlTags, urlType });
        return {
          ...prev,
          tags: urlTags,
          search: urlSearch,
          min_price: urlMinPrice,
          max_price: urlMaxPrice,
          in_stock: urlInStock,
          sort: urlSort,
          page: urlPage,
        };
      }
      return prev;
    });

    // Sync item type
    if (itemType !== urlType) {
      console.log('🔗 [URL → State] Syncing type:', urlType);
      setItemTypeState(urlType);
    }
  }, [searchParams]); // React to URL changes

  /**
   * ⭐ FIXED: Update URL when filters change (State → URL)
   * Uses debouncing to prevent sync loops
   */
  useEffect(() => {
    // Create params from current state
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'created_at') params.set('sort', filters.sort);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.in_stock) params.set('in_stock', filters.in_stock);
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.page > 1) params.set('page', filters.page);
    if (itemType && itemType !== 'all') params.set('type', itemType);
    
    // Only update if params actually changed
    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      console.log('🔄 [State → URL] Syncing to URL:', { tags: filters.tags, type: itemType });
      setSearchParams(params, { replace: true });
    }
  }, [filters, itemType]); // Don't include setSearchParams/searchParams to prevent loops

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
   * FIXED: Update tags filter - NOW ACCEPTS BOTH STRING AND ARRAY
   * @param {Array<string>|string} selectedTags - Array of tag names OR comma-separated string
   * 
   * @example
   * setTags(['birthday'])                          // Array input
   * setTags('birthday,anniversary')                // String input (from SidebarFilters)
   * setTags([])                                    // Clear all tag filters
   * setTags('')                                    // Clear all tag filters
   */
  const setTags = useCallback((selectedTags = []) => {
    let tagsArray = [];
    
    // Handle both string and array input
    if (typeof selectedTags === 'string') {
      // If string (e.g., "birthday,anniversary"), split it
      if (selectedTags.trim().length > 0) {
        tagsArray = selectedTags
          .split(',')
          .map(tag => tag.toLowerCase().trim())
          .filter(tag => tag.length > 0);
      }
    } else if (Array.isArray(selectedTags)) {
      // If array (e.g., ['birthday', 'anniversary']), use as-is
      tagsArray = selectedTags
        .map(tag => tag.toLowerCase().trim())
        .filter(tag => tag.length > 0);
    }

    // Convert to comma-separated string for storage
    const tagsString = tagsArray.join(',');

    console.log('🏷️ Setting tags filter:', {
      input: selectedTags,
      inputType: typeof selectedTags,
      parsed: tagsArray,
      stored: tagsString
    });

    setFilters(prev => ({
      ...prev,
      tags: tagsString,
      page: 1 // Reset to page 1 when tags change
    }));
  }, []);

  /**
   * 🆕 NEW: Update item type filter
   * @param {string} type - 'all' | 'products' | 'bundles'
   */
  const setItemType = useCallback((type) => {
    console.log('🔄 Item type changed:', type);
    setItemTypeState(type);
    setFilters(prev => ({
      ...prev,
      page: 1 // Reset to first page when type changes
    }));
  }, []);

  /**
   * Get tags as array (for UI checkboxes/selections)
   * @returns {Array<string>} Array of selected tag names (lowercase)
   * 
   * @example
   * const selectedTags = getSelectedTags();
   * // ["birthday", "anniversary"]
   */
  const getSelectedTags = useCallback(() => {
    if (!filters.tags || filters.tags.trim().length === 0) {
      return [];
    }
    return filters.tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  }, [filters.tags]);

  /**
   * Toggle single tag on/off
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
   * Check if specific tag is selected
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
   * 🆕 UPDATED: Reset all filters (including item type)
   */
  const resetFilters = useCallback(() => {
    console.log('🔄 Resetting all filters');
    setFilters({
      search: '',
      sort: 'created_at',
      min_price: '',
      max_price: '',
      in_stock: '',
      tags: '', // Reset tags too
      page: 1,
      limit: 32
    });
    setItemTypeState('all'); // 🆕 NEW: Reset item type
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
      filters.tags ||
      (itemType && itemType !== 'all') // 🆕 NEW: Include item type
    );
  }, [filters, itemType]); // 🆕 NEW: Add itemType to dependencies

  /**
   * 🆕 UPDATED: Get query params object for API call
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
    if (filters.tags) params.tags = filters.tags; // Send as comma-separated string
    if (itemType) params.type = itemType; // 🆕 NEW: Add item type

    console.log('📤 API Params:', params);
    return params;
  }, [filters, itemType]); // 🆕 NEW: Add itemType to dependencies

  /**
   * Clear only tag filters (keep other filters)
   */
  const clearTagFilters = useCallback(() => {
    console.log('🏷️ Clearing tag filters');
    setTags([]);
  }, [setTags]);

  /**
   * Clear all filters except tags
   */
  const clearNonTagFilters = useCallback(() => {
    console.log('🔄 Clearing non-tag filters');
    setFilters(prev => ({
      ...prev,
      search: '',
      sort: 'created_at',
      min_price: '',
      max_price: '',
      in_stock: '',
      page: 1
    }));
    setItemTypeState('all'); // 🆕 NEW: Reset item type too
  }, []);

  return {
    // ==================== STATE ====================
    filters,
    itemType, // 🆕 NEW: Export item type
    
    // ==================== SETTERS ====================
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setTags,        // FIXED: Now accepts both string and array
    setPage,
    setItemType,    // 🆕 NEW: Item type setter
    resetFilters,
    
    // ==================== TAG UTILITIES ====================
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