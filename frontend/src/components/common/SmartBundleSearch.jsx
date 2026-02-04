// frontend/src/components/common/SmartBundleSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ChevronRight, Tag } from 'lucide-react';

/**
 * SmartBundleSearch Component - ENHANCED VERSION
 * 
 * FEATURES:
 * - Real-time search with debouncing (300ms)
 * - Smart tag matching - breaks search into words and matches against tags
 * - Searches BOTH products AND bundles (type filtering supported)
 * - Handles tags as BOTH arrays and strings (robust)
 * - Compact dropdown with top 5-6 results
 * - Pagination within dropdown (next 5 results)
 * - Enter key redirects to /shop with full search
 * - Click outside to close
 * - Professional error handling
 * - Skeleton loading states
 * - Tag highlighting in results
 * 
 * @param {string} placeholder - Search input placeholder
 * @param {string} className - Additional CSS classes
 * @param {string} searchType - 'all' | 'products' | 'bundles' (default: 'all')
 * @param {Function} onResultClick - Optional callback when result is clicked
 * @param {Function} onNavigate - Navigation function (receives path)
 */
const SmartBundleSearch = ({ 
  placeholder = "Search products and bundles...", 
  className = "",
  searchType = "all", // ✅ NEW: Support type filtering
  onResultClick,
  onNavigate
}) => {
  // State management
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Refs
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  // Constants
  const RESULTS_PER_PAGE = 5;
  const DEBOUNCE_DELAY = 300;
  const API_URL = import.meta.env.VITE_API_BASE_URL;


  /**
   * ✅ FIXED: Normalize tags to array format
   * Handles both array and string formats gracefully
   */
  const normalizeTags = (tags) => {
    if (!tags) return [];
    
    // If already an array, return lowercase version
    if (Array.isArray(tags)) {
      return tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
    }
    
    // If string, split by comma and normalize
    if (typeof tags === 'string') {
      return tags
        .toLowerCase()
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    
    // Fallback: empty array
    console.warn('⚠️ Unexpected tags format:', typeof tags, tags);
    return [];
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * ✅ ENHANCED: Smart search with product + bundle support
   */
  const performSmartSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setTotalResults(0);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError('');
    setIsOpen(true);

    try {
      const queryWords = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0);

      console.log('🔍 Smart Search initiated:', {
        originalQuery: searchQuery,
        queryWords,
        searchType
      });

      // ✅ NEW: Use shop service to search all items
      const params = {
        search: searchQuery,
        limit: 50,
        type: searchType // 'all', 'products', or 'bundles'
      };

      const response = await fetch(
        `${API_URL}/api/shop/items?${new URLSearchParams(params)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const allItems = data.data || [];

      // ✅ Smart matching with robust tag handling (works for both products & bundles)
      const scoredItems = allItems.map(item => {
        let score = 0;
        
        const itemTags = normalizeTags(item.tags);
        const itemTitle = (item.title || '').toLowerCase();
        const itemDescription = (item.description || '').toLowerCase();

        // Direct title match (highest score)
        if (itemTitle.includes(searchQuery.toLowerCase())) {
          score += 100;
        }
        
        // Description match
        if (itemDescription.includes(searchQuery.toLowerCase())) {
          score += 50;
        }

        // Tag matches
        queryWords.forEach(word => {
          itemTags.forEach(tag => {
            if (tag.includes(word) || word.includes(tag)) {
              score += 10;
            }
          });
        });

        return { ...item, searchScore: score };
      });

      const matchedItems = scoredItems
        .filter(item => item.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);

      console.log('✅ Smart Search results:', {
        totalMatched: matchedItems.length,
        types: {
          products: matchedItems.filter(i => i.item_type === 'product').length,
          bundles: matchedItems.filter(i => i.item_type === 'bundle').length
        },
        topScores: matchedItems.slice(0, 5).map(i => ({
          title: i.title,
          type: i.item_type,
          score: i.searchScore,
          tags: normalizeTags(i.tags)
        }))
      });

      setResults(matchedItems);
      setTotalResults(matchedItems.length);
      setCurrentPage(0);
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change with debouncing
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSmartSearch(value);
    }, DEBOUNCE_DELAY);
  };

  /**
   * Navigate to path
   */
  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  /**
   * Handle Enter key - redirect to /shop with search query
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  /**
   * Handle result click - route to product or bundle
   */
  const handleResultClick = (item) => {
    setIsOpen(false);
    setQuery('');
    
    if (onResultClick) {
      onResultClick(item);
    }
    
    // ✅ NEW: Route based on item type
    const path = item.item_type === 'bundle' 
      ? `/shop/bundles/${item.id}`
      : `/shop/products/${item.id}`;
    
    navigate(path);
  };

  /**
   * Clear search
   */
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setIsOpen(false);
    setCurrentPage(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * Load next page of results
   */
  const handleNextPage = () => {
    if ((currentPage + 1) * RESULTS_PER_PAGE < totalResults) {
      setCurrentPage(prev => prev + 1);
    }
  };

  /**
   * Load previous page of results
   */
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  /**
   * Get current page results
   */
  const getCurrentPageResults = () => {
    const startIdx = currentPage * RESULTS_PER_PAGE;
    const endIdx = startIdx + RESULTS_PER_PAGE;
    return results.slice(startIdx, endIdx);
  };

  const currentResults = getCurrentPageResults();
  const hasNextPage = (currentPage + 1) * RESULTS_PER_PAGE < totalResults;
  const hasPrevPage = currentPage > 0;

  /**
   * Format currency
   */
  const formatPrice = (price) => {
    return `₹${parseFloat(price || 0).toFixed(2)}`;
  };

  /**
   * ✅ FIXED: Highlight matching tags with robust handling
   */
  const getMatchingTags = (bundle) => {
    const bundleTags = normalizeTags(bundle.tags);
    if (bundleTags.length === 0) return [];
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return bundleTags.filter(tag => 
      queryWords.some(word => tag.includes(word) || word.includes(tag))
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search 
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            loading ? 'text-tpppink animate-pulse' : 'text-slate-400'
          }`}
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-lg
            focus:outline-none focus:border-tpppink focus:ring-2 focus:ring-tpppink/20
            hover:border-slate-300 transition-all text-slate-900 placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tpppink transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-slate-200 z-50 max-h-102 overflow-hidden">
          
          {/* Loading State */}
          {loading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div className="p-6 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">No products found</p>
              <p className="text-xs text-slate-500 mt-1">Try different keywords or tags</p>
            </div>
          )}

          {/* Results List */}
          {!loading && !error && currentResults.length > 0 && (
            <>
              <div className="max-h-80 overflow-y-auto">
                {currentResults.map((item) => {
                  const matchingTags = getMatchingTags(item);
                  const isBundle = item.item_type === 'bundle';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item)}
                      className="w-full px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-100 last:border-b-0 group"
                    >
                      <div className="flex gap-3">
                        {/* Item Image */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                          <img
                            src={item.img_url || '/placeholder-product.png'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.png';
                            }}
                          />
                          {/* ✅ NEW: Type badge */}
                          {isBundle && (
                            <span className="absolute top-1 right-1 bg-tpppink text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              BUNDLE
                            </span>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-tpppink transition-colors line-clamp-1 mb-1">
                            {item.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-tpppink">
                              {formatPrice(item.price)}
                            </span>
                            {isBundle && item.discount_percent > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                {item.discount_percent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Matching Tags */}
                          {matchingTags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <Tag size={12} className="text-slate-400" />
                              {matchingTags.slice(0, 3).map((tag, i) => (
                                <span 
                                  key={i}
                                  className="text-xs bg-tpppink/10 text-tpppink px-2 py-0.5 rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {matchingTags.length > 3 && (
                                <span className="text-xs text-slate-500">
                                  +{matchingTags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight 
                          size={18} 
                          className="text-slate-400 group-hover:text-tpppink transition-colors flex-shrink-0 mt-1" 
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination Footer */}
              <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Showing {currentPage * RESULTS_PER_PAGE + 1}-
                    {Math.min((currentPage + 1) * RESULTS_PER_PAGE, totalResults)} of {totalResults}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Previous Page */}
                    {hasPrevPage && (
                      <button
                        onClick={handlePrevPage}
                        className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
                      >
                        ← Previous
                      </button>
                    )}
                    
                    {/* Next Page */}
                    {hasNextPage && (
                      <button
                        onClick={handleNextPage}
                        className="text-tpppink hover:text-tpppink/80 font-semibold transition-colors"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
                
                {/* View All Results */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full mt-2 text-sm text-center text-tpppink hover:text-tpppink/80 font-semibold transition-colors py-1"
                >
                  View all results in shop →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartBundleSearch;