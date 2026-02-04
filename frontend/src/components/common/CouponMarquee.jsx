// frontend/src/components/common/CouponMarquee.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveFeaturedCoupons, getFeaturedCouponById } from '../../data/featuredCoupons';

/**
 * CouponMarquee Component
 * Clean, professional design matching site theme
 * 
 * Features:
 * - Auto-scrolling marquee with multiple coupons
 * - Click to open detailed modal
 * - Smooth animations
 * - Mobile responsive
 * - Auto-hides on scroll down, shows on scroll up
 */
const CouponMarquee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Load active coupons on mount
  useEffect(() => {
    const coupons = getActiveFeaturedCoupons();
    setActiveCoupons(coupons);
    console.log('📢 [Marquee] Loaded coupons:', coupons);
  }, []);

  // Check if redirected from marquee click
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const couponId = params.get('marquee_coupon');
    
    console.log('🔍 [Marquee] URL params:', { couponId, pathname: location.pathname });
    
    if (couponId) {
      const coupon = getFeaturedCouponById(couponId);
      console.log('🎯 [Marquee] Found coupon:', coupon);
      
      if (coupon) {
        setSelectedCoupon(coupon);
        setShowModal(true);
        
        // Clean URL without reloading
        const newUrl = location.pathname + 
          location.search.replace(`marquee_coupon=${couponId}`, '')
          .replace('?&', '?').replace(/[?&]$/, '');
        window.history.replaceState({}, '', newUrl || location.pathname);
      }
    }
  }, [location.search, location.pathname]);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolled more than 100px and scrolling down
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle coupon click - navigate to shop with modal trigger
  const handleCouponClick = (coupon) => {
    console.log('🖱️ [Marquee] Clicked coupon:', coupon.id);
    setSelectedCoupon(coupon);
    setShowModal(true);
    navigate(`/shop?marquee_coupon=${coupon.id}`);
  };

  // Handle modal actions
  const handleAction = (button) => {
    console.log('🎬 [Marquee] Action:', button);
    
    if (button.action === 'category' && button.params) {
      const params = new URLSearchParams(button.params).toString();
      navigate(`${button.path}?${params}`);
    } else {
      navigate(button.path);
    }
    
    setShowModal(false);
  };

  // Copy coupon code
  const handleCopyCode = () => {
    if (selectedCoupon) {
      navigator.clipboard.writeText(selectedCoupon.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (activeCoupons.length === 0) {
    console.log('⚠️ [Marquee] No active coupons');
    return null;
  }

  return (
    <>
      {/* Clean Professional Marquee Banner */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sticky top-16 z-40 overflow-hidden"
        style={{ top: 'calc(4rem)' }} // Accounts for header height
      >
        <div className="bg-tpppink border-b border-tpppink/20">
          
          {/* Marquee Content - Clean Design */}
          <div className="relative overflow-hidden py-2.5">
            <motion.div
              className="flex gap-16 whitespace-nowrap"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {/* Repeat coupons for seamless loop */}
              {[...activeCoupons, ...activeCoupons, ...activeCoupons].map((coupon, index) => (
                <button
                  key={`${coupon.id}-${index}`}
                  onClick={() => handleCouponClick(coupon)}
                  className="flex items-center gap-2 text-white font-semibold text-sm hover:scale-105 transition-transform active:scale-95 cursor-pointer group"
                >
                  <Gift size={18} className="flex-shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="group-hover:underline">{coupon.marquee_text}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Clean Professional Modal */}
      <AnimatePresence>
        {showModal && selectedCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
              >
                <X size={20} className="text-tppslate" />
              </button>

              {/* Header - Clean Pink Banner */}
              <div className="bg-tpppink px-6 pt-8 pb-6 rounded-t-xl border-b-4 border-tpppink/20">
                <div className="flex items-start gap-3">
                  <Gift size={32} className="flex-shrink-0 text-white mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedCoupon.modal.title}
                    </h2>
                    <p className="text-white/90 text-sm font-medium">
                      {selectedCoupon.modal.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                
                {/* Description */}
                <p className="text-tppslate leading-relaxed text-sm">
                  {selectedCoupon.modal.description}
                </p>

                {/* Coupon Code Box - Clean Design */}
                <div className="bg-slate-50 border-2 border-tpppink rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-tppslate font-semibold mb-1.5 uppercase tracking-wide">
                        Coupon Code
                      </p>
                      <div className="flex items-center gap-2">
                        <Tag size={20} className="text-tpppink" />
                        <p className="text-2xl font-bold text-tpppink tracking-wider">
                          {selectedCoupon.modal.code_display}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-2.5 bg-tpppink hover:bg-tpppink/90 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 active:scale-95 shadow-md"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Highlights - Clean List */}
                {selectedCoupon.modal.highlights && (
                  <div>
                    <h3 className="text-sm font-bold text-tppslate mb-3 uppercase tracking-wide">
                      What You Get
                    </h3>
                    <div className="space-y-2.5 bg-slate-50 rounded-lg p-4 border border-slate-200">
                      {selectedCoupon.modal.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-tpppink mt-2 flex-shrink-0" />
                          <p className="text-sm text-tppslate flex-1 leading-relaxed">
                            {highlight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms & Conditions - Minimal */}
                {selectedCoupon.modal.terms && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="text-xs font-bold text-tppslate mb-3 uppercase tracking-wide">
                      Terms & Conditions
                    </h3>
                    <ul className="space-y-2">
                      {selectedCoupon.modal.terms.map((term, index) => (
                        <li key={index} className="text-xs text-tppslate/80 flex items-start gap-2">
                          <span className="text-tppslate/40 font-bold">•</span>
                          <span className="flex-1">{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons - Clean Primary/Secondary */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleAction(selectedCoupon.modal.buttons.primary)}
                    className="flex-1 px-6 py-3.5 bg-tpppink hover:bg-tpppink/90 text-white font-bold rounded-lg transition-all active:scale-95 shadow-md text-sm"
                  >
                    {selectedCoupon.modal.buttons.primary.text}
                  </button>
                  <button
                    onClick={() => handleAction(selectedCoupon.modal.buttons.secondary)}
                    className="flex-1 px-6 py-3.5 bg-white hover:bg-slate-50 text-tpppink font-bold rounded-lg transition-all active:scale-95 border-2 border-tpppink text-sm"
                  >
                    {selectedCoupon.modal.buttons.secondary.text}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CouponMarquee;