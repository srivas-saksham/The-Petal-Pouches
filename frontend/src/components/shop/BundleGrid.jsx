// frontend/src/components/shop/BundleGrid.jsx - FIXED WITH LAYOUT MODES

import React from 'react';
import BundleCard from './BundleCard';
import BundleLoading from './BundleLoading';
import BundleEmpty from './BundleEmpty';

const BundleGrid = ({ 
  bundles, 
  loading, 
  error, 
  cartItems = [], 
  onCartUpdate,
  layoutMode = '5' // Default to 5 columns
}) => {
  
  // Dynamic grid classes based on layout mode
  const getGridClasses = () => {
    const baseClasses = "grid grid-cols-1 sm:grid-cols-2 gap-4";
    
    switch(layoutMode) {
      case '4':
        return `${baseClasses} lg:grid-cols-3 xl:grid-cols-4`;
      case '5':
        return `${baseClasses} lg:grid-cols-4 xl:grid-cols-5`;
      case '6':
        return `${baseClasses} lg:grid-cols-4 xl:grid-cols-6`;
      default:
        return `${baseClasses} lg:grid-cols-4 xl:grid-cols-5`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-6">
        <div className={getGridClasses()}>
          {[...Array(12)].map((_, i) => (
            <BundleLoading key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-800 font-medium mb-2">Failed to load bundles</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!bundles || bundles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-6">
        <BundleEmpty />
      </div>
    );
  }

  // Success state - render grid with dynamic layout
  return (
    <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-4 sm:p-6">
      <div className={getGridClasses()}>
        {bundles.map((bundle) => (
          <BundleCard 
            key={bundle.id} 
            bundle={bundle}
            cartItems={cartItems}
            onCartUpdate={onCartUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default BundleGrid;