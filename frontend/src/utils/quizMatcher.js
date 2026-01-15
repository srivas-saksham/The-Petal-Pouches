// frontend/src/utils/quizMatcher.js

/**
 * GIFT QUIZ MATCHING ALGORITHM
 * 
 * This algorithm scores bundles/products based on quiz answers.
 * 
 * SCORING BREAKDOWN:
 * 1. Primary Tag Match (Weight: 10) → +100 points
 * 2. Secondary Tag Matches (Weight: 7) → +10 points per match
 * 3. Price Range Fit (Weight: 5) → +50 points (exact), +25 (close)
 * 4. Stock Availability → Multiplier (1.0, 0.9, 0.3)
 * 5. Recipient Match → +15 points per match
 * 6. Style Match → +20 points
 */

/**
 * Calculate match score for a single item
 * @param {Object} item - Bundle or product object
 * @param {Object} quizAnswers - User's quiz answers
 * @returns {Object} - { item, score, matchReasons, priceMatch }
 */
export function calculateMatchScore(item, quizAnswers) {
  let score = 0;
  const matchReasons = [];
  
  // 1. PRIMARY TAG MATCH (Occasion) - Highest priority
  if (quizAnswers.occasion && item.primary_tag === quizAnswers.occasion.primaryTag) {
    score += 100;
    matchReasons.push({
      type: 'occasion',
      label: `Perfect for ${quizAnswers.occasion.label}`,
      points: 100
    });
  }
  
  // 2. SECONDARY TAG MATCHES (Interests, Style, Special)
  const userTags = collectUserTags(quizAnswers);
  const itemTags = item.tags || [];
  const matchingTags = userTags.filter(tag => itemTags.includes(tag.toLowerCase()));
  
  matchingTags.forEach(tag => {
    score += 10;
  });
  
  if (matchingTags.length > 0) {
    matchReasons.push({
      type: 'interests',
      label: `Matches ${matchingTags.length} of her interests`,
      points: matchingTags.length * 10,
      tags: matchingTags
    });
  }
  
  // 3. RECIPIENT TYPE MATCH
  if (quizAnswers.recipient) {
    const recipientTags = quizAnswers.recipient.tags || [];
    const recipientMatches = recipientTags.filter(tag => 
      itemTags.includes(tag.toLowerCase())
    );
    
    if (recipientMatches.length > 0) {
      const recipientScore = recipientMatches.length * 15;
      score += recipientScore;
      matchReasons.push({
        type: 'recipient',
        label: `Great for ${quizAnswers.recipient.label.toLowerCase()}`,
        points: recipientScore
      });
    }
  }
  
  // 4. STYLE MATCH
  if (quizAnswers.style) {
    const styleTags = quizAnswers.style.tags || [];
    const styleMatches = styleTags.filter(tag => 
      itemTags.includes(tag.toLowerCase())
    );
    
    if (styleMatches.length > 0) {
      score += 20;
      matchReasons.push({
        type: 'style',
        label: `Matches ${quizAnswers.style.label} style`,
        points: 20
      });
    }
  }
  
  // 5. PRICE RANGE FIT
  const priceMatch = calculatePriceMatch(item, quizAnswers.budget);
  score += priceMatch.points;
  
  if (priceMatch.isMatch) {
    matchReasons.push({
      type: 'price',
      label: priceMatch.label,
      points: priceMatch.points
    });
  }
  
  // 6. STOCK AVAILABILITY MULTIPLIER
  const stock = item.stock || item.stock_limit || 0;
  let stockMultiplier = 1.0;
  
  if (stock === 0) {
    stockMultiplier = 0.3; // Show but heavily penalize
    matchReasons.push({
      type: 'warning',
      label: 'Currently out of stock',
      points: 0
    });
  } else if (stock < 5) {
    stockMultiplier = 0.9; // Slightly penalize low stock
    matchReasons.push({
      type: 'info',
      label: `Only ${stock} left in stock`,
      points: 0
    });
  }
  
  score *= stockMultiplier;
  
  // 7. SPECIAL PREFERENCES BONUS
  if (quizAnswers.special && quizAnswers.special.length > 0) {
    const specialTags = quizAnswers.special.flatMap(s => s.tags || []);
    const specialMatches = specialTags.filter(tag => 
      itemTags.includes(tag.toLowerCase())
    );
    
    if (specialMatches.length > 0) {
      const specialScore = specialMatches.length * 8;
      score += specialScore;
      matchReasons.push({
        type: 'special',
        label: 'Includes special touches you wanted',
        points: specialScore
      });
    }
  }
  
  return {
    item,
    score: Math.round(score),
    matchReasons,
    priceMatch: priceMatch.isMatch,
    isInStock: stock > 0,
    stockLevel: stock
  };
}

/**
 * Collect all tags from quiz answers
 */
function collectUserTags(quizAnswers) {
  const tags = [];
  
  // Recipient tags
  if (quizAnswers.recipient && quizAnswers.recipient.tags) {
    tags.push(...quizAnswers.recipient.tags);
  }
  
  // Interest tags (multi-select)
  if (quizAnswers.interests && Array.isArray(quizAnswers.interests)) {
    quizAnswers.interests.forEach(interest => {
      if (interest.tags) {
        tags.push(...interest.tags);
      }
    });
  }
  
  // Style tags
  if (quizAnswers.style && quizAnswers.style.tags) {
    tags.push(...quizAnswers.style.tags);
  }
  
  // Special tags
  if (quizAnswers.special && Array.isArray(quizAnswers.special)) {
    quizAnswers.special.forEach(special => {
      if (special.tags) {
        tags.push(...special.tags);
      }
    });
  }
  
  // Return unique tags, lowercased
  return [...new Set(tags.map(tag => tag.toLowerCase()))];
}

/**
 * Calculate price match score
 */
function calculatePriceMatch(item, budgetOption) {
  if (!budgetOption || !budgetOption.priceRange) {
    return { isMatch: false, points: 0, label: '' };
  }
  
  const [minPrice, maxPrice] = budgetOption.priceRange;
  const itemPrice = item.price || 0;
  
  // Perfect fit
  if (itemPrice >= minPrice && itemPrice <= maxPrice) {
    return {
      isMatch: true,
      points: 50,
      label: 'Within your budget'
    };
  }
  
  // Slightly above budget (within 20%)
  if (itemPrice <= maxPrice * 1.2 && itemPrice > maxPrice) {
    return {
      isMatch: true,
      points: 25,
      label: 'Slightly above budget (worth it!)'
    };
  }
  
  // Below budget
  if (itemPrice < minPrice) {
    return {
      isMatch: true,
      points: 30,
      label: 'Great value under budget'
    };
  }
  
  return { isMatch: false, points: 0, label: '' };
}

/**
 * Rank and filter results
 * @param {Array} items - Array of bundles/products
 * @param {Object} quizAnswers - User's quiz answers
 * @returns {Object} - { perfectMatches, goodAlternatives, allResults }
 */
export function rankResults(items, quizAnswers) {
  // Score all items
  const scoredItems = items.map(item => 
    calculateMatchScore(item, quizAnswers)
  );
  
  // Sort by score descending
  const sortedItems = scoredItems.sort((a, b) => b.score - a.score);
  
  // Categorize results
  const perfectMatches = sortedItems.filter(item => item.score >= 150);
  const goodAlternatives = sortedItems.filter(item => 
    item.score >= 100 && item.score < 150
  );
  const okayOptions = sortedItems.filter(item => 
    item.score >= 50 && item.score < 100
  );
  
  return {
    perfectMatches: perfectMatches.slice(0, 6), // Top 6 perfect matches
    goodAlternatives: goodAlternatives.slice(0, 6), // Top 6 alternatives
    okayOptions: okayOptions.slice(0, 3), // Top 3 okay options
    allResults: sortedItems,
    totalMatches: sortedItems.length,
    highestScore: sortedItems[0]?.score || 0
  };
}

/**
 * Get match quality label
 */
export function getMatchQuality(score) {
  if (score >= 200) return { label: 'Perfect Match!', color: 'tppmint', emoji: '🎯' };
  if (score >= 150) return { label: 'Excellent Match', color: 'tppmint', emoji: '✨' };
  if (score >= 100) return { label: 'Good Match', color: 'tpppeach', emoji: '👍' };
  if (score >= 50) return { label: 'Decent Option', color: 'tppgrey', emoji: '👌' };
  return { label: 'Low Match', color: 'tppslate', emoji: '🤔' };
}

export default {
  calculateMatchScore,
  rankResults,
  getMatchQuality
};