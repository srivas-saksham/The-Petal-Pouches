// frontend/src/components/home/HomeFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Heart, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';

const HomeFooter = () => {
  const { brandMode } = useBrand();

  return (
    <footer className="bg-tppslate dark:bg-tppdark text-white relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tpppink dark:bg-tppdarkwhite rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tpppink dark:bg-tppdarkwhite rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Animated top edge */}
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
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="fill-white dark:fill-tppdark"
              />
            </motion.svg>
          </div>

          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link to="/" className="relative inline-block">
              <h1 className="text-3xl lg:text-8xl font-italianno text-tpppink dark:text-tppdarkwhite hover:text-tpppink/80 dark:hover:text-tppdarkwhite/80 transition-colors">
                Rizara
              </h1>
              <span className="font-yatraone absolute -right-1 bottom-1 uppercase text-[16px] tracking-[0.35em] font-light text-tpppink dark:text-tppdarkwhite/80 pointer-events-none">
                {brandMode === 'feminine' ? 'Luxe' : 'Men'}
              </span>
            </Link>
            <p className="text-white/70 dark:text-tppdarkwhite/50 text-sm leading-relaxed mb-6 max-w-xs">
              Curating perfect gift bundles with love and care. Premium products, thoughtfully packaged for life's special moments.
            </p>

            {/* Newsletter — Desktop */}
            <div className="hidden lg:block">
              <p className="font-inter text-white/90 dark:text-tppdarkwhite/70 font-semibold text-sm mb-3">
                Stay Updated
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white/10 dark:bg-tppdarkwhite/5 border border-white/20 dark:border-tppdarkwhite/10 rounded-l-lg text-sm text-white dark:text-tppdarkwhite placeholder-white/50 dark:placeholder-tppdarkwhite/30 focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:bg-white/15 dark:focus:bg-tppdarkwhite/10 transition-all"
                />
                <button className="px-4 py-2 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 rounded-r-lg transition-all">
                  <Send size={16} className="text-white dark:text-tppdark" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-inter font-bold text-white dark:text-tppdarkwhite text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink dark:bg-tppdarkwhite rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop All', to: '/shop' },
                { label: 'About Us', to: '/about' },
                { label: 'FAQs', to: '/faqs' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-white/70 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink dark:bg-tppdarkwhite transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  onClick={() => {
                    const quizSection = document.getElementById('gift-quiz-section');
                    if (quizSection) quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-white/70 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink dark:bg-tppdarkwhite transition-all duration-300" />
                  Gift Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-1">
            <h4 className="font-inter font-bold text-white dark:text-tppdarkwhite text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink dark:bg-tppdarkwhite rounded-full" />
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Track Order', to: '/user/orders' },
                { label: 'Returns', to: '/refund-policy' },
                { label: 'Shipping Info', to: '/shipping-policy' },
                { label: 'Contact Us', to: '/contact-us' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-white/70 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-tpppink dark:bg-tppdarkwhite transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-inter font-bold text-white dark:text-tppdarkwhite text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-tpppink dark:bg-tppdarkwhite rounded-full" />
              Get in Touch
            </h4>

            <ul className="space-y-4 mb-6">
              <li>
                <a
                  href="mailto:rizaraofficial@gmail.com"
                  className="flex items-start gap-3 text-white/70 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-sm group"
                >
                  <div className="p-2 bg-tpppink/20 dark:bg-tppdarkwhite/10 rounded-lg group-hover:bg-tpppink/30 dark:group-hover:bg-tppdarkwhite/20 transition-colors">
                    <Mail size={16} className="text-tpppink dark:text-tppdarkwhite" />
                  </div>
                  <span className="pt-1.5">rizaraofficial@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919217791695"
                  className="flex items-start gap-3 text-white/70 dark:text-tppdarkwhite/50 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-sm group"
                >
                  <div className="p-2 bg-tpppink/20 dark:bg-tppdarkwhite/10 rounded-lg group-hover:bg-tpppink/30 dark:group-hover:bg-tppdarkwhite/20 transition-colors">
                    <Phone size={16} className="text-tpppink dark:text-tppdarkwhite" />
                  </div>
                  <span className="pt-1.5">+91 92177 91695</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/70 dark:text-tppdarkwhite/50 text-sm">
                  <div className="p-2 bg-tpppink/20 dark:bg-tppdarkwhite/10 rounded-lg">
                    <MapPin size={16} className="text-tpppink dark:text-tppdarkwhite" />
                  </div>
                  <span className="pt-1.5">Delhi, India</span>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <p className="text-white/90 dark:text-tppdarkwhite/70 font-semibold text-sm mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/rizara.luxe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 dark:bg-tppdarkwhite/10 hover:bg-tpppink dark:hover:bg-tppdarkwhite rounded-lg transition-all hover:scale-110 group"
                  title="Instagram"
                >
                  <Instagram size={18} className="group-hover:text-white dark:group-hover:text-tppdark transition-colors" />
                </a>
                <a
                  href="https://www.facebook.com/people/Rizara-Luxe/61586194575624/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 dark:bg-tppdarkwhite/10 hover:bg-tpppink dark:hover:bg-tppdarkwhite rounded-lg transition-all hover:scale-110 group"
                  title="Facebook"
                >
                  <Facebook size={18} className="group-hover:text-white dark:group-hover:text-tppdark transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Newsletter */}
        <div className="lg:hidden mb-8 pb-6 border-b border-white/20 dark:border-tppdarkwhite/10">
          <p className="text-white/90 dark:text-tppdarkwhite/70 font-semibold text-sm mb-3">
            Stay Updated
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2.5 bg-white/10 dark:bg-tppdarkwhite/5 border border-white/20 dark:border-tppdarkwhite/10 rounded-l-lg text-sm text-white dark:text-tppdarkwhite placeholder-white/50 dark:placeholder-tppdarkwhite/30 focus:outline-none focus:border-tpppink dark:focus:border-tppdarkwhite focus:bg-white/15 dark:focus:bg-tppdarkwhite/10 transition-all"
            />
            <button className="px-4 py-2.5 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 rounded-r-lg transition-all">
              <Send size={16} className="text-white dark:text-tppdark" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 dark:border-tppdarkwhite/10 pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-white/60 dark:text-tppdarkwhite/40 text-xs lg:text-sm flex items-center gap-2">
              © {new Date().getFullYear()} Rizara. Made with
              <Heart size={14} className="text-tpppink dark:text-tppdarkwhite fill-tpppink dark:fill-tppdarkwhite" />
              in India
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: 'Privacy Policy', to: '/privacy-policy' },
                { label: 'Terms of Service', to: '/terms-and-conditions' },
                { label: 'Refund Policy', to: '/refund-policy' },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-white/60 dark:text-tppdarkwhite/40 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors text-xs lg:text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;