// frontend/src/components/shop/BundleEmpty.jsx - UPDATED STYLING

import React from 'react';
import { Package } from 'lucide-react';

const BundleEmpty = ({ message, showReset = false, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-tppslate/5 rounded-full p-6 mb-4 border border-tppgrey">
        <Package size={48} className="text-tppslate/40" />
      </div>
      
      <h3 className="text-xl font-semibold text-tppslate mb-2">
        {message || 'No bundles found'}
      </h3>
      
      <p className="text-tppslate/60 text-center max-w-md mb-6 text-sm">
        {showReset 
          ? 'Try adjusting your filters or search criteria'
          : 'Check back later for new bundle collections'
        }
      </p>

      {showReset && onReset && (
        <button
          onClick={onReset}
          className="bg-tpppink text-white px-6 py-2.5 rounded-lg hover:bg-tpppink/90 transition-colors font-medium text-sm shadow-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default BundleEmpty;