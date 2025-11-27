// frontend/src/components/shop/ShopEmpty.jsx

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * ShopEmpty Component
 * Display when no products match the current filters
 * 
 * @param {boolean} hasFilters - Whether any filters are currently applied
 * @param {Function} onResetFilters - Callback to reset all filters
 */
const ShopEmpty = ({ hasFilters = false, onResetFilters }) => {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Illustration */}
        <div className="mb-6">
          <div className="relative w-24 h-24 mx-auto">
            {/* Search Icon Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-tpppink/10 to-tppslate/10 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-tpppink/50" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-tppslate mb-3">
          {hasFilters ? 'No products found' : 'No products available'}
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-base sm:text-lg max-w-md mb-8">
          {hasFilters
            ? 'We couldn\'t find any products matching your filters. Try adjusting your search criteria or browse all products.'
            : 'We\'re currently stocking our collection. Please check back soon!'}
        </p>

        {/* Helpful Suggestions */}
        {hasFilters && (
          <div className="mb-8 p-4 sm:p-6 bg-tppslate/5 border-2 border-tppslate/20 rounded-lg max-w-md">
            <p className="text-sm font-semibold text-tppslate mb-3">
              Try adjusting:
            </p>
            <ul className="text-sm text-slate-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-tpppink font-bold mt-0.5">•</span>
                <span>Your search keywords</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tpppink font-bold mt-0.5">•</span>
                <span>Price range (try increasing max price)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tpppink font-bold mt-0.5">•</span>
                <span>Uncheck "In Stock Only" filter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-tpppink font-bold mt-0.5">•</span>
                <span>Remove other active filters</span>
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {hasFilters && (
            <button
              onClick={onResetFilters}
              className={`
                flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                font-semibold transition-all duration-200 border-2
                bg-tpppink text-white border-tpppink hover:bg-tppslate hover:border-tppslate
                active:scale-95 shadow-md hover:shadow-lg
              `}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Clear All Filters</span>
            </button>
          )}

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-lg
              font-semibold transition-all duration-200 border-2
              ${hasFilters
                ? 'bg-white text-tppslate border-slate-300 hover:border-tpppink hover:text-tpppink hover:bg-tpppink/5'
                : 'bg-tpppink text-white border-tpppink hover:bg-tppslate hover:border-tppslate'
              }
              active:scale-95 shadow-md hover:shadow-lg
            `}
          >
            <span>{hasFilters ? 'Browse All Products' : 'Continue Shopping'}</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-4">
            Need help? Check out our FAQ or contact us
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/faq"
              className="text-xs font-semibold text-tpppink hover:text-tppslate transition-colors"
            >
              View FAQ
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="/contact"
              className="text-xs font-semibold text-tpppink hover:text-tppslate transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopEmpty;