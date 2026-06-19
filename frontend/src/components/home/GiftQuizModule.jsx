// frontend/src/components/home/GiftQuizModule.jsx

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import QuizContainer from './GiftQuiz/QuizContainer';
import { useBrand } from '../../context/BrandContext';

const GridBackground = ({ gridSize = 45, opacity = 0.05, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = useRef(null);
  const { brandMode } = useBrand();

  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cols = Math.ceil(rect.width / gridSize);
        const rows = Math.ceil(rect.height / gridSize);
        setGridDimensions({ rows, cols });
      }
    };
    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [gridSize]);

  const getHoveredCell = () => {
    if (!mousePos || !containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = mousePos.x - rect.left;
    const y = mousePos.y - rect.top;
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    if (col >= 0 && col < gridDimensions.cols && row >= 0 && row < gridDimensions.rows) {
      return { row, col };
    }
    return null;
  };

  const hoveredCell = getHoveredCell();

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-tpppink dark:border-tppdarkwhite"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered
                  ? brandMode === 'feminine' ? '#d9566ab7' : '#ffffffcf'
                  : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

const GiftQuizModule = ({ onAddToCart }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [mousePos, setMousePos] = useState(null);
  const { brandMode } = useBrand();

  const isMasculine = brandMode === 'masculine';

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  return (
    <section
      id="gift-quiz-section"
      ref={sectionRef}
      className="relative py-12 md:py-24 bg-gradient-to-br from-white via-tpppeach/10 to-tpppeach/20 dark:from-tppdark dark:via-tppdark dark:to-tppdark overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      <GridBackground opacity={0.12} mousePos={mousePos} />

      {/* Animated top edge */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
        <motion.svg className="w-full h-16 md:h-20" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            animate={{
              d: [
                "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
                "M0,50 C360,65 720,25 1080,45 C1260,55 1380,20 1440,35 L1440,0 L0,0 Z",
                "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="fill-white dark:fill-tppdark"
          />
        </motion.svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Centered header — no left-column text, no paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-12 space-y-2"
        >
          <p className="text-xs sm:text-sm tracking-[0.18em] uppercase font-medium text-tpppink dark:text-tppdarkwhite/60">
            Not Sure What to Gift?
          </p>
          <h2 className={
            isMasculine
              ? 'font-semibold tracking-tight text-4xl sm:text-5xl lg:text-6xl text-tppslate dark:text-tppdarkwhite'
              : 'font-italianno text-5xl sm:text-6xl lg:text-7xl text-tppslate dark:text-tppdarkwhite leading-none'
          }>
            {isMasculine ? 'Find His Perfect Gift' : 'Find Her Perfect Gift'}
          </h2>
        </motion.div>

        {/* Quiz — itself a two-column layout: questions left, live recommendation right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <QuizContainer onAddToCart={onAddToCart} />
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden md:flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-12 lg:mt-16 text-tppslate/60 dark:text-tppdarkwhite/40 text-xs sm:text-sm font-light"
        >
          {['500+ Happy Recipients', '4.9★ Average Rating', 'Free Personalized Card'].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Animated bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
        <motion.svg className="w-full h-16 md:h-20" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            animate={{
              d: [
                "M0,40 C360,70 720,20 1080,50 C1260,65 1380,30 1440,40 L1440,80 L0,80 Z",
                "M0,30 C360,15 720,55 1080,35 C1260,20 1380,60 1440,45 L1440,80 L0,80 Z",
                "M0,40 C360,70 720,20 1080,50 C1260,65 1380,30 1440,40 L1440,80 L0,80 Z",
              ]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="fill-tpppink dark:fill-tppdarkgray"
          />
        </motion.svg>
      </div>
    </section>
  );
};

export default GiftQuizModule;