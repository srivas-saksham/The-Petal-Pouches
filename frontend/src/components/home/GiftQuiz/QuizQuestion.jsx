// frontend/src/components/home/GiftQuiz/QuizQuestion.jsx - SIMPLIFIED VERSION

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Gift, Sparkles, Users, Briefcase, Crown, TrendingUp, DollarSign } from 'lucide-react';

// Icon mapping for different option values
const ICON_MAP = {
  // Occasions
  'birthday': Gift,
  'anniversary': Heart,
  'valentine': Heart,
  'friendship-day': Users,
  'just-because': Sparkles,
  'congratulations': Sparkles,
  'apology': Heart,
  
  // Recipients
  'romantic-partner': Heart,
  'best-friend': Users,
  'mother': Heart,
  'sister': Users,
  'colleague': Briefcase,
  
  // Styles
  'romantic-elegant': Crown,
  'cute-playful': Heart,
  'classic-timeless': Crown,
  'trendy-modern': TrendingUp,
  'meaningful-sentimental': Heart,
  
  // Budget
  'budget-friendly': DollarSign,
  'moderate': DollarSign,
  'premium': DollarSign,
  'luxury': Crown,
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
 * Main Question Router Component
 */
const QuizQuestion = ({ question, value, onChange, compact = false }) => {
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