// frontend/src/components/home/HeroParallax.jsx

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * HeroParallax Component - REDESIGNED
 * 
 * Features:
 * - Curved mask hero container (NO straight edges)
 * - Vertical parallax on hero image
 * - Floating content with depth
 * - Minimal, premium aesthetic
 * - Soft wave divider at bottom
 * - Interactive blur effect on hover
 */
const HeroParallax = () => {
  const heroRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Scroll-based parallax transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Image moves up as user scrolls down (subtle parallax)
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  
  // Content fades and moves as user scrolls
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  return (
    <section 
      ref={heroRef} 
      className="relative h-[85vh] overflow-hidden bg-gradient-to-br from-[#FFF1F6] via-[#F7E1D7] to-[#FFE8E0]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Hero Image Container with Curved Mask */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'ellipse(120% 100% at 50% 0%)',
          WebkitClipPath: 'ellipse(120% 100% at 50% 0%)',
        }}
      >
        {/* Parallax Image */}
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="absolute inset-0 w-full h-full"
        >
          <motion.img
            src="/assets/hero-video-poster.jpg"
            alt="Rizara Gift Experience"
            className="w-full h-full object-cover"
            animate={{
              filter: isHovered ? 'blur(0px)' : 'blur(2px)'
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        </motion.div>
      </div>

      {/* Hero Content - Centered */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex items-center justify-center px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-6xl md:text-12xl lg:text-[156px] font-italianno text-tpppink tracking-tight leading-none">
              Rizara
            </h2>
            <p className="text-base md:text-lg text-tppslate/70 mt-3 tracking-wide font-light">
              Moments Wrapped in Sparkle
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-tpppink text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              Explore Collections
              <ArrowRight size={18} />
            </motion.button>

            {/* Secondary CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/90 backdrop-blur-sm text-tppslate rounded-full text-sm font-medium flex items-center gap-2 border border-tppgrey/30 hover:bg-white transition-colors"
            >
              <Sparkles size={18} />
              Take Gift Quiz
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Wave Divider - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden">
        <motion.svg
          className="w-full h-24 md:h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={{
                d: [
                    "M0,64 C240,90 480,100 720,85 C960,70 1200,45 1440,64 L1440,120 L0,120 Z",
                    "M0,70 C240,45 480,60 720,75 C960,90 1200,80 1440,70 L1440,120 L0,120 Z",
                    "M0,50 C240,75 480,85 720,65 C960,45 1200,70 1440,55 L1440,120 L0,120 Z",
                    "M0,75 C240,50 480,70 720,90 C960,80 1200,60 1440,75 L1440,120 L0,120 Z",
                    "M0,64 C240,90 480,100 720,85 C960,70 1200,45 1440,64 L1440,120 L0,120 Z",
                ]
                }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            fill="#FFFFFF"
          />
        </motion.svg>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            className="w-1.5 h-1.5 bg-white/80 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroParallax;