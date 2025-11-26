// frontend/src/components/user/layout/CustomerLayout.jsx

import { useState } from 'react';
import CustomerSidebar from './Sidebar';
import CustomerTopBar from './TopBar';

/**
 * Main layout wrapper for customer dashboard
 * Includes sidebar navigation and top bar
 */
export default function CustomerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="customer-layout min-h-screen bg-gradient-to-br from-tpppeach/20 via-white to-tpppeach/10">
      {/* Sidebar */}
      <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="customer-main lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <CustomerTopBar onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="customer-content min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-tppslate/10 py-8 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* About */}
              <div>
                <h3 className="font-bold text-tppslate mb-3">The Petal Pouches</h3>
                <p className="text-sm text-tppslate/70">
                  Discover beautiful, handcrafted gift pouches for every occasion.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-tppslate mb-3 text-sm">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/shop" className="text-tppslate/70 hover:text-tpppink transition-colors">Shop</a></li>
                  <li><a href="/about" className="text-tppslate/70 hover:text-tpppink transition-colors">About Us</a></li>
                  <li><a href="/contact" className="text-tppslate/70 hover:text-tpppink transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 className="font-semibold text-tppslate mb-3 text-sm">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/faq" className="text-tppslate/70 hover:text-tpppink transition-colors">FAQ</a></li>
                  <li><a href="/shipping" className="text-tppslate/70 hover:text-tpppink transition-colors">Shipping Info</a></li>
                  <li><a href="/returns" className="text-tppslate/70 hover:text-tpppink transition-colors">Returns</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-tppslate mb-3 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/privacy" className="text-tppslate/70 hover:text-tpppink transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-tppslate/70 hover:text-tpppink transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-tppslate/10 pt-6">
              <p className="text-center text-sm text-tppslate/60">
                © 2024 The Petal Pouches. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* CSS for responsive behavior */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .customer-main {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
}