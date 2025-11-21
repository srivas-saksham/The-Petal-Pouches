// frontend/src/components/adminComps/BundleProductSelector.jsx

import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BundleProductSelector({ onSelect, onClose, excludeProductIds = [] }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        in_stock: 'true'
      });

      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const response = await fetch(`${API_URL}/api/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        // Filter out excluded products
        const filtered = (data.data || []).filter(
          product => !excludeProductIds.includes(product.id)
        );
        setProducts(filtered);
        setTotalPages(data.metadata?.totalPages || 1);
        setTotalCount(data.metadata?.totalCount || 0);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const handleSelectProduct = (product) => {
    onSelect(product);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Select Product</h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose a product to add to the bundle
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={handleClearFilters}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex gap-3 mt-3">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <button
              onClick={handlePriceChange}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4 text-sm text-gray-600">
                Showing {products.length} of {totalCount} products
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-pink-500 hover:shadow-md transition-all"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                      {product.img_url ? (
                        <img
                          src={product.img_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h4 className="font-medium text-sm text-gray-900 truncate" title={product.title}>
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ₹{product.price}
                    </p>
                    
                    {/* Stock Badge */}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Variants Badge */}
                    {product.has_variants && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          Has Variants
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}