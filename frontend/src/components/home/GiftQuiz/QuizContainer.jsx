// frontend/src/components/home/GiftQuiz/QuizContainer.jsx - COMPACT VERSION

import React, { useState } from 'react';
import Stepper, { Step } from '../../reactbits/Stepper';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import { QUIZ_QUESTIONS, validateAnswers } from './quizData';
import { rankResults } from '../../../utils/quizMatcher';
import { fetchQuizMatches, saveQuizResults } from '../../../services/quizService';

/**
 * QuizContainer - COMPACT VERSION
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
      
      if (response.success && response.data.length > 0) {
        const ranked = rankResults(response.data, quizAnswers);
        setRankedResults(ranked);
        await saveQuizResults(quizAnswers, ranked.allResults);
      } else {
        setRankedResults({
          perfectMatches: [],
          goodAlternatives: [],
          okayOptions: [],
          allResults: [],
          totalMatches: 0
        });
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
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

export default QuizContainer;