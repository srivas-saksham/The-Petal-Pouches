// frontend/src/services/quizService.js - RANDOM PRODUCTS VERSION

import api, { apiRequest } from './api';

/**
 * Fetch random items (5-8) regardless of quiz answers
 * @param {Object} quizAnswers - User's quiz answers (ignored for now)
 * @returns {Promise<Object>} - { success, data: [items], error }
 */
export const fetchQuizMatches = async (quizAnswers) => {
  try {
    console.log('🎯 Fetching random quiz matches (5-8 items)...');
    console.log('📝 Quiz answers (not used currently):', quizAnswers);
    
    // Generate random count between 5-8
    const randomCount = Math.floor(Math.random() * 4) + 5; // 5, 6, 7, or 8
    
    console.log(`🎲 Randomly selected to show ${randomCount} items`);
    
    // Build simple params to fetch all items
    const params = {
      type: 'all', // Both products and bundles
      page: 1,
      limit: 100, // Fetch plenty to randomize from
      sort: 'created_at',
      order: 'desc'
    };
    
    console.log('📡 Fetching from shop API...');
    
    const response = await apiRequest(() => 
      api.get('/api/shop/items', { params })
    );
    
    console.log('📦 Shop Response:', response);
    
    const allItems = response.success ? response.data : [];
    
    console.log(`✅ Fetched ${allItems.length} total items from shop`);
    
    if (allItems.length === 0) {
      console.warn('⚠️ No items available in shop');
      return {
        success: true,
        data: [],
        metadata: { totalItems: 0 }
      };
    }
    
    // Shuffle and pick random items
    const shuffledItems = shuffleArray([...allItems]);
    const randomItems = shuffledItems.slice(0, Math.min(randomCount, shuffledItems.length));
    
    console.log(`🎯 Selected ${randomItems.length} random items`);
    
    if (randomItems.length > 0) {
      console.log('📦 Sample Item:', randomItems[0]);
    }
    
    return {
      success: true,
      data: randomItems,
      metadata: {
        totalItems: randomItems.length,
        randomCount: randomCount,
        availableItems: allItems.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching random items:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch items'
    };
  }
};

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Save quiz results for analytics (optional)
 */
export const saveQuizResults = async (quizAnswers, matchedItems) => {
  try {
    console.log('📊 Quiz completed:', {
      answers: quizAnswers,
      randomItemsShown: matchedItems.slice(0, 3).map(m => m.item.id)
    });
    
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