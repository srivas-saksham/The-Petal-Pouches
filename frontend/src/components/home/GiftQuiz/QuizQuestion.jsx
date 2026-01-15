// frontend/src/components/home/GiftQuiz/QuizQuestion.jsx - COMPACT VERSION

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Gift, Sparkles, Home, Users, Briefcase, BookOpen, Flower2, Coffee, Palette, Zap, Crown, TrendingUp, Leaf, DollarSign, Edit3, Scissors, Sprout } from 'lucide-react';

// Icon mapping for different option values
const ICON_MAP = {
  // Occasions
  'birthday': Gift,
  'anniversary': Heart,
  'valentine': Heart,
  'thank-you': Sparkles,
  'just-because': Sparkles,
  'congratulations': Sparkles,
  'apology': Flower2,
  'new-baby': Heart,
  
  // Recipients
  'romantic-partner': Heart,
  'best-friend': Users,
  'mother': Flower2,
  'sister': Users,
  'colleague': Briefcase,
  'teacher': BookOpen,
  
  // Interests
  'spa-lover': Sparkles,
  'foodie': Coffee,
  'beauty-enthusiast': Palette,
  'romantic': Heart,
  'homebody': Home,
  'adventurous': Zap,
  'minimalist': Sparkles,
  'eco-conscious': Leaf,
  
  // Styles
  'luxe': Crown,
  'cute': Heart,
  'classic': Crown,
  'trendy': TrendingUp,
  'boho': Flower2,
  
  // Budget
  'budget-friendly': DollarSign,
  'moderate': DollarSign,
  'premium': DollarSign,
  'luxury': Crown,
  
  // Special
  'personalized': Edit3,
  'handmade': Scissors,
  'vegan': Sprout,
  'quick-delivery': Zap,
};

const getIconComponent = (value) => {
  return ICON_MAP[value] || Gift;
};

/**
 * Single Choice Question Component - COMPACT & CLEAN
 */
export const SingleChoiceQuestion = ({ question, value, onChange, compact = false }) => {
  return (
    <div className="space-y-3">
      {/* Question Header - COMPACT: Smaller text */}
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-tppslate">
          {question.question}
        </h3>
        {question.subtitle && (
          <p className="text-xs text-tppslate/50 font-light">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Options Grid - COMPACT: Smaller spacing and text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((option) => {
          const isSelected = value?.value === option.value;
          const IconComponent = getIconComponent(option.value);
          
          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-3 py-2 rounded-lg border transition-all text-left group ${
                isSelected
                  ? 'border-tpppink bg-tpppink/5 shadow-sm'
                  : 'border-tppslate/10 bg-white hover:border-tpppink/30 hover:bg-tpppink/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Icon - COMPACT: Smaller */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-tpppink/15' 
                    : 'bg-tppslate/5 group-hover:bg-tpppink/10'
                }`}>
                  <IconComponent 
                    size={14} 
                    className={isSelected ? 'text-tpppink' : 'text-tppslate/60'} 
                  />
                </div>

                {/* Label Only - COMPACT: Smaller text */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-tppslate text-sm leading-tight">
                    {option.label}
                  </h4>
                </div>

                {/* Check Mark - COMPACT: Smaller */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-4 h-4 bg-tpppink rounded-full flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Multi Choice Question Component - COMPACT & CLEAN
 */
export const MultiChoiceQuestion = ({ question, value = [], onChange, compact = false }) => {
  const maxSelections = question.maxSelections || 999;
  const selectedCount = value.length;
  const canSelectMore = selectedCount < maxSelections;

  const handleToggle = (option) => {
    const isSelected = value.some(v => v.value === option.value);
    
    if (isSelected) {
      onChange(value.filter(v => v.value !== option.value));
    } else {
      if (canSelectMore) {
        onChange([...value, option]);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Question Header with Counter - COMPACT: Smaller */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 flex-1">
          <h3 className="text-base font-semibold text-tppslate">
            {question.question}
          </h3>
          {question.subtitle && (
            <p className="text-xs text-tppslate/50 font-light">
              {question.subtitle}
            </p>
          )}
        </div>
        
        {/* Selection Counter - COMPACT */}
        <div className="flex-shrink-0 px-2 py-1 bg-tpppink/10 rounded-full border border-tpppink/20">
          <span className="text-xs font-semibold text-tpppink">
            {selectedCount}/{maxSelections}
          </span>
        </div>
      </div>

      {/* Options Grid - COMPACT: Smaller spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((option) => {
          const isSelected = value.some(v => v.value === option.value);
          const isDisabled = !isSelected && !canSelectMore;
          const IconComponent = getIconComponent(option.value);
          
          return (
            <motion.button
              key={option.value}
              onClick={() => !isDisabled && handleToggle(option)}
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              disabled={isDisabled}
              className={`relative px-3 py-2 rounded-lg border transition-all text-left group ${
                isSelected
                  ? 'border-tpppink bg-tpppink/5 shadow-sm'
                  : isDisabled
                  ? 'border-tppslate/5 bg-tppslate/5 opacity-50 cursor-not-allowed'
                  : 'border-tppslate/10 bg-white hover:border-tpppink/30 hover:bg-tpppink/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Icon - COMPACT */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-tpppink/15' 
                    : isDisabled
                    ? 'bg-tppslate/5'
                    : 'bg-tppslate/5 group-hover:bg-tpppink/10'
                }`}>
                  <IconComponent 
                    size={14} 
                    className={isSelected ? 'text-tpppink' : 'text-tppslate/60'} 
                  />
                </div>

                {/* Label Only - COMPACT */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-tppslate text-sm leading-tight">
                    {option.label}
                  </h4>
                </div>

                {/* Check Mark - COMPACT */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-4 h-4 bg-tpppink rounded-full flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Main Question Router Component
 */
const QuizQuestion = ({ question, value, onChange, compact = false }) => {
  if (question.type === 'multi-choice') {
    return (
      <MultiChoiceQuestion
        question={question}
        value={value}
        onChange={onChange}
        compact={compact}
      />
    );
  }

  return (
    <SingleChoiceQuestion
      question={question}
      value={value}
      onChange={onChange}
      compact={compact}
    />
  );
};

export default QuizQuestion;