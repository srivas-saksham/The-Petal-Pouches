// frontend/src/components/home/GiftQuiz/QuizResults.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ShoppingBag, RotateCcw, Package } from 'lucide-react';
import { getMatchQuality } from '../../../utils/quizMatcher';

function getPrimaryImage(item) {
  const bundleImgs = item?.Bundle_images;
  if (Array.isArray(bundleImgs) && bundleImgs.length > 0) {
    const primary = bundleImgs.find(i => i.is_primary) || bundleImgs[0];
    if (primary?.img_url) return primary.img_url;
  }
  const productImgs = item?.Product_images;
  if (Array.isArray(productImgs) && productImgs.length > 0) {
    const primary = productImgs.find(i => i.is_primary) || productImgs[0];
    if (primary?.img_url) return primary.img_url;
  }
  return item?.img_url || 'https://placehold.co/400x400/FFF0F3/D9566A?text=Gift';
}

const QuizResults = ({ rankedResults, onRestart, onAddToCart, onViewDetails, loading = false, isMasculine = false }) => {

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto"
        >
          <Sparkles size={48} className="text-tpppink dark:text-tppdarkwhite" />
        </motion.div>
        <p className="text-sm text-tppslate/50 dark:text-tppdarkwhite/40 font-light tracking-wide">
          Finding perfect gifts for {isMasculine ? 'him' : 'her'}...
        </p>
      </div>
    );
  }

  const { perfectMatches = [], goodAlternatives = [], totalMatches = 0 } = rankedResults ?? {};
  const allItems = [...perfectMatches, ...goodAlternatives];

  if (!allItems.length) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 mx-auto bg-tpppeach/20 dark:bg-tppdarkwhite/10 rounded-full flex items-center justify-center">
          <Package size={32} className="text-tppslate/30 dark:text-tppdarkwhite/30" />
        </div>
        <p className="text-base font-semibold text-tppslate dark:text-tppdarkwhite">No products found</p>
        <p className="text-sm text-tppslate/40 dark:text-tppdarkwhite/40 font-light max-w-xs mx-auto">
          Check back soon — new arrivals are on the way.
        </p>
        <button
          onClick={onRestart}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-full text-sm font-medium hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition shadow-sm"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Header — heading left, retake CTA right */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="space-y-0.5">
          <h2 className={
            isMasculine
              ? 'font-semibold tracking-tight text-2xl sm:text-3xl text-tppslate dark:text-tppdarkwhite'
              : 'font-italianno text-4xl sm:text-5xl text-tppslate dark:text-tppdarkwhite leading-none'
          }>
            {isMasculine ? 'Handpicked For Him' : 'Handpicked For Her'}
          </h2>
          <p className="text-[11px] text-tppslate/40 dark:text-tppdarkwhite/35 font-light">
            {totalMatches} curated gift{totalMatches !== 1 ? 's' : ''} · based on your answers
          </p>
        </div>
        <button
          onClick={onRestart}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200
            bg-tpppink text-white border border-tpppink
            hover:bg-transparent hover:text-tpppink hover:border-tpppink
            dark:bg-white dark:text-tppslate dark:border-white
            dark:hover:bg-transparent dark:hover:text-white dark:hover:border-white"
        >
          <RotateCcw size={11} />
          Retake
        </button>
      </motion.div>

      {/* Grid — no internal scroll, container elongates naturally */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allItems.map((matchedItem, index) => (
          <ResultCard
            key={matchedItem.item?.id ?? index}
            matchedItem={matchedItem}
            index={index}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
            isMasculine={isMasculine}
          />
        ))}
      </div>

      {/* Footer — browse CTA only */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => (window.location.href = '/shop')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-full text-sm font-medium hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-opacity duration-200 shadow-sm cursor-pointer"
        >
          <ShoppingBag size={13} />
          Browse All Gifts
        </button>
      </div>
    </div>
  );
};

const ResultCard = ({ matchedItem, index, onAddToCart, onViewDetails, isMasculine }) => {
  const { item, score, matchReasons, isInStock } = matchedItem;
  const isProduct = item.item_type === 'product';
  const image = getPrimaryImage(item);
  const matchQuality = getMatchQuality(score);

  const displayReasons = (matchReasons ?? [])
    .filter(r => r.type !== 'warning' && r.type !== 'info')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="bg-white dark:bg-tppdark rounded-xl border border-tppslate/8 dark:border-tppdarkwhite/10 overflow-hidden hover:shadow-md dark:hover:border-tppdarkwhite/18 transition-all duration-250 group"
    >
      {/* Image — smaller aspect */}
      <div className="relative aspect-[3/2] bg-gradient-to-br from-pink-50 to-tpppeach/20 dark:from-tppdarkgray dark:to-tppdark overflow-hidden">
        <img
          src={image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 dark:opacity-90"
          onError={e => { e.target.src = 'https://placehold.co/400x300/FFF0F3/D9566A?text=Gift'; }}
        />
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 dark:bg-tppdark/90 backdrop-blur-sm rounded-full text-[9px] font-semibold text-tppslate dark:text-tppdarkwhite tracking-wide">
          {matchQuality.label}
        </span>
        {!isInStock && (
          <div className="absolute inset-0 bg-white/55 dark:bg-tppdark/60 flex items-center justify-center">
            <span className="px-2.5 py-0.5 bg-tppslate/75 dark:bg-tppdarkgray text-white text-[10px] font-medium rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body — compact */}
      <div className="p-3 space-y-1.5">
        <h4 className="font-semibold text-tppslate dark:text-tppdarkwhite text-[12px] sm:text-[13px] leading-snug line-clamp-2">
          {item.title}
        </h4>

        {displayReasons[0] && (
          <p className="flex items-start gap-1 text-[10px] text-tppslate/50 dark:text-tppdarkwhite/35 font-light leading-tight">
            <Heart size={8} className="text-tpppink dark:text-tppdarkwhite/55 mt-0.5 flex-shrink-0" />
            {displayReasons[0].label}
          </p>
        )}

        <div className="flex items-baseline gap-1.5">
          {item.original_price > item.price && (
            <span className="text-[10px] text-tppslate/30 dark:text-tppdarkwhite/25 line-through">
              ₹{item.original_price}
            </span>
          )}
          <span className="text-sm font-bold text-tpppink dark:text-tppdarkwhite">₹{item.price}</span>
        </div>

        <div className="flex gap-1.5 pt-0.5">
          <button
            onClick={() => onViewDetails(item, isProduct)}
            className="flex-1 py-1.5 border border-tppslate/12 dark:border-tppdarkwhite/12 text-tppslate/55 dark:text-tppdarkwhite/45 rounded-lg text-[10px] font-medium hover:border-tpppink dark:hover:border-tppdarkwhite hover:text-tpppink dark:hover:text-tppdarkwhite transition-all duration-200 cursor-pointer"
          >
            Details
          </button>
          {isInStock ? (
            <button
              onClick={() => onAddToCart(item, isProduct)}
              className="flex-1 py-1.5 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg text-[10px] font-medium hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-opacity duration-200 cursor-pointer"
            >
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-1.5 bg-tppslate/6 dark:bg-tppdarkwhite/5 text-tppslate/22 dark:text-tppdarkwhite/18 rounded-lg text-[10px] font-medium cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;