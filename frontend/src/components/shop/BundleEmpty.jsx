// frontend/src/components/shop/BundleEmpty.jsx

import React from 'react';
import { Package } from 'lucide-react';

const BundleEmpty = ({ message, showReset = false, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Package size={48} className="text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message || 'No bundles found'}
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {showReset 
          ? 'Try adjusting your filters or search criteria'
          : 'Check back later for new bundle collections'
        }
      </p>

      {showReset && onReset && (
        <button
          onClick={onReset}
          className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default BundleEmpty;