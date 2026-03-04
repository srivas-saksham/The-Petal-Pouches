// frontend/src/components/home/HeroParallaxMen.jsx
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';

const HeroParallaxMen = () => {
  const heroRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { setBrandMode } = useBrand();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  return (
    <section
      ref={heroRef}
      className="relative h-[60vh] md:h-[85vh] overflow-hidden bg-tppdark"
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
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="absolute inset-0 w-full h-full"
        >
          <motion.img
            src="/assets/hero-men3.jpeg"
            alt="Rizara Men's Collection"
            className="w-full h-full object-cover"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          {/* Darker overlay for dark theme */}
          <div className="absolute inset-0 bg-gradient-to-b from-tppdark/40 via-transparent to-tppdark/60" />
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="absolute bottom-24 md:bottom-28 left-0 right-0 z-10 px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-row items-center justify-center gap-3 md:gap-4"
        >
          {/* Primary CTA */}
          <motion.button
            onClick={() => navigate('/shop')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 md:px-8 md:py-4 bg-tppdarkwhite text-tppdark rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 shadow-lg hover:shadow-xl transition-shadow"
            style={{
              boxShadow: `
                2px 2px 0 rgba(237,237,237,0.08),
                4px 4px 0 rgba(237,237,237,0.07),
                6px 6px 0 rgba(237,237,237,0.06),
                8px 8px 0 rgba(237,237,237,0.05),
                10px 10px 0 rgba(237,237,237,0.04),
                12px 12px 0 rgba(237,237,237,0.03),
                14px 14px 0 rgba(237,237,237,0.02),
                16px 16px 0 rgba(237,237,237,0.01)
              `
            }}
          >
            <span>Explore Collections</span>
            <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            onClick={() => setBrandMode('feminine')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 md:px-8 md:py-4 bg-tppdark/80 backdrop-blur-sm text-tppdarkwhite rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 border border-tppdarkwhite/20 hover:bg-tppdark transition-colors"
            style={{
              boxShadow: `
                2px 2px 0 rgba(237,237,237,0.05),
                4px 4px 0 rgba(237,237,237,0.04),
                6px 6px 0 rgba(237,237,237,0.03),
                8px 8px 0 rgba(237,237,237,0.02),
                10px 10px 0 rgba(237,237,237,0.01)
              `
            }}
          >
            <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
            <span>Shop for Her</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Wave Divider - DESKTOP */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden">
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
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            fill="#000000d9"
          />
        </motion.svg>
      </div>

      {/* Wave Divider - MOBILE */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden">
        <motion.svg
          className="w-full h-20"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={{
              d: [
                "M0,64 C360,90 720,100 1080,85 C1260,70 1380,45 1440,64 L1440,120 L0,120 Z",
                "M0,70 C360,45 720,60 1080,75 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z",
                "M0,64 C360,90 720,100 1080,85 C1260,70 1380,45 1440,64 L1440,120 L0,120 Z",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            fill="#000000d9"
          />
        </motion.svg>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-tppdarkwhite/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-tppdarkwhite/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroParallaxMen;