// frontend/src/services/quizService.js

import api, { apiRequest } from './api';

/**
 * Fetch items matching quiz criteria
 * @param {Object} quizAnswers - User's quiz answers
 * @returns {Promise<Object>} - { success, data: [items], error }
 */
export const fetchQuizMatches = async (quizAnswers) => {
  try {
    console.log('🎯 Fetching quiz matches with answers:', quizAnswers);
    
    // Build query parameters from quiz answers
    const params = buildQueryParams(quizAnswers);
    
    // Fetch both bundles and products in parallel
    const [bundlesResponse, productsResponse] = await Promise.all([
      apiRequest(() => api.get('/api/bundles', { params: params.bundles })),
      apiRequest(() => api.get('/api/products', { params: params.products }))
    ]);
    
    // Combine results
    const bundles = bundlesResponse.success ? bundlesResponse.data : [];
    const products = productsResponse.success ? productsResponse.data : [];
    
    const combinedItems = [...bundles, ...products];
    
    console.log(`✅ Found ${combinedItems.length} potential matches (${bundles.length} bundles, ${products.length} products)`);
    
    return {
      success: true,
      data: combinedItems,
      metadata: {
        totalBundles: bundles.length,
        totalProducts: products.length,
        totalItems: combinedItems.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching quiz matches:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch matches'
    };
  }
};

/**
 * Build API query parameters from quiz answers
 */
function buildQueryParams(quizAnswers) {
  const baseParams = {
    active: 'true',
    page: 1,
    limit: 50 // Fetch more items for better matching
  };
  
  // Primary tag filter (occasion)
  if (quizAnswers.occasion && quizAnswers.occasion.primaryTag) {
    baseParams.primary_tag = quizAnswers.occasion.primaryTag;
  }
  
  // Price range filter
  if (quizAnswers.budget && quizAnswers.budget.priceRange) {
    const [minPrice, maxPrice] = quizAnswers.budget.priceRange;
    baseParams.min_price = minPrice;
    baseParams.max_price = maxPrice * 1.2; // Allow 20% above budget
  }
  
  // Stock filter for quick delivery
  if (quizAnswers.special) {
    const needsQuickDelivery = quizAnswers.special.some(s => s.filterFlag === 'in_stock_only');
    if (needsQuickDelivery) {
      baseParams.in_stock = 'true';
    }
  }
  
  // Tag-based filtering (optional - can add multiple tags)
  const allTags = collectRelevantTags(quizAnswers);
  if (allTags.length > 0) {
    baseParams.tags = allTags.slice(0, 5).join(','); // Limit to top 5 tags
  }
  
  return {
    bundles: { ...baseParams },
    products: { ...baseParams }
  };
}

/**
 * Collect relevant tags from quiz answers for API filtering
 */
function collectRelevantTags(quizAnswers) {
  const tags = [];
  
  // Add recipient tags
  if (quizAnswers.recipient && quizAnswers.recipient.tags) {
    tags.push(...quizAnswers.recipient.tags);
  }
  
  // Add top 2 interest tags
  if (quizAnswers.interests && Array.isArray(quizAnswers.interests)) {
    const interestTags = quizAnswers.interests.flatMap(i => i.tags || []);
    tags.push(...interestTags.slice(0, 2));
  }
  
  // Add style tags
  if (quizAnswers.style && quizAnswers.style.tags) {
    tags.push(...quizAnswers.style.tags.slice(0, 1));
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Save quiz results for analytics (optional)
 */
export const saveQuizResults = async (quizAnswers, matchedItems) => {
  try {
    // This can be used for analytics/tracking
    // You can create an endpoint to save quiz completion data
    console.log('📊 Quiz completed:', {
      answers: quizAnswers,
      topMatches: matchedItems.slice(0, 3).map(m => m.item.id)
    });
    
    // Example: await api.post('/api/analytics/quiz-completion', { ... });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving quiz results:', error);
    return { success: false };
  }
};

export default {
  fetchQuizMatches,
  saveQuizResults
};