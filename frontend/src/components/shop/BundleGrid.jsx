// frontend/src/components/shop/BundleGrid.jsx - WITH CART INTEGRATION

import React from 'react';
import BundleCard from './BundleCard';
import BundleLoading from './BundleLoading';
import BundleEmpty from './BundleEmpty';

const BundleGrid = ({ bundles, loading, error, cartItems = [], onCartUpdate }) => {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <BundleLoading key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium mb-2">Failed to load bundles</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!bundles || bundles.length === 0) {
    return <BundleEmpty />;
  }

  // Success state - render grid with cart data
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {bundles.map((bundle) => (
        <BundleCard 
          key={bundle.id} 
          bundle={bundle}
          cartItems={cartItems}
          onCartUpdate={onCartUpdate}
        />
      ))}
    </div>
  );
};

export default BundleGrid;