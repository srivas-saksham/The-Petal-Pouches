// frontend/src/components/home/GiftQuiz/QuizResults.jsx - WITH DEBUG INFO

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ShoppingBag, RotateCcw, Package } from 'lucide-react';
import { getMatchQuality } from '../../../utils/quizMatcher';

/**
 * Quiz Results Component - WITH DEBUG TAG DISPLAY
 * 
 * NEW FEATURES:
 * ✅ Debug section showing user's quiz preferences
 * ✅ Shows primary tag, recipient tags, and style tags
 * ✅ All existing functionality preserved
 */
const QuizResults = ({ 
  rankedResults, 
  onRestart, 
  onAddToCart, 
  onViewDetails,
  loading = false,
  quizAnswers = null, // ADDED: For debug info
  showDebug = true // ADDED: Toggle debug display
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
      {/* Header */}
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

      {/* DEBUG INFO - Shows quiz answers and matching tags */}
      {showDebug && quizAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-tppslate/5 to-tpppeach/5 border border-tppslate/10 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-tpppink rounded-full animate-pulse"></div>
              <h3 className="text-sm font-bold text-tppslate">Debug: Your Matching Preferences</h3>
            </div>
            <span className="text-xs text-tppslate/40 font-mono">Quiz Answers</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Occasion */}
            {quizAnswers.occasion && (
              <div className="bg-white rounded-lg p-3 border border-tppslate/10 space-y-1.5">
                <div className="font-semibold text-tppslate/70 text-[10px] uppercase tracking-wide">Occasion</div>
                <div className="font-bold text-tppslate">{quizAnswers.occasion.label}</div>
                <div className="flex items-center gap-1">
                  <span className="text-tppslate/50">Primary Tag:</span>
                  <span className="px-2 py-0.5 bg-tpppink/10 text-tpppink rounded-full font-mono text-[10px]">
                    {quizAnswers.occasion.primaryTag}
                  </span>
                </div>
              </div>
            )}

            {/* Recipient */}
            {quizAnswers.recipient && (
              <div className="bg-white rounded-lg p-3 border border-tppslate/10 space-y-1.5">
                <div className="font-semibold text-tppslate/70 text-[10px] uppercase tracking-wide">Recipient</div>
                <div className="font-bold text-tppslate">{quizAnswers.recipient.label}</div>
                {quizAnswers.recipient.tags && quizAnswers.recipient.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {quizAnswers.recipient.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-tppmint/10 text-tppmint rounded-full font-mono text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Style */}
            {quizAnswers.style && (
              <div className="bg-white rounded-lg p-3 border border-tppslate/10 space-y-1.5">
                <div className="font-semibold text-tppslate/70 text-[10px] uppercase tracking-wide">Style</div>
                <div className="font-bold text-tppslate">{quizAnswers.style.label}</div>
                {quizAnswers.style.tags && quizAnswers.style.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {quizAnswers.style.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-tpppeach/10 text-tpppeach rounded-full font-mono text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Budget */}
            {quizAnswers.budget && (
              <div className="bg-white rounded-lg p-3 border border-tppslate/10 space-y-1.5">
                <div className="font-semibold text-tppslate/70 text-[10px] uppercase tracking-wide">Budget</div>
                <div className="font-bold text-tppslate">{quizAnswers.budget.label}</div>
                {quizAnswers.budget.priceRange && (
                  <div className="text-tppslate/60">
                    ₹{quizAnswers.budget.priceRange[0]} - ₹{quizAnswers.budget.priceRange[1]}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-tppslate/10">
            <div className="text-[10px] text-tppslate/50 space-y-0.5">
              <div>• Items are matched against: <span className="font-mono text-tpppink">primary_tag</span> (occasion) and <span className="font-mono text-tppmint">tags</span> (recipient + style)</div>
              <div>• Scoring: Primary match +100pts, Recipient tags +20pts each, Style tags +15pts each, Budget +50pts</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Perfect Matches Section */}
      {perfectMatches.length > 0 && (
        <ResultsSection
          title="Perfect Matches"
          subtitle="These gifts scored highest based on your answers"
          icon={<Heart size={20} className="text-tpppink" />}
          items={perfectMatches}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          showDebug={showDebug}
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
          showDebug={showDebug}
        />
      )}

      {/* Actions */}
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
 * Results Section Component
 */
const ResultsSection = ({ title, subtitle, icon, items, onAddToCart, onViewDetails, showDebug }) => {
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[28rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-tppslate/20 scrollbar-track-transparent">
        {items.map((matchedItem, index) => (
          <ResultCard
            key={matchedItem.item.id}
            matchedItem={matchedItem}
            index={index}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
            showDebug={showDebug}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual Result Card - WITH DEBUG TAG INFO
 */
const ResultCard = ({ matchedItem, index, onAddToCart, onViewDetails, showDebug }) => {
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
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-50/80 to-tpppeach/30 overflow-hidden">
        <img
          src={primaryImage}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Match Score Badge */}
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

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-bold text-tppslate line-clamp-2 text-base leading-tight">
          {item.title}
        </h4>

        {/* DEBUG: Item Tags */}
        {showDebug && item.tags && item.tags.length > 0 && (
          <div className="bg-tppslate/5 rounded-lg p-2 space-y-1">
            <div className="text-[9px] font-semibold text-tppslate/50 uppercase tracking-wide">Item Tags</div>
            <div className="flex flex-wrap gap-1">
              {item.primary_tag && (
                <span className="px-1.5 py-0.5 bg-tpppink/20 text-tpppink rounded text-[9px] font-mono border border-tpppink/30">
                  {item.primary_tag} (primary)
                </span>
              )}
              {item.tags.map((tag, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-tppslate/10 text-tppslate/70 rounded text-[9px] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Reasons */}
        <div className="space-y-1.5">
          {matchReasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-tppslate/70">
              <span className="text-tppmint mt-0.5 flex-shrink-0">✓</span>
              <span className="leading-relaxed">{reason.label}</span>
            </div>
          ))}
        </div>

        {/* DEBUG: Score Breakdown */}
        {showDebug && (
          <div className="bg-tppmint/5 rounded-lg p-2 space-y-1">
            <div className="text-[9px] font-semibold text-tppslate/50 uppercase tracking-wide">Score: {score} pts</div>
            <div className="space-y-0.5">
              {matchReasons.map((reason, idx) => (
                <div key={idx} className="flex justify-between text-[9px] text-tppslate/60">
                  <span>{reason.label}</span>
                  <span className="font-mono text-tppmint">+{reason.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
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

        {/* Actions */}
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