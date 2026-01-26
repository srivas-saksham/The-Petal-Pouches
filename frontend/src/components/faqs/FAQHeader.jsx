import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';

/**
 * FAQHeader Component with Scroll Behavior
 * 
 * FEATURES:
 * - CommonHeader: Static at top-0 (always visible)
 * - Search bar row: Slides up on scroll down, slides down on scroll up
 * - Mobile responsive: Full-width search input
 * - Smooth animations matching BundleHeader behavior
 * 
 * PROPS:
 * - searchQuery: Current search query string
 * - onSearchChange: Callback function when search changes
 */
const FAQHeader = ({ searchQuery, onSearchChange }) => {
  // ⭐ SCROLL HIDE/SHOW STATE
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  // ⭐ SCROLL DETECTION FOR HIDE/SHOW SEARCH BAR
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ignore tiny scroll movements
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }

      // Scrolling down - hide search bar
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsSearchVisible(false);
      } 
      // Scrolling up - show search bar immediately
      else if (currentScrollY < lastScrollY.current) {
        setIsSearchVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-30">
      {/* Main Header - Using CommonHeader - ALWAYS VISIBLE */}
      <CommonHeader />
    
      {/* Search Bar Row - SLIDES UP/DOWN ON SCROLL - MOBILE RESPONSIVE */}
      <div
        className={`sticky top-16 bg-white/95 backdrop-blur-sm border-b border-slate-100 transition-transform duration-300 ease-in-out ${
          isSearchVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
          {/* Search Input */}
          <div className="relative">
            <Search 
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
              size={18}
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg border-2 border-slate-200 
                bg-white text-slate-800 placeholder:text-slate-400 
                focus:border-tpppink focus:ring-2 focus:ring-tpppink/20 
                transition-all outline-none text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQHeader;