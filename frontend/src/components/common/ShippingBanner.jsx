// frontend/src/components/common/ShippingBanner.jsx
import React, { useState, useEffect } from 'react';
import { Truck, X } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const STORAGE_KEY = 'rizara_shipping_banner_dismissed';

const ShippingBanner = () => {
  const { brandMode } = useBrand();
  const isMasculine = brandMode === 'masculine';
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setVisible(false);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div
      className={`relative w-full py-2 px-10 text-center text-xs sm:text-sm font-medium tracking-wide ${
        isMasculine
          ? 'bg-tppdark text-tppdarkwhite border-b border-tppdarkwhite/10'
          : 'bg-tpppink text-white'
      }`}
    >
      <span className="inline-flex items-center justify-center gap-1.5">
        <Truck size={14} className="hidden sm:inline-block flex-shrink-0" />
        Zero Shipping Charges on Every Order! 
      </span>

      <button
        onClick={handleClose}
        aria-label="Dismiss banner"
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
          isMasculine ? 'hover:bg-tppdarkwhite/10' : 'hover:bg-white/20'
        }`}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default ShippingBanner;
