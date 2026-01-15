// frontend/src/components/home/GiftQuiz/quizData.js

/**
 * GIFT QUIZ CONFIGURATION
 * 
 * This file contains all quiz questions, options, and scoring weights.
 * Each question contributes to the final matching algorithm.
 */

export const QUIZ_QUESTIONS = [
  // ===========================
  // QUESTION 1: OCCASION (Primary Filter)
  // ===========================
  {
    id: 'occasion',
    question: "What's the occasion?",
    subtitle: "Let's start with the celebration",
    type: 'single-choice',
    required: true,
    weight: 10, // Highest weight - primary filter
    options: [
      { 
        value: 'birthday', 
        label: 'Birthday', 
        icon: '🎂', 
        primaryTag: 'birthday',
        description: 'Celebrate another year around the sun'
      },
      { 
        value: 'anniversary', 
        label: 'Anniversary', 
        icon: '💕', 
        primaryTag: 'anniversary',
        description: 'Mark a special milestone together'
      },
      { 
        value: 'valentine', 
        label: "Valentine's Day", 
        icon: '💝', 
        primaryTag: 'valentine',
        description: 'Express your love and affection'
      },
      { 
        value: 'thank-you', 
        label: 'Thank You', 
        icon: '🙏', 
        primaryTag: 'thank-you',
        description: 'Show appreciation and gratitude'
      },
      { 
        value: 'just-because', 
        label: 'Just Because', 
        icon: '✨', 
        primaryTag: 'just-because',
        description: 'No reason needed for kindness'
      },
      { 
        value: 'congratulations', 
        label: 'Congratulations', 
        icon: '🎉', 
        primaryTag: 'congratulations',
        description: 'Celebrate an achievement'
      },
      { 
        value: 'apology', 
        label: 'Apology', 
        icon: '🌹', 
        primaryTag: 'apology',
        description: 'Make amends with a thoughtful gesture'
      },
      { 
        value: 'new-baby', 
        label: 'New Baby', 
        icon: '👶', 
        primaryTag: 'new-baby',
        description: 'Welcome the newest family member'
      },
    ]
  },

  // ===========================
  // QUESTION 2: RECIPIENT PROFILE
  // ===========================
  {
    id: 'recipient',
    question: "Who is this gift for?",
    subtitle: "Help us understand your relationship",
    type: 'single-choice',
    required: true,
    weight: 8,
    options: [
      { 
        value: 'romantic-partner', 
        label: 'Romantic Partner', 
        icon: '💑',
        tags: ['romantic', 'intimate', 'couple'],
        description: 'Your significant other'
      },
      { 
        value: 'best-friend', 
        label: 'Best Friend', 
        icon: '👯‍♀️',
        tags: ['friendship', 'fun', 'casual'],
        description: 'Your closest confidant'
      },
      { 
        value: 'mother', 
        label: 'Mother', 
        icon: '💐',
        tags: ['motherhood', 'family', 'elegant'],
        description: 'The woman who gave you life'
      },
      { 
        value: 'sister', 
        label: 'Sister', 
        icon: '👭',
        tags: ['sibling', 'family', 'playful'],
        description: 'Your sister or sister-in-law'
      },
      { 
        value: 'colleague', 
        label: 'Colleague', 
        icon: '💼',
        tags: ['professional', 'elegant', 'sophisticated'],
        description: 'A work associate'
      },
      { 
        value: 'teacher', 
        label: 'Teacher/Mentor', 
        icon: '📚',
        tags: ['appreciation', 'professional', 'thoughtful'],
        description: 'Someone who guides you'
      },
    ]
  },

  // ===========================
  // QUESTION 3: INTERESTS (Multi-select)
  // ===========================
  {
    id: 'interests',
    question: "What describes her best?",
    subtitle: "Select up to 3 that match her personality",
    type: 'multi-choice',
    required: true,
    maxSelections: 3,
    weight: 7,
    options: [
      { 
        value: 'spa-lover', 
        label: 'Spa & Wellness', 
        icon: '🧖‍♀️', 
        tags: ['spa', 'wellness', 'self-care', 'relaxation'],
        description: 'Loves pampering and relaxation'
      },
      { 
        value: 'foodie', 
        label: 'Foodie & Gourmet', 
        icon: '🍫', 
        tags: ['gourmet', 'chocolate', 'treats', 'indulgent'],
        description: 'Appreciates fine flavors'
      },
      { 
        value: 'beauty-enthusiast', 
        label: 'Beauty Enthusiast', 
        icon: '💄', 
        tags: ['beauty', 'skincare', 'makeup', 'cosmetics'],
        description: 'Passionate about beauty products'
      },
      { 
        value: 'romantic', 
        label: 'Romantic Soul', 
        icon: '🌹', 
        tags: ['romantic', 'flowers', 'candles', 'sentimental'],
        description: 'Loves thoughtful gestures'
      },
      { 
        value: 'homebody', 
        label: 'Cozy Homebody', 
        icon: '🏠', 
        tags: ['cozy', 'comfort', 'home', 'relaxation'],
        description: 'Enjoys comfort and home life'
      },
      { 
        value: 'adventurous', 
        label: 'Adventurous Spirit', 
        icon: '✈️', 
        tags: ['adventure', 'unique', 'bold', 'exciting'],
        description: 'Seeks new experiences'
      },
      { 
        value: 'minimalist', 
        label: 'Minimalist & Elegant', 
        icon: '✨', 
        tags: ['minimal', 'elegant', 'classy', 'sophisticated'],
        description: 'Appreciates simplicity'
      },
      { 
        value: 'eco-conscious', 
        label: 'Eco-Conscious', 
        icon: '🌿', 
        tags: ['eco-friendly', 'natural', 'organic', 'sustainable'],
        description: 'Values sustainability'
      },
    ]
  },

  // ===========================
  // QUESTION 4: STYLE PREFERENCE
  // ===========================
  {
    id: 'style',
    question: "What's her style vibe?",
    subtitle: "Choose the aesthetic that suits her best",
    type: 'single-choice',
    required: true,
    weight: 6,
    options: [
      { 
        value: 'luxe', 
        label: 'Luxurious & Premium', 
        icon: '💎',
        tags: ['luxury', 'premium', 'elegant', 'sophisticated'],
        description: 'High-end and refined taste'
      },
      { 
        value: 'cute', 
        label: 'Cute & Playful', 
        icon: '🎀',
        tags: ['cute', 'playful', 'fun', 'youthful'],
        description: 'Sweet and charming aesthetic'
      },
      { 
        value: 'classic', 
        label: 'Classic & Timeless', 
        icon: '👑',
        tags: ['classic', 'timeless', 'traditional', 'elegant'],
        description: 'Timeless and sophisticated'
      },
      { 
        value: 'trendy', 
        label: 'Trendy & Modern', 
        icon: '⚡',
        tags: ['trendy', 'modern', 'contemporary', 'stylish'],
        description: 'Up-to-date with latest trends'
      },
      { 
        value: 'boho', 
        label: 'Boho & Natural', 
        icon: '🌸',
        tags: ['boho', 'natural', 'earthy', 'organic'],
        description: 'Free-spirited and natural'
      },
    ]
  },

  // ===========================
  // QUESTION 5: BUDGET RANGE
  // ===========================
  {
    id: 'budget',
    question: "What's your budget?",
    subtitle: "Select a comfortable price range",
    type: 'single-choice',
    required: true,
    weight: 5,
    options: [
      { 
        value: 'budget-friendly', 
        label: 'Under ₹1,000', 
        icon: '💰',
        priceRange: [0, 1000],
        description: 'Thoughtful gifts on a budget'
      },
      { 
        value: 'moderate', 
        label: '₹1,000 - ₹2,500', 
        icon: '💵',
        priceRange: [1000, 2500],
        description: 'Quality gifts at fair prices'
      },
      { 
        value: 'premium', 
        label: '₹2,500 - ₹5,000', 
        icon: '💳',
        priceRange: [2500, 5000],
        description: 'Premium curated experiences'
      },
      { 
        value: 'luxury', 
        label: 'Above ₹5,000', 
        icon: '💎',
        priceRange: [5000, 999999],
        description: 'Luxury gift collections'
      },
    ]
  },

  // ===========================
  // QUESTION 6: SPECIAL PREFERENCES (Optional)
  // ===========================
  {
    id: 'special',
    question: "Any special touches?",
    subtitle: "Optional preferences (select all that apply)",
    type: 'multi-choice',
    required: false,
    weight: 3,
    options: [
      { 
        value: 'personalized', 
        label: 'Personalized Items', 
        icon: '🎨',
        tags: ['personalized', 'custom', 'unique'],
        description: 'Custom-made just for her'
      },
      { 
        value: 'handmade', 
        label: 'Handmade/Artisan', 
        icon: '🖌️',
        tags: ['handmade', 'artisan', 'crafted'],
        description: 'Crafted with care'
      },
      { 
        value: 'vegan', 
        label: 'Vegan/Cruelty-Free', 
        icon: '🌱',
        tags: ['vegan', 'cruelty-free', 'ethical'],
        description: 'Ethical and animal-friendly'
      },
      { 
        value: 'quick-delivery', 
        label: 'Quick Delivery', 
        icon: '⚡',
        filterFlag: 'in_stock_only',
        description: 'Need it fast? In-stock items only'
      },
    ]
  },
];

/**
 * Get total number of quiz steps
 */
export const getTotalSteps = () => QUIZ_QUESTIONS.length;

/**
 * Get question by ID
 */
export const getQuestionById = (id) => {
  return QUIZ_QUESTIONS.find(q => q.id === id);
};

/**
 * Get question by step number (1-indexed)
 */
export const getQuestionByStep = (step) => {
  return QUIZ_QUESTIONS[step - 1];
};

/**
 * Validate quiz answers
 */
export const validateAnswers = (answers) => {
  const errors = {};
  
  QUIZ_QUESTIONS.forEach(question => {
    if (question.required && !answers[question.id]) {
      errors[question.id] = 'This question is required';
    }
    
    if (question.type === 'multi-choice' && question.maxSelections) {
      const answer = answers[question.id];
      if (answer && answer.length > question.maxSelections) {
        errors[question.id] = `Please select up to ${question.maxSelections} options`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default QUIZ_QUESTIONS;