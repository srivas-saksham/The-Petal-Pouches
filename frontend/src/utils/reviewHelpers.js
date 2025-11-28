// frontend/src/utils/reviewHelpers.js

/**
 * Review Helper Functions
 * Utility functions for review operations and display
 */

/**
 * Generate random rating between 4.0 and 4.9 for bundles with no reviews
 * @returns {number} Random rating (e.g., 4.3, 4.7)
 */
export const generatePlaceholderRating = () => {
  // Generate random number between 4.0 and 4.9 with 1 decimal
  const rating = 4.0 + Math.random() * 0.9;
  return Math.round(rating * 10) / 10;
};

/**
 * Calculate average rating from reviews array
 * @param {Array} reviews - Array of review objects with rating field
 * @returns {number} Average rating (1-5) or null if no reviews
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return null;
  }
  
  const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
  const average = sum / reviews.length;
  
  return Math.round(average * 10) / 10; // Round to 1 decimal
};

/**
 * Get display rating (use actual if available, otherwise placeholder)
 * @param {Array|null} reviews - Reviews array or null
 * @param {number|null} cachedRating - Pre-calculated average rating
 * @returns {Object} { rating: number, isPlaceholder: boolean, count: number }
 */
export const getDisplayRating = (reviews = null, cachedRating = null) => {
  // If we have cached rating from product
  if (cachedRating && cachedRating > 0) {
    return {
      rating: cachedRating,
      isPlaceholder: false,
      count: reviews?.length || 0
    };
  }
  
  // If we have reviews, calculate average
  if (reviews && Array.isArray(reviews) && reviews.length > 0) {
    return {
      rating: calculateAverageRating(reviews),
      isPlaceholder: false,
      count: reviews.length
    };
  }
  
  // No reviews - use placeholder
  return {
    rating: generatePlaceholderRating(),
    isPlaceholder: true,
    count: 0
  };
};

/**
 * Format rating for display (show 1 decimal)
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating (e.g., "4.5")
 */
export const formatRating = (rating) => {
  if (!rating || isNaN(rating)) return '0.0';
  return rating.toFixed(1);
};

/**
 * Get star fill percentage for partial stars
 * @param {number} rating - Rating value (e.g., 4.3)
 * @param {number} starPosition - Star position (1-5)
 * @returns {number} Fill percentage (0-100)
 */
export const getStarFillPercentage = (rating, starPosition) => {
  if (rating >= starPosition) return 100;
  if (rating < starPosition - 1) return 0;
  
  const decimal = rating - Math.floor(rating);
  return decimal * 100;
};

/**
 * Format review count for display
 * @param {number} count - Number of reviews
 * @returns {string} Formatted count (e.g., "123", "1.2k")
 */
export const formatReviewCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  return `${Math.floor(count / 1000)}k`;
};

/**
 * Get rating color class based on value
 * @param {number} rating - Rating value
 * @returns {string} Tailwind color class
 */
export const getRatingColorClass = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-tppmint';
  if (rating >= 3.0) return 'text-yellow-600';
  return 'text-orange-600';
};

/**
 * Get review text based on rating
 * @param {number} rating - Rating value
 * @returns {string} Review quality text
 */
export const getRatingText = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  return 'Below Average';
};

/**
 * Sort reviews by various criteria
 * @param {Array} reviews - Reviews array
 * @param {string} sortBy - Sort criteria (recent, helpful, rating_high, rating_low)
 * @returns {Array} Sorted reviews
 */
export const sortReviews = (reviews, sortBy = 'recent') => {
  if (!reviews || !Array.isArray(reviews)) return [];
  
  const sorted = [...reviews];
  
  switch (sortBy) {
    case 'helpful':
      return sorted.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
    
    case 'rating_high':
      return sorted.sort((a, b) => b.rating - a.rating);
    
    case 'rating_low':
      return sorted.sort((a, b) => a.rating - b.rating);
    
    case 'recent':
    default:
      return sorted.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
  }
};

/**
 * Filter reviews by rating
 * @param {Array} reviews - Reviews array
 * @param {number} rating - Rating to filter by (1-5)
 * @returns {Array} Filtered reviews
 */
export const filterReviewsByRating = (reviews, rating) => {
  if (!reviews || !Array.isArray(reviews)) return [];
  if (!rating) return reviews;
  
  return reviews.filter(review => review.rating === rating);
};

/**
 * Get rating distribution
 * @param {Array} reviews - Reviews array
 * @returns {Object} Distribution object { 5: count, 4: count, ... }
 */
export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  if (!reviews || !Array.isArray(reviews)) return distribution;
  
  reviews.forEach(review => {
    const rating = review.rating;
    if (rating >= 1 && rating <= 5) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  });
  
  return distribution;
};

/**
 * Format time ago for review timestamps
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time (e.g., "2 days ago")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const reviewDate = new Date(timestamp);
  const diffMs = now - reviewDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Validate review data before submission
 * @param {Object} reviewData - Review data object
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateReviewData = (reviewData) => {
  const errors = [];
  
  if (!reviewData.product_id) {
    errors.push('Product ID is required');
  }
  
  if (!reviewData.rating) {
    errors.push('Rating is required');
  } else if (reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (reviewData.comment && reviewData.comment.length > 1000) {
    errors.push('Comment must be less than 1000 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};