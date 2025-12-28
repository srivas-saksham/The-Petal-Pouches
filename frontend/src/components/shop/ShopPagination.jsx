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
   * Scroll to top smoothly
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /**
   * Handle previous page click
   */
  const handlePrevious = () => {
    if (!isFirstPage && !isLoading) {
      onPageChange(currentPage - 1);
      scrollToTop();
    }
  };

  /**
   * Handle next page click
   */
  const handleNext = () => {
    if (!isLastPage && !isLoading) {
      onPageChange(currentPage + 1);
      scrollToTop();
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
    <nav
      className="flex items-center justify-between gap-4 py-8 px-4"
      aria-label="Pagination"
    >
      {/* Left Section - Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={isFirstPage || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
          transition-all duration-200 border-2
          ${isFirstPage || isLoading
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5'
          }
        `}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Middle Section - Page Info and Numbers */}
      <div className="flex items-center gap-2">
        {/* Page Numbers - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-tppslate"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => {
                  if (!isLoading) {
                    onPageChange(page);
                    scrollToTop();
                  }
                }}
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
        <div className="md:hidden text-sm font-semibold text-tppslate">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Right Section - Next Button */}
      <button
        onClick={handleNext}
        disabled={isLastPage || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
          transition-all duration-200 border-2
          ${isLastPage || isLoading
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5'
          }
        `}
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tpppink"></div>
        </div>
      )}
    </nav>
  );
};

export default ShopPagination;