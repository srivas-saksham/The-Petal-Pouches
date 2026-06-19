// frontend/src/components/home/GiftQuiz/quizData.js

/**
 * GIFT QUIZ CONFIGURATION - SIMPLIFIED TAG SYSTEM
 *
 * Universal Tags Used: romantic, friendship, elegant, cute, meaningful, trendy, classic
 * No emoji icons here — the UI maps option.value to a lucide-react icon instead.
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
    weight: 10,
    options: [
      {
        value: 'birthday',
        label: 'Birthday',
        primaryTag: 'birthday',
        description: 'Celebrate another year around the sun'
      },
      {
        value: 'anniversary',
        label: 'Anniversary',
        primaryTag: 'anniversary',
        description: 'Mark a special milestone together'
      },
      {
        value: 'valentine',
        label: "Valentine's Day",
        primaryTag: 'valentine',
        description: 'Express your love and affection'
      },
      {
        value: 'friendship-day',
        label: 'Friendship Day',
        primaryTag: 'friendship-day',
        description: 'Celebrate your bestie'
      },
      {
        value: 'just-because',
        label: 'Just Because',
        primaryTag: 'just-because',
        description: 'No reason needed for kindness'
      },
      {
        value: 'congratulations',
        label: 'Congratulations',
        primaryTag: 'congratulations',
        description: 'Celebrate an achievement'
      },
      {
        value: 'apology',
        label: 'Apology',
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
        tags: ['valentine', 'romantic', 'meaningful'],
        description: 'Your significant other'
      },
      {
        value: 'best-friend',
        label: 'Best Friend',
        tags: ['friendship', 'cute'],
        description: 'Your closest confidant'
      },
      {
        value: 'mother',
        label: 'Mother',
        tags: ['elegant', 'meaningful'],
        description: 'The woman who gave you life'
      },
      {
        value: 'sister',
        label: 'Sister',
        tags: ['friendship', 'trendy'],
        description: 'Your sister or sister-in-law'
      },
      {
        value: 'colleague',
        label: 'Colleague',
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
    question: "What's their style vibe?",
    subtitle: "Choose the aesthetic that suits them best",
    type: 'single-choice',
    required: true,
    weight: 7,
    options: [
      {
        value: 'romantic-elegant',
        label: 'Romantic & Elegant',
        tags: ['romantic', 'elegant'],
        description: 'Sophisticated and loving'
      },
      {
        value: 'cute-playful',
        label: 'Cute & Playful',
        tags: ['cute', 'trendy'],
        description: 'Sweet and fun aesthetic'
      },
      {
        value: 'classic-timeless',
        label: 'Classic & Timeless',
        tags: ['classic', 'elegant'],
        description: 'Traditional and refined'
      },
      {
        value: 'trendy-modern',
        label: 'Trendy & Modern',
        tags: ['trendy', 'cute'],
        description: 'Up-to-date and stylish'
      },
      {
        value: 'meaningful-sentimental',
        label: 'Meaningful & Sentimental',
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
        label: 'Under ₹200',
        priceRange: [0, 200],
        description: 'Thoughtful gifts on a budget'
      },
      {
        value: 'moderate',
        label: '₹200 - ₹500',
        priceRange: [200, 500],
        description: 'Quality gifts at fair prices'
      },
      {
        value: 'premium',
        label: '₹500 - ₹1,000',
        priceRange: [500, 1000],
        description: 'Premium curated experiences'
      },
      {
        value: 'luxury',
        label: 'Above ₹1,000',
        priceRange: [1000, 3000],
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