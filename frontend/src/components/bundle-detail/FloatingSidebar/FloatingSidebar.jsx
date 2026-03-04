// frontend/src/components/bundle-detail/FloatingSidebar/FloatingSidebar.jsx

import React from 'react';
import DeliverySection from './DeliverySection';
import BundleValueSection from './BundleValueSection';
import TrustBadgesSection from './TrustBadgesSection';

const FloatingSidebar = ({ bundle, bundleWeight = 199, pendingWeight = null }) => {
  const items = bundle?.items || bundle?.Bundle_items || [];

  return (
    <div className="sticky top-20">
      <div className="group bg-white dark:bg-tppdarkgray rounded-xl border-0 sm:border-2 sm:border-dashed sm:border-tppslate/50 dark:sm:border-tppdarkwhite/20 hover:border-tpppink/70 dark:hover:border-tppdarkwhite/50 shadow-lg overflow-hidden transition-colors duration-300">

        <DeliverySection bundleWeight={bundleWeight} isRecalculating={pendingWeight !== null} />

        <div className="relative py-2 bg-transparent">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-gray-200 dark:border-tppdarkwhite/10"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white dark:bg-tppdarkgray px-3">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-tppdarkwhite/20"></div>
            </div>
          </div>
        </div>

        <BundleValueSection bundle={bundle} items={items} />

        <div className="relative py-2 bg-transparent">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-gray-200 dark:border-tppdarkwhite/10"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white dark:bg-tppdarkgray px-3">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-tppdarkwhite/20"></div>
            </div>
          </div>
        </div>

        <TrustBadgesSection />
      </div>
    </div>
  );
};

export default FloatingSidebar;