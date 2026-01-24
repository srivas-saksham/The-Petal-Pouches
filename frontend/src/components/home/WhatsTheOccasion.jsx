// frontend/src/components/home/WhatsTheOccasion.jsx - MOBILE CARD SIZE FIX

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Heart, Eye, Package } from 'lucide-react';
import Circular3DCarousel from './Circular3DCarousel';

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

const WhatsTheOccasion = ({ onQuickView }) => {
  const navigate = (path) => {
    window.location.href = path;
  };
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState(null);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const fetchValentineItems = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        
        const [bundlesResponse, productsResponse] = await Promise.all([
          fetch(`${API_URL}/api/bundles?primary_tag=valentine`),
          fetch(`${API_URL}/api/products?primary_tag=valentine`)
        ]);
        
        if (!bundlesResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch Valentine items');
        }
        
        const bundlesData = await bundlesResponse.json();
        const productsData = await productsResponse.json();
        
        const valentineBundles = bundlesData.data?.filter(bundle => 
          bundle.primary_tag === 'valentine' || 
          (bundle.tags && bundle.tags.includes('valentine'))
        ) || [];
        
        const valentineProducts = productsData.data?.filter(product => 
          product.primary_tag === 'valentine' || 
          (product.tags && product.tags.includes('valentine'))
        ) || [];
        
        const combinedItems = [...valentineBundles, ...valentineProducts];
        
        console.log('💝 Valentine items loaded:', {
          bundles: valentineBundles.length,
          products: valentineProducts.length,
          total: combinedItems.length
        });
        
        setBundles(combinedItems);
      } catch (error) {
        console.error('❌ Error fetching Valentine items:', error);
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValentineItems();
  }, []);

  if (loading) {
    return (
      <section className="relative py-16 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8 mx-auto"></div>
            <div className="flex gap-6 overflow-hidden justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 md:w-80">
                  <div className="bg-slate-200 rounded-2xl h-[400px] md:h-[480px]"></div>
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
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <h2 className="text-base text-tppslate/80 font-light max-w-2xl mx-auto">
            Special Occasions
          </h2>

          <h2 className="text-2xl md:text-3xl font-bold text-tppslate mb-3 uppercase tracking-tight">
            What's the Occasion?
          </h2>

          <h2 className="font-italianno text-6xl md:text-8xl text-tpppink">
            Valentine's
          </h2>
        </div>
      </div>

      <Circular3DCarousel
        items={bundles}
        isInfinity={true}
        autoplay={false}
        delay={5}
        itemWidth={320}
        itemMargin={16}
        visibleAmount={4}
        onItemClick={(bundle) => {
          const isProduct = bundle.stock !== undefined && bundle.stock_limit === undefined;
          if (isProduct) {
            navigate(`/shop/products/${bundle.id}`);
          } else {
            navigate(`/shop/bundles/${bundle.id}`);
          }
        }}
        renderItem={(bundle, index, isDown) => (
          <BundleCardWithGallery
            bundle={bundle}
            index={index}
            onQuickView={onQuickView}
            navigate={navigate}
            isDown={isDown}
          />
        )}
        className="z-10 max-w-8xl mx-auto group"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-10 text-center">
        <button
          onClick={() => navigate('/shop?tags=valentine')}
          className="inline-flex items-center gap-2 px-6 py-3 text-tppslate hover:text-tpppink font-semibold transition-colors group"
        >
          <span>View All Valentine's Gifts</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

// BUNDLE CARD - MOBILE OPTIMIZED
const BundleCardWithGallery = ({ bundle, index, onQuickView, navigate, isDown }) => {
  
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

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [bundle.id]);

  useEffect(() => {
    setImageLoaded(false);
    
    if (currentImage?.img_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
      img.src = currentImage.img_url;
      
      if (img.complete) {
        setImageLoaded(true);
      }
    }
  }, [currentImage?.img_url]);

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
    if (isDown) return;
    
    const isProduct = bundle.stock !== undefined && bundle.stock_limit === undefined;
    
    if (isProduct) {
      navigate(`/shop/products/${bundle.id}`);
    } else {
      navigate(`/shop/bundles/${bundle.id}`);
    }
  };

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
    // MOBILE: w-64 (256px), DESKTOP: md:w-80 (320px)
    <div className="flex-shrink-0 w-64 md:w-80">
      {/* Card - MOBILE: h-[400px], DESKTOP: md:h-[480px] */}
      <div
        onClick={handleCardClick}
        className="h-[400px] md:h-[480px] flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.18),0_8px_16px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group/card bg-transparent"
      >
        {/* Image Container - MOBILE: h-[240px], DESKTOP: md:h-[288px] (60% of card) */}
        <div 
          className="relative flex-shrink-0 h-[240px] md:h-[288px] overflow-hidden bg-gradient-to-br from-pink-50/80 to-tpppeach/40 backdrop-blur-sm"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          
          {/* Valentine's Badge */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
            <div className="px-2 py-1 md:px-3 md:py-1.5 bg-tpppink/95 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 md:gap-1.5">
              <Heart size={10} className="md:w-3 md:h-3" fill="currentColor" />
              <span>Valentine's</span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
          )}

          {/* Current Image */}
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
              <Package size={48} className="md:w-16 md:h-16 text-slate-300" />
            </div>
          )}

          {/* Navigation Arrows - MOBILE: Always visible, DESKTOP: Show on hover */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePreviousImage}
                className={`absolute left-1.5 md:left-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20 ${
                  isHovering ? 'opacity-100' : 'opacity-100 md:opacity-0'
                }`}
                aria-label="Previous image"
              >
                <ChevronLeft size={14} className="md:w-4 md:h-4 text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
              </button>
              
              <button
                onClick={handleNextImage}
                className={`absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group/arrow z-20 ${
                  isHovering ? 'opacity-100' : 'opacity-100 md:opacity-0'
                }`}
                aria-label="Next image"
              >
                <ChevronRight size={14} className="md:w-4 md:h-4 text-slate-700 group-hover/arrow:text-tpppink transition-colors" />
              </button>
            </>
          )}

          {/* Dot Indicators - MOBILE: Always visible, DESKTOP: Show on hover */}
          {hasMultipleImages && (
            <div className={`absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-1.5 px-1.5 py-1 md:px-2 md:py-1.5 bg-black/60 backdrop-blur-sm rounded-full z-20 ${
              isHovering ? 'opacity-100' : 'opacity-100 md:opacity-0'
            }`}>
              {images.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={(e) => handleDotClick(e, dotIndex)}
                  className={`transition-all duration-200 rounded-full ${
                    dotIndex === currentImageIndex
                      ? 'w-1.5 h-0.5 md:w-2 md:h-1 bg-white'
                      : 'w-0.5 h-0.5 md:w-1 md:h-1 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${dotIndex + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content - MOBILE: Smaller padding and text */}
        <div className="flex-1 flex flex-col p-3 md:p-5 bg-white">
          
          {/* Title */}
          <h3 className="text-base md:text-lg font-bold text-tppslate mb-1.5 md:mb-2 line-clamp-1 group-hover/card:text-tpppink transition-colors h-6 md:h-7">
            {bundle.title}
          </h3>

          {/* Description */}
          <p className="text-xs md:text-sm text-tppslate/60 mb-3 md:mb-4 line-clamp-2 font-light leading-relaxed h-8 md:h-10">
            {bundle.description || 'A perfect gift for your loved ones this Valentine\'s Day.'}
          </p>

          {/* Price Section */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 md:gap-2">
              {bundle.original_price && bundle.original_price > bundle.price && (
                <span className="text-xs md:text-sm text-tppslate/40 line-through font-medium">
                  ₹{bundle.original_price}
                </span>
              )}
              
              <span className="text-xl md:text-2xl font-bold text-tpppink">
                ₹{bundle.price}
              </span>
            </div>

            {/* Stock Display */}
            {(bundle.stock !== undefined || bundle.stock_limit !== undefined) && (
              <div className="text-[10px] md:text-xs text-tppslate/60 font-medium">
                {(() => {
                  const stockValue = bundle.stock !== undefined ? bundle.stock : bundle.stock_limit;
                  return stockValue > 0 ? (
                    <span className="text-tppmint">● In Stock</span>
                  ) : (
                    <span className="text-red-500">● Out of Stock</span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsTheOccasion;