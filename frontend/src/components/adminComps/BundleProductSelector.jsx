import { useState, useEffect } from 'react';
import { X, Search, Filter, Package, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';

export default function BundleProductSelector({ onSelect, onClose, excludeProductIds = [] }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await adminApi.get('/api/categories');
      if (response.data) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit,
        in_stock: 'true'
      };

      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const response = await adminApi.get('/api/products', { params });

      if (response.data) {
        const filtered = (response.data || []).filter(
          product => !excludeProductIds.includes(product.id)
        );
        setProducts(filtered);
        setTotalPages(response.metadata?.totalPages || 1);
        setTotalCount(response.metadata?.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const handlePriceApply = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-[1px]"
      onClick={handleBackdropClick}
      style={{ 
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
    >
      <div
        className="w-[420px] bg-white shadow-2xl flex flex-col h-full rounded-r-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: 'auto'
        }}
      >
        {/* Header */}
        <div className="bg-tppslate text-white p-3 flex items-center justify-between flex-shrink-0 rounded-tr-2xl">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Select Product</h3>
              <p className="text-[10px] text-white/80">Add to bundle</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-2 border-b border-gray-200 flex-shrink-0 space-y-2 bg-white">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { 
                setSearch(e.target.value); 
                setCurrentPage(1); 
              }}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-tpppink"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex-shrink-0 ${
                showFilters ? 'bg-tpppink text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Filter
            </button>
            <select
              value={selectedCategory}
              onChange={(e) => { 
                setSelectedCategory(e.target.value); 
                setCurrentPage(1); 
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none focus:border-tpppink"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {showFilters && (
            <div className="p-2 bg-gray-50 rounded border border-gray-200 space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none focus:border-tpppink"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none focus:border-tpppink"
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handlePriceApply}
                  className="flex-1 px-2 py-1 bg-tpppink text-white rounded text-[11px] font-medium hover:bg-tpppink/90"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-[11px] font-medium hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Count */}
        {!loading && products.length > 0 && (
          <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <p className="text-[10px] text-gray-600">
              {products.length} of {totalCount} products
            </p>
          </div>
        )}

        {/* Products Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 bg-white custom-scrollbar" style={{ minHeight: 0 }}>
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-tpppink animate-spin mb-2" />
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="w-12 h-12 mb-2" />
              <p className="text-xs">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {products.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product)}
                  className="border border-gray-200 rounded p-1.5 hover:border-tpppink hover:shadow-sm transition-all text-left bg-white"
                >
                  <div className="aspect-square bg-gray-100 rounded mb-1 overflow-hidden">
                    {product.img_url ? (
                      <img
                        src={product.img_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <h4 className="font-medium text-[10px] text-gray-900 truncate mb-0.5" title={product.title}>
                    {product.title}
                  </h4>
                  <p className="text-xs font-bold text-tpppink mb-1">
                    ₹{product.price}
                  </p>
                  
                  <div className="flex flex-wrap gap-0.5">
                    <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-700' 
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock}
                    </span>
                    {product.has_variants && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-700">
                        Var
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="p-2 border-t border-gray-200 flex-shrink-0 bg-white rounded-br-2xl">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-0.5 text-[11px] font-medium"
              >
                <ChevronLeft className="w-3 h-3" />
                Prev
              </button>
              
              <span className="text-[11px] font-medium text-gray-600">
                {currentPage} / {totalPages}
              </span>
              
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-0.5 text-[11px] font-medium"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}