// frontend/src/components/admin/products/InventoryAnalytics.jsx
/**
 * Inventory & Profitability Analytics
 * Shows cost price, margins, and profitability metrics
 * Maintains all existing functionality
 */

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Percent,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const StatCard = ({ icon: Icon, label, value, subValue, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-300 hover:border-green-600 hover:bg-green-50';
      case 'primary':
        return 'border-blue-300 hover:border-blue-600 hover:bg-blue-50';
      case 'warning':
        return 'border-purple-300 hover:border-purple-600 hover:bg-purple-50';
      default:
        return 'border-slate-200 hover:border-tpppink hover:bg-tpppink/10';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'primary':
        return 'text-blue-600';
      case 'warning':
        return 'text-purple-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className={`bg-white rounded border-2 p-4 transition-all duration-200 ${getVariantStyles()}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${getIconColor()}`} />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </div>
  );
};

const ProgressBar = ({ label, value, icon: Icon }) => {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-tpppink h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((value / 100000) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function InventoryAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/products/analytics/inventory`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }

      setAnalytics(result.data);
    } catch (err) {
      console.error('Error fetching inventory analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Inventory & Profitability</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded border border-slate-200 p-4 animate-pulse">
              <div className="w-full h-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, categoryStats, topProfitable } = analytics;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">Inventory & Profitability</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Investment"
          value={formatCurrency(overview.totalInvestment)}
          subValue={`In ${overview.totalProducts} products`}
        />
        
        <StatCard
          icon={TrendingUp}
          label="Potential Revenue"
          value={formatCurrency(overview.potentialRevenue)}
          subValue="If all stock sells"
          variant="primary"
        />
        
        <StatCard
          icon={Package}
          label="Expected Profit"
          value={formatCurrency(overview.totalProfit)}
          subValue={`${overview.profitMargin}% margin`}
          variant="success"
        />
        
        <StatCard
          icon={Percent}
          label="Avg Margin"
          value={`${overview.avgMargin}%`}
          subValue="Across all products"
          variant="warning"
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border-2 border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-tpppink transition-all duration-200"
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Detailed Breakdown
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show Detailed Breakdown
          </>
        )}
      </button>

      {/* Detailed Analytics */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Category Breakdown */}
          <div className="bg-white rounded border-2 border-slate-200 p-4 hover:border-tpppink hover:shadow-sm transition-all duration-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Category Profitability</h3>
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((cat) => (
                <ProgressBar
                  key={cat.category}
                  label={`${cat.category} (${cat.count})`}
                  value={cat.profit}
                />
              ))}
            </div>
          </div>

          {/* Top Profitable Products */}
          <div className="bg-white rounded border-2 border-slate-200 p-4 hover:border-tpppink hover:shadow-sm transition-all duration-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Top 5 Profitable Products</h3>
            <div className="space-y-3">
              {topProfitable.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-tpppink text-white rounded-full text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                      {product.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(product.profit)}</div>
                    <div className="text-xs text-slate-500">{product.margin}% margin</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}