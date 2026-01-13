import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Heart, Eye, Package } from 'lucide-react';

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
 * WhatsTheOccasion Component - COMPLETE PROFESSIONAL VERSION
 * 
 * Features:
 * ✅ Interactive grid background
 * ✅ Image loading on route navigation (using key prop)
 * ✅ Quick View button functionality
 * ✅ Smooth animations and transitions
 * ✅ Fixed arrow button clickability (pointer-events-none on images)
 * ✅ Force image reload on navigation
 * ✅ Hides component if no Valentine items found
 * ✅ Centered professional heading
 * ✅ Equal card heights with evenly distributed content
 * ✅ Transparent card backgrounds with realistic shadows
 * ✅ View All redirects to /shop?tags=valentine
 * ✅ Drag-to-scroll carousel (Fixed - accurate mouse tracking)
 * ✅ Edge fade effects
 */
const WhatsTheOccasion = ({ onQuickView }) => {
  const navigate = (path) => {
    // This will be replaced with actual navigate from useNavigate
    window.location.href = path;
  };
  const scrollContainerRef = useRef(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mousePos, setMousePos] = useState(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  // ===========================
  // FETCH VALENTINE'S BUNDLES AND PRODUCTS
  // ===========================
  useEffect(() => {
    const fetchValentineItems = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        
        // Fetch both bundles and products in parallel
        const [bundlesResponse, productsResponse] = await Promise.all([
          fetch(`${API_URL}/api/bundles?primary_tag=valentine`),
          fetch(`${API_URL}/api/products?primary_tag=valentine`)
        ]);
        
        if (!bundlesResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch Valentine items');
        }
        
        const bundlesData = await bundlesResponse.json();
        const productsData = await productsResponse.json();
        
        // Filter Valentine bundles
        const valentineBundles = bundlesData.data?.filter(bundle => 
          bundle.primary_tag === 'valentine' || 
          (bundle.tags && bundle.tags.includes('valentine'))
        ) || [];
        
        // Filter Valentine products
        const valentineProducts = productsData.data?.filter(product => 
          product.primary_tag === 'valentine' || 
          (product.tags && product.tags.includes('valentine'))
        ) || [];
        
        // Combine bundles and products
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

  const scrollLeftBtn = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRightBtn = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // ===========================
  // DRAG TO SCROLL FUNCTIONALITY - FIXED (Circular Gallery Method)
  // ===========================
  const onTouchDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDown(true);
    setScrollPosition(scrollContainerRef.current.scrollLeft);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const onTouchMove = (e) => {
    if (!isDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = startX - clientX;
    scrollContainerRef.current.scrollLeft = scrollPosition + distance;
  };

  const onTouchUp = () => {
    setIsDown(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = '';
    }
  };

  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <section className="relative py-16 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8 mx-auto"></div>
            <div className="flex gap-6 overflow-hidden justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <div className="bg-slate-200 rounded-2xl h-[480px]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ NEW: Hide component if no Valentine items found
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
      
      {/* Section Header - Centered */}
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

      {/* Carousel Container */}
      <div className="relative z-10 max-w-8xl mx-auto group">
        
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeftBtn}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-tppslate hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRightBtn}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-tppslate hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Edge Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-pink-50/60 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-pink-50/60 to-transparent z-20 pointer-events-none" />

        {/* Scrollable Cards Container with Drag-to-Scroll */}
        <div
          ref={scrollContainerRef}
          onMouseDown={onTouchDown}
          onMouseMove={onTouchMove}
          onMouseUp={onTouchUp}
          onMouseLeave={onTouchUp}
          onTouchStart={onTouchDown}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchUp}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            cursor: isDown ? 'grabbing' : 'grab'
          }}
        >
          {bundles.map((bundle, index) => (
            <BundleCardWithGallery
              key={bundle.id}
              bundle={bundle}
              index={index}
              onQuickView={onQuickView}
              navigate={navigate}
              isDown={isDown}
            />
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-10 text-center">
        <button
          onClick={() => navigate('/shop?tags=valentine')}
          className="inline-flex items-center gap-2 px-6 py-3 text-tppslate hover:text-tpppink font-semibold transition-colors group"
        >
          <span>View All Valentine's Gifts</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
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
// BUNDLE CARD WITH IMAGE GALLERY - PROFESSIONAL VERSION
// ===========================
const BundleCardWithGallery = ({ bundle, index, onQuickView, navigate, isDown }) => {
  
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
    // Prevent navigation if user was dragging
    if (isDown) return;
    
    // Check if it's a product or bundle based on presence of 'stock' field
    // Products have 'stock', bundles have 'stock_limit'
    const isProduct = bundle.stock !== undefined && bundle.stock_limit === undefined;
    
    if (isProduct) {
      navigate(`/shop/products/${bundle.id}`);
    } else {
      navigate(`/shop/bundles/${bundle.id}`);
    }
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
    <div className="flex-shrink-0 w-80">
      {/* Card - Fixed Height with Transparent Background and Realistic Shadow */}
      <div
        onClick={handleCardClick}
        className="h-[480px] flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.18),0_8px_16px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group/card bg-transparent"
      >
        {/* Image Container with Gallery - 60% of card height */}
        <div 
          className="relative flex-shrink-0 h-[288px] overflow-hidden bg-gradient-to-br from-pink-50/80 to-tpppeach/40 backdrop-blur-sm"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          
          {/* Valentine's Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="px-3 py-1.5 bg-tpppink/95 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
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

        {/* Card Content - 40% of card height with white background */}
        <div className="flex-1 flex flex-col p-5 bg-white">
          
          {/* Title - Fixed height */}
          <h3 className="text-lg font-bold text-tppslate mb-2 line-clamp-1 group-hover/card:text-tpppink transition-colors h-7">
            {bundle.title}
          </h3>

          {/* Description - Fixed height with line clamp */}
          <p className="text-sm text-tppslate/60 mb-4 line-clamp-2 font-light leading-relaxed h-10">
            {bundle.description || 'A perfect gift for your loved ones this Valentine\'s Day.'}
          </p>

          {/* Price Section - Push to bottom */}
          <div className="flex items-center justify-between mt-auto">
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

            {/* Stock Display - handles both products and bundles */}
            {(bundle.stock !== undefined || bundle.stock_limit !== undefined) && (
              <div className="text-xs text-tppslate/60 font-medium">
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