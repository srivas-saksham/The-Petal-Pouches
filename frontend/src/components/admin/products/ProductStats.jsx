import { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  DollarSign,
  Layers,
  Tag,
  BarChart3,
  PieChart,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};

const formatPercentage = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  return `${num.toFixed(1)}%`;
};

// Skeleton Loader Component
const StatCardSkeleton = () => (
  <div className="bg-white rounded border border-slate-200 p-3 animate-pulse">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-4 h-4 bg-slate-200 rounded"></div>
      <div className="w-16 h-3 bg-slate-200 rounded"></div>
    </div>
    <div className="w-20 h-5 bg-slate-200 rounded mb-1"></div>
    <div className="w-24 h-3 bg-slate-200 rounded"></div>
  </div>
);

// Compact Stat Card Component with conditional coloring
const CompactStatCard = ({ icon: Icon, label, value, subValue, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-300 border-2 transition-all duration-200 hover:border-green-600 hover:shadow-sm hover:bg-green-100';
      case 'warning':
        return 'border-yellow-300 border-2 transition-all duration-200 hover:border-yellow-600 hover:shadow-sm hover:bg-yellow-100';
      case 'danger':
        return 'border-red-300 border-2 transition-all duration-200 hover:border-red-600 hover:shadow-sm hover:bg-red-100';
      default:
        return 'border-slate-200 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-900';
      case 'warning':
        return 'text-amber-900';
      case 'danger':
        return 'text-red-900';
      default:
        return 'text-slate';
    }
  };

  return (
    <div className={`bg-white rounded border p-3 transition-all duration-200 ${getVariantStyles()}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${getIconColor()}`} />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <div className={`text-lg font-semibold ${getValueColor()}`}>{value}</div>
      {subValue && <div className="text-xs text-slate-500 mt-0.5">{subValue}</div>}
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, value, total, icon: Icon }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
          <span className="text-xs font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate">{formatNumber(value)}</span>
          <span className="text-xs text-slate-500">({formatPercentage(percentage)})</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div 
          className="bg-slate-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// Main Component
export default function EnhancedProductStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/products?limit=10000`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      const products = result.data || [];
      
      if (products.length === 0) {
        setStats({
          total: 0,
          isEmpty: true
        });
        setLoading(false);
        return;
      }

      // Calculate comprehensive statistics
      const calculatedStats = calculateStats(products);
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching product stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products) => {
    // Basic counts
    const total = products.length;
    const withVariants = products.filter(p => p.has_variants).length;
    const withoutVariants = total - withVariants;

    // Stock analysis
    const inStock = products.filter(p => p.stock > 10).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Price analysis
    const prices = products.map(p => p.price).filter(p => p != null && !isNaN(p));
    const avgPrice = prices.length > 0 
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalInventoryValue = products.reduce((sum, p) => {
      return sum + ((p.price || 0) * (p.stock || 0));
    }, 0);

    // Category analysis
    const categoryMap = {};
    products.forEach(p => {
      const catName = p.Categories?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { count: 0, value: 0 };
      }
      categoryMap[catName].count++;
      categoryMap[catName].value += (p.price || 0) * (p.stock || 0);
    });

    const categoryStats = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
        percentage: (data.count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Price range distribution
    const priceRanges = [
      { label: 'Under ₹500', min: 0, max: 500, count: 0 },
      { label: '₹500 - ₹1000', min: 500, max: 1000, count: 0 },
      { label: '₹1000 - ₹2000', min: 1000, max: 2000, count: 0 },
      { label: '₹2000 - ₹5000', min: 2000, max: 5000, count: 0 },
      { label: 'Above ₹5000', min: 5000, max: Infinity, count: 0 }
    ];

    products.forEach(p => {
      const price = p.price || 0;
      for (let range of priceRanges) {
        if (price >= range.min && price < range.max) {
          range.count++;
          break;
        }
      }
    });

    // Stock health score (0-100)
    const stockHealthScore = total > 0
      ? Math.round(((inStock * 1 + lowStock * 0.5 + outOfStock * 0) / total) * 100)
      : 0;

    // Average stock per product
    const avgStock = total > 0 ? totalStockUnits / total : 0;

    return {
      total,
      isEmpty: false,
      
      // Stock metrics
      inStock,
      lowStock,
      outOfStock,
      totalStockUnits,
      avgStock,
      stockHealthScore,
      
      // Variant metrics
      withVariants,
      withoutVariants,
      
      // Price metrics
      avgPrice,
      minPrice,
      maxPrice,
      totalInventoryValue,
      
      // Distribution data
      categoryStats,
      priceRanges: priceRanges.filter(r => r.count > 0),
      
      // Calculated percentages
      inStockPercent: (inStock / total) * 100,
      lowStockPercent: (lowStock / total) * 100,
      outOfStockPercent: (outOfStock / total) * 100,
      withVariantsPercent: (withVariants / total) * 100,
      withoutVariantsPercent: (withoutVariants / total) * 100
    };
  };

  if (error) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded p-4">
        <div className="flex items-center gap-2 text-slate-800 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold text-sm">Error Loading Statistics</span>
        </div>
        <p className="text-xs text-slate-600 mb-3">{error}</p>
        <button
          onClick={fetchProductStats}
          className="px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate">Product Analytics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats || stats.isEmpty) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate">Product Analytics</h2>
        </div>
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded p-8 text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No Products Yet</h3>
          <p className="text-xs text-slate-500">Add your first product to see statistics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={statsRef} className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate">Product Analytics</h2>
      </div>

      {/* Compact Overview - Always Visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CompactStatCard
          icon={Package}
          label="Total Products"
          value={formatNumber(stats.total)}
          subValue={`${formatNumber(stats.totalStockUnits)} units`}
        />
        
        <CompactStatCard
          icon={CheckCircle}
          label="In Stock"
          value={formatNumber(stats.inStock)}
          subValue={formatPercentage(stats.inStockPercent)}
          variant="success"
        />
        
        <CompactStatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={formatNumber(stats.lowStock)}
          subValue={formatPercentage(stats.lowStockPercent)}
          variant="warning"
        />
        
        <CompactStatCard
          icon={XCircle}
          label="Out of Stock"
          value={formatNumber(stats.outOfStock)}
          subValue={formatPercentage(stats.outOfStockPercent)}
          variant="danger"
        />
        
        <CompactStatCard
          icon={DollarSign}
          label="Avg Price"
          value={formatCurrency(stats.avgPrice)}
          subValue={`${formatCurrency(stats.minPrice)} - ${formatCurrency(stats.maxPrice)}`}
        />
        
        <CompactStatCard
          icon={Activity}
          label="Inventory Value"
          value={formatCurrency(stats.totalInventoryValue)}
          subValue="Total value"
        />
        
        <CompactStatCard
          icon={Layers}
          label="With Variants"
          value={formatNumber(stats.withVariants)}
          subValue={formatPercentage(stats.withVariantsPercent)}
        />
        
        <CompactStatCard
          icon={BarChart3}
          label="Stock Health"
          value={`${stats.stockHealthScore}/100`}
          subValue={
            stats.stockHealthScore >= 80 ? 'Excellent' :
            stats.stockHealthScore >= 60 ? 'Good' :
            stats.stockHealthScore >= 40 ? 'Fair' : 'Poor'
          }
          variant={
            stats.stockHealthScore >= 80 ? 'success' :
            stats.stockHealthScore >= 60 ? 'default' :
            stats.stockHealthScore >= 40 ? 'warning' : 'danger'
          }
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => {
          setShowDetails(!showDetails);
          if (!showDetails) {
            setTimeout(() => {
              statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            Hide Detailed Analytics
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            Show Detailed Analytics
          </>
        )}
      </button>

      {/* Detailed Analytics - Collapsible with Animation */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showDetails 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stock Distribution */}
            <div className="bg-white rounded border border-slate-200 p-4 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate">Stock Distribution</h3>
              </div>
              <div className="space-y-3">
                <ProgressBar
                  icon={CheckCircle}
                  label="In Stock (>10 units)"
                  value={stats.inStock}
                  total={stats.total}
                />
                <ProgressBar
                  icon={AlertTriangle}
                  label="Low Stock (1-10 units)"
                  value={stats.lowStock}
                  total={stats.total}
                />
                <ProgressBar
                  icon={XCircle}
                  label="Out of Stock"
                  value={stats.outOfStock}
                  total={stats.total}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Avg Stock per Product:</span>
                    <span className="font-semibold text-slate">{stats.avgStock.toFixed(1)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Stock Units:</span>
                    <span className="font-semibold text-slate">{formatNumber(stats.totalStockUnits)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded border border-slate-200 p-4 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate">Category Distribution</h3>
              </div>
              <div className="space-y-3">
                {stats.categoryStats.slice(0, 5).map((cat) => (
                  <ProgressBar
                    key={cat.name}
                    label={cat.name}
                    value={cat.count}
                    total={stats.total}
                  />
                ))}
              </div>
              {stats.categoryStats.length > 5 && (
                <div className="mt-3 text-xs text-slate-500 text-center">
                  +{stats.categoryStats.length - 5} more categories
                </div>
              )}
            </div>

            {/* Price Range Distribution */}
            {stats.priceRanges.length > 0 && (
              <div className="bg-white rounded border border-slate-200 p-4 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate">Price Range Distribution</h3>
                </div>
                <div className="space-y-3">
                  {stats.priceRanges.map((range) => (
                    <ProgressBar
                      key={range.label}
                      label={range.label}
                      value={range.count}
                      total={stats.total}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Type Distribution */}
            <div className="bg-white rounded border border-slate-200 p-4 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate">Product Type Distribution</h3>
              </div>
              <div className="space-y-3">
                <ProgressBar
                  label="Products with Variants"
                  value={stats.withVariants}
                  total={stats.total}
                />
                <ProgressBar
                  label="Simple Products"
                  value={stats.withoutVariants}
                  total={stats.total}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Variant Products:</span>
                    <span className="font-semibold text-slate">{formatPercentage(stats.withVariantsPercent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simple Products:</span>
                    <span className="font-semibold text-slate">{formatPercentage(stats.withoutVariantsPercent)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-slate-50 rounded border border-slate-200 p-4 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
            <h3 className="text-sm font-semibold text-slate mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs ">
              <div className="bg-white rounded border border-slate-200 p-3 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
                <div className="font-semibold text-slate-700 mb-1">Inventory Status</div>
                <div className="text-slate-600">
                  {stats.inStockPercent >= 70 
                    ? '✓ Healthy inventory levels'
                    : stats.inStockPercent >= 50
                    ? '⚠ Moderate inventory levels'
                    : '⚠ Low inventory - consider restocking'}
                </div>
              </div>
              <div className="bg-white rounded border border-slate-200 p-3 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
                <div className="font-semibold text-slate-700 mb-1">Urgent Actions</div>
                <div className="text-slate-600">
                  {stats.outOfStock > 0 
                    ? `${stats.outOfStock} product${stats.outOfStock > 1 ? 's' : ''} need immediate restocking`
                    : stats.lowStock > 0
                    ? `${stats.lowStock} product${stats.lowStock > 1 ? 's' : ''} running low`
                    : '✓ No urgent actions needed'}
                </div>
              </div>
              <div className="bg-white rounded border border-slate-200 p-3 border-2 transition-all duration-200 hover:border-tpppink hover:shadow-sm hover:bg-tpppink/10">
                <div className="font-semibold text-slate-700 mb-1">Product Diversity</div>
                <div className="text-slate-600">
                  {stats.categoryStats.length} {stats.categoryStats.length === 1 ? 'category' : 'categories'} with 
                  {stats.withVariantsPercent > 50 ? ' high' : ' moderate'} variant diversity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}