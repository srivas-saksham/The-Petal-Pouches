// frontend/src/components/shop/ShopPagination.jsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ShopPagination Component
 * Pagination controls with Previous/Next buttons and page info
 * 
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {boolean} hasMore - Whether there are more pages after current
 * @param {Function} onPageChange - Callback when page changes (receives newPage)
 * @param {boolean} isLoading - Whether products are currently loading
 */
const ShopPagination = ({
  currentPage = 1,
  totalPages = 1,
  hasMore = false,
  onPageChange,
  isLoading = false
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || !hasMore;

  /**
   * Handle previous page click
   */
  const handlePrevious = () => {
    if (!isFirstPage && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  /**
   * Handle next page click
   */
  const handleNext = () => {
    if (!isLastPage && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  /**
   * Generate page numbers to display
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push('...');
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg border-2 border-slate-200">
      {/* Left Section - Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={isFirstPage || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 border-2
          ${isFirstPage || isLoading
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5 active:scale-95'
          }
        `}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Middle Section - Page Info and Numbers */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Page Numbers - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-slate-500 font-medium"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => !isLoading && onPageChange(page)}
                disabled={isLoading}
                className={`
                  w-10 h-10 rounded-lg font-semibold transition-all duration-200 border-2
                  ${page === currentPage
                    ? 'bg-tpppink text-white border-tpppink shadow-md'
                    : 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5'
                  }
                  ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Page Info Text */}
        <div className="flex items-center gap-1 text-sm font-medium text-slate-600 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <span>Page</span>
          <span className="font-bold text-tppslate">{currentPage}</span>
          <span>of</span>
          <span className="font-bold text-tppslate">{totalPages}</span>
        </div>
      </div>

      {/* Right Section - Next Button */}
      <button
        onClick={handleNext}
        disabled={isLastPage || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 border-2
          ${isLastPage || isLoading
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5 active:scale-95'
          }
        `}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tpppink via-tppslate to-tpppink animate-pulse" />
      )}
    </div>
  );
};

export default ShopPagination;