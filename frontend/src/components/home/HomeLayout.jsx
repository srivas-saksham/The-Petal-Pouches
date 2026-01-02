// frontend/src/components/home/HomeLayout.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, User, Heart } from 'lucide-react';

/**
 * HomeLayout Component - REDESIGNED
 * 
 * Features:
 * - Minimal, clean navigation
 * - Subtle scroll progress
 * - Premium footer with curves
 * - No aggressive styling
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
        className="fixed top-0 left-0 h-0.5 bg-tpppink z-50"
        style={{ 
          width: `${scrollProgress}%`,
          boxShadow: '0 1px 4px rgba(217, 86, 105, 0.3)',
        }}
      />

      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-tppgrey/10">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <span className="font-italianno text-5xl text-tppslate group-hover:text-tpppink transition-colors">
              Rizara
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/shop" className="text-sm text-tppslate/70 hover:text-tppslate transition-colors font-light">
              Shop All
            </a>
            <button className="text-sm text-tppslate/70 hover:text-tppslate transition-colors font-light">
              Gift Quiz
            </button>
            <a href="/shop?category=bundles" className="text-sm text-tppslate/70 hover:text-tppslate transition-colors font-light">
              Bundles
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Wishlist */}
            <button
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-tpppeach/30 transition-colors group"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-tppslate/70 group-hover:text-tpppink transition-colors" />
            </button>

            {/* Cart Button */}
            <button
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-tpppeach/30 transition-colors group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} className="text-tppslate/70 group-hover:text-tpppink transition-colors" />
              
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-tpppink text-white text-xs font-semibold rounded-full flex items-center justify-center"
              >
                2
              </motion.span>
            </button>

            {/* User Account */}
            <button
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-tpppeach/30 hover:bg-tpppeach/50 transition-colors group"
              aria-label="My Account"
            >
              <User size={20} className="text-tpppink" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-tpppeach/30 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-tppslate"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer with Curved Top */}
      <footer className="relative bg-tppslate text-white pt-20 pb-12 overflow-hidden">
        
        {/* Animated Curved top edge */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden">
          <motion.svg
            className="w-full h-16"
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              animate={{
                d: [
                  "M0,32 C360,10 720,50 1080,25 C1260,12 1380,40 1440,32 L1440,0 L0,0 Z",
                  "M0,40 C360,50 720,15 1080,35 C1260,45 1380,10 1440,25 L1440,0 L0,0 Z",
                  "M0,32 C360,10 720,50 1080,25 C1260,12 1380,40 1440,32 L1440,0 L0,0 Z",
                ]
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              fill="#FFFFFF"
            />
          </motion.svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <span className="text-2xl font-serif">Rizara</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md font-light">
                Creating unforgettable gift experiences with beautifully curated boxes. 
                Every detail is designed to make someone feel truly special.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/rizara"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com/rizara"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm font-light">
                <li>
                  <a href="/shop" className="text-white/60 hover:text-white transition-colors">
                    Shop All Gifts
                  </a>
                </li>
                <li>
                  <a href="/shop?category=bundles" className="text-white/60 hover:text-white transition-colors">
                    Gift Bundles
                  </a>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white transition-colors text-left">
                    Gift Quiz
                  </button>
                </li>
                <li>
                  <a href="/user/orders" className="text-white/60 hover:text-white transition-colors">
                    Track Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h3 className="font-semibold text-base mb-4">Customer Care</h3>
              <ul className="space-y-2 text-sm font-light">
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40 font-light">
            <p>© 2025 Rizara. All rights reserved.</p>
            <p>Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;