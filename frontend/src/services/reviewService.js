// frontend/src/services/reviewService.js
import api, { apiRequest } from './api';

/**
 * Get reviews for a bundle
 * @param {string} bundleId - Bundle UUID
 * @param {Object} params - Query params { page, limit, sort }
 * @returns {Promise<Object>} Reviews data
 */
export const getBundleReviews = async (bundleId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const response = await api.get(
      `/api/reviews/bundle/${bundleId}?${queryParams.toString()}`
    );
    
    return {
      success: true,
      data: response.data.data || [],
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    console.error('❌ Get bundle reviews error:', error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || 'Failed to fetch reviews'
    };
  }
};

/**
 * Submit a new review
 * @param {Object} reviewData - { bundle_id, rating, comment }
 * @returns {Promise<Object>} Created review
 */
export const submitReview = async (reviewData) => {
  return apiRequest(() =>
    api.post('/api/reviews', {
      bundle_id: reviewData.bundle_id,
      rating: reviewData.rating,
      comment: reviewData.comment
    })
  );
};

/**
 * Mark review as helpful
 * @param {string} reviewId - Review UUID
 * @returns {Promise<Object>} Updated helpful count
 */
export const markReviewHelpful = async (reviewId) => {
  return apiRequest(() =>
    api.post(`/api/reviews/${reviewId}/helpful`)
  );
};

/**
 * Get review statistics for bundle
 * @param {string} bundleId - Bundle UUID
 * @returns {Promise<Object>} Rating distribution and stats
 */
export const getReviewStats = async (bundleId) => {
  return apiRequest(() =>
    api.get(`/api/reviews/bundle/${bundleId}/stats`)
  );
};

/**
 * Update review (user's own review)
 * @param {string} reviewId - Review UUID
 * @param {Object} updateData - { rating, comment }
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (reviewId, updateData) => {
  return apiRequest(() =>
    api.put(`/api/reviews/${reviewId}`, updateData)
  );
};

/**
 * Delete review (user's own review)
 * @param {string} reviewId - Review UUID
 * @returns {Promise<Object>} Success message
 */
export const deleteReview = async (reviewId) => {
  return apiRequest(() =>
    api.delete(`/api/reviews/${reviewId}`)
  );
};

export default {
  getBundleReviews,
  submitReview,
  markReviewHelpful,
  getReviewStats,
  updateReview,
  deleteReview
};