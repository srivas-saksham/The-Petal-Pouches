// frontend/src/hooks/useIntersectionObserver.js

import { useState, useEffect, useRef } from 'react';

/**
 * useIntersectionObserver Hook
 * 
 * Detects when an element enters/exits the viewport for reveal animations
 * 
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0 to 1)
 * @param {string} options.rootMargin - Margin around root
 * @param {boolean} options.triggerOnce - Only trigger once (default: true)
 * @returns {Array} - [ref, isIntersecting, hasIntersected]
 */
export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already intersected and triggerOnce is true, don't observe
    if (hasIntersected && triggerOnce) return;

    // Create observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
          
          // If triggerOnce, disconnect after first intersection
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return [elementRef, isIntersecting, hasIntersected];
};

/**
 * useMultipleIntersectionObserver Hook
 * 
 * Observes multiple elements with staggered reveal animations
 * 
 * @param {number} count - Number of elements to observe
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} - Array of [ref, isVisible, index] tuples
 */
export const useMultipleIntersectionObserver = (count, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    staggerDelay = 100,
  } = options;

  const [visibilityState, setVisibilityState] = useState(
    Array(count).fill(false)
  );
  
  const refs = useRef(Array(count).fill(null).map(() => ({ current: null })));
  const observersRef = useRef([]);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    // Create observers for each element
    refs.current.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Apply staggered delay
            const timeout = setTimeout(() => {
              setVisibilityState(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, index * staggerDelay);

            timeoutsRef.current[index] = timeout;

            // Disconnect after revealing
            observer.disconnect();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(ref.current);
      observersRef.current[index] = observer;
    });

    // Cleanup
    return () => {
      observersRef.current.forEach(observer => {
        if (observer) observer.disconnect();
      });
      
      timeoutsRef.current.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [count, threshold, rootMargin, staggerDelay]);

  return refs.current.map((ref, index) => ({
    ref,
    isVisible: visibilityState[index],
    index,
  }));
};

/**
 * useScrollTrigger Hook
 * 
 * Triggers callback when element enters viewport
 * 
 * @param {Function} callback - Function to call on intersection
 * @param {Object} options - IntersectionObserver options
 * @returns {ref} - Element ref
 */
export const useScrollTrigger = (callback, options = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (hasTriggeredRef.current && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!hasTriggeredRef.current || !triggerOnce)) {
          callback();
          hasTriggeredRef.current = true;
          
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin, triggerOnce]);

  return elementRef;
};

/**
 * useRevealOnScroll Hook
 * 
 * Simple hook for fade-in animations on scroll
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - { ref, style, isVisible }
 */
export const useRevealOnScroll = (options = {}) => {
  const {
    threshold = 0.2,
    delay = 0,
    duration = 600,
  } = options;

  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold,
    triggerOnce: true,
  });

  const style = {
    opacity: hasIntersected ? 1 : 0,
    transform: hasIntersected ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
  };

  return {
    ref,
    style,
    isVisible: hasIntersected,
  };
};

export default useIntersectionObserver;