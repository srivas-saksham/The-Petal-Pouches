// frontend/src/components/admin/dashboard/TopProductsList.jsx - UPDATED TO SHOW TOP BUNDLES

import { ArrowRight, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/adminHelpers';

export default function TopProductsList({ products, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-tppslate/30 mx-auto mb-3" />
        <p className="text-sm text-tppslate/60">No bundles sold yet</p>
      </div>
    );
  }

  const handleBundleClick = (bundleId) => {
    window.location.href = `/admin/bundles?id=${bundleId}`;
  };

  return (
    <div className="space-y-2">
      {products.map((bundle, index) => (
        <div
          key={bundle.id}
          onClick={() => handleBundleClick(bundle.id)}
          className="
            flex items-center gap-3 p-3 
            bg-white rounded-md border-2 border-tppslate/10
            transition-all duration-200
            hover:border-tpppink hover:bg-tpppink/5 hover:shadow-sm
            cursor-pointer group
          "
        >
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tppslate/10 flex items-center justify-center">
            <span className="text-xs font-bold text-tppslate">
              {index + 1}
            </span>
          </div>

          {/* Bundle Image */}
          <img
            src={bundle.img_url || '/placeholder-product.png'}
            alt={bundle.title}
            className="w-12 h-12 object-cover rounded border border-tppslate/20"
            onError={(e) => {
              e.target.src = '/placeholder-product.png';
            }}
          />

          {/* Bundle Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-tppslate truncate text-xs">
              {bundle.title}
            </div>
            <div className="text-[10px] text-tppslate/60">
              {bundle.sales || 0} sold
            </div>
          </div>

          {/* Revenue */}
          <div className="text-right flex items-center gap-2">
            <div>
              <div className="font-bold text-tppslate text-xs">
                {formatCurrency(bundle.revenue || 0)}
              </div>
              <div className="text-[10px] text-tppslate/50">
                revenue
              </div>
            </div>
            <ArrowRight className="w-3 h-3 text-tppslate/30 group-hover:text-tpppink transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}