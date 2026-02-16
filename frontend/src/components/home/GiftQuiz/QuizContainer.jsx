// frontend/src/components/home/GiftQuiz/QuizContainer.jsx - RANDOM PRODUCTS FIX

import React, { useState } from 'react';
import Stepper, { Step } from '../../reactbits/Stepper';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import { QUIZ_QUESTIONS, validateAnswers } from './quizData';
import { fetchQuizMatches, saveQuizResults } from '../../../services/quizService';

/**
 * QuizContainer - WITH RANDOM PRODUCTS SUPPORT
 * Modified to handle random product display without complex matching
 */
const QuizContainer = ({ onAddToCart, compact = false }) => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [rankedResults, setRankedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleAnswerChange = (questionId, value) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isCurrentStepAnswered = () => {
    const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];
    if (!currentQuestion) return false;
    
    const answer = quizAnswers[currentQuestion.id];
    
    if (currentQuestion.type === 'multi-choice') {
      return answer && answer.length > 0;
    }
    
    return !!answer;
  };

  const handleQuizComplete = async () => {
    const validation = validateAnswers(quizAnswers);
    if (!validation.isValid) {
      alert('Please answer all required questions');
      return;
    }

    setLoading(true);
    setQuizComplete(true);

    try {
      const response = await fetchQuizMatches(quizAnswers);
      
      console.log('📦 Quiz Service Response:', response);
      
      if (response.success && response.data.length > 0) {
        // Create simple ranked results for random products
        const simpleRankedResults = createSimpleRankedResults(response.data, quizAnswers);
        
        console.log('✅ Ranked Results Created:', simpleRankedResults);
        
        setRankedResults(simpleRankedResults);
        await saveQuizResults(quizAnswers, simpleRankedResults.allResults);
      } else {
        console.warn('⚠️ No items returned from quiz service');
        setRankedResults({
          perfectMatches: [],
          goodAlternatives: [],
          okayOptions: [],
          allResults: [],
          totalMatches: 0
        });
      }
    } catch (error) {
      console.error('❌ Error processing quiz:', error);
      setRankedResults({
        perfectMatches: [],
        goodAlternatives: [],
        okayOptions: [],
        allResults: [],
        totalMatches: 0
      });
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
    const path = isProduct 
      ? `/shop/products/${item.id}` 
      : `/shop/bundles/${item.id}`;
    window.location.href = path;
  };

  const handleAddToCart = (item, isProduct) => {
    if (onAddToCart) {
      onAddToCart(item, isProduct);
    } else {
      handleViewDetails(item, isProduct);
    }
  };

  if (quizComplete) {
    return (
      <div className="w-full p-4 sm:p-6">
        <QuizResults
          rankedResults={rankedResults}
          loading={loading}
          onRestart={handleRestart}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          quizAnswers={quizAnswers}
          showDebug={true}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Stepper
        initialStep={1}
        onStepChange={(step) => setCurrentStep(step)}
        onFinalStepCompleted={handleQuizComplete}
        stepCircleContainerClassName="bg-white shadow-lg px-3"
        stepContainerClassName="pb-3 px-3"
        contentClassName="py-3"
        footerClassName="pt-3"
        backButtonText="Back"
        nextButtonText="Continue"
        backButtonProps={{
          className: "text-xs px-3 py-1.5 text-tppslate/60 hover:text-tppslate transition-colors font-medium rounded-lg hover:bg-tppslate/5"
        }}
        nextButtonProps={{
          className: `text-xs px-5 py-2 bg-tpppink text-white rounded-full font-medium 
                     hover:bg-tpppink/90 transition-all shadow-sm
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-tpppink`,
          disabled: !isCurrentStepAnswered()
        }}
      >
        {QUIZ_QUESTIONS.map((question) => (
          <Step key={question.id}>
            <QuizQuestion
              question={question}
              value={quizAnswers[question.id]}
              onChange={(value) => handleAnswerChange(question.id, value)}
              compact={compact}
            />
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

/**
 * Create simple ranked results for random products
 * Assigns dummy scores and reasons to display products properly
 */
function createSimpleRankedResults(items, quizAnswers) {
  console.log(`🎯 Creating ranked results for ${items.length} random items`);
  
  // Check stock status for each item
  const itemsWithStock = items.map(item => {
    const isProduct = item.stock !== undefined && item.stock_limit === undefined;
    const isInStock = isProduct 
      ? (item.stock > 0)
      : (item.stock_limit === null || item.stock_sold < item.stock_limit);
    
    return { ...item, isInStock };
  });
  
  // Create match objects with dummy scores
  const matchedItems = itemsWithStock.map((item, index) => {
    // Assign scores from 100 down (so they look like good matches)
    const score = 100 - (index * 10);
    
    // Create simple match reasons based on quiz answers
    const matchReasons = createMatchReasons(item, quizAnswers, score);
    
    return {
      item,
      score,
      matchReasons,
      isInStock: item.isInStock
    };
  });
  
  // Split items: all go to perfectMatches for now
  const allResults = matchedItems;
  const perfectMatches = matchedItems;
  const goodAlternatives = [];
  const okayOptions = [];
  
  console.log('✅ Results breakdown:', {
    perfectMatches: perfectMatches.length,
    goodAlternatives: goodAlternatives.length,
    okayOptions: okayOptions.length,
    total: allResults.length
  });
  
  return {
    perfectMatches,
    goodAlternatives,
    okayOptions,
    allResults,
    totalMatches: allResults.length
  };
}

/**
 * Create match reasons for display
 */
function createMatchReasons(item, quizAnswers, score) {
  const reasons = [];
  
  // Reason 1: Budget match
  if (quizAnswers.budget && quizAnswers.budget.priceRange) {
    const [minPrice, maxPrice] = quizAnswers.budget.priceRange;
    if (item.price >= minPrice && item.price <= maxPrice) {
      reasons.push({
        label: `Within your ${quizAnswers.budget.label} budget`,
        points: 50
      });
    } else {
      reasons.push({
        label: `Premium option at ₹${item.price}`,
        points: 20
      });
    }
  }
  
  // Reason 2: Occasion
  if (quizAnswers.occasion) {
    reasons.push({
      label: `Perfect for ${quizAnswers.occasion.label}`,
      points: 30
    });
  }
  
  // Reason 3: Recipient
  if (quizAnswers.recipient) {
    reasons.push({
      label: `Great choice for ${quizAnswers.recipient.label}`,
      points: 20
    });
  }
  
  // If no reasons, add a generic one
  if (reasons.length === 0) {
    reasons.push({
      label: 'Carefully curated for her',
      points: score
    });
  }
  
  return reasons;
}

export default QuizContainer;