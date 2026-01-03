// frontend/src/components/home/HomeLayout.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';

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

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer with Curved Top */}
      <footer className="relative bg-slate-900 text-white pt-20 pb-12 overflow-hidden">
        
        {/* Animated Curved top edge */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden">
          <motion.svg
            className="w-full h-20"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              animate={{
                d: [
                  "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
                  "M0,50 C360,65 720,25 1080,45 C1260,55 1380,20 1440,35 L1440,0 L0,0 Z",
                  "M0,40 C360,10 720,60 1080,30 C1260,15 1380,50 1440,40 L1440,0 L0,0 Z",
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              fill="#FFFFFF"
            />
          </motion.svg>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Brand Section */}
            <div>
              <h3 className="text-2xl font-greyqo text-tpppink mb-4">Rizara</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Curating perfect gift bundles with love and care. Premium products, thoughtfully packaged.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/shop" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link to="/gift-quiz" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Gift Quiz
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Customer Care</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/user/orders" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <Mail size={16} className="flex-shrink-0 mt-0.5 text-tpppink" />
                  <span>support@rizara.com</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <Phone size={16} className="flex-shrink-0 mt-0.5 text-tpppink" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5 text-tpppink" />
                  <span>Delhi, India</span>
                </li>
              </ul>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg hover:bg-tpppink transition-colors"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg hover:bg-tpppink transition-colors"
                  title="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-lg hover:bg-tpppink transition-colors"
                  title="Twitter"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Rizara. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-tpppink transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;