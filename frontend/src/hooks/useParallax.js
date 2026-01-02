// frontend/src/hooks/useParallax.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_ANIMATION } from '../utils/constants';

/**
 * useParallax Hook
 * 
 * Manages multi-layer parallax scroll effects with performance optimization
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Parallax speed multiplier (default: 0.5)
 * @param {boolean} options.enabled - Enable/disable parallax (default: true)
 * @returns {Object} - Parallax state and transform values
 */
export const useParallax = (options = {}) => {
  const {
    speed = HERO_ANIMATION.parallaxSpeed,
    enabled = true,
  } = options;

  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const rafRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Calculate transform values for different layers
  const getTransforms = useCallback(() => {
    const baseOffset = scrollY * speed;

    return {
      // Background layer (slowest, moves up as you scroll down)
      background: {
        translateY: baseOffset * 0.3,
        scale: 1 + (scrollY * 0.00005),
      },
      // Mid-ground layer
      midground: {
        translateY: baseOffset * 0.6,
        scale: 1 + (scrollY * 0.0001),
      },
      // Foreground layer (fastest)
      foreground: {
        translateY: baseOffset * 1,
        scale: 1,
      },
      // Floating elements (ribbons, petals)
      floating: {
        translateY: baseOffset * 0.4,
        rotate: scrollY * 0.05,
      },
      // Text elements (slight parallax for depth)
      text: {
        translateY: baseOffset * 0.8,
        opacity: Math.max(0, 1 - (scrollY / 500)),
      },
    };
  }, [scrollY, speed]);

  // Handle scroll with RAF for smooth performance
  const handleScroll = useCallback(() => {
    if (!enabled) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after 150ms of no scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    });
  }, [enabled]);

  // Set up scroll listener
  useEffect(() => {
    if (!enabled) return;

    // Set initial scroll position
    setScrollY(window.scrollY);

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, handleScroll]);

  // Generate CSS transform strings
  const transforms = getTransforms();
  
  const getTransformStyle = (layer) => {
    const transform = transforms[layer];
    if (!transform) return {};

    const styles = {
      transform: '',
      transition: isScrolling ? 'none' : 'transform 0.1s ease-out',
    };

    const transformParts = [];

    if (transform.translateY !== undefined) {
      transformParts.push(`translateY(${transform.translateY}px)`);
    }

    if (transform.scale !== undefined) {
      transformParts.push(`scale(${transform.scale})`);
    }

    if (transform.rotate !== undefined) {
      transformParts.push(`rotate(${transform.rotate}deg)`);
    }

    styles.transform = transformParts.join(' ');

    if (transform.opacity !== undefined) {
      styles.opacity = transform.opacity;
    }

    return styles;
  };

  // Calculate scroll progress (0 to 1) for a given range
  const getScrollProgress = (start = 0, end = 1000) => {
    if (scrollY < start) return 0;
    if (scrollY > end) return 1;
    return (scrollY - start) / (end - start);
  };

  // Check if element is in viewport
  const isInViewport = (elementTop, elementBottom) => {
    const viewportHeight = window.innerHeight;
    const scrollTop = scrollY;
    const scrollBottom = scrollTop + viewportHeight;

    return elementBottom > scrollTop && elementTop < scrollBottom;
  };

  return {
    scrollY,
    isScrolling,
    transforms,
    getTransformStyle,
    getScrollProgress,
    isInViewport,
    enabled,
  };
};

/**
 * useScrollProgress Hook
 * 
 * Tracks overall page scroll progress (0 to 100%)
 * 
 * @returns {number} - Scroll progress percentage
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
        
        setProgress(Math.min(100, Math.max(0, progress)));
      });
    };

    // Set initial progress
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return progress;
};

export default useParallax;