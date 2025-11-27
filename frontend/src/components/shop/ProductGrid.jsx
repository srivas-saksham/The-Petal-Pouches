// frontend/src/components/shop/ProductGrid.jsx

import React from 'react';
import ProductCard from './ProductCard';

/**
 * ProductGrid Component
 * Responsive grid layout for products with dynamic column support
 * 
 * @param {Array} products - Array of product objects
 * @param {string} layoutMode - '3' or '5' columns
 * @param {Function} onProductClick - Callback when product is clicked
 */
const ProductGrid = ({
  products = [],
  layoutMode = '3',
  onProductClick
}) => {
  /**
   * Determine grid columns based on layout mode and screen size
   */
  const getGridClasses = () => {
    const baseClasses = 'grid gap-4 sm:gap-5 lg:gap-6 auto-rows-max';

    // Layout modes
    if (layoutMode === '5') {
      return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`;
    }

    // Default 3 columns
    return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={getGridClasses()}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;