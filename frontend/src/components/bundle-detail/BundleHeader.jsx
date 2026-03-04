// frontend/src/components/bundle-detail/BundleHeader.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Share2, Heart, Check } from 'lucide-react';
import CommonHeader from '../common/CommonHeader';
import Breadcrumb from './ui/Breadcrumb';
import { generateBreadcrumbs } from '../../utils/bundleHelpers';
import useBundleDetail from '../../hooks/useBundleDetail';
import shopService from '../../services/shopService';

const BundleHeader = () => {
  const { id } = useParams();
  const location = useLocation();
  const isProductView = location.pathname.includes('/shop/products/');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const bundleHook = useBundleDetail(isProductView ? null : id);
  const [showShareModal, setShowShareModal] = useState(false);
  const breadcrumbItems = item ? generateBreadcrumbs(item) : [];
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (isProductView) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const result = await shopService.getProductById(id);
          if (result.success && result.data) setItem(result.data);
        } catch (err) { console.error('Failed to fetch product:', err); }
        finally { setLoading(false); }
      };
      fetchProduct();
    } else {
      setItem(bundleHook.bundle);
      setLoading(bundleHook.loading);
    }
  }, [id, isProductView, bundleHook.bundle, bundleHook.loading]);

  useEffect(() => {
    if (item?.id) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.some(w => w.id === item.id));
    }
  }, [item?.id]);

  const [isBreadcrumbVisible, setIsBreadcrumbVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) setIsBreadcrumbVisible(false);
      else if (currentScrollY < lastScrollY.current) setIsBreadcrumbVisible(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const stockLimit = isProductView ? item?.stock : item?.stock_limit;
    const isLowStock = stockLimit && stockLimit > 0 && stockLimit < 5;
    const hasDiscount = !isProductView && item?.discount_percent;
    const hasOriginalPrice = !isProductView && item?.original_price;
    const shareData = {
      title: `${item?.title}${hasDiscount ? ` - ${item.discount_percent}% OFF` : ''} - Rizara Luxe`,
      text: `${item?.title}\n\n${item?.description}\n\n₹${item.price}${hasOriginalPrice ? ` (was ₹${item.original_price})` : ''}${isLowStock ? '\n⚠️ Limited stock!' : ''}\n\nRizara Luxe`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share cancelled'); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  const handleWishlistClick = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (newState) wishlist.push({ id: item?.id, addedAt: new Date().toISOString() });
    else { const filtered = wishlist.filter(w => w.id !== item?.id); localStorage.setItem('wishlist', JSON.stringify(filtered)); return; }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  return (
    <div className="sticky top-0 z-30">
      <CommonHeader />
      {showShareModal && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-4 duration-200">
          <Check size={14} /><span className="font-medium">Link copied!</span>
        </div>
      )}
      <div className={`sticky top-16 bg-white/95 dark:bg-tppdark/95 backdrop-blur-sm border-b border-slate-100 dark:border-tppdarkwhite/10 transition-transform duration-300 ease-in-out ${isBreadcrumbVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-9xl mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0 overflow-hidden">
              {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
            </div>
            <div className="flex items-center gap-2 md:gap-2.5 flex-shrink-0">
              <button
                onClick={handleShare}
                className="p-2 md:p-1.5 border-2 border-slate-200 dark:border-tppdarkwhite/10 rounded-lg hover:border-tpppink dark:hover:border-tppdarkwhite hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 active:scale-95 transition-all text-slate-600 dark:text-tppdarkwhite/60 hover:text-tpppink dark:hover:text-tppdarkwhite touch-manipulation"
              >
                <Share2 size={18} className="md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleWishlistClick}
                className={`p-2 md:p-1.5 border-2 rounded-lg active:scale-95 transition-all touch-manipulation ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-500'
                    : 'border-slate-200 dark:border-tppdarkwhite/10 hover:border-tpppink dark:hover:border-tppdarkwhite hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 text-slate-600 dark:text-tppdarkwhite/60 hover:text-tpppink dark:hover:text-tppdarkwhite'
                }`}
              >
                <Heart size={18} className="md:w-5 md:h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleHeader;