// frontend/src/services/quizService.js - FIXED TO MATCH SHOP LOGIC

import api, { apiRequest } from './api';

/**
 * Fetch items matching quiz criteria
 * @param {Object} quizAnswers - User's quiz answers
 * @returns {Promise<Object>} - { success, data: [items], error }
 */
export const fetchQuizMatches = async (quizAnswers) => {
  try {
    console.log('🎯 Fetching quiz matches with answers:', quizAnswers);
    
    // Build query parameters EXACTLY like the shop does
    const params = buildShopStyleParams(quizAnswers);
    
    console.log('🔧 Built Query Params (Shop-Style):', params);
    
    // Fetch using shop service (which already works!)
    console.log('📡 Fetching from shop API...');
    
    const response = await apiRequest(() => 
      api.get('/api/shop/items', { params })
    );
    
    console.log('📦 Shop Response:', response);
    
    const items = response.success ? response.data : [];
    
    console.log(`✅ Found ${items.length} total items`);
    
    if (items.length > 0) {
      console.log('📦 Sample Item:', items[0]);
    }
    
    return {
      success: true,
      data: items,
      metadata: response.metadata || {
        totalItems: items.length
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
 * Build API query parameters EXACTLY like ShopNew.jsx does
 * This matches the working shop component's approach
 */
function buildShopStyleParams(quizAnswers) {
  const params = {
    type: 'all', // Fetch both products and bundles
    page: 1,
    limit: 50, // Get plenty of items for matching
    sort: 'created_at',
    order: 'desc'
  };
  
  console.log('🏗️ Building shop-style params...');
  
  // 1. PRICE RANGE (Budget filter)
  if (quizAnswers.budget && quizAnswers.budget.priceRange) {
    const [minPrice, maxPrice] = quizAnswers.budget.priceRange;
    params.min_price = minPrice;
    params.max_price = maxPrice * 1.2; // Allow 20% above budget
    console.log('  ✅ Price range:', minPrice, '-', maxPrice * 1.2);
  }
  
  // 2. TAGS (Combine ALL tags just like shop does)
  const allTags = collectAllTags(quizAnswers);
  
  if (allTags.length > 0) {
    // ✅ KEY FIX: Join tags with commas EXACTLY like shop does
    params.tags = allTags.join(',');
    console.log('  ✅ Tags (comma-separated):', params.tags);
  } else {
    console.warn('  ⚠️ No tags collected!');
  }
  
  // 3. STOCK FILTER (optional - ensure we get available items)
  // params.in_stock = 'true'; // Uncomment to only show in-stock items
  
  console.log('📤 Final shop-style params:', params);
  
  return params;
}

/**
 * Collect ALL relevant tags from quiz answers
 * Include primary tag, recipient tags, and style tags
 */
function collectAllTags(quizAnswers) {
  const tags = [];
  
  console.log('🔍 Collecting all tags from quiz answers...');
  
  // 1. Primary tag from occasion (highest priority)
  if (quizAnswers.occasion && quizAnswers.occasion.primaryTag) {
    tags.push(quizAnswers.occasion.primaryTag);
    console.log('  ✅ Primary tag:', quizAnswers.occasion.primaryTag);
  }
  
  // 2. Recipient tags
  if (quizAnswers.recipient && quizAnswers.recipient.tags) {
    tags.push(...quizAnswers.recipient.tags);
    console.log('  ✅ Recipient tags:', quizAnswers.recipient.tags);
  }
  
  // 3. Style tags
  if (quizAnswers.style && quizAnswers.style.tags) {
    tags.push(...quizAnswers.style.tags);
    console.log('  ✅ Style tags:', quizAnswers.style.tags);
  }
  
  // Remove duplicates and lowercase
  const uniqueTags = [...new Set(tags.map(tag => tag.toLowerCase()))];
  console.log('  ✅ Unique tags:', uniqueTags);
  
  return uniqueTags;
}

/**
 * Save quiz results for analytics (optional)
 */
export const saveQuizResults = async (quizAnswers, matchedItems) => {
  try {
    console.log('📊 Quiz completed:', {
      answers: quizAnswers,
      topMatches: matchedItems.slice(0, 3).map(m => m.item.id)
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