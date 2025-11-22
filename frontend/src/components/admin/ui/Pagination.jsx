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

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info Text */}
      <div className="text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{paginationInfo.from}</span> to{' '}
        <span className="font-semibold text-text-primary">{paginationInfo.to}</span> of{' '}
        <span className="font-semibold text-text-primary">{paginationInfo.totalItems}</span> results
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!paginationInfo.hasPrev}
          className={`
            p-2 rounded-lg border transition-all
            ${
              paginationInfo.hasPrev
                ? 'border-border hover:bg-surface hover:border-admin-pink text-text-primary'
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
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-lg border border-border hover:bg-surface hover:border-admin-pink text-sm font-medium text-text-primary transition-all"
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
            onClick={() => onPageChange(pageNum)}
            className={`
              px-3 py-2 rounded-lg border text-sm font-medium transition-all
              ${
                pageNum === currentPage
                  ? 'bg-admin-pink border-admin-pink text-white'
                  : 'border-border hover:bg-surface hover:border-admin-pink text-text-primary'
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
              onClick={() => onPageChange(paginationInfo.totalPages)}
              className="px-3 py-2 rounded-lg border border-border hover:bg-surface hover:border-admin-pink text-sm font-medium text-text-primary transition-all"
            >
              {paginationInfo.totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!paginationInfo.hasNext}
          className={`
            p-2 rounded-lg border transition-all
            ${
              paginationInfo.hasNext
                ? 'border-border hover:bg-surface hover:border-admin-pink text-text-primary'
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