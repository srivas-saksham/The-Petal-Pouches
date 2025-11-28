// frontend/src/pages/BundleDetailPage.jsx - FIXED (No Cart)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Check, AlertCircle } from 'lucide-react';
import { formatBundlePrice, getBundleStockMessage } from '../utils/bundleHelpers';
import BundleProducts from '../components/shop/BundleProducts';
import bundleService from '../services/bundleService';

/**
 * BundleDetailPage - Full page view for bundle
 * NO ADD TO CART FUNCTIONALITY - Removed as requested
 */
const BundleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bundle, setBundle] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch bundle details
  useEffect(() => {
    const fetchBundle = async () => {
      setLoading(true);
      setError(null);

      try {
        const [bundleResponse, stockResponse] = await Promise.all([
          bundleService.getBundleDetails(id),
          bundleService.checkBundleStock(id)
        ]);

        setBundle(bundleResponse.data);
        setStockStatus(stockResponse.data);
      } catch (err) {
        console.error('Failed to fetch bundle:', err);
        setError(err.message || 'Failed to load bundle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBundle();
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bundle.title,
          text: bundle.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Bundle</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/shop/bundles')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Bundles
          </button>
        </div>
      </div>
    );
  }

  if (!bundle) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/shop/bundles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Bundles
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              <img
                src={bundle.img_url || '/placeholder-bundle.png'}
                alt={bundle.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {bundle.title}
              </h1>
              {bundle.description && (
                <p className="text-gray-600 leading-relaxed text-lg">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-b py-6">
              <p className="text-4xl font-bold text-gray-900">
                {formatBundlePrice(bundle.price)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Complete bundle price • Tax included
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 py-4">
              {stockStatus?.in_stock ? (
                <>
                  <Check size={24} className="text-green-600" />
                  <span className="text-green-600 font-medium text-lg">
                    {getBundleStockMessage(stockStatus)}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={24} className="text-red-600" />
                  <span className="text-red-600 font-medium text-lg">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-semibold"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons - NO ADD TO CART */}
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="border-2 border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Heart size={20} />
                  Add to Wishlist
                </button>
                <button 
                  onClick={handleShare}
                  className="border-2 border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <BundleProducts items={bundle.items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;