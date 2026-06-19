// frontend/src/components/home/GiftQuiz/QuizQuestion.jsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  Check, Heart, Gift, Sparkles, Users, Briefcase, Crown,
  TrendingUp, Wallet, Gem, PartyPopper, HandHeart
} from 'lucide-react';

// Maps each option value to a lucide-react icon — no emojis anywhere.
const ICON_MAP = {
  birthday: Gift,
  anniversary: Heart,
  valentine: Heart,
  'friendship-day': Users,
  'just-because': Sparkles,
  congratulations: PartyPopper,
  apology: HandHeart,
  'romantic-partner': Heart,
  'best-friend': Users,
  mother: Heart,
  sister: Users,
  colleague: Briefcase,
  'romantic-elegant': Gem,
  'cute-playful': Sparkles,
  'classic-timeless': Crown,
  'trendy-modern': TrendingUp,
  'meaningful-sentimental': Heart,
  'budget-friendly': Wallet,
  moderate: Wallet,
  premium: Gem,
  luxury: Crown,
};

const getIcon = (value) => ICON_MAP[value] || Gift;

// Single-choice question — elongated full-width row cards.
// Icon left · label+description center · radio dot right.
// Hover: border tint + very subtle bg fill. Select: accent border + filled dot.
const QuizQuestion = ({ question, value, onChange, isMasculine = false }) => {
  const accentBorder = isMasculine ? 'border-tppdarkwhite' : 'border-tpppink';
  const accentBg    = isMasculine ? 'bg-tppdarkwhite'    : 'bg-tpppink';
  const accentText  = isMasculine ? 'text-tppdarkwhite'  : 'text-tpppink';
  const accentSoft  = isMasculine ? 'bg-tppdarkwhite/8'  : 'bg-tpppink/[0.05]';
  const hoverBorder = isMasculine
    ? 'hover:border-white/70'
    : 'hover:border-white';

  const headingCls = isMasculine
    ? 'font-semibold tracking-tight text-2xl sm:text-3xl text-tppslate dark:text-tppdarkwhite'
    : 'font-italianno text-4xl sm:text-5xl text-tppslate dark:text-tppdarkwhite leading-none';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Question heading */}
      <div className="space-y-0.5">
        <h3 className={headingCls}>{question.question}</h3>
        {question.subtitle && (
          <p className="text-[10px] sm:text-[11px] text-tppslate/40 dark:text-tppdarkwhite/30 font-light tracking-wide">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* 2-column option grid */}
      <div className="grid grid-cols-2 gap-2">
        {question.options.map((option) => {
          const isSelected = value?.value === option.value;
          const Icon = getIcon(option.value);

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option)}
              whileTap={{ scale: 0.98 }}
              className={`
                group relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border
                cursor-pointer text-left
                transition-all duration-200
                ${isSelected
                  ? `${accentBorder} ${accentSoft}`
                  : `border-tppslate/10 dark:border-tppdarkwhite/10 bg-white dark:bg-transparent hover:bg-tpppeach/40 ${hoverBorder}`
                }
              `}
              style={{
                boxShadow: isSelected
                  ? isMasculine
                    ? '0 0 0 1px rgba(255,255,255,0.12)'
                    : '0 4px 12px -4px rgba(217,86,106,0.20)'
                  : 'none',
              }}
            >
              {/* Icon */}
              <div
                className={`
                  flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                  transition-colors duration-200
                  ${isSelected
                    ? accentSoft
                    : 'bg-tppslate/5 dark:bg-tppdarkwhite/5 group-hover:bg-white dark:group-hover:bg-white/10'
                  }
                `}
              >
                <Icon
                  size={13}
                  className={`transition-colors duration-200 ${
                    isSelected
                      ? accentText
                      : 'text-tppslate/40 dark:text-tppdarkwhite/35 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite'
                  }`}
                />
              </div>

              {/* Label only — description hidden to save space in 2-col */}
              <span
                className={`flex-1 min-w-0 text-[12px] sm:text-[13px] font-medium leading-tight transition-colors duration-200 ${
                  isSelected
                    ? 'text-tppslate dark:text-tppdarkwhite'
                    : 'text-tppslate/70 dark:text-tppdarkwhite/55 group-hover:text-tppslate/90 dark:group-hover:text-tppdarkwhite/80'
                }`}
              >
                {option.label}
              </span>

              {/* Radio dot */}
              <div
                className={`
                  flex-shrink-0 w-3.5 h-3.5 rounded-full border transition-all duration-200
                  ${isSelected
                    ? `${accentBg} border-transparent`
                    : 'border-tppslate/20 dark:border-tppdarkwhite/20 group-hover:bg-tpppink dark:group-hover:bg-white group-hover:border-transparent'
                  }
                  flex items-center justify-center
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  >
                    <Check
                      size={7}
                      className={isMasculine ? 'text-tppdark' : 'text-white'}
                      strokeWidth={3.5}
                    />
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

export default QuizQuestion;