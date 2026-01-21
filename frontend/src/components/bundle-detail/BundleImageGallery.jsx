import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Package, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * BundleImageGallery - Multi-image viewer with carousel thumbnails
 * Features:
 * - Primary image in 1:1 aspect ratio (square)
 * - Full-width thumbnail carousel with drag-to-scroll
 * - Click thumbnails to switch images
 * - Smooth transitions and loading states
 */
const BundleImageGallery = ({ bundle, isOutOfStock }) => {
  // Process images: use new images array or fallback to legacy img_url
  const images = useMemo(() => {
    if (bundle?.images && Array.isArray(bundle.images) && bundle.images.length > 0) {
      // Sort by display_order and prioritize primary image
      return [...bundle.images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.display_order - b.display_order;
      });
    }
    
    // Fallback to legacy single image
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const carouselRef = useRef(null);

  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentImage = images[selectedIndex] || null;
  const hasMultipleImages = images.length > 1;

  // Thumbnail settings
  const THUMBNAIL_WIDTH = 80; // 80px per thumbnail
  const THUMBNAIL_GAP = 8; // 8px gap

  // Update scroll button visibility
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Initialize scroll buttons on mount and when images change
  useEffect(() => {
    updateScrollButtons();
    
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [images]);

  // Handle image selection
  const handleThumbnailClick = (index) => {
    if (index !== selectedIndex && !isDragging) {
      setImageLoading(true);
      setSelectedIndex(index);
    }
  };

  // Navigate to previous image
  const handlePrevious = () => {
    setImageLoading(true);
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Navigate to next image
  const handleNext = () => {
    setImageLoading(true);
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Scroll carousel left
  const scrollCarouselLeft = () => {
    if (!carouselRef.current) return;
    const scrollAmount = (THUMBNAIL_WIDTH + THUMBNAIL_GAP) * 3; // Scroll 3 thumbnails
    carouselRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
  };

  // Scroll carousel right
  const scrollCarouselRight = () => {
    if (!carouselRef.current) return;
    const scrollAmount = (THUMBNAIL_WIDTH + THUMBNAIL_GAP) * 3; // Scroll 3 thumbnails
    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
  };

  // ===========================
  // DRAG TO SCROLL HANDLERS
  // ===========================
  
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiply for faster scroll
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    carouselRef.current.style.cursor = 'grab';
    carouselRef.current.style.userSelect = 'auto';
    updateScrollButtons();
  };

  const handleMouseLeave = () => {
    if (isDragging && carouselRef.current) {
      setIsDragging(false);
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.userSelect = 'auto';
      updateScrollButtons();
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    updateScrollButtons();
  };

  // Handle keyboard navigation for main image
  useEffect(() => {
    if (!hasMultipleImages) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, selectedIndex]);

  return (
    <div className="relative bg-white flex flex-col w-full max-w-full overflow-hidden">
      
      {/* Main Image Container - STRICT 1:1 ASPECT RATIO with mobile constraints */}
      <div className="relative w-full max-w-full" style={{ aspectRatio: '1 / 1' }}>
        
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        {/* Image Display - OBJECT-CONTAIN to maintain aspect ratio */}
        {currentImage ? (
          <img
            src={currentImage.img_url}
            alt={`${bundle.title} - Image ${selectedIndex + 1}`}
            className={`w-full h-full object-contain bg-white transition-opacity duration-300 ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              e.target.src = '/placeholder-bundle.png';
              setImageLoading(false);
            }}
          />
        ) : (
          // Fallback when no images
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Package size={48} className="md:w-16 md:h-16 text-slate-300" />
          </div>
        )}

        {/* Navigation Arrows (only if multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} className="md:w-5 md:h-5 text-slate-700 group-hover:text-tpppink transition-colors" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group z-10"
              aria-label="Next image"
            >
              <ChevronRight size={16} className="md:w-5 md:h-5 text-slate-700 group-hover:text-tpppink transition-colors" />
            </button>
          </>
        )}

        {/* Image Counter (only if multiple images) */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/70 text-white text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white text-xs md:text-sm font-bold px-2 py-1 md:px-4 md:py-2 rounded-md shadow-lg flex items-center gap-1 md:gap-2 z-10">
            <AlertCircle size={12} className="md:w-4 md:h-4" />
            OUT OF STOCK
          </div>
        )}

        {/* Discount Badge */}
        {!isOutOfStock && bundle?.discount_percent > 0 && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-green-500 text-white text-xs md:text-sm font-bold px-2 py-1 md:px-4 md:py-2 rounded-md shadow-lg z-10">
            {bundle.discount_percent}% OFF
          </div>
        )}
      </div>

      {/* Full-Width Carousel Thumbnail Gallery (only if multiple images) */}
      {hasMultipleImages && (
        <div className="border-t border-slate-200 bg-slate-50 p-2 md:p-4 relative max-w-full overflow-hidden">
          
          {/* Left Chevron - Positioned absolutely over carousel */}
          {canScrollLeft && (
            <button
              onClick={scrollCarouselLeft}
              className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-9 md:h-9 bg-white hover:bg-slate-50 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group border-2 border-slate-200"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={14} className="md:w-[18px] md:h-[18px] text-slate-600 group-hover:text-tpppink transition-colors" />
            </button>
          )}

          {/* Draggable Thumbnail Container - FULL WIDTH */}
          <div 
            ref={carouselRef}
            className="flex gap-1.5 md:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide select-none max-w-full"
            style={{ 
              cursor: isDragging ? 'grabbing' : 'grab',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onScroll={updateScrollButtons}
          >
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? 'border-tpppink shadow-lg scale-105'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
                style={{ 
                  width: `${THUMBNAIL_WIDTH}px`, 
                  height: `${THUMBNAIL_WIDTH}px`,
                  pointerEvents: isDragging ? 'none' : 'auto' // Prevent click while dragging
                }}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image.img_url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                  draggable="false"
                />
                
                {/* Selected Indicator Overlay */}
                {index === selectedIndex && (
                  <div className="absolute inset-0 bg-tpppink/15 border-2 border-tpppink rounded-lg pointer-events-none" />
                )}
              </button>
            ))}
          </div>

          {/* Right Chevron - Positioned absolutely over carousel */}
          {canScrollRight && (
            <button
              onClick={scrollCarouselRight}
              className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-9 md:h-9 bg-white hover:bg-slate-50 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group border-2 border-slate-200"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight size={14} className="md:w-[18px] md:h-[18px] text-slate-600 group-hover:text-tpppink transition-colors" />
            </button>
          )}
        </div>
      )}

      {/* Hide scrollbar globally for carousel */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BundleImageGallery;