// frontend/src/components/home/GiftQuizModule.jsx

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Star } from 'lucide-react';

// Interactive Grid Background Component
const GridBackground = ({ gridSize = 40, opacity = 0.05, mousePos }) => {
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
                transition: 'all 0.2s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

/**
 * GiftQuizModule Component - REDESIGNED
 * 
 * Features:
 * - Two-column layout (text left, visual right)
 * - Slightly right-heavy alignment
 * - Clean minimal design
 * - Curved section with soft background
 * - Subtle scroll reveal animation
 */
const GiftQuizModule = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [mousePos, setMousePos] = useState(null);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-white via-tpppeach/10 to-tpppeach/20 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />
      
      {/* Mouse tracker overlay for grid interaction */}
      <div className="absolute inset-0 z-50 pointer-events-none" 
           onMouseMove={(e) => {
             const gridElement = e.currentTarget.previousElementSibling;
             if (gridElement) {
               const mouseEvent = new MouseEvent('mousemove', {
                 clientX: e.clientX,
                 clientY: e.clientY,
                 bubbles: true
               });
               gridElement.dispatchEvent(mouseEvent);
             }
           }}
      />
      
      {/* Animated Curved top edge */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden">
        <motion.svg
          className="w-full h-20"
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

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:pr-8"
          >
            {/* Small heading */}
            <p className="text-sm tracking-wider text-tpppink uppercase mb-3 font-medium">
              Not Sure What to Gift?
            </p>

            {/* Main heading */}
            <h2 className="text-4xl md:text-5xl font-serif text-tppslate mb-6 leading-tight">
              Find Her Perfect Gift in 30 Seconds
            </h2>

            {/* Supporting text */}
            <p className="text-base text-tppslate/70 mb-8 leading-relaxed font-light">
              Answer a few quick questions about her style, interests, and your relationship. 
              We'll recommend a beautifully curated gift box that she'll absolutely love.
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} className="text-tpppink" />
                </div>
                <span className="text-sm font-medium text-tppslate">Personalized</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-tpppink" />
                </div>
                <span className="text-sm font-medium text-tppslate">Quick & Easy</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tpppink/10 flex items-center justify-center flex-shrink-0">
                  <Star size={18} className="text-tpppink" />
                </div>
                <span className="text-sm font-medium text-tppslate">Guaranteed Joy</span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-tpppink text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles size={18} />
              Start the Gift Quiz
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          {/* Right Column - Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Floating visual card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              {/* Mock quiz interface */}
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tpppink to-tpppink/70 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles size={28} className="text-white" />
                </div>

                <h3 className="text-2xl font-serif text-tppslate mb-4">
                  Quick Gift Finder
                </h3>

                {/* Mock question */}
                <div className="space-y-3">
                  <p className="text-sm text-tppslate/70 font-light">What's the occasion?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Birthday', 'Anniversary', 'Just Because', 'Thank You'].map((option) => (
                      <button
                        key={option}
                        className="px-4 py-3 bg-tpppeach/30 hover:bg-tpppeach/50 text-tppslate text-sm rounded-xl transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="flex gap-2 mt-8">
                  <div className="h-1.5 flex-1 bg-tpppink rounded-full" />
                  <div className="h-1.5 flex-1 bg-tppgrey/30 rounded-full" />
                  <div className="h-1.5 flex-1 bg-tppgrey/30 rounded-full" />
                </div>
              </div>

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
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#FFB5A0] to-[#FFC5D0] rounded-2xl opacity-80 shadow-lg"
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
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#D4A5FF] to-[#E8C5FF] rounded-2xl opacity-70 shadow-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-tppslate/60 text-sm font-light"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>500+ Happy Recipients</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>4.9★ Average Rating</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tppmint" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free Personalized Card</span>
          </div>
        </motion.div>
      </div>

      {/* Animated Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <motion.svg
          className="w-full h-20"
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