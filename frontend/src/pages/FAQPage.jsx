import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Mail, Clock, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FAQHeader from '../components/faqs/FAQHeader';
import { getAllFAQs } from '../components/faqs/faqData';
import SEO from '../components/seo/SEO';

/**
 * FAQ Page Component
 * Mobile-first, fully responsive FAQ page with search and category filtering
 * Features:
 * - Animated accordion items
 * - Sliding search header on scroll
 * - Category filtering
 * - Mobile-optimized layout
 * - Contact support section
 * - Centralized FAQ data from faqData.js
 * - Load More functionality (shows 5 FAQs at a time)
 * - Interactive Grid Background (same as ExperienceGallery)
 */

// Get FAQ data from centralized source
const faqData = { categories: getAllFAQs() };

// Interactive Grid Background Component (from ExperienceGallery)
const GridBackground = ({ gridSize = 40, opacity = 0.05, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cols = Math.ceil(rect.width / gridSize);
        const rows = Math.ceil(rect.height / gridSize);
        setGridDimensions({ rows, cols });
      }
    };

    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [gridSize]);

  const getHoveredCell = () => {
    if (!mousePos || !containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = mousePos.x - rect.left;
    const y = mousePos.y - rect.top;
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    
    if (col >= 0 && col < gridDimensions.cols && row >= 0 && row < gridDimensions.rows) {
      return { row, col };
    }
    return null;
  };

  const hoveredCell = getHoveredCell();

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-tpppink"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered ? '#d9566ab7' : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQs, setOpenFAQs] = useState([]);
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(5);
  const [mousePos, setMousePos] = useState(null);

  // Filter FAQs based on search and category
  useEffect(() => {
    let results = [];

    faqData.categories.forEach(category => {
      if (selectedCategory === 'all' || selectedCategory === category.id) {
        const matchingFAQs = category.faqs
          .filter(faq => 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(faq => ({
            ...faq,
            categoryName: category.name,
            categoryIcon: category.icon
          }));
        
        results = [...results, ...matchingFAQs];
      }
    });

    setFilteredFAQs(results);
    // Reset displayed count when filters change
    setDisplayedCount(5);
  }, [searchQuery, selectedCategory]);

  // Toggle FAQ open/close
  const toggleFAQ = (index) => {
    setOpenFAQs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Load more FAQs
  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 5);
  };

  // Get currently displayed FAQs
  const displayedFAQs = filteredFAQs.slice(0, displayedCount);
  const hasMoreFAQs = displayedCount < filteredFAQs.length;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle mouse movement for grid background
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Rizara Luxe products, shipping, returns, and our premium gifting experience."
        canonical="https://www.rizara.in/faqs"
      />

      {/* Interactive Grid Background */}
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />

      {/* FAQ Header with CommonHeader and Sliding Search */}
      <div className="relative z-10">
        <FAQHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-between gap-2 pb-2">
            {/* All Categories Tab */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-tpppink text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              All
            </button>

            {/* Category Tabs */}
            {faqData.categories.map((category) => {
              // Get first word of category name
              const shortName = category.name.split(' ')[0];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-tpppink text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        {filteredFAQs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-slate-600"
          >
            Showing {displayedFAQs.length} of {filteredFAQs.length} results
          </motion.div>
        )}

        {/* FAQ List */}
        <div className="space-y-3">
          {displayedFAQs.length > 0 ? (
            <>
              {displayedFAQs.map((faq, index) => {
                const isOpen = openFAQs.includes(index);
                const CategoryIcon = faq.categoryIcon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-start gap-3 p-4 md:p-5 text-left transition-colors hover:bg-slate-50"
                    >
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isOpen ? 'bg-tpppink text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <CategoryIcon size={16} />
                      </div>

                      {/* Question */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-semibold transition-colors ${
                          isOpen ? 'text-tpppink' : 'text-tppslate'
                        }`}>
                          {faq.question}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {faq.categoryName}
                        </p>
                      </div>

                      {/* Chevron */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown 
                          size={20} 
                          className={isOpen ? 'text-tpppink' : 'text-slate-400'}
                        />
                      </motion.div>
                    </button>

                    {/* Answer */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-5 pb-4 md:pb-5 pl-16 md:pl-[72px]">
                            <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Load More Button */}
              {hasMoreFAQs && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center pt-6"
                >
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-tpppink text-white font-semibold rounded-lg hover:bg-tpppink/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    Load More ({filteredFAQs.length - displayedCount} remaining)
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-semibold text-slate-600 mb-2">
                No results found
              </p>
              <p className="text-sm text-slate-500">
                Try adjusting your search or browse different categories
              </p>
            </motion.div>
          )}
        </div>

        {/* Still Have Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-tpppink/10 to-purple-50 rounded-2xl p-6 md:p-8 border border-tpppink/20"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-tppslate mb-3">
              Still Have Questions?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Email Support */}
            <a
              href="mailto:officialrizara@gmail.com"
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-tpppink hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-tpppink/10 rounded-full flex items-center justify-center group-hover:bg-tpppink transition-colors">
                <Mail size={24} className="text-tpppink group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate mb-1">Email Us</p>
                <p className="text-sm text-slate-600">officialrizara@gmail.com</p>
              </div>
            </a>

            {/* Business Hours */}
            <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate mb-1">Business Hours</p>
                <p className="text-sm text-slate-600">Mon-Sat: 10 AM - 7 PM</p>
              </div>
            </div>

            {/* Response Time */}
            <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <MessageCircle size={24} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate mb-1">Quick Response</p>
                <p className="text-sm text-slate-600">Within 24 hours</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;