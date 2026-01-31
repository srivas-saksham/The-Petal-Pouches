// frontend/src/components/bundle-detail/FloatingSidebar/FloatingSidebar.jsx
import React from 'react';
import DeliverySection from './DeliverySection';
import BundleValueSection from './BundleValueSection';
import TrustBadgesSection from './TrustBadgesSection';

/**
 * FloatingSidebar - Unified Receipt-Style Sidebar
 * Clean, decision-support focused sidebar without price/cart duplication
 */
const FloatingSidebar = ({ bundle, bundleWeight = 199, pendingWeight = null }) => {
  // Extract items from bundle
  const items = bundle?.items || bundle?.Bundle_items || [];

  return (
    <div className="sticky top-20">
      {/* SINGLE UNIFIED CONTAINER - RECEIPT DESIGN */}
      <div className="group bg-white rounded-xl border-0 sm:border-2 sm:border-dashed sm:border-tppslate/50 hover:border-tpppink/70 shadow-lg overflow-hidden transition-colors duration-300">
        
        {/* ==================== DELIVERY SECTION ==================== */}
        <DeliverySection 
          bundleWeight={bundleWeight}
          isRecalculating={pendingWeight !== null} // ✅ Pass loading state
        />

        {/* ==================== SECTION BREAK ==================== */}
        <div className="relative py-2 bg-transparent">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-3">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* ==================== BUNDLE VALUE SECTION ==================== */}
        <BundleValueSection bundle={bundle} items={items} />

        {/* ==================== SECTION BREAK ==================== */}
        <div className="relative py-2 bg-transparent">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-3">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* ==================== TRUST BADGES SECTION ==================== */}
        <TrustBadgesSection />

      </div>
    </div>
  );
};

export default FloatingSidebar;