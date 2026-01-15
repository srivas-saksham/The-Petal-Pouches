// frontend/src/components/home/GiftQuizModule.jsx - COMPACT VERSION

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Star } from 'lucide-react';
import QuizContainer from './GiftQuiz/QuizContainer';

// Interactive Grid Background Component
const GridBackground = ({ gridSize = 45, opacity = 0.05, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = useRef(null);

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
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-tpppink"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered ? '#d9566ab7' : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

/**
 * GiftQuizModule Component - COMPACT VERSION
 */
const GiftQuizModule = ({ onAddToCart }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [mousePos, setMousePos] = useState(null);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-gradient-to-br from-white via-tpppeach/10 to-tpppeach/20 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground opacity={0.12} mousePos={mousePos} />
      
      {/* Animated Curved top edge */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
        <motion.svg
          className="w-full h-16 md:h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={{
              d: [
                "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
                "M0,50 C360,65 720,25 1080,45 C1260,55 1380,20 1440,35 L1440,0 L0,0 Z",
                "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            fill="#FFFFFF"
          />
        </motion.svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:pr-6 space-y-6"
          >
            {/* Small heading */}
            <p className="text-xs sm:text-sm tracking-wider text-tpppink uppercase font-medium">
              Not Sure What to Gift?
            </p>

            {/* Main heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-italianno text-tppslate leading-tight">
              Find Her Perfect Gift in 30 Seconds
            </h2>

            {/* Supporting text */}
            <p className="text-sm sm:text-base text-tppslate/70 leading-relaxed font-light max-w-xl">
              Answer a few quick questions about her style, interests, and your relationship. 
              We'll recommend a beautifully curated gift box that she'll absolutely love.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-tpppink" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-tppslate">Personalized</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-tpppink" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-tppslate">Quick & Easy</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Star size={16} className="text-tpppink" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-tppslate">Guaranteed Joy</span>
              </div>
            </div>

            {/* Call-to-action hint - Mobile only */}
            <div className="flex lg:hidden items-center gap-2 text-xs sm:text-sm text-tppslate/60">
              <ArrowRight size={14} className="text-tpppink" />
              <span className="font-light">Take the quiz below to get started</span>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-tppslate/60">
              <ArrowRight size={16} className="text-tpppink" />
              <span className="font-light">Get started with the quiz on the right →</span>
            </div>
          </motion.div>

          {/* Right Column - Quiz Container */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
          >
            {/* Quiz Card with decorative elements */}
            <div className="relative w-full">
              {/* Decorative floating elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-3 -right-3 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#FFB5A0] to-[#FFC5D0] rounded-2xl opacity-80 shadow-lg z-0"
              />

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-3 -left-3 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#D4A5FF] to-[#E8C5FF] rounded-2xl opacity-70 shadow-lg z-0"
              />

              {/* Actual Quiz Container */}
              <div className="relative z-10 w-full">
                <QuizContainer 
                  onAddToCart={onAddToCart}
                  compact={true}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-12 lg:mt-16 text-tppslate/60 text-xs sm:text-sm font-light"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>500+ Happy Recipients</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>4.9★ Average Rating</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free Personalized Card</span>
          </div>
        </motion.div>
      </div>

      {/* Animated Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
        <motion.svg
          className="w-full h-16 md:h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={{
              d: [
                "M0,40 C360,70 720,20 1080,50 C1260,65 1380,30 1440,40 L1440,80 L0,80 Z",
                "M0,30 C360,15 720,55 1080,35 C1260,20 1380,60 1440,45 L1440,80 L0,80 Z",
                "M0,40 C360,70 720,20 1080,50 C1260,65 1380,30 1440,40 L1440,80 L0,80 Z",
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            fill="#d9566a"
          />
        </motion.svg>
      </div>
    </section>
  );
};

export default GiftQuizModule;