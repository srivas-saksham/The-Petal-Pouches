import { useState } from 'react';
import { Search, Filter, Calendar, X, ChevronDown } from 'lucide-react';

const OrdersFilters = ({ filters, onFilterChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = !!(
    filters.search || filters.status !== 'all' || filters.payment_status || filters.from_date || filters.to_date
  );

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-tppslate/10 dark:border-tppdarkwhite/10 p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="relative">
          <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-8 md:pl-9 pr-2 md:pr-3 py-1.5 md:py-2 text-xs md:text-sm border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full pl-8 md:pl-9 pr-7 md:pr-8 py-1.5 md:py-2 text-xs md:text-sm border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
            <option value="rto_initiated">Return Initiated</option>
            <option value="rto_delivered">Returned</option>
          </select>
          <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-tppslate/40 dark:text-tppdarkwhite/30 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-1 md:gap-1.5 ${
              showAdvanced
                ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark border-tpppink dark:border-tppdarkwhite'
                : 'bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite border-tppslate/20 dark:border-tppdarkwhite/10 hover:border-tpppink dark:hover:border-tppdarkwhite'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-tpppink dark:text-tppdarkwhite hover:bg-tpppink/10 dark:hover:bg-tppdarkwhite/5 rounded-lg border border-tpppink/20 dark:border-tppdarkwhite/10 transition-all flex items-center justify-center"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline ml-1">Reset</span>
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="pt-2 md:pt-3 border-t border-tppslate/10 dark:border-tppdarkwhite/10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1">From Date</label>
              <input
                type="date"
                value={filters.from_date || ''}
                onChange={(e) => onFilterChange('from_date', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1">To Date</label>
              <input
                type="date"
                value={filters.to_date || ''}
                onChange={(e) => onFilterChange('to_date', e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1">Payment Status</label>
              <select
                value={filters.payment_status || 'all'}
                onChange={(e) => onFilterChange('payment_status', e.target.value === 'all' ? '' : e.target.value)}
                className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="pt-2 md:pt-3 border-t border-tppslate/10 dark:border-tppdarkwhite/10">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs font-semibold text-tppslate/60 dark:text-tppdarkwhite/40">Active:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite text-[10px] md:text-xs rounded-full font-medium">
                <span className="max-w-[80px] md:max-w-none truncate">Search: {filters.search}</span>
                <X className="w-2.5 h-2.5 md:w-3 md:h-3 cursor-pointer hover:text-tpppink/70 dark:hover:text-tppdarkwhite/70 flex-shrink-0" onClick={() => onFilterChange('search', '')} />
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite text-[10px] md:text-xs rounded-full font-medium">
                Status: {filters.status.replace(/_/g, ' ')}
                <X className="w-2.5 h-2.5 md:w-3 md:h-3 cursor-pointer hover:text-tpppink/70 dark:hover:text-tppdarkwhite/70 flex-shrink-0" onClick={() => onFilterChange('status', 'all')} />
              </span>
            )}
            {filters.payment_status && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite text-[10px] md:text-xs rounded-full font-medium">
                Payment: {filters.payment_status}
                <X className="w-2.5 h-2.5 md:w-3 md:h-3 cursor-pointer hover:text-tpppink/70 dark:hover:text-tppdarkwhite/70 flex-shrink-0" onClick={() => onFilterChange('payment_status', '')} />
              </span>
            )}
            {(filters.from_date || filters.to_date) && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite text-[10px] md:text-xs rounded-full font-medium">
                Date Range
                <X className="w-2.5 h-2.5 md:w-3 md:h-3 cursor-pointer hover:text-tpppink/70 dark:hover:text-tppdarkwhite/70 flex-shrink-0" onClick={() => { onFilterChange('from_date', ''); onFilterChange('to_date', ''); }} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;