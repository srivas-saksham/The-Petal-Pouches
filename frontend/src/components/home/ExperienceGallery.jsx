// frontend/src/components/home/ExperienceGallery.jsx

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Heart, Sparkles, Cake } from 'lucide-react';

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
 * ExperienceGallery Component - REDESIGNED
 * 
 * Features:
 * - 3 featured bundles (horizontal on desktop)
 * - Image POPS OUT on hover (escapes card boundary)
 * - Soft shadows and rounded corners
 * - Spring-based hover animations
 * - Curved section background
 * - Interactive grid background
 */
const ExperienceGallery = () => {
  const [mousePos, setMousePos] = useState(null);
  
  const experiences = [
    {
      id: 'romantic',
      title: 'The Romantic Box',
      description: 'For those who believe in grand gestures and timeless love',
      image: 'https://images.unsplash.com/photo-1606800052052-7a8d5b9d8bf5?w=600&q=80',
      icon: Heart,
      color: 'from-[#FFB5A0] to-[#FFC5D0]',
    },
    {
      id: 'bestie',
      title: 'The Bestie Bundle',
      description: 'Celebrate your ride-or-die friendship with sparkle and joy',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80',
      icon: Sparkles,
      color: 'from-[#FFD4A3] to-[#FFF1D0]',
    },
    {
      id: 'birthday',
      title: 'The Birthday Sparkle',
      description: 'Make their special day unforgettable with this curated delight',
      image: 'https://images.unsplash.com/photo-1608559358217-f2d3c1dce05f?w=600&q=80',
      icon: Cake,
      color: 'from-[#D4A5FF] to-[#E8C5FF]',
    },
  ];

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />
      
      {/* Curved Background Shape */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 C300,150 600,80 900,120 C1200,160 1350,100 1440,120 L1440,800 L0,800 Z"
            fill="#FFF8F5"
            opacity="0.4"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-tppslate mb-4 leading-tight">
            Curated Gift Experiences
          </h2>
          <p className="text-base text-tppslate/70 max-w-2xl mx-auto font-light">
            Each box is thoughtfully designed to create a memorable unboxing moment
          </p>
        </motion.div>

        {/* Three Bundle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((experience, index) => {
            const Icon = experience.icon;

            return (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <motion.div
                  whileHover="hover"
                  className="group relative bg-white rounded-3xl overflow-visible cursor-pointer"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* Image Container - POPS OUT on hover */}
                  <div className="relative overflow-hidden rounded-t-3xl h-72">
                    <motion.div
                      variants={{
                        hover: {
                          scale: 1.15,
                          y: -12,
                          zIndex: 50,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        }
                      }}
                      className="relative w-full h-full"
                    >
                      <img
                        src={experience.image}
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient overlay on hover */}
                      <motion.div
                        variants={{
                          hover: {
                            opacity: 0.3,
                            transition: { duration: 0.3 }
                          }
                        }}
                        initial={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      />

                      {/* Mood Badge */}
                      <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-2 shadow-lg">
                        <Icon size={16} className="text-tpppink" />
                        <span className="text-xs font-medium text-tppslate">
                          {experience.id}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-tppslate mb-3 group-hover:text-tpppink transition-colors">
                      {experience.title}
                    </h3>
                    
                    <p className="text-sm text-tppslate/70 mb-5 leading-relaxed font-light">
                      {experience.description}
                    </p>

                    {/* Color Indicator Bar */}
                    <div 
                      className={`w-full h-1.5 rounded-full bg-gradient-to-r ${experience.color} mb-5`}
                      style={{
                        boxShadow: '0 2px 8px rgba(255, 181, 160, 0.25)',
                      }}
                    />

                    {/* CTA Link */}
                    <motion.div 
                      className="flex items-center justify-between text-tpppink"
                      variants={{
                        hover: {
                          x: 4,
                          transition: { duration: 0.3 }
                        }
                      }}
                    >
                      <span className="text-sm font-medium">Explore Collection</span>
                      <ArrowRight size={18} />
                    </motion.div>
                  </div>

                  {/* Decorative corner accent on hover */}
                  <motion.div
                    variants={{
                      hover: {
                        opacity: 1,
                        transition: { duration: 0.3 }
                      }
                    }}
                    initial={{ opacity: 0 }}
                    className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, transparent 0%, rgba(255, 181, 160, 0.2) 100%)',
                      borderBottomLeftRadius: '100%',
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* How It Works - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 pt-16 border-t border-tppgrey/20"
        >
          <h3 className="text-3xl font-serif text-tppslate text-center mb-12">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { num: '1', title: 'Pick Your Mood', desc: 'Choose from curated collections based on occasion' },
              { num: '2', title: 'Add a Message', desc: 'Personalize with a heartfelt note on premium card' },
              { num: '3', title: 'Create Magic', desc: 'We carefully pack and deliver your perfect gift' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-tpppink rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-white text-xl font-semibold">{step.num}</span>
                </div>
                <h4 className="font-semibold text-tppslate mb-2">{step.title}</h4>
                <p className="text-sm text-tppslate/70 font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceGallery;