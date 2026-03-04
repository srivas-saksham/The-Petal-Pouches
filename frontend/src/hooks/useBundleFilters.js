// frontend/src/hooks/useBundleFilters.js
// CHANGE FROM ORIGINAL: getApiParams() now includes `gender` derived from brandMode via useBrand().
// All other logic unchanged.

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';

const useBundleFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { brandMode } = useBrand();

  const [itemType, setItemTypeState] = useState(
    searchParams.get('type') || 'all'
  );

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'created_at',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    tags: searchParams.get('tags') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 32
  });

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
      const hasChanges = 
        prev.tags !== urlTags ||
        prev.search !== urlSearch ||
        prev.min_price !== urlMinPrice ||
        prev.max_price !== urlMaxPrice ||
        prev.in_stock !== urlInStock ||
        prev.sort !== urlSort ||
        prev.page !== urlPage;

      if (hasChanges) {
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

    if (itemType !== urlType) {
      setItemTypeState(urlType);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'created_at') params.set('sort', filters.sort);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.in_stock) params.set('in_stock', filters.in_stock);
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.page > 1) params.set('page', filters.page);
    if (itemType && itemType !== 'all') params.set('type', itemType);
    
    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, itemType]);

  const setSearch = useCallback((search) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const setSortBy = useCallback((sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  }, []);

  const setPriceRange = useCallback((min_price, max_price) => {
    setFilters(prev => ({ ...prev, min_price, max_price, page: 1 }));
  }, []);

  const setInStock = useCallback((in_stock) => {
    setFilters(prev => ({ ...prev, in_stock, page: 1 }));
  }, []);

  const setTags = useCallback((selectedTags = []) => {
    let tagsArray = [];
    if (typeof selectedTags === 'string') {
      if (selectedTags.trim().length > 0) {
        tagsArray = selectedTags.split(',').map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
      }
    } else if (Array.isArray(selectedTags)) {
      tagsArray = selectedTags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
    }
    const tagsString = tagsArray.join(',');
    setFilters(prev => ({ ...prev, tags: tagsString, page: 1 }));
  }, []);

  const setItemType = useCallback((type) => {
    setItemTypeState(type);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const getSelectedTags = useCallback(() => {
    if (!filters.tags || filters.tags.trim().length === 0) return [];
    return filters.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
  }, [filters.tags]);

  const toggleTag = useCallback((tagName) => {
    const tagLower = tagName.toLowerCase().trim();
    const currentTags = getSelectedTags();
    if (currentTags.includes(tagLower)) {
      setTags(currentTags.filter(t => t !== tagLower));
    } else {
      setTags([...currentTags, tagLower]);
    }
  }, [getSelectedTags, setTags]);

  const isTagSelected = useCallback((tagName) => {
    return getSelectedTags().includes(tagName.toLowerCase().trim());
  }, [getSelectedTags]);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', sort: 'created_at', min_price: '', max_price: '', in_stock: '', tags: '', page: 1, limit: 32 });
    setItemTypeState('all');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.min_price ||
      filters.max_price ||
      filters.in_stock ||
      (filters.sort && filters.sort !== 'created_at') ||
      filters.tags ||
      (itemType && itemType !== 'all')
    );
  }, [filters, itemType]);

  /**
   * ✅ UPDATED: getApiParams now includes `gender` from brandMode
   * - feminine → gender = 'women'  (backend returns women + neutral)
   * - masculine → gender = 'men'   (backend returns men + neutral)
   */
  const getApiParams = useCallback(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      // Map brand mode to gender filter value
      gender: brandMode === 'masculine' ? 'men' : 'women',
    };

    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.in_stock) params.in_stock = filters.in_stock;
    if (filters.tags) params.tags = filters.tags;
    if (itemType) params.type = itemType;

    return params;
  }, [filters, itemType, brandMode]); // ✅ brandMode added as dependency

  const clearTagFilters = useCallback(() => { setTags([]); }, [setTags]);

  const clearNonTagFilters = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '', sort: 'created_at', min_price: '', max_price: '', in_stock: '', page: 1 }));
    setItemTypeState('all');
  }, []);

  return {
    filters,
    itemType,
    setSearch,
    setSortBy,
    setPriceRange,
    setInStock,
    setTags,
    setPage,
    setItemType,
    resetFilters,
    getSelectedTags,
    toggleTag,
    isTagSelected,
    clearTagFilters,
    clearNonTagFilters,
    hasActiveFilters,
    getApiParams
  };
};

export default useBundleFilters;