// frontend/src/components/home/GiftQuiz/QuizQuestion.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Gift, Sparkles, Users, Briefcase, Crown, TrendingUp, DollarSign } from 'lucide-react';

const ICON_MAP = {
  'birthday': Gift,
  'anniversary': Heart,
  'valentine': Heart,
  'friendship-day': Users,
  'just-because': Sparkles,
  'congratulations': Sparkles,
  'apology': Heart,
  'romantic-partner': Heart,
  'best-friend': Users,
  'mother': Heart,
  'sister': Users,
  'colleague': Briefcase,
  'romantic-elegant': Crown,
  'cute-playful': Heart,
  'classic-timeless': Crown,
  'trendy-modern': TrendingUp,
  'meaningful-sentimental': Heart,
  'budget-friendly': DollarSign,
  'moderate': DollarSign,
  'premium': DollarSign,
  'luxury': Crown,
};

const getIconComponent = (value) => ICON_MAP[value] || Gift;

export const SingleChoiceQuestion = ({ question, value, onChange, compact = false }) => {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-tppslate dark:text-tppdarkwhite">
          {question.question}
        </h3>
        {question.subtitle && (
          <p className="text-xs text-tppslate/50 dark:text-tppdarkwhite/40 font-light">
            {question.subtitle}
          </p>
        )}
      </div>

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
                  ? 'border-tpppink dark:border-tppdarkwhite bg-tpppink/5 dark:bg-tppdarkwhite/5 shadow-sm'
                  : 'border-tppslate/10 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdark hover:border-tpppink/30 dark:hover:border-tppdarkwhite/20 hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-tpppink/15 dark:bg-tppdarkwhite/15'
                    : 'bg-tppslate/5 dark:bg-tppdarkwhite/5 group-hover:bg-tpppink/10 dark:group-hover:bg-tppdarkwhite/10'
                }`}>
                  <IconComponent
                    size={14}
                    className={isSelected ? 'text-tpppink dark:text-tppdarkwhite' : 'text-tppslate/60 dark:text-tppdarkwhite/40'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight transition-colors ${
                    isSelected
                      ? 'text-tppslate dark:text-tppdarkwhite'
                      : 'text-tppslate dark:text-tppdarkwhite/70'
                  }`}>
                    {option.label}
                  </h4>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-4 h-4 bg-tpppink dark:bg-tppdarkwhite rounded-full flex items-center justify-center"
                  >
                    <Check size={10} className="text-white dark:text-tppdark" strokeWidth={3} />
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