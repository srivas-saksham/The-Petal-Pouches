// frontend/src/components/home/GiftQuiz/QuizContainer.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import RecommendationPanel from './RecommendationPanel';
import { QUIZ_QUESTIONS, validateAnswers } from './quizData';
import { fetchQuizMatches, saveQuizResults } from '../../../services/quizService';
import { useBrand } from '../../../context/BrandContext';

const TOTAL_STEPS = QUIZ_QUESTIONS.length;

const QuizContainer = ({ onAddToCart }) => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [rankedResults, setRankedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const { brandMode } = useBrand();

  const isMasculine = brandMode === 'masculine';
  const gender = isMasculine ? 'male' : 'female';

  const handleAnswerChange = (questionId, value) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Same external behavior as before: select an option, brief pause, then
  // advance — or finish on the last step. Now drives a built-in step engine
  // instead of the old Stepper/Step components.
  const handleChoiceSelect = (questionId, value, questionIndex) => {
    handleAnswerChange(questionId, value);
    const isLast = questionIndex === QUIZ_QUESTIONS.length - 1;

    setTimeout(() => {
      if (isLast) {
        handleQuizComplete({ ...quizAnswers, [questionId]: value });
      } else {
        setDirection(1);
        setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
      }
    }, 320);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleQuizComplete = async (answers = quizAnswers) => {
    const validation = validateAnswers(answers);
    if (!validation.isValid) {
      alert('Please answer all required questions');
      return;
    }

    setLoading(true);
    setQuizComplete(true);

    try {
      const response = await fetchQuizMatches(answers, gender);
      console.log('📦 Quiz Service Response:', response);

      if (response.success && response.data.length > 0) {
        const simpleRankedResults = createSimpleRankedResults(response.data, answers, isMasculine);
        console.log('✅ Ranked Results Created:', simpleRankedResults);
        setRankedResults(simpleRankedResults);
        await saveQuizResults(answers, simpleRankedResults.allResults);
      } else {
        console.warn('⚠️ No items returned from quiz service');
        setRankedResults({ perfectMatches: [], goodAlternatives: [], okayOptions: [], allResults: [], totalMatches: 0 });
      }
    } catch (error) {
      console.error('❌ Error processing quiz:', error);
      setRankedResults({ perfectMatches: [], goodAlternatives: [], okayOptions: [], allResults: [], totalMatches: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setQuizAnswers({});
    setQuizComplete(false);
    setRankedResults(null);
    setCurrentStep(1);
    setDirection(1);
  };

  const handleViewDetails = (item, isProduct) => {
    const path = isProduct ? `/shop/products/${item.id}` : `/shop/bundles/${item.id}`;
    window.location.href = path;
  };

  const handleAddToCart = (item, isProduct) => {
    if (onAddToCart) onAddToCart(item, isProduct);
    else handleViewDetails(item, isProduct);
  };

  if (quizComplete) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <QuizResults
          rankedResults={rankedResults}
          loading={loading}
          onRestart={handleRestart}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          isMasculine={isMasculine}
        />
      </div>
    );
  }

  const activeQuestion = QUIZ_QUESTIONS[currentStep - 1];
  const accent = isMasculine ? 'bg-tppdarkwhite' : 'bg-tpppink';

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 lg:gap-5 items-stretch">

      {/* Quiz panel — left column */}
      <div
        className="relative flex flex-col bg-tpppeach dark:bg-tppdarkgray rounded-[22px] overflow-hidden px-5 sm:px-6 pt-5 pb-6"
        style={{ boxShadow: '0 16px 40px -14px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(217,86,106,0.08)' }}
      >
        {/* Progress header */}
        <div className="pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              aria-label="Go back"
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'border-tppslate/15 dark:border-tppdarkwhite/15 text-tppslate/50 dark:text-tppdarkwhite/40 hover:border-tpppink dark:hover:border-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite cursor-pointer'
              }`}
            >
              <ArrowLeft size={13} />
            </button>

            <div className="flex-1 flex items-center gap-1.5">
              {QUIZ_QUESTIONS.map((q, i) => {
                const stepNum = i + 1;
                const filled = stepNum <= currentStep;
                return (
                  <div
                    key={q.id}
                    className="flex-1 h-[3px] rounded-full bg-tppslate/8 dark:bg-tppdarkwhite/8 overflow-hidden"
                  >
                    <motion.div
                      className={`h-full rounded-full ${accent}`}
                      initial={false}
                      animate={{ width: filled ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                );
              })}
            </div>

            <span className="flex-shrink-0 text-[10px] font-medium text-tppslate/35 dark:text-tppdarkwhite/25 tabular-nums">
              {currentStep}/{TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Sliding question content */}
        <div className="relative flex-1">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeQuestion.id}
              initial={{ x: direction >= 0 ? 24 : -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -24 : 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <QuizQuestion
                question={activeQuestion}
                value={quizAnswers[activeQuestion.id]}
                onChange={(value) => handleChoiceSelect(activeQuestion.id, value, currentStep - 1)}
                isMasculine={isMasculine}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Recommendation panel — right column, refreshes every step */}
      <RecommendationPanel
        gender={gender}
        refreshKey={currentStep}
        isMasculine={isMasculine}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────

function createSimpleRankedResults(items, quizAnswers, isMasculine) {
  console.log(`🎯 Creating ranked results for ${items.length} random items`);

  const matchedItems = items.map((item, index) => {
    const isBundle = item.item_type === 'bundle';
    let isInStock;
    if (isBundle) {
      isInStock = item.stock_limit === null || item.stock_limit > 0;
    } else {
      const stockValue = item.stock_limit ?? item.stock ?? 0;
      isInStock = stockValue > 0;
    }
    const score = 100 - (index * 10);
    const matchReasons = createMatchReasons(item, quizAnswers, score, isMasculine);
    return { item, score, matchReasons, isInStock };
  });

  return {
    perfectMatches: matchedItems,
    goodAlternatives: [],
    okayOptions: [],
    allResults: matchedItems,
    totalMatches: matchedItems.length,
  };
}

function createMatchReasons(item, quizAnswers, score, isMasculine) {
  const reasons = [];
  if (quizAnswers.budget && quizAnswers.budget.priceRange) {
    const [minPrice, maxPrice] = quizAnswers.budget.priceRange;
    if (item.price >= minPrice && item.price <= maxPrice) {
      reasons.push({ label: `Within your ${quizAnswers.budget.label} budget`, points: 50 });
    } else {
      reasons.push({ label: `Premium option at ₹${item.price}`, points: 20 });
    }
  }
  if (quizAnswers.occasion) reasons.push({ label: `Perfect for ${quizAnswers.occasion.label}`, points: 30 });
  if (quizAnswers.recipient) reasons.push({ label: `Great choice for ${quizAnswers.recipient.label}`, points: 20 });
  if (reasons.length === 0) reasons.push({ label: `Carefully curated for ${isMasculine ? 'him' : 'her'}`, points: score });
  return reasons;
}

export default QuizContainer;