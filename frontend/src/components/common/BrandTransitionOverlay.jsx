// frontend/src/components/common/BrandTransitionOverlay.jsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';

export default function BrandTransitionOverlay() {
  const { isTransitioning, transitionPhase, pendingMode, applyPendingMode } = useBrand();
  const midpointFired = useRef(false);

  // Reset midpoint guard when transition starts
  useEffect(() => {
    if (transitionPhase === 'closing') {
      midpointFired.current = false;
    }
  }, [transitionPhase]);

  const toMasculine = pendingMode === 'masculine';

  const topPanelVariants = {
    hidden: { y: '-100%' },
    visible: { y: '0%', transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
    exit: { y: '-100%', transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.55 } },
  };

  const bottomPanelVariants = {
    hidden: { y: '100%' },
    visible: { y: '0%', transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
    exit: { y: '100%', transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.55 } },
  };

  const textVariants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.1 } },
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
  };

  // Fire applyPendingMode at midpoint (when panels are closed)
  const handleTopPanelAnimationComplete = (definition) => {
    if (definition === 'visible' && !midpointFired.current) {
      midpointFired.current = true;
      applyPendingMode();
    }
  };

  return (
    <AnimatePresence>
      {isTransitioning && (
        <>
          {/* Top Panel */}
          <motion.div
            key="top-panel"
            className="fixed top-0 left-0 right-0 h-1/2 z-[9999] flex items-end justify-center pb-1"
            style={{
              background: toMasculine
                ? 'linear-gradient(to bottom, #0a0a0a, #130100)'
                : 'linear-gradient(to bottom, #fff0f3, #fce4ec)',
            }}
            variants={topPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={handleTopPanelAnimationComplete}
          >
            {/* Text shown at midpoint */}
            <AnimatePresence>
              {transitionPhase === 'open' && (
                <motion.div
                  key="text"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center select-none"
                >
                  <p className={`text-xs font-semibold tracking-[0.4em] uppercase mb-1 ${
                    toMasculine ? 'text-white/40' : 'text-tpppink/60'
                  }`}>
                    {toMasculine ? 'Now entering' : 'Returning to'}
                  </p>
                  <p className={`text-2xl font-bold tracking-wide ${
                    toMasculine ? 'text-white' : 'text-tpppink'
                  }`}>
                    {toMasculine ? 'The Void' : 'The Light'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bottom Panel */}
          <motion.div
            key="bottom-panel"
            className="fixed bottom-0 left-0 right-0 h-1/2 z-[9999] flex items-start justify-center pt-1"
            style={{
              background: toMasculine
                ? 'linear-gradient(to top, #0a0a0a, #130100)'
                : 'linear-gradient(to top, #fff0f3, #fce4ec)',
            }}
            variants={bottomPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative line at seam */}
            <div className={`w-16 h-0.5 mt-0 ${
              toMasculine ? 'bg-white/20' : 'bg-tpppink/30'
            }`} />
          </motion.div>

          {/* Center seam glow */}
          <motion.div
            key="seam"
            className="fixed top-1/2 left-0 right-0 -translate-y-1/2 h-px z-[10000]"
            style={{
              background: toMasculine
                ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(217,86,106,0.4) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          />
        </>
      )}
    </AnimatePresence>
  );
}