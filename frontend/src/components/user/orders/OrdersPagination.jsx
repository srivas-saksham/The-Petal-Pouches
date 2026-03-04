// frontend/src/components/user/orders/OrdersPagination.jsx

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const OrdersPagination = ({ pagination, onPageChange }) => {
  const { page, pages, total, limit } = pagination;
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) range.push(i);
    if (page - delta > 2) rangeWithDots.push(1, '...');
    else rangeWithDots.push(1);
    rangeWithDots.push(...range);
    if (page + delta < pages - 1) rangeWithDots.push('...', pages);
    else if (pages > 1) rangeWithDots.push(pages);
    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-tppslate/10 dark:border-tppdarkwhite/10 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-tppslate/60 dark:text-tppdarkwhite/50">
          Showing <span className="font-semibold text-tppslate dark:text-tppdarkwhite">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-semibold text-tppslate dark:text-tppdarkwhite">{Math.min(page * limit, total)}</span>{' '}
          of <span className="font-semibold text-tppslate dark:text-tppdarkwhite">{total}</span> orders
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="First Page">
            <ChevronsLeft className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          </button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Previous Page">
            <ChevronLeft className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          </button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === '...') return <span key={`dots-${idx}`} className="px-2 text-tppslate/40 dark:text-tppdarkwhite/30">...</span>;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark'
                      : 'hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 text-tppslate dark:text-tppdarkwhite'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="p-2 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Next Page">
            <ChevronRight className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          </button>
          <button onClick={() => onPageChange(pages)} disabled={page === pages} className="p-2 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Last Page">
            <ChevronsRight className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPagination;