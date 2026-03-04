import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Mail, Clock, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FAQHeader from '../components/faqs/FAQHeader';
import { getAllFAQs } from '../components/faqs/faqData';
import SEO from '../components/seo/SEO';
import { useBrand } from '../context/BrandContext';

const faqData = { categories: getAllFAQs() };

const GridBackground = ({ gridSize = 40, opacity = 0.05, mousePos}) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = React.useRef(null);
  const { brandMode } = useBrand();

  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current) {
        const cols = Math.ceil(window.innerWidth / gridSize);
        const rows = Math.ceil(window.innerHeight / gridSize);
        setGridDimensions({ rows, cols });
      }
    };
    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    window.addEventListener('scroll', updateGridDimensions);
    return () => {
      window.removeEventListener('resize', updateGridDimensions);
      window.removeEventListener('scroll', updateGridDimensions); // ← ADD THIS
    };
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
    <div ref={containerRef} className="fixed inset-0 w-full pointer-events-none" style={{ zIndex: 1, height: '100%' }}>
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-tpppink dark:border-tppdarkwhite"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered ? (brandMode === 'feminine'?'#d9566ab7' : '#ffffffcf' ) : 'transparent',
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
    setDisplayedCount(5);
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (index) => {
    setOpenFAQs(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleLoadMore = () => setDisplayedCount(prev => prev + 5);

  const displayedFAQs = filteredFAQs.slice(0, displayedCount);
  const hasMoreFAQs = displayedCount < filteredFAQs.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white dark:from-tppdark dark:via-tppdark dark:to-tppdark relative "
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Rizara Luxe products, shipping, returns, and our premium gifting experience."
        canonical="https://www.rizara.in/faqs"
      />

      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />

        <FAQHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-between gap-2 pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark shadow-lg'
                  : 'bg-white dark:bg-tppdarkgray text-slate-600 dark:text-tppdarkwhite/70 hover:bg-slate-50 dark:hover:bg-tppdarkwhite/10 border border-slate-200 dark:border-tppdarkwhite/10'
              }`}
            >
              All
            </button>
            {faqData.categories.map((category) => {
              const shortName = category.name.split(' ')[0];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark shadow-lg'
                      : 'bg-white dark:bg-tppdarkgray text-slate-600 dark:text-tppdarkwhite/70 hover:bg-slate-50 dark:hover:bg-tppdarkwhite/10 border border-slate-200 dark:border-tppdarkwhite/10'
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-sm text-slate-600 dark:text-tppdarkwhite/50">
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
                    className="bg-white dark:bg-tppdarkgray rounded-xl border border-slate-200 dark:border-tppdarkwhite/10 shadow-sm hover:shadow-md dark:hover:border-tppdarkwhite/20 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-start gap-3 p-4 md:p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isOpen
                          ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark'
                          : 'bg-slate-100 dark:bg-tppdarkwhite/10 text-slate-600 dark:text-tppdarkwhite/60'
                      }`}>
                        <CategoryIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-semibold transition-colors ${
                          isOpen
                            ? 'text-tpppink dark:text-tppdarkwhite'
                            : 'text-tppslate dark:text-tppdarkwhite/80'
                        }`}>
                          {faq.question}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40 mt-1">
                          {faq.categoryName}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown size={20} className={isOpen ? 'text-tpppink dark:text-tppdarkwhite' : 'text-slate-400 dark:text-tppdarkwhite/30'} />
                      </motion.div>
                    </button>

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
                            <p className="text-sm md:text-base text-slate-700 dark:text-tppdarkwhite/60 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {hasMoreFAQs && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center pt-6"
                >
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark font-semibold rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    Load More ({filteredFAQs.length - displayedCount} remaining)
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Search size={48} className="mx-auto text-slate-300 dark:text-tppdarkwhite/20 mb-4" />
              <p className="text-lg font-semibold text-slate-600 dark:text-tppdarkwhite/60 mb-2">No results found</p>
              <p className="text-sm text-slate-500 dark:text-tppdarkwhite/40">Try adjusting your search or browse different categories</p>
            </motion.div>
          )}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-tpppink/10 to-purple-50 dark:from-tppdarkgray dark:to-tppdarkgray rounded-2xl p-6 md:p-8 border border-tpppink/20 dark:border-tppdarkwhite/10"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-tppslate dark:text-tppdarkwhite mb-3">Still Have Questions?</h2>
            <p className="text-slate-600 dark:text-tppdarkwhite/50 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="mailto:officialrizara@gmail.com"
              className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-tppdark rounded-xl border border-slate-200 dark:border-tppdarkwhite/10 hover:border-tpppink dark:hover:border-tppdarkwhite/30 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-tpppink/10 dark:bg-tppdarkwhite/10 rounded-full flex items-center justify-center group-hover:bg-tpppink dark:group-hover:bg-tppdarkwhite transition-colors">
                <Mail size={24} className="text-tpppink dark:text-tppdarkwhite group-hover:text-white dark:group-hover:text-tppdark transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate dark:text-tppdarkwhite mb-1">Email Us</p>
                <p className="text-sm text-slate-600 dark:text-tppdarkwhite/50">officialrizara@gmail.com</p>
              </div>
            </a>

            <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-tppdark rounded-xl border border-slate-200 dark:border-tppdarkwhite/10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-tppdarkwhite/10 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-blue-600 dark:text-tppdarkwhite/60" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate dark:text-tppdarkwhite mb-1">Business Hours</p>
                <p className="text-sm text-slate-600 dark:text-tppdarkwhite/50">Mon-Sat: 10 AM - 7 PM</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-tppdark rounded-xl border border-slate-200 dark:border-tppdarkwhite/10">
              <div className="w-12 h-12 bg-green-50 dark:bg-tppdarkwhite/10 rounded-full flex items-center justify-center">
                <MessageCircle size={24} className="text-green-600 dark:text-tppdarkwhite/60" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-tppslate dark:text-tppdarkwhite mb-1">Quick Response</p>
                <p className="text-sm text-slate-600 dark:text-tppdarkwhite/50">Within 24 hours</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FAQPage;