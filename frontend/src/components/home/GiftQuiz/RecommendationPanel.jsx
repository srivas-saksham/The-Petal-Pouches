// frontend/src/components/home/GiftQuiz/RecommendationPanel.jsx

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ShoppingBag } from 'lucide-react';
import { fetchQuizMatches } from '../../../services/quizService';

function getPrimaryImage(item) {
  const bundleImgs = item?.Bundle_images;
  if (Array.isArray(bundleImgs) && bundleImgs.length > 0) {
    const primary = bundleImgs.find((i) => i.is_primary) || bundleImgs[0];
    if (primary?.img_url) return primary.img_url;
  }
  const productImgs = item?.Product_images;
  if (Array.isArray(productImgs) && productImgs.length > 0) {
    const primary = productImgs.find((i) => i.is_primary) || productImgs[0];
    if (primary?.img_url) return primary.img_url;
  }
  return item?.img_url || 'https://placehold.co/500x500/FFF0F3/D9566A?text=Gift';
}

const FALLBACK_BLURB =
  "Hand-picked from our collection — a thoughtful pick worth a closer look.";

/**
 * Live "We Recommend" panel — sits beside the quiz. Fetches a random item
 * via the existing quizService (same source QuizResults uses) and swaps to a
 * new random pick whenever refreshKey changes (i.e. on every quiz step).
 */
const RecommendationPanel = ({ gender, refreshKey, isMasculine, onViewDetails }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    fetchQuizMatches({}, gender).then((res) => {
      if (!mountedRef.current) return;
      if (res.success && res.data.length > 0) {
        const pick = res.data[Math.floor(Math.random() * res.data.length)];
        setItem(pick);
      } else {
        setItem(null);
      }
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
    };
  }, [gender, refreshKey]);

  const accentText = isMasculine ? 'text-tppdarkwhite' : 'text-tpppink';
  const accentBg = isMasculine ? 'bg-tppdarkwhite' : 'bg-tpppink';

  return (
    <div className="relative rounded-[20px] sm:rounded-[24px] overflow-hidden min-h-[360px] sm:min-h-[420px] border border-tppslate/8 dark:border-tppdarkwhite/8">
      <AnimatePresence mode="wait">
        {loading || !item ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8"
          >
            <Sparkles className={`${accentText} animate-pulse`} size={26} />
            <p className="text-xs text-tppslate/40 dark:text-tppdarkwhite/30 font-light">
              Finding a recommendation…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={item.id ?? item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="flex flex-col h-full"
          >
            {/* Image — fixed height to keep panel viewport-friendly */}
            <div className="relative h-36 sm:h-40 bg-gradient-to-br from-pink-50 to-tpppeach/30 dark:from-tppdark dark:to-tppdarkgray overflow-hidden">
              <img
                src={getPrimaryImage(item)}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/500x500/FFF0F3/D9566A?text=Gift';
                }}
              />
            </div>

            {/* Content — compact */}
            <div className="flex-1 flex flex-col justify-between gap-3 p-4 sm:p-5 bg-white dark:bg-tppdarkwhite/[0.03]">
              <div className="space-y-2">
                <p className={`text-[10px] tracking-[0.16em] uppercase font-medium ${accentText} opacity-75`}>
                  We Recommend
                </p>
                <h3 className={`leading-tight text-tppslate dark:text-tppdarkwhite ${
                  isMasculine
                    ? 'font-semibold tracking-tight text-base sm:text-lg'
                    : 'font-italianno text-2xl sm:text-3xl'
                }`}>
                  {item.title}
                </h3>
                <p className="text-[11px] text-tppslate/50 dark:text-tppdarkwhite/35 font-light leading-relaxed line-clamp-1">
                  {item.description || FALLBACK_BLURB}
                </p>

                <div className="flex items-center gap-0.5 pt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={`${accentText} fill-current`} />
                  ))}
                  <span className="text-[10px] text-tppslate/35 dark:text-tppdarkwhite/25 ml-1 font-light">
                    Customer favourite
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  {item.original_price > item.price && (
                    <span className="text-[10px] text-tppslate/28 dark:text-tppdarkwhite/22 line-through">
                      ₹{item.original_price}
                    </span>
                  )}
                  <span className="text-base font-bold text-tppslate dark:text-tppdarkwhite">
                    ₹{item.price}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onViewDetails?.(item, item.item_type === 'product')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 ${accentBg} ${
                    isMasculine ? 'text-tppdark' : 'text-white'
                  } rounded-full text-[11px] font-semibold hover:opacity-90 transition-opacity duration-200 cursor-pointer`}
                >
                  <ShoppingBag size={11} />
                  View Product
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecommendationPanel;