// frontend/src/components/common/CouponMarquee.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveFeaturedCoupons } from '../../data/featuredCoupons';

/**
 * CouponMarquee Component
 * Clean, professional design matching site theme
 * 
 * Features:
 * - Auto-scrolling marquee with multiple coupons
 * - Click to navigate directly to shop with filters
 * - Smooth animations
 * - Mobile responsive
 * - Auto-hides on scroll down, shows on scroll up
 */
const CouponMarquee = () => {
  const navigate = useNavigate();
  
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Load active coupons on mount
  useEffect(() => {
    const coupons = getActiveFeaturedCoupons();
    setActiveCoupons(coupons);
    console.log('📢 [Marquee] Loaded coupons:', coupons);
  }, []);

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

  // Handle coupon click - navigate directly to shop with appropriate filters
  const handleCouponClick = (coupon) => {
    console.log('🖱️ [Marquee] Clicked coupon:', coupon.id);
    
    // Use the secondary button navigation (category filter) if available
    const targetButton = coupon.modal.buttons.secondary || coupon.modal.buttons.primary;
    
    if (targetButton.action === 'category' && targetButton.params) {
      const params = new URLSearchParams(targetButton.params).toString();
      navigate(`${targetButton.path}?${params}`);
    } else {
      navigate(targetButton.path);
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
    </>
  );
};

export default CouponMarquee;