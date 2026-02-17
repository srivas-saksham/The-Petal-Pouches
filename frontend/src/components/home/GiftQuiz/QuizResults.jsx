// frontend/src/components/home/GiftQuiz/QuizResults.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ShoppingBag, RotateCcw, Package } from 'lucide-react';
import { getMatchQuality } from '../../../utils/quizMatcher';

// ─── Image helper ────────────────────────────────────────────

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

// ─── Main Component ──────────────────────────────────────────

const QuizResults = ({
  rankedResults,
  onRestart,
  onAddToCart,
  onViewDetails,
  loading = false,
}) => {

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto"
        >
          <Sparkles size={48} className="text-tpppink" />
        </motion.div>
        <p className="text-sm text-tppslate/50 font-light tracking-wide">
          Finding perfect gifts for you...
        </p>
      </div>
    );
  }

  const { perfectMatches = [], goodAlternatives = [], totalMatches = 0 } = rankedResults ?? {};
  const allItems = [...perfectMatches, ...goodAlternatives];

  if (!allItems.length) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 mx-auto bg-tpppeach/20 rounded-full flex items-center justify-center">
          <Package size={32} className="text-tppslate/30" />
        </div>
        <p className="text-base font-semibold text-tppslate">No products found</p>
        <p className="text-sm text-tppslate/40 font-light max-w-xs mx-auto">
          Check back soon — new arrivals are on the way.
        </p>
        <button
          onClick={onRestart}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-tpppink
                     text-white rounded-full text-sm font-medium
                     hover:bg-tpppink/90 transition shadow-sm"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1.5"
      >
        <div className="w-11 h-11 mx-auto bg-gradient-to-br from-tpppink to-tpppeach
                        rounded-full flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-tppslate">Handpicked For Her</h2>
        <p className="text-xs text-tppslate/45 font-light">
          {totalMatches} curated gift{totalMatches !== 1 ? 's' : ''} based on your answers
        </p>
      </motion.div>

      {/* Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3
                   max-h-[32rem] overflow-y-auto pr-0.5
                   scrollbar-thin scrollbar-thumb-tppslate/10 scrollbar-track-transparent"
      >
        {allItems.map((matchedItem, index) => (
          <ResultCard
            key={matchedItem.item?.id ?? index}
            matchedItem={matchedItem}
            index={index}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                     border border-tppslate/20 text-tppslate/60 rounded-full
                     text-sm font-medium hover:border-tpppink hover:text-tpppink transition"
        >
          <RotateCcw size={14} />
          Retake Quiz
        </button>
        <button
          onClick={() => (window.location.href = '/shop')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                     bg-tpppink text-white rounded-full text-sm font-medium
                     hover:bg-tpppink/90 transition shadow-sm"
        >
          <ShoppingBag size={14} />
          Browse All Gifts
        </button>
      </div>
    </div>
  );
};

// ─── Result Card ─────────────────────────────────────────────

const ResultCard = ({ matchedItem, index, onAddToCart, onViewDetails }) => {
  const { item, score, matchReasons, isInStock } = matchedItem;
  // isInStock computed correctly in QuizContainer using item_type + stock fields

  const isProduct = item.item_type === 'product';
  const image = getPrimaryImage(item);
  const matchQuality = getMatchQuality(score);

  const displayReasons = (matchReasons ?? [])
    .filter(r => r.type !== 'warning' && r.type !== 'info')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-white rounded-2xl border border-tppslate/8 overflow-hidden
                 hover:shadow-md transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-50 to-tpppeach/20 overflow-hidden">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-[1.03]
                     transition-transform duration-300"
          onError={e => {
            e.target.src = 'https://placehold.co/400x300/FFF0F3/D9566A?text=Gift';
          }}
        />

        {/* Match quality badge */}
        <span className="absolute top-2.5 right-2.5 px-2.5 py-1
                         bg-white/90 backdrop-blur-sm rounded-full shadow-sm
                         text-[10px] font-semibold text-tppslate tracking-wide">
          {matchQuality.label}
        </span>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
            <span className="px-3 py-1 bg-tppslate/75 text-white
                             text-xs font-medium rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">

        {/* Title */}
        <h4 className="font-semibold text-tppslate text-sm leading-snug line-clamp-2">
          {item.title}
        </h4>

        {/* Match reasons */}
        {displayReasons.length > 0 && (
          <ul className="space-y-1">
            {displayReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-tppslate/55 font-light">
                <Heart size={9} className="text-tpppink mt-0.5 flex-shrink-0" />
                {reason.label}
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          {item.original_price > item.price && (
            <span className="text-xs text-tppslate/30 line-through">
              ₹{item.original_price}
            </span>
          )}
          <span className="text-lg font-bold text-tpppink">₹{item.price}</span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 pt-0.5">
          <button
            onClick={() => onViewDetails(item, isProduct)}
            className="flex-1 py-2 border border-tppslate/15 text-tppslate/60 rounded-xl
                       text-xs font-medium hover:border-tpppink hover:text-tpppink transition"
          >
            View Details
          </button>

          {isInStock ? (
            <button
              onClick={() => onAddToCart(item, isProduct)}
              className="flex-1 py-2 bg-tpppink text-white rounded-xl text-xs font-medium
                         hover:bg-tpppink/90 transition shadow-sm"
            >
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-2 bg-tppslate/8 text-tppslate/25 rounded-xl
                         text-xs font-medium cursor-not-allowed"
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