// frontend/src/components/home/HomeFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Heart, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeFooter = () => {
  return (
    <footer className="bg-tppslate text-white mt-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tpppink rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tpppink rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
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

          {/* Brand Section - Full Width on Mobile */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-3xl lg:text-8xl font-italianno text-tpppink">
                Rizara
              </h3>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-xs">
              Curating perfect gift bundles with love and care. Premium products, thoughtfully packaged for life's special moments.
            </p>

            {/* Newsletter */}
            <div className="hidden lg:block">
              <p className="font-inter text-white/90 font-semibold text-sm mb-3">
                Stay Updated
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-tpppink focus:bg-white/15 transition-all"
                />
                <button className="px-4 py-2 bg-tpppink hover:bg-tpppink/90 rounded-r-lg transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-inter font-bold text-white text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink rounded-full"></div>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/shop" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => {
                    const quizSection = document.getElementById('gift-quiz-section');
                    if (quizSection) {
                      quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Gift Quiz
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/faqs" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-1">
            <h4 className="font-inter font-bold text-white text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink rounded-full"></div>
              Customer Care
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/user/orders" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Track Order
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-white/70 hover:text-tpppink transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink transition-all duration-300"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-inter font-bold text-white text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink rounded-full"></div>
              Get in Touch
            </h4>
            <ul className="space-y-4 mb-6">
              <li>
                <a 
                  href="mailto:rizaraofficial@gmail.com"
                  className="flex items-start gap-3 text-white/70 hover:text-tpppink transition-colors text-sm group"
                >
                  <div className="p-2 bg-tpppink/20 rounded-lg group-hover:bg-tpppink/30 transition-colors">
                    <Mail size={16} className="text-tpppink" />
                  </div>
                  <span className="pt-1.5">rizaraofficial@gmail.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+919876543210"
                  className="flex items-start gap-3 text-white/70 hover:text-tpppink transition-colors text-sm group"
                >
                  <div className="p-2 bg-tpppink/20 rounded-lg group-hover:bg-tpppink/30 transition-colors">
                    <Phone size={16} className="text-tpppink" />
                  </div>
                  <span className="pt-1.5">+91 98765 43210</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/70 text-sm">
                  <div className="p-2 bg-tpppink/20 rounded-lg">
                    <MapPin size={16} className="text-tpppink" />
                  </div>
                  <span className="pt-1.5">Delhi, India</span>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <p className="text-white/90 font-semibold text-sm mb-3">Follow Us</p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/rizara.luxe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-tpppink rounded-lg transition-all hover:scale-110"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/people/Rizara-Luxe/61586194575624/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-tpppink rounded-lg transition-all hover:scale-110"
                  title="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-tpppink rounded-lg transition-all hover:scale-110"
                  title="Twitter"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Newsletter - Shows only on mobile */}
        <div className="lg:hidden mb-8 pb-6 border-b border-white/20">
          <p className="text-white/90 font-semibold text-sm mb-3">
            Stay Updated
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-l-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-tpppink focus:bg-white/15 transition-all"
            />
            <button className="px-4 py-2.5 bg-tpppink hover:bg-tpppink/90 rounded-r-lg transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-xs lg:text-sm flex items-center gap-2">
              © {new Date().getFullYear()} Rizara. Made with 
              <Heart size={14} className="text-tpppink fill-tpppink" /> 
              in India
            </p>
            <div className="flex items-center gap-6">
              <Link 
                to="/privacy" 
                className="text-white/60 hover:text-tpppink transition-colors text-xs lg:text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-white/60 hover:text-tpppink transition-colors text-xs lg:text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                to="/refund" 
                className="text-white/60 hover:text-tpppink transition-colors text-xs lg:text-sm"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;