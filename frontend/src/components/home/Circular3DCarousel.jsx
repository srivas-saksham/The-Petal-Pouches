// frontend/src/components/home/Circular3DCarousel.jsx - MOBILE OPTIMIZED

import React, { useState, useEffect, useRef } from 'react';

/**
 * Circular3DCarousel.jsx - MOBILE OPTIMIZED
 * 
 * Mobile-Only Changes:
 * ✅ Carousel scaled to 70% on mobile
 * ✅ Desktop UI completely untouched
 */
const Circular3DCarousel = ({
  items = [],
  isInfinity = true,
  autoplay = false,
  delay = 5,
  itemWidth = 400,
  itemMargin = 40,
  visibleAmount = 4,
  onItemClick = null,
  renderItem = null,
  className = ''
}) => {
  const [nowIndex, setNowIndex] = useState(isInfinity ? visibleAmount : 0);
  const [isAnimate, setIsAnimate] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [diffX, setDiffX] = useState(0);
  const [movingStatus, setMovingStatus] = useState(1);
  const [dataArray, setDataArray] = useState(items);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive item width: 250px on mobile, 400px on desktop
  const responsiveItemWidth = isMobile ? 250 : itemWidth;
  const responsiveItemMargin = isMobile ? 16 : itemMargin;

  // Initialize infinite scroll data
  useEffect(() => {
    if (isInfinity && items.length > 0) {
      const behindData = items.slice(0, visibleAmount);
      const beforeData = items.slice(-visibleAmount);
      const newDataArray = [...beforeData, ...items, ...behindData].map((item, index) => ({
        ...item,
        time: new Date().getTime() + index
      }));
      setDataArray(newDataArray);
    } else {
      setDataArray(items);
    }
  }, [items, isInfinity, visibleAmount]);

  // Auto-play functionality
  useEffect(() => {
    if (autoplay && dataArray.length > 0) {
      timerRef.current = setInterval(() => {
        changeImagePosition(1);
      }, delay * 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [autoplay, delay, nowIndex, dataArray.length]);

  // Compute left position for carousel
  const computedLeft = () => {
    const leftSpan = parseInt(`${-nowIndex * parseInt(responsiveItemWidth)}`);
    let marginSpan = responsiveItemMargin * nowIndex;
    
    if (isInfinity) {
      marginSpan = responsiveItemMargin * (nowIndex - 1) + responsiveItemMargin;
    }
    
    return {
      carouselTranslateX: `${leftSpan - marginSpan}`,
      carouselTranslateZ: -400,
      carouselOpacity: 0
    };
  };

  // Change carousel position
  const changeImagePosition = (index) => {
    let thisIndex = (nowIndex + index) % dataArray.length;
    
    if (!isInfinity && thisIndex < 0) {
      thisIndex = dataArray.length - 1;
    }
    
    if (isInfinity) {
      thisIndex = nowIndex + index;
    }
    
    setNowIndex(thisIndex);
    setIsAnimate(true);
  };

  // Handle transition end for infinite scroll
  const handleTransitionEnd = () => {
    if (!isInfinity) return;
    
    if (nowIndex >= dataArray.length - visibleAmount) {
      setNowIndex(visibleAmount);
      setIsAnimate(false);
    } else if (nowIndex <= 0) {
      setNowIndex(dataArray.length - (visibleAmount * 2));
      setIsAnimate(false);
    }
  };

  // Mouse/Touch event handlers
  const handleMouseDown = (e) => {
    const mobileMoveStartX = e.touches ? e.touches[0].clientX : 0;
    const clientX = e.clientX ? e.clientX : mobileMoveStartX;
    setIsMouseDown(true);
    setStartX(clientX);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    
    const mobileMoveX = e.touches ? e.touches[0].clientX : startX;
    const moveX = e.clientX ? e.clientX : mobileMoveX;
    const diff = startX - moveX;
    const spanDistance = responsiveItemWidth + responsiveItemMargin;
    
    if (diff > spanDistance || diff < -spanDistance) return;
    
    setDiffX(diff);
    setMovingStatus(-diff < 0 ? -1 : 1);
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown) return;
    
    const maxDiffX = responsiveItemWidth / 2;
    const mobileMoveX = e.changedTouches ? e.changedTouches[0].pageX : startX;
    const moveX = e.clientX || mobileMoveX;
    const diff = startX - moveX;
    
    let thisIndex;
    
    if (diff > maxDiffX) {
      thisIndex = nowIndex + 1;
    } else if (diff < -maxDiffX) {
      thisIndex = nowIndex - 1;
    }
    
    if (!isInfinity) {
      thisIndex = thisIndex < 0 ? 0 : thisIndex > dataArray.length - 1 ? dataArray.length - 1 : thisIndex;
    }
    
    setIsMouseDown(false);
    setIsAnimate(true);
    setNowIndex(thisIndex !== undefined ? thisIndex : nowIndex);
    setStartX(0);
    setDiffX(0);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsAnimate(true);
    setStartX(0);
    setDiffX(0);
  };

  // Compute moving style for 3D effect
  const computedMovingStyle = (index) => {
    const styles = {
      translateX: '0',
      translateZ: '0',
      opacityStyle: '1'
    };
    
    if (!isMouseDown && nowIndex <= index) return styles;
    
    if (!isMouseDown && nowIndex > index) {
      return {
        translateX: 0,
        translateZ: -responsiveItemWidth,
        opacityStyle: 0
      };
    }
    
    if (movingStatus === 1) {
      if (nowIndex - 1 === index) {
        const z = -responsiveItemWidth + parseInt(-diffX);
        styles.translateZ = `${z > 0 ? 0 : z}`;
        styles.opacityStyle = `${-diffX / responsiveItemWidth}`;
      } else if (nowIndex > index) {
        styles.translateZ = `${-responsiveItemWidth}`;
        styles.opacityStyle = `0`;
      }
    } else if (movingStatus === -1) {
      if (nowIndex === index) {
        styles.translateZ = `${-diffX}`;
        styles.opacityStyle = `${1 - Math.abs(diffX / responsiveItemWidth)}`;
      } else if (nowIndex > index) {
        styles.translateZ = `${-responsiveItemWidth}`;
        styles.opacityStyle = `0`;
      }
    }
    
    styles.translateX = `${-diffX}`;
    return styles;
  };

  const { carouselTranslateX } = computedLeft();

  if (!renderItem) {
    console.error('Circular3DCarousel: renderItem prop is required');
    return null;
  }

  if (dataArray.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full flex justify-center ${className}`}>
      <div className="relative w-full whitespace-nowrap">
        {/* Main Carousel Posts */}
        <div
          className={`relative ${isAnimate ? 'transition-all duration-300 ease-out' : ''}`}
          style={{
            perspective: '600px'
          }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onTransitionEnd={isInfinity ? handleTransitionEnd : undefined}
          onMouseLeave={handleMouseLeave}
        >
          {dataArray.map((item, index) => {
            const { translateX, translateZ, opacityStyle } = computedMovingStyle(index);
            
            return (
              <div
                key={item.time || item.id || index}
                className={`inline-block relative ${isAnimate ? 'transition-all duration-500 ease-out' : ''}`}
                style={{
                  width: `${responsiveItemWidth}px`,
                  height: 'auto',
                  marginRight: `${responsiveItemMargin}px`,
                  transform: `translateX(${parseInt(carouselTranslateX) + parseInt(translateX)}px) translateZ(${parseInt(translateZ)}px)`,
                  opacity: opacityStyle,
                  transformStyle: 'preserve-3d',
                  userSelect: 'none',
                  cursor: isMouseDown ? 'grabbing' : 'grab'
                }}
                onClick={() => !isMouseDown && onItemClick && onItemClick(item)}
              >
                {renderItem(item, index, isMouseDown)}
              </div>
            );
          })}
        </div>

        {/* Progress Bars with Diamond Indicators */}
        <div 
          className="inline-flex relative mt-10"
          style={{ perspective: '600px' }}
        >
          {dataArray.map((item, index) => {
            const { translateX, translateZ, opacityStyle } = computedMovingStyle(index);
            
            return (
              <div
                key={`bar-${item.time || item.id || index}`}
                className={`relative border-b border-tppslate ${isAnimate ? 'transition-all duration-500 ease-out delay-100' : ''}`}
                style={{
                  width: `${responsiveItemWidth}px`,
                  paddingRight: `${responsiveItemMargin}px`,
                  paddingBottom: '40px',
                  marginBottom: '10px',
                  transform: `translateX(${parseInt(carouselTranslateX) + parseInt(translateX)}px) translateZ(${(parseInt(translateZ) * 2) / 3}px)`,
                  opacity: opacityStyle,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Diamond Indicator */}
                <div 
                  className="absolute bg-tppslate"
                  style={{
                    width: '8px',
                    height: '8px',
                    bottom: '-4px',
                    left: 'calc(50% - 40px)',
                    transform: 'rotate(45deg)'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => changeImagePosition(-1)}
        className="absolute bg-tppslate left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white rounded-full text-white transition-all duration-300 hover:bg-white/80 hover:text-gray-900"
        aria-label="Previous"
        style={{ transform: 'translateY(-50%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button
        onClick={() => changeImagePosition(1)}
        className="absolute bg-tppslate right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white rounded-full text-white transition-all duration-300 hover:bg-white/80 hover:text-gray-900"
        aria-label="Next"
        style={{ transform: 'translateY(-50%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default Circular3DCarousel;