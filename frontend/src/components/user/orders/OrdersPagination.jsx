// frontend/src/components/user/orders/OrdersPagination.jsx

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination component with page numbers and navigation
 */
const OrdersPagination = ({ pagination, onPageChange }) => {
  const { page, pages, total, limit } = pagination;

  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else if (pages > 1) {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white rounded-lg border border-tppslate/10 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results Info */}
        <p className="text-sm text-tppslate/60">
          Showing <span className="font-semibold text-tppslate">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-semibold text-tppslate">
            {Math.min(page * limit, total)}
          </span>{' '}
          of <span className="font-semibold text-tppslate">{total}</span> orders
        </p>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4 text-tppslate" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-tppslate" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-tppslate/40">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-tpppink text-white'
                      : 'hover:bg-tppslate/5 text-tppslate'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            className="p-2 rounded-lg hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-tppslate" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(pages)}
            disabled={page === pages}
            className="p-2 rounded-lg hover:bg-tppslate/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4 text-tppslate" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPagination;