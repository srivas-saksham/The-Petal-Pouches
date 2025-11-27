// frontend/src/hooks/useProductGrid.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing product grid layout mode
 * Handles toggling between 3 and 5 column layouts
 * Persists preference to localStorage
 * Provides responsive column adjustment
 */
export const useProductGrid = () => {
  const [layoutMode, setLayoutMode] = useState('3');
  const [screenSize, setScreenSize] = useState('lg');
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Initialize layout mode from localStorage on mount
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopGridLayout');
      if (saved && (saved === '3' || saved === '5')) {
        setLayoutMode(saved);
      }
    } catch (error) {
      console.warn('Failed to read localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  /**
   * Handle window resize to detect screen size changes
   */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setScreenSize('sm');
      } else if (width < 768) {
        setScreenSize('md');
      } else if (width < 1024) {
        setScreenSize('lg');
      } else if (width < 1280) {
        setScreenSize('xl');
      } else {
        setScreenSize('2xl');
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Change layout mode and save to localStorage
   */
  const changeLayout = useCallback((mode) => {
    if (mode !== '3' && mode !== '5') {
      console.warn(`Invalid layout mode: ${mode}. Must be '3' or '5'`);
      return;
    }

    setLayoutMode(mode);

    try {
      localStorage.setItem('shopGridLayout', mode);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, []);

  /**
   * Get recommended layout for current screen size
   */
  const getRecommendedLayout = useCallback(() => {
    // 5 columns only available on xl+ screens
    if (layoutMode === '5' && (screenSize === 'sm' || screenSize === 'md')) {
      return '3';
    }
    return layoutMode;
  }, [layoutMode, screenSize]);

  /**
   * Check if 5 column layout is available for current screen
   */
  const is5ColumnAvailable = useCallback(() => {
    return screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl';
  }, [screenSize]);

  /**
   * Reset to default layout (3 columns)
   */
  const resetLayout = useCallback(() => {
    setLayoutMode('3');
    try {
      localStorage.setItem('shopGridLayout', '3');
    } catch (error) {
      console.warn('Failed to reset layout:', error);
    }
  }, []);

  /**
   * Get grid column count based on layout and screen
   */
  const getGridColumns = useCallback(() => {
    const layout = getRecommendedLayout();

    if (layout === '5') {
      return {
        sm: 1,
        md: 2,
        lg: 3,
        xl: 5,
        '2xl': 5
      };
    }

    // Default 3 columns
    return {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 3,
      '2xl': 3
    };
  }, [getRecommendedLayout]);

  /**
   * Get grid gap based on screen size
   */
  const getGridGap = useCallback(() => {
    return {
      sm: 'gap-4',
      md: 'gap-4',
      lg: 'gap-5',
      xl: 'gap-6',
      '2xl': 'gap-6'
    }[screenSize] || 'gap-5';
  }, [screenSize]);

  /**
   * Get Tailwind grid classes
   */
  const getGridClasses = useCallback(() => {
    const layout = getRecommendedLayout();
    const baseClasses = 'grid auto-rows-max';
    const gap = getGridGap();

    if (layout === '5') {
      return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ${gap}`;
    }

    // Default 3 columns
    return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gap}`;
  }, [getRecommendedLayout, getGridGap]);

  /**
   * Get metadata about grid state
   */
  const getGridMetadata = useCallback(() => {
    const columns = getGridColumns();
    return {
      layoutMode,
      currentLayout: getRecommendedLayout(),
      screenSize,
      is5ColumnAvailable: is5ColumnAvailable(),
      columns,
      currentColumns: columns[screenSize] || 3,
      gridClasses: getGridClasses(),
      gap: getGridGap()
    };
  }, [layoutMode, getRecommendedLayout, screenSize, is5ColumnAvailable, getGridColumns, getGridClasses, getGridGap]);

  return {
    // State
    layoutMode,
    screenSize,
    isLoaded,

    // Methods
    changeLayout,
    resetLayout,

    // Getters
    getRecommendedLayout,
    is5ColumnAvailable,
    getGridColumns,
    getGridGap,
    getGridClasses,
    getGridMetadata
  };
};

export default useProductGrid;