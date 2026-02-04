// frontend/src/components/home/HomeLayout.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';
import CouponMarquee from '../common/CouponMarquee';
/**
 * HomeLayout Component
 * 
 * Features:
 * - New CommonHeader with all ShopHeader functionalities
 * - Scroll progress bar
 * - Premium footer with curved waves
 * - Clean, minimal design
 */
const HomeLayout = ({ children }) => {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Subtle Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 bg-tpppink z-[60]"
        style={{ 
          width: `${scrollProgress}%`,
          boxShadow: '0 1px 4px rgba(217, 86, 105, 0.3)',
        }}
      />

      {/* New CommonHeader */}
      <CommonHeader />

      {/* ⭐ NEW: Coupon Marquee - Shows below header */}
      <CouponMarquee />
      {/* Main Content */}
      <main>
        {children}
      </main>

    </div>
  );
};

export default HomeLayout;