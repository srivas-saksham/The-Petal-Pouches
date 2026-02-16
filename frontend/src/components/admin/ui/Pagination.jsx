// frontend/src/components/admin/ui/Pagination.jsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationInfo, generatePageNumbers } from '../../../utils/adminHelpers';

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) {
  const paginationInfo = getPaginationInfo(totalItems, currentPage, itemsPerPage);
  const pageNumbers = generatePageNumbers(currentPage, paginationInfo.totalPages, 5);

  if (paginationInfo.totalPages <= 1) return null;

  // ✅ FIXED: Scroll the main content container to top
  const handlePageChange = (newPage) => {
    // Find the scrollable main container (AdminLayout's <main> element)
    const mainContainer = document.querySelector('main.overflow-y-auto');
    
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Fallback: also try window scroll (in case layout changes)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Call page change
    onPageChange(newPage);
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info Text */}
      <div className="text-sm text-text-secondary">
        Showing <span className="font-semibold text-tppslate">{paginationInfo.from}</span> to{' '}
        <span className="font-semibold text-tppslate">{paginationInfo.to}</span> of{' '}
        <span className="font-semibold text-tppslate">{paginationInfo.totalItems}</span> results
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!paginationInfo.hasPrev}
          className={`
            p-2 rounded-lg border transition-all
            ${
              paginationInfo.hasPrev
                ? 'border-border hover:bg-surface hover:border-tpppink text-tppslate'
                : 'border-border text-text-muted cursor-not-allowed opacity-50'
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* First Page */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-lg border border-border hover:bg-surface hover:border-tpppink text-sm font-medium text-tppslate transition-all"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-text-muted">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`
              px-3 py-2 rounded-lg border text-sm font-medium transition-all
              ${
                pageNum === currentPage
                  ? 'bg-transparent border-tpppink text-tpppink'
                  : 'border-border hover:bg-surface hover:border-tpppink text-tppslate'
              }
            `}
          >
            {pageNum}
          </button>
        ))}

        {/* Last Page */}
        {pageNumbers[pageNumbers.length - 1] < paginationInfo.totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < paginationInfo.totalPages - 1 && (
              <span className="px-2 text-text-muted">...</span>
            )}
            <button
              onClick={() => handlePageChange(paginationInfo.totalPages)}
              className="px-3 py-2 rounded-lg border border-border hover:bg-surface hover:border-tpppink text-sm font-medium text-tppslate transition-all"
            >
              {paginationInfo.totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!paginationInfo.hasNext}
          className={`
            p-2 rounded-lg border transition-all
            ${
              paginationInfo.hasNext
                ? 'border-border hover:bg-surface hover:border-tpppink text-tppslate'
                : 'border-border text-text-muted cursor-not-allowed opacity-50'
            }
          `}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}