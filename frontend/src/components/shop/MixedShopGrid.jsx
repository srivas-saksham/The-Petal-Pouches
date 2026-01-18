// frontend/src/components/shop/MixedShopGrid.jsx - MOBILE OPTIMIZED

import React, { useState } from 'react';
import BundleCard from './BundleCard';
import ProductCard from './ProductCard';
import BundleLoading from './BundleLoading';
import BundleEmpty from './BundleEmpty';
import ItemQuickView from './ItemQuickView';

/**
 * MixedShopGrid - Displays both products and bundles
 * MOBILE: Strict 2-column layout with compact spacing
 * DESKTOP: Respects layoutMode (4/5/6 columns)
 */
const MixedShopGrid = ({ 
  items = [], 
  loading, 
  error, 
  cartItems = [], 
  onCartUpdate,
  layoutMode = '5'
}) => {
  
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickViewType, setQuickViewType] = useState(null);

  const handleQuickView = (item) => {
    const type = item.item_type || 'bundle';
    console.log(`📦 Opening QuickView for ${type}:`, item.title);
    setQuickViewItem(item);
    setQuickViewType(type);
  };

  const handleCloseQuickView = () => {
    setQuickViewItem(null);
    setQuickViewType(null);
  };

  // ⭐ MOBILE FIRST: Strict 2-column layout
  const getGridClasses = () => {
    // Mobile: ALWAYS 2 columns with tight gap
    const mobileClasses = "grid grid-cols-2 gap-2";
    
    // Desktop: Respect layoutMode
    switch(layoutMode) {
      case '4':
        return `${mobileClasses} lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 xl:gap-4`;
      case '5':
        return `${mobileClasses} lg:grid-cols-4 lg:gap-3 xl:grid-cols-5 xl:gap-4`;
      case '6':
        return `${mobileClasses} lg:grid-cols-4 lg:gap-3 xl:grid-cols-6 xl:gap-4`;
      default:
        return `${mobileClasses} lg:grid-cols-4 lg:gap-3 xl:grid-cols-5 xl:gap-4`;
    }
  };

  if (loading) {
    return (
      <div className="bg-transparent">
        <div className={getGridClasses()}>
          {[...Array(12)].map((_, i) => (
            <BundleLoading key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-3 lg:p-6">
        <div className="text-center py-8 lg:py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 lg:p-6 max-w-md mx-auto">
            <p className="text-red-800 font-medium mb-2 text-sm lg:text-base">Failed to load items</p>
            <p className="text-red-600 text-xs lg:text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-tppgrey shadow-sm p-3 lg:p-6">
        <BundleEmpty />
      </div>
    );
  }

  return (
    <>
      {/* ⭐ MOBILE: No wrapper padding, transparent background */}
      <div className="bg-transparent">
        <div className={getGridClasses()}>
          {items.map((item) => {
            const isProduct = item.item_type === 'product';
            
            return isProduct ? (
              <ProductCard 
                key={`product-${item.id}`}
                product={item}
                cartItems={cartItems}
                onCartUpdate={onCartUpdate}
                onQuickView={handleQuickView}
              />
            ) : (
              <BundleCard 
                key={`bundle-${item.id}`}
                bundle={item}
                cartItems={cartItems}
                onCartUpdate={onCartUpdate}
                onQuickView={handleQuickView}
              />
            );
          })}
        </div>
      </div>

      {/* Unified QuickView Modal */}
      <ItemQuickView
        item={quickViewItem}
        itemType={quickViewType}
        isOpen={!!quickViewItem}
        onClose={handleCloseQuickView}
      />
    </>
  );
};

export default MixedShopGrid;