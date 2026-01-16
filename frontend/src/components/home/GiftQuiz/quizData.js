// frontend/src/components/home/GiftQuiz/quizData.js

/**
 * GIFT QUIZ CONFIGURATION - SIMPLIFIED TAG SYSTEM
 * 
 * Universal Tags Used: romantic, friendship, elegant, cute, meaningful, trendy, classic
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
        value: 'friendship-day', 
        label: 'Friendship Day', 
        icon: '👯‍♀️', 
        primaryTag: 'friendship-day',
        description: 'Celebrate your bestie'
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
        tags: ['valentine','romantic', 'meaningful'],
        description: 'Your significant other'
      },
      { 
        value: 'best-friend', 
        label: 'Best Friend', 
        icon: '👯‍♀️',
        tags: ['friendship', 'cute'],
        description: 'Your closest confidant'
      },
      { 
        value: 'mother', 
        label: 'Mother', 
        icon: '💐',
        tags: ['elegant', 'meaningful'],
        description: 'The woman who gave you life'
      },
      { 
        value: 'sister', 
        label: 'Sister', 
        icon: '👭',
        tags: ['friendship', 'trendy'],
        description: 'Your sister or sister-in-law'
      },
      { 
        value: 'colleague', 
        label: 'Colleague', 
        icon: '💼',
        tags: ['elegant', 'classic'],
        description: 'A work associate'
      },
    ]
  },

  // ===========================
  // QUESTION 3: STYLE PREFERENCE
  // ===========================
  {
    id: 'style',
    question: "What's her style vibe?",
    subtitle: "Choose the aesthetic that suits her best",
    type: 'single-choice',
    required: true,
    weight: 7,
    options: [
      { 
        value: 'romantic-elegant', 
        label: 'Romantic & Elegant', 
        icon: '💎',
        tags: ['romantic', 'elegant'],
        description: 'Sophisticated and loving'
      },
      { 
        value: 'cute-playful', 
        label: 'Cute & Playful', 
        icon: '🎀',
        tags: ['cute', 'trendy'],
        description: 'Sweet and fun aesthetic'
      },
      { 
        value: 'classic-timeless', 
        label: 'Classic & Timeless', 
        icon: '👑',
        tags: ['classic', 'elegant'],
        description: 'Traditional and refined'
      },
      { 
        value: 'trendy-modern', 
        label: 'Trendy & Modern', 
        icon: '⚡',
        tags: ['trendy', 'cute'],
        description: 'Up-to-date and stylish'
      },
      { 
        value: 'meaningful-sentimental', 
        label: 'Meaningful & Sentimental', 
        icon: '💝',
        tags: ['meaningful', 'romantic'],
        description: 'Heartfelt and special'
      },
    ]
  },

  // ===========================
  // QUESTION 4: BUDGET RANGE
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
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default QUIZ_QUESTIONS;