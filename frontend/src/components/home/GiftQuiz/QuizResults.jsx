// frontend/src/components/home/GiftQuiz/QuizResults.jsx - FIXED VERSION

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ShoppingBag, RotateCcw, Package } from 'lucide-react';
import { getMatchQuality } from '../../../utils/quizMatcher';

/**
 * Quiz Results Component - PROFESSIONAL FIXED VERSION
 * 
 * FIXES APPLIED:
 * ✅ Better proportions and spacing
 * ✅ Responsive grid layout
 * ✅ Improved card design
 * ✅ Better mobile experience
 * ✅ Clean, professional styling
 */
const QuizResults = ({ 
  rankedResults, 
  onRestart, 
  onAddToCart, 
  onViewDetails,
  loading = false 
}) => {
  
  if (loading) {
    return (
      <div className="text-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Sparkles size={64} className="text-tpppink" />
        </motion.div>
        <p className="text-tppslate/60 text-sm">Finding your perfect gifts...</p>
      </div>
    );
  }

  const { perfectMatches, goodAlternatives, totalMatches } = rankedResults;
  const hasResults = totalMatches > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-tpppeach/20 rounded-full flex items-center justify-center">
          <Package size={40} className="text-tppslate/40" />
        </div>
        <h3 className="text-2xl font-bold text-tppslate mb-2">
          No Perfect Matches Found
        </h3>
        <p className="text-sm text-tppslate/60 mb-8 max-w-sm mx-auto">
          Try adjusting your preferences or budget to see more options
        </p>
        <button
          onClick={onRestart}
          className="px-6 py-2.5 bg-tpppink text-white rounded-full text-sm font-medium flex items-center gap-2 mx-auto hover:bg-tpppink/90 transition shadow-sm"
        >
          <RotateCcw size={16} />
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - FIXED: Better spacing */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-lg"
        >
          <Sparkles size={32} className="text-white" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold text-tppslate">
          Your Perfect Matches!
        </h2>
        <p className="text-sm text-tppslate/60">
          We found {totalMatches} gift{totalMatches !== 1 ? 's' : ''} tailored just for her
        </p>
      </div>

      {/* Perfect Matches Section */}
      {perfectMatches.length > 0 && (
        <ResultsSection
          title="Perfect Matches"
          subtitle="These gifts scored highest based on your answers"
          icon={<Heart size={20} className="text-tpppink" />}
          items={perfectMatches}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      )}

      {/* Good Alternatives Section */}
      {goodAlternatives.length > 0 && (
        <ResultsSection
          title="Great Alternatives"
          subtitle="Also wonderful options to consider"
          icon={<Sparkles size={20} className="text-tpppeach" />}
          items={goodAlternatives}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      )}

      {/* Actions - FIXED: Better button layout */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 border-2 border-tppslate/20 text-tppslate rounded-full text-sm font-medium flex items-center gap-2 justify-center hover:border-tpppink hover:text-tpppink transition"
        >
          <RotateCcw size={16} />
          Retake Quiz
        </button>
        
        <button
          onClick={() => window.location.href = '/shop'}
          className="px-6 py-2.5 bg-tpppink text-white rounded-full text-sm font-medium flex items-center gap-2 justify-center hover:bg-tpppink/90 transition shadow-sm"
        >
          <ShoppingBag size={16} />
          Browse All Gifts
        </button>
      </div>
    </div>
  );
};

/**
 * Results Section Component - FIXED: Better layout
 */
const ResultsSection = ({ title, subtitle, icon, items, onAddToCart, onViewDetails }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <h3 className="text-lg font-bold text-tppslate">{title}</h3>
          <p className="text-xs text-tppslate/60">{subtitle}</p>
        </div>
      </div>

      {/* Items Grid - FIXED: Better responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[28rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-tppslate/20 scrollbar-track-transparent">
        {items.map((matchedItem, index) => (
          <ResultCard
            key={matchedItem.item.id}
            matchedItem={matchedItem}
            index={index}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual Result Card - FIXED: Professional design
 */
const ResultCard = ({ matchedItem, index, onAddToCart, onViewDetails }) => {
  const { item, score, matchReasons, isInStock } = matchedItem;
  const matchQuality = getMatchQuality(score);
  
  // Determine if it's a product or bundle
  const isProduct = item.stock !== undefined && item.stock_limit === undefined;
  
  // Get primary image
  const primaryImage = item.images?.[0]?.img_url || item.img_url || 'https://placehold.co/300x300/FFB5A0/FFF?text=Gift';

  // Color mapping for match quality badges
  const badgeColors = {
    'tppmint': 'bg-tppmint',
    'tpppeach': 'bg-tpppeach', 
    'tpppink': 'bg-tpppink',
    'green-500': 'bg-green-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-xl border border-tppslate/10 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image - FIXED: Better aspect ratio */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-50/80 to-tpppeach/30 overflow-hidden">
        <img
          src={primaryImage}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Match Score Badge - FIXED: Better positioning */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 ${badgeColors[matchQuality.color] || 'bg-tppmint'} rounded-full shadow-md`}>
          <span className="text-xs font-bold text-white">
            {matchQuality.emoji} {matchQuality.label}
          </span>
        </div>

        {/* Stock Badge */}
        {!isInStock && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 rounded-full shadow-md">
            <span className="text-xs font-bold text-white">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content - FIXED: Better spacing and typography */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-bold text-tppslate line-clamp-2 text-base leading-tight">
          {item.title}
        </h4>

        {/* Match Reasons - FIXED: Better display */}
        <div className="space-y-1.5">
          {matchReasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-tppslate/70">
              <span className="text-tppmint mt-0.5 flex-shrink-0">✓</span>
              <span className="leading-relaxed">{reason.label}</span>
            </div>
          ))}
        </div>

        {/* Price - FIXED: Better styling */}
        <div className="flex items-baseline gap-2 pt-1">
          {item.original_price && item.original_price > item.price && (
            <span className="text-sm text-tppslate/40 line-through">
              ₹{item.original_price}
            </span>
          )}
          <span className="text-xl font-bold text-tpppink">
            ₹{item.price}
          </span>
        </div>

        {/* Actions - FIXED: Better button design */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onViewDetails(item, isProduct)}
            className="flex-1 px-3 py-2 border-2 border-tppslate/15 text-tppslate rounded-lg text-sm font-medium hover:border-tpppink hover:text-tpppink transition-all"
          >
            Details
          </button>
          
          {isInStock && (
            <button
              onClick={() => onAddToCart(item, isProduct)}
              className="flex-1 px-3 py-2 bg-tpppink text-white rounded-lg text-sm font-medium hover:bg-tpppink/90 transition-all shadow-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;