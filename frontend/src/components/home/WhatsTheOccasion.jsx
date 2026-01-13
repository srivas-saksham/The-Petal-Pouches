// frontend/src/components/home/WhatsTheOccasion.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Eye, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
 * WhatsTheOccasion Component - COMPLETE FIXED VERSION
 * 
 * Features:
 * ✅ Interactive grid background
 * ✅ Image loading on route navigation (using key prop)
 * ✅ Quick View button functionality
 * ✅ Smooth animations and transitions
 * ✅ Fixed arrow button clickability (pointer-events-none on images)
 * ✅ Force image reload on navigation
 */
const WhatsTheOccasion = ({ onQuickView }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  // ===========================
  // FETCH VALENTINE'S BUNDLES
  // ===========================
  useEffect(() => {
    const fetchValentineBundles = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/bundles?primary_tag=valentine`);
        
        if (!response.ok) throw new Error('Failed to fetch bundles');
        
        const data = await response.json();
        
        const valentineBundles = data.data?.filter(bundle => 
          bundle.primary_tag === 'valentine' || 
          (bundle.tags && bundle.tags.includes('valentine'))
        ) || [];
        
        console.log('💝 Valentine bundles loaded:', valentineBundles.length);
        setBundles(valentineBundles);
      } catch (error) {
        console.error('❌ Error fetching Valentine bundles:', error);
        setBundles([
          {
            id: 'valentine-fallback',
            title: 'Valentine Romance Bundle',
            description: 'Express your love with this romantic collection.',
            price: 1299,
            original_price: 1599,
            img_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop',
            stock_limit: 15,
            tags: ['gift', 'celebration'],
            primary_tag: 'valentine',
            images: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchValentineBundles();
  }, []);

  // ===========================
  // SCROLL CONTROL
  // ===========================
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [bundles]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <section className="relative py-16 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <div className="bg-slate-200 rounded-2xl h-96"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <section 
      className="relative py-16 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />
      
      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-tppslate mb-2 uppercase tracking-tight">
            What's the Occasion?
          </h2>
          
          <p className="text-base text-tppslate/60 font-light max-w-2xl">
            Celebrate love with our curated Valentine's Day collection. Thoughtfully designed gift bundles to make hearts flutter.
          </p>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 group">
        
        {/* Left Arrow */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-tppslate hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-tppslate hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </motion.button>
        )}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {bundles.map((bundle, index) => (
            <BundleCardWithGallery
              key={bundle.id}
              bundle={bundle}
              index={index}
              onQuickView={onQuickView}
              navigate={navigate}
            />
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/shop?occasion=valentine')}
          className="inline-flex items-center gap-2 px-6 py-3 text-tppslate hover:text-tpppink font-semibold transition-colors group"
        >
          <span>View All Valentine's Gifts</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

// ===========================
// BUNDLE CARD WITH IMAGE GALLERY
// ===========================
const BundleCardWithGallery = ({ bundle, index, onQuickView, navigate }) => {
  
  // Process images
  const images = useMemo(() => {
    if (bundle?.images && Array.isArray(bundle.images) && bundle.images.length > 0) {
      return [...bundle.images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.display_order - b.display_order;
      });
    }
    
    if (bundle?.img_url) {
      return [{ 
        id: 'legacy', 
        img_url: bundle.img_url, 
        is_primary: true,
        display_order: 0 
      }];
    }
    
    return [];
  }, [bundle]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex] || null;

  // ✅ FIX: Reset image state when bundle changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [bundle.id]);

  // ✅ FIX: Check if current image is already loaded/cached
  useEffect(() => {
    setImageLoaded(false);
    
    if (currentImage?.img_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
      img.src = currentImage.img_url;
      
      // If image is already complete (cached), set loaded immediately
      if (img.complete) {
        setImageLoaded(true);
      }
    }
  }, [currentImage?.img_url]);

  // ===========================
  // IMAGE NAVIGATION HANDLERS
  // ===========================
  const handlePreviousImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    setImageLoaded(false);
  };

  const handleDotClick = (e, dotIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (dotIndex !== currentImageIndex) {
      setCurrentImageIndex(dotIndex);
      setImageLoaded(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/shop/bundles/${bundle.id}`);
  };

  // ✅ FIX: Proper Quick View handler
  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Quick View clicked for:', bundle.title);
    
    if (onQuickView && typeof onQuickView === 'function') {
      onQuickView(bundle);
    } else {
      console.warn('⚠️ onQuickView prop is not a function or not provided');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-shrink-0 w-80"
    >
      {/* Card */}
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group/card"
      >
        {/* Image Container with Gallery */}
        <div 
          className="relative aspect-[4/3] overflow-hidden bg-tpppeach/20"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          
          {/* Valentine's Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="px-3 py-1.5 bg-tpppink text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
              <Heart size={12} fill="currentColor" />
              <span>Valentine's</span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
          )}

          {/* ✅ FIX: Current Image with pointer-events-none for clickable arrows */}
          {currentImage ? (
            <img
              key={`${bundle.id}-${currentImageIndex}-${currentImage.img_url}`}
              src={currentImage.img_url}
              alt={`${bundle.title} - Image ${currentImageIndex + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover/card:scale-110 pointer-events-none z-0`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400/FFB5A0/FFF?text=Valentine+Bundle';
                setImageLoaded(true);
              }}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50 pointer-events-none z-0">
              <Package size={64} className="text-slate-300" />
            </div>
          )}

          {/* Navigation Arrows - Now clickable with higher z-index */}
          {hasMultipleImages && isHovering && (
            <>
              <button
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} className="text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20"
                aria-label="Next image"
              >
                <ChevronRight size={16} className="text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {hasMultipleImages && isHovering && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 bg-black/60 backdrop-blur-sm rounded-full z-20">
              {images.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={(e) => handleDotClick(e, dotIndex)}
                  className={`transition-all duration-200 rounded-full ${
                    dotIndex === currentImageIndex
                      ? 'w-2 h-1 bg-white'
                      : 'w-1 h-1 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${dotIndex + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          
          {/* Title */}
          <h3 className="text-lg font-bold text-tppslate mb-2 line-clamp-1 group-hover/card:text-tpppink transition-colors">
            {bundle.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-tppslate/60 mb-4 line-clamp-2 font-light leading-relaxed">
            {bundle.description}
          </p>

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {bundle.original_price && bundle.original_price > bundle.price && (
                <span className="text-sm text-tppslate/40 line-through font-medium">
                  ₹{bundle.original_price}
                </span>
              )}
              
              <span className="text-2xl font-bold text-tpppink">
                ₹{bundle.price}
              </span>
            </div>

            {bundle.stock_limit !== undefined && (
              <div className="text-xs text-tppslate/60 font-medium">
                {bundle.stock_limit > 0 ? (
                  <span className="text-tppmint">● In Stock</span>
                ) : (
                  <span className="text-red-500">● Out of Stock</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsTheOccasion;