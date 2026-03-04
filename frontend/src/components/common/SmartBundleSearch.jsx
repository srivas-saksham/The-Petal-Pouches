// frontend/src/components/common/SmartBundleSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ChevronRight, Tag } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import shopService from '../../services/shopService';

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
 * - Brand mode gender segmentation (masculine -> men, feminine -> women)
 * - Dark mode support
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
  searchType = "all",
  onResultClick,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Brand mode — derive gender param exactly as ShopNew.jsx does
  const { brandMode } = useBrand();
  const gender = brandMode === 'masculine' ? 'men' : 'women';

  const RESULTS_PER_PAGE = 5;
  const DEBOUNCE_DELAY = 300;

  /**
   * Normalize tags to array format.
   * Handles both array and string formats gracefully.
   */
  const normalizeTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof tags === 'string') {
      return tags.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
    }
    console.warn('Unexpected tags format:', typeof tags, tags);
    return [];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /**
   * Smart search using shopService — includes gender param for brand mode filtering.
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
      const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);

      console.log('Smart Search initiated:', { originalQuery: searchQuery, queryWords, searchType, gender });

      // Use shopService.getAllItems — consistent with ShopNew.jsx, forwards gender param
      const response = await shopService.getAllItems({
        search: searchQuery,
        limit: 50,
        type: searchType,
        gender,
      });

      const allItems = response.data || [];

      const scoredItems = allItems.map(item => {
        let score = 0;
        const itemTags = normalizeTags(item.tags);
        const itemTitle = (item.title || '').toLowerCase();
        const itemDescription = (item.description || '').toLowerCase();

        if (itemTitle.includes(searchQuery.toLowerCase())) score += 100;
        if (itemDescription.includes(searchQuery.toLowerCase())) score += 50;

        queryWords.forEach(word => {
          itemTags.forEach(tag => {
            if (tag.includes(word) || word.includes(tag)) score += 10;
          });
        });

        return { ...item, searchScore: score };
      });

      const matchedItems = scoredItems
        .filter(item => item.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);

      console.log('Smart Search results:', {
        totalMatched: matchedItems.length,
        gender,
        types: {
          products: matchedItems.filter(i => i.item_type === 'product').length,
          bundles: matchedItems.filter(i => i.item_type === 'bundle').length
        },
        topScores: matchedItems.slice(0, 5).map(i => ({
          title: i.title, type: i.item_type, score: i.searchScore, tags: normalizeTags(i.tags)
        }))
      });

      setResults(matchedItems);
      setTotalResults(matchedItems.length);
      setCurrentPage(0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSmartSearch(value);
    }, DEBOUNCE_DELAY);
  };

  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = (item) => {
    setIsOpen(false);
    setQuery('');
    if (onResultClick) onResultClick(item);
    const path = item.item_type === 'bundle'
      ? `/shop/bundles/${item.id}`
      : `/shop/products/${item.id}`;
    navigate(path);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setIsOpen(false);
    setCurrentPage(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * RESULTS_PER_PAGE < totalResults) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const getCurrentPageResults = () => {
    const startIdx = currentPage * RESULTS_PER_PAGE;
    return results.slice(startIdx, startIdx + RESULTS_PER_PAGE);
  };

  const currentResults = getCurrentPageResults();
  const hasNextPage = (currentPage + 1) * RESULTS_PER_PAGE < totalResults;
  const hasPrevPage = currentPage > 0;

  const formatPrice = (price) => `\u20b9${parseFloat(price || 0).toFixed(2)}`;

  const getMatchingTags = (item) => {
    const itemTags = normalizeTags(item.tags);
    if (itemTags.length === 0) return [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    return itemTags.filter(tag =>
      queryWords.some(word => tag.includes(word) || word.includes(tag))
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            loading
              ? 'text-tpppink dark:text-tppdarkwhite animate-pulse'
              : 'text-slate-400 dark:text-tppdarkwhite/40'
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
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-tppdarkgray border-2 border-slate-200 dark:border-tppdarkwhite/10 rounded-lg focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/20 hover:border-slate-300 dark:hover:border-tppdarkwhite/20 transition-all text-slate-900 dark:text-tppdarkwhite placeholder:text-slate-400 dark:placeholder:text-tppdarkwhite/30"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-tppdarkwhite/40 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-tppdarkgray rounded-lg shadow-xl border-2 border-slate-200 dark:border-tppdarkwhite/10 z-50 max-h-102 overflow-hidden">

          {/* Loading State */}
          {loading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-tppdarkwhite/10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-tppdarkwhite/10 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-tppdarkwhite/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div className="p-6 text-center">
              <Package className="w-10 h-10 text-slate-300 dark:text-tppdarkwhite/20 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-tppdarkwhite/70 font-medium">No products found</p>
              <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40 mt-1">Try different keywords or tags</p>
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
                      className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 transition-all text-left border-b border-slate-100 dark:border-tppdarkwhite/10 last:border-b-0 group"
                    >
                      <div className="flex gap-3">
                        {/* Item Image */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-tppdark border border-slate-200 dark:border-tppdarkwhite/10 relative">
                          <img
                            src={item.img_url || '/placeholder-product.png'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                          />
                          {isBundle && (
                            <span className="absolute top-1 right-1 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              BUNDLE
                            </span>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-tppdarkwhite group-hover:text-tpppink dark:group-hover:text-tppdarkwhite/80 transition-colors line-clamp-1 mb-1">
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-tpppink dark:text-tppdarkwhite">
                              {formatPrice(item.price)}
                            </span>
                            {isBundle && item.discount_percent > 0 && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {item.discount_percent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Matching Tags */}
                          {matchingTags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <Tag size={12} className="text-slate-400 dark:text-tppdarkwhite/30" />
                              {matchingTags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-tpppink/10 dark:bg-tppdarkwhite/10 text-tpppink dark:text-tppdarkwhite px-2 py-0.5 rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {matchingTags.length > 3 && (
                                <span className="text-xs text-slate-500 dark:text-tppdarkwhite/40">
                                  +{matchingTags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight
                          size={18}
                          className="text-slate-400 dark:text-tppdarkwhite/30 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite transition-colors flex-shrink-0 mt-1"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination Footer */}
              <div className="border-t-2 border-slate-200 dark:border-tppdarkwhite/10 bg-slate-50 dark:bg-tppdark px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-tppdarkwhite/70 font-medium">
                    Showing {currentPage * RESULTS_PER_PAGE + 1}-
                    {Math.min((currentPage + 1) * RESULTS_PER_PAGE, totalResults)} of {totalResults}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasPrevPage && (
                      <button
                        onClick={handlePrevPage}
                        className="text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 font-semibold transition-colors"
                      >
                        ← Previous
                      </button>
                    )}
                    {hasNextPage && (
                      <button
                        onClick={handleNextPage}
                        className="text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 font-semibold transition-colors"
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
                  className="w-full mt-2 text-sm text-center text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 font-semibold transition-colors py-1"
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