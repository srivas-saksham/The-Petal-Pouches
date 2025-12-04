// frontend/src/services/tagsService.js - SIMPLIFIED FOR SHOP FILTERING

import api, { apiRequest } from './api';

/**
 * Get all available tags for filtering
 * Returns list of all tags that bundles can have
 * 
 * @returns {Promise<Object>} { success, data: [tags], error }
 * 
 * Response format:
 * [
 *   { name: "birthday" },
 *   { name: "anniversary" },
 *   { name: "romantic" },
 *   ...
 * ]
 */
export const getAllTags = async () => {
  console.log('📌 Fetching all available tags...');
  
  return apiRequest(() =>
    api.get('/api/bundles/tags')
  );
};

/**
 * Get tags with bundle counts for filter UI - CONTEXT-AWARE
 * Returns tags with counts based on current filter context
 * 
 * @param {Object} filterContext - Current filters { tags, search, min_price, max_price, in_stock }
 * @returns {Promise<Object>} { success, data: [tags with counts], error }
 */
export const getTagsWithCounts = async (filterContext = {}) => {
  console.log('📊 Fetching context-aware tag counts with filters:', filterContext);
  
  const params = new URLSearchParams();
  
  // Add filter context to get dynamic counts
  if (filterContext.tags) params.append('tags', filterContext.tags);
  if (filterContext.search) params.append('search', filterContext.search);
  if (filterContext.min_price) params.append('min_price', filterContext.min_price);
  if (filterContext.max_price) params.append('max_price', filterContext.max_price);
  if (filterContext.in_stock) params.append('in_stock', filterContext.in_stock);
  
  return apiRequest(() =>
    api.get(`/api/tags/with-counts${params.toString() ? `?${params}` : ''}`)
  );
};

/**
 * Search tags by name
 * @param {string} query - Search query
 * @returns {Promise<Object>} { success, data: [matching tags], error }
 */
export const searchTags = async (query) => {
  if (!query || query.length < 1) {
    return {
      success: true,
      data: [],
      message: 'Search query too short'
    };
  }

  console.log(`🔍 Searching tags: ${query}`);
  
  return apiRequest(() =>
    api.get('/api/bundles/tags', {
      params: { search: query }
    })
  );
};

/**
 * Get bundles by tag
 * @param {string} tagName - Tag name to filter by
 * @param {Object} params - Pagination params { page, limit }
 * @returns {Promise<Object>} { success, data: [bundles], metadata, error }
 */
export const getBundlesByTag = async (tagName, params = {}) => {
  console.log(`🏷️ Fetching bundles with tag: ${tagName}`);
  
  const queryParams = new URLSearchParams();
  queryParams.append('tags', tagName);
  queryParams.append('active', 'true');
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  return apiRequest(() =>
    api.get(`/api/bundles?${queryParams.toString()}`)
  );
};

/**
 * Get bundles by multiple tags
 * @param {Array<string>} tagNames - Array of tag names
 * @param {Object} params - Pagination params { page, limit }
 * @returns {Promise<Object>} { success, data: [bundles], metadata, error }
 */
export const getBundlesByTags = async (tagNames = [], params = {}) => {
  if (!tagNames || tagNames.length === 0) {
    return {
      success: true,
      data: [],
      metadata: { total: 0 }
    };
  }

  console.log(`🏷️ Fetching bundles with tags: ${tagNames.join(', ')}`);
  
  const queryParams = new URLSearchParams();
  queryParams.append('tags', tagNames.join(','));
  queryParams.append('active', 'true');
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  return apiRequest(() =>
    api.get(`/api/bundles?${queryParams.toString()}`)
  );
};

// ==================== DEFAULT EXPORT ====================

export default {
  getAllTags,
  getTagsWithCounts,
  searchTags,
  getBundlesByTag,
  getBundlesByTags
};