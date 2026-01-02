// frontend/src/components/home/HomeFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

const HomeFooter = () => {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-italianno text-tpppink mb-4">Rizara</h3>
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
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
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
  );
};

export default HomeFooter;