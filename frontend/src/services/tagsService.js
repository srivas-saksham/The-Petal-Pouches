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
 * Get tags with bundle counts for filter UI
 * Returns tags with the number of bundles that have each tag
 * Perfect for displaying tag counts in sidebar filters
 * 
 * @returns {Promise<Object>} { success, data: [tags with counts], error }
 * 
 * Response format:
 * [
 *   { name: "birthday", count: 24 },
 *   { name: "anniversary", count: 18 },
 *   { name: "romantic", count: 15 },
 *   ...
 * ]
 */
export const getTagsWithCounts = async () => {
  console.log('📊 Fetching tags with bundle counts...');
  
  return apiRequest(() =>
    api.get('/api/bundles/tags/with-counts')
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