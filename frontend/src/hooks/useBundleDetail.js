// frontend/src/hooks/useBundleDetail.js
import { useState, useEffect } from 'react';
import bundleService from '../services/bundleService';

/**
 * useBundleDetail Hook
 * Fetches all bundle data: details, stock, reviews
 * 
 * @param {string} bundleId - Bundle UUID
 * @returns {Object} { bundle, loading, error, stockStatus, reviews }
 */
const useBundleDetail = (bundleId) => {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);

  useEffect(() => {
    if (!bundleId) {
      setLoading(false);
      return;
    }

    const fetchBundleData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch bundle details and stock in parallel
        const [bundleResponse, stockResponse] = await Promise.all([
          bundleService.getBundleDetails(bundleId),
          bundleService.checkBundleStock(bundleId)
        ]);

        if (bundleResponse.success) {
          const bundleData = bundleResponse.data;
          const items = bundleData.Bundle_items || bundleData.items || [];
          
          setBundle({ ...bundleData, items });
          console.log('✅ Bundle loaded:', bundleData.title);
        } else {
          setError(bundleResponse.error || 'Failed to load bundle');
        }

        if (stockResponse.success) {
          setStockStatus(stockResponse.data);
        }
      } catch (err) {
        console.error('❌ useBundleDetail error:', err);
        setError(err.message || 'Failed to load bundle data');
      } finally {
        setLoading(false);
      }
    };

    fetchBundleData();
  }, [bundleId]);

  return {
    bundle,
    loading,
    error,
    stockStatus,
  };
};

export default useBundleDetail;