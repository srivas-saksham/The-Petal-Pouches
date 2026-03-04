import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';

const FAQHeader = ({ searchQuery, onSearchChange }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setIsSearchVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsSearchVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <CommonHeader />

      <div
        className={`sticky top-16 z-30 bg-white/95 dark:bg-tppdark/95 backdrop-blur-sm border-b border-slate-100 dark:border-tppdarkwhite/10 transition-transform duration-300 ease-in-out ${
          isSearchVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="relative">
            <Search
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-tppdarkwhite/30 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg border-2 border-slate-200 dark:border-tppdarkwhite/10
                bg-white dark:bg-tppdarkgray text-slate-800 dark:text-tppdarkwhite placeholder:text-slate-400 dark:placeholder:text-tppdarkwhite/30
                focus:border-tpppink dark:focus:border-tppdarkwhite/30 focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10
                transition-all outline-none text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQHeader;