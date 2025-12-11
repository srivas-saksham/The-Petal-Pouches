// frontend/src/components/bundle-detail/FloatingSidebar/FloatingSidebar.jsx
import React from 'react';
import DeliverySection from './DeliverySection';
import BundleValueSection from './BundleValueSection';
import TrustBadgesSection from './TrustBadgesSection';

/**
 * FloatingSidebar - Unified Receipt-Style Sidebar
 * Clean, decision-support focused sidebar without price/cart duplication
 */
const FloatingSidebar = ({ bundle, bundleWeight = 1000, pendingWeight = null }) => {
  // Extract items from bundle
  const items = bundle?.items || bundle?.Bundle_items || [];

  return (
    <div className="sticky top-20">
      {/* SINGLE UNIFIED CONTAINER - RECEIPT DESIGN */}
      <div className="group bg-white rounded-xl border-2 border-dashed border-tppslate/50 hover:border-tpppink/70 shadow-lg overflow-hidden transition-colors duration-300">
        
        {/* ==================== DELIVERY SECTION ==================== */}
        <DeliverySection 
          bundleWeight={bundleWeight}
          isRecalculating={pendingWeight !== null} // ✅ Pass loading state
        />

        {/* ==================== DOTTED SEPARATOR ==================== */}
        <div className="border-t-2 border-dashed border-tppslate/50 group-hover:border-tpppink/70 transition-colors duration-300"></div>

        {/* ==================== BUNDLE VALUE SECTION ==================== */}
        <BundleValueSection bundle={bundle} items={items} />

        {/* ==================== DOTTED SEPARATOR ==================== */}
        <div className="border-t-2 border-dashed border-tppslate/50 group-hover:border-tpppink/70 transition-colors duration-300"></div>

        {/* ==================== TRUST BADGES SECTION ==================== */}
        <TrustBadgesSection />

      </div>
    </div>
  );
};

export default FloatingSidebar;