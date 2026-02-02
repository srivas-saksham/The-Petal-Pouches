// frontend/src/components/admin/coupons/ProductSelector.jsx
/**
 * Product Selector Component
 * Multi-select dropdown with search for selecting eligible products
 * ⭐ FIXED: Uses correct API base URL
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Package, Loader, AlertCircle } from 'lucide-react';

const ProductSelector = ({ 
  selectedProductIds = [], 
  onChange, 
  disabled = false 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // ⭐ Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rizarabackend.vercel.app';

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // ⭐ FIXED: Use full backend URL
      const response = await fetch(`${API_BASE_URL}/api/products?limit=1000`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data?.products || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.title?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.id?.toLowerCase().includes(query)
    );
  });

  // Get selected products details
  const selectedProducts = products.filter(p => 
    selectedProductIds.includes(p.id)
  );

  // Toggle product selection
  const handleToggleProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      // Remove from selection
      onChange(selectedProductIds.filter(id => id !== productId));
    } else {
      // Add to selection
      onChange([...selectedProductIds, productId]);
    }
  };

  // Remove product chip
  const handleRemoveProduct = (productId) => {
    onChange(selectedProductIds.filter(id => id !== productId));
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-tppslate">
          Eligible Products *
        </label>
        {selectedProductIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
          >
            Clear All ({selectedProductIds.length})
          </button>
        )}
      </div>

      {/* Selected Products Chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-2 border-slate-200 rounded-lg">
          {selectedProducts.map(product => (
            <div
              key={product.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-tpppink/30 rounded-lg text-sm"
            >
              <Package className="w-3 h-3 text-tpppink" />
              <span className="text-slate-700 font-medium">{product.title}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(product.id)}
                disabled={disabled}
                className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled || loading}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && !loading && !error && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No products found
              </div>
            ) : (
              filteredProducts.map(product => {
                const isSelected = selectedProductIds.includes(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleToggleProduct(product.id)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 disabled:opacity-50 ${
                      isSelected ? 'bg-tpppink/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          isSelected 
                            ? 'bg-tpppink border-tpppink' 
                            : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {product.title}
                        </p>
                        {product.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          ID: {product.id.substring(0, 8)}...
                        </p>
                      </div>

                      {/* Price */}
                      {product.price && (
                        <div className="text-sm font-bold text-tpppink">
                          ₹{product.price}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 text-center">
          <Loader className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">
              Failed to load products
            </p>
            <p className="text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchProducts}
              className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Close Dropdown Button */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-0"
            onClick={() => setShowDropdown(false)}
          />
          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="text-xs text-slate-600 hover:text-slate-800 font-semibold"
          >
            Close
          </button>
        </>
      )}

      <p className="text-xs text-slate-500">
        Select one or more products eligible for this coupon
      </p>
    </div>
  );
};

export default ProductSelector;