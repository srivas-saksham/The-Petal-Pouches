// frontend/src/components/shop/ShopHeader.jsx

import React from 'react';
import { Grid3x3, Grid2x2 } from 'lucide-react';

/**
 * ShopHeader Component
 * Displays page title, subtitle, and layout toggle buttons
 * 
 * @param {string} layoutMode - Current layout mode ('3' or '5')
 * @param {Function} onLayoutChange - Callback when layout changes
 */
const ShopHeader = ({ layoutMode = '3', onLayoutChange }) => {
  return (
    <div className="bg-gradient-to-r from-tpppink/10 via-white to-tppslate/10 border-b-2 border-tppslate/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Content */}
        <div className="flex items-start justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-tppslate mb-2">
              Shop Our Collection
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Discover beautiful gifts and treasures from The Petal Pouches
            </p>
          </div>

          {/* Layout Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 flex-shrink-0">
            {/* 3 Column Layout Button */}
            <button
              onClick={() => onLayoutChange('3')}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md
                transition-all duration-200 font-medium text-sm
                ${layoutMode === '3'
                  ? 'bg-white text-tpppink shadow-sm border-2 border-tpppink'
                  : 'text-slate-600 hover:text-tppslate hover:bg-white/50 border-2 border-transparent'
                }
              `}
              title="3 Column Layout"
              aria-label="Switch to 3 column layout"
            >
              <Grid2x2 className="w-5 h-5" />
              <span className="ml-1">3</span>
            </button>

            {/* 5 Column Layout Button */}
            <button
              onClick={() => onLayoutChange('5')}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md
                transition-all duration-200 font-medium text-sm
                ${layoutMode === '5'
                  ? 'bg-white text-tpppink shadow-sm border-2 border-tpppink'
                  : 'text-slate-600 hover:text-tppslate hover:bg-white/50 border-2 border-transparent'
                }
              `}
              title="5 Column Layout"
              aria-label="Switch to 5 column layout"
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="ml-1">5</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-6 text-sm text-slate-600 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tpppink"></div>
            <span>Premium Quality Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tppslate"></div>
            <span>Fast & Free Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;