// frontend/src/components/home/GiftQuiz/QuizContainer.jsx

import React, { useState, useRef } from 'react';
import Stepper, { Step } from '../../reactbits/Stepper';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import { QUIZ_QUESTIONS, validateAnswers } from './quizData';
import { fetchQuizMatches, saveQuizResults } from '../../../services/quizService';
import { useBrand } from '../../../context/BrandContext';

const QuizContainer = ({ onAddToCart, compact = false }) => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [rankedResults, setRankedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const stepperRef = useRef(null);
  const { brandMode } = useBrand();

  const isMasculine = brandMode === 'masculine';
  const gender = isMasculine ? 'male' : 'female';

  const handleAnswerChange = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleChoiceSelect = (questionId, value, questionIndex) => {
    handleAnswerChange(questionId, value);

    const isLast = questionIndex === QUIZ_QUESTIONS.length - 1;

    setTimeout(() => {
      if (isLast) {
        handleQuizComplete({ ...quizAnswers, [questionId]: value });
      } else {
        stepperRef.current?.nextStep();
      }
    }, 280);
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
      // ✅ Pass gender so quiz results respect brandMode filtering
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
      <div className="w-full p-4 sm:p-6 bg-white dark:bg-tppdarkgray rounded-2xl">
        <QuizResults
          rankedResults={rankedResults}
          loading={loading}
          onRestart={handleRestart}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          quizAnswers={quizAnswers}
          isMasculine={isMasculine}
          showDebug={true}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-tppdarkgray rounded-2xl">
      <Stepper
        ref={stepperRef}
        initialStep={1}
        onStepChange={(step) => setCurrentStep(step)}
        onFinalStepCompleted={() => handleQuizComplete(quizAnswers)}
        stepCircleContainerClassName="bg-white dark:bg-tppdarkgray shadow-lg px-3"
        stepContainerClassName="pb-3 px-3"
        contentClassName="py-3"
        footerClassName="pt-3"
        backButtonText="Back"
        nextButtonText="Continue"
        backButtonProps={{
          className: "text-xs px-3 py-1.5 text-tppslate/60 dark:text-tppdarkwhite/50 hover:text-tppslate dark:hover:text-tppdarkwhite transition-colors font-medium rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5"
        }}
        nextButtonProps={{
          className: `text-xs px-5 py-2 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-full font-medium
                     hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-all shadow-sm
                     disabled:opacity-40 disabled:cursor-not-allowed`,
        }}
      >
        {QUIZ_QUESTIONS.map((question, idx) => (
          <Step key={question.id}>
            <QuizQuestion
              question={question}
              value={quizAnswers[question.id]}
              onChange={(value) => handleChoiceSelect(question.id, value, idx)}
              compact={compact}
            />
          </Step>
        ))}
      </Stepper>
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