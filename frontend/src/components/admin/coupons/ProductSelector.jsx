// frontend/src/components/admin/coupons/ProductSelector.jsx
/**
 * Product Selector Component - Sidebar Modal Version
 * Multi-select sidebar with search for selecting eligible products
 * Shows product images, titles, and prices in a clean list layout
 * ⭐ FIXED: Uses correct API base URL and displays images properly
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Package, Loader, AlertCircle, ShoppingBag, Check } from 'lucide-react';

const ProductSelector = ({ 
  selectedProductIds = [], 
  onChange, 
  disabled = false 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  // ⭐ Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rizarabackend.vercel.app';

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar]);

  // ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showSidebar) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSidebar]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // ⭐ FIXED: Use full backend URL with admin_view parameter
      const response = await fetch(`${API_BASE_URL}/api/products?limit=1000&admin_view=true`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
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

  // Select all filtered products
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map(p => p.id);
    const newSelections = [...new Set([...selectedProductIds, ...filteredIds])];
    onChange(newSelections);
  };

  // Deselect all filtered products
  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredProducts.map(p => p.id));
    const newSelections = selectedProductIds.filter(id => !filteredIds.has(id));
    onChange(newSelections);
  };

  // Get product image URL (handles both Product_images array and legacy img_url)
  const getProductImage = (product) => {
    // Check for Product_images array first
    const imageArray = product?.Product_images || product?.images;
    
    if (imageArray && Array.isArray(imageArray) && imageArray.length > 0) {
      // Find primary image or use first image
      const primaryImage = imageArray.find(img => img.is_primary);
      return primaryImage?.img_url || imageArray[0]?.img_url;
    }
    
    // Fallback to legacy img_url
    if (product.img_url) {
      return product.img_url;
    }
    
    return null;
  };

  // Get selling price (handles both selling_price and price fields)
  const getSellingPrice = (product) => {
    return product.selling_price || product.price || 0;
  };

  // Click outside sidebar to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowSidebar(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-3">
      {/* Label and Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-tppslate">
          Eligible Products *
        </label>
        {selectedProductIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 transition-colors"
          >
            Clear All ({selectedProductIds.length})
          </button>
        )}
      </div>

      {/* Selected Products Chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-2 border-slate-200 rounded-lg max-h-40 overflow-y-auto">
          {selectedProducts.map(product => {
            const imageUrl = getProductImage(product);
            const price = getSellingPrice(product);

            return (
              <div
                key={product.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-tpppink/30 rounded-lg text-sm group hover:border-tpppink/50 transition-all"
              >
                {/* Product Image Thumbnail */}
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={product.title}
                    className="w-6 h-6 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 ${imageUrl ? 'hidden' : 'flex'}`}>
                  <Package className="w-3 h-3 text-slate-400" />
                </div>
                
                <span className="text-slate-700 font-medium max-w-[150px] truncate">
                  {product.title}
                </span>
                
                <span className="text-xs text-tpppink font-bold flex-shrink-0">
                  ₹{price}
                </span>
                
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  disabled={disabled}
                  className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-1 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Select Products Button */}
      <button
        type="button"
        onClick={() => setShowSidebar(true)}
        disabled={disabled || loading}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-tpppink transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
      >
        <ShoppingBag className="w-4 h-4" />
        {selectedProductIds.length > 0 
          ? `${selectedProductIds.length} Product${selectedProductIds.length !== 1 ? 's' : ''} Selected - Click to Modify`
          : 'Click to Select Products'}
      </button>

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
          <div className="flex-1">
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

      <p className="text-xs text-slate-500">
        Select one or more products eligible for this coupon
      </p>

      {/* ========================================
          PRODUCT SELECTION SIDEBAR
          ======================================== */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-end z-[100]"
          onClick={handleBackdropClick}
        >
          <div 
            className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-tpppink to-tpppink/90 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-tpppink" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Select Products
                  </h3>
                  <p className="text-white/80 text-sm">
                    {selectedProductIds.length} selected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b-2 border-slate-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Bulk Actions */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs px-3 py-1.5 bg-tpppink/10 text-tpppink rounded-lg hover:bg-tpppink/20 font-semibold transition-colors"
                  >
                    Select All ({filteredProducts.length})
                  </button>
                  {selectedProductIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeselectAllFiltered}
                      className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
                    >
                      Deselect Filtered
                    </button>
                  )}
                  <span className="text-xs text-slate-500 ml-auto">
                    {filteredProducts.length} of {products.length}
                  </span>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-8 h-8 animate-spin text-tpppink" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Package className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-lg font-semibold text-slate-600 mb-2">
                    No products found
                  </p>
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'Try a different search term' : 'No products available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map(product => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const imageUrl = getProductImage(product);
                    const price = getSellingPrice(product);

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleToggleProduct(product.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-tpppink bg-tpppink/5' 
                            : 'border-slate-200 hover:border-tpppink/50 hover:bg-slate-50'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-tpppink border-tpppink' 
                              : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            )}
                          </div>
                        </div>

                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                            <Package className="w-6 h-6 text-slate-300" />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {product.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base font-bold text-tpppink">
                              ₹{price}
                            </span>
                            
                            {/* Stock Badge */}
                            {product.stock !== undefined && (
                              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                product.stock > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-tpppink">{selectedProductIds.length}</span> product{selectedProductIds.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="px-5 py-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="px-5 py-2.5 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 font-semibold transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add slide-in animation CSS */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductSelector;