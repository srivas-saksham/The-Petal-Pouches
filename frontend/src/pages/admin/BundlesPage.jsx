// frontend/src/pages/admin/BundlesPage.jsx - REDESIGNED
/**
 * Bundles Management Page
 * ✅ Redesigned stats with muted colors
 * ✅ Improved filter UI with better visibility
 * ✅ Clean, modern aesthetic
 */

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Upload, Package, CheckCircle, XCircle, Percent, Search, X } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import SearchBar from '../../components/admin/ui/SearchBar';
import Modal from '../../components/admin/ui/Modal';
import { useToast } from '../../hooks/useToast';

// Import components
import AdminBundleCard from '../../components/admin/bundles/AdminBundleCard';
import BundleForm from '../../components/adminComps/BundleForm';

// Import services
import {
  getBundles,
  deleteBundle,
  toggleBundleStatus,
  duplicateBundle,
  getBundleStats,
} from '../../services/bundleService';

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const toast = useToast();
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [pricingFilter, setPricingFilter] = useState('all');
  
  // View state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState(null);

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchBundles();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, stockFilter, pricingFilter, bundles]);

  const fetchBundles = async () => {
    setLoading(true);
    const result = await getBundles({ page: 1, limit: 1000 });
    
    if (result.success) {
      const bundlesData = Array.isArray(result.data) 
        ? result.data 
        : result.data.data || [];
      
      setBundles(bundlesData);
      console.log('✅ Bundles loaded:', bundlesData.length);
    } else {
      toast.error(result.error || 'Failed to load bundles');
      setBundles([]);
    }
    
    setLoading(false);
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    const result = await getBundleStats();
    
    if (result.success) {
      setStats(result.data);
    }
    
    setStatsLoading(false);
  };

  // ==================== FILTERING LOGIC ====================

  const applyFilters = () => {
    let filtered = [...bundles];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(bundle =>
        bundle.title.toLowerCase().includes(searchLower) ||
        bundle.description?.toLowerCase().includes(searchLower) ||
        bundle.id.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bundle => 
        statusFilter === 'active' ? bundle.is_active : !bundle.is_active
      );
    }

    if (stockFilter !== 'all') {
      filtered = filtered.filter(bundle => {
        const stock = bundle.stock_limit || 0;
        if (stockFilter === 'out_of_stock') return stock === 0;
        if (stockFilter === 'low_stock') return stock > 0 && stock <= 3;
        if (stockFilter === 'in_stock') return stock > 3;
        return true;
      });
    }

    if (pricingFilter !== 'all') {
      filtered = filtered.filter(bundle => {
        if (pricingFilter === 'discount') return bundle.discount_percent > 0;
        if (pricingFilter === 'markup') return bundle.markup_percent > 0;
        return true;
      });
    }

    setFilteredBundles(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStockFilter('all');
    setPricingFilter('all');
  };

  // ==================== ACTION HANDLERS ====================

  const handleEdit = (bundleId) => {
    setEditingBundleId(bundleId);
    setShowEditModal(true);
  };

  const handleDelete = async (bundleId, bundleName) => {
      const result = await deleteBundle(bundleId);
    
    if (result.success) {
      toast.success('Bundle deleted successfully');
      fetchBundles();
      fetchStats();
    } else {
      toast.error(result.error || 'Failed to delete bundle');
    }
  };

  const handleToggle = async (bundleId) => {
    const result = await toggleBundleStatus(bundleId);
    
    if (result.success) {
      toast.success(result.data.message || 'Bundle status updated');
      fetchBundles();
      fetchStats();
    } else {
      toast.error(result.error || 'Failed to toggle status');
    }
  };

  const handleDuplicate = async (bundleId) => {
    const result = await duplicateBundle(bundleId);
    
    if (result.success) {
      toast.success('Bundle duplicated successfully');
      fetchBundles();
      fetchStats();
    } else {
      toast.error(result.error || 'Failed to duplicate bundle');
    }
  };

  const handleFormSuccess = (successMessage) => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingBundleId(null);
    toast.success(successMessage);
    fetchBundles();
    fetchStats();
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingBundleId(null);
  };

  // ==================== COMPUTED VALUES ====================

  const activeFiltersCount = [
    statusFilter !== 'all',
    stockFilter !== 'all',
    pricingFilter !== 'all'
  ].filter(Boolean).length;

  // Calculate stats from actual bundles data
  const calculateStats = () => {
    if (!bundles || bundles.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        avg_discount: 0,
        avg_markup: 0,
        discounted_count: 0,
        markup_count: 0
      };
    }

    const activeBundles = bundles.filter(b => b.is_active);
    const inactiveBundles = bundles.filter(b => !b.is_active);
    
    // Calculate average discount (only from bundles with discount)
    const bundlesWithDiscount = bundles.filter(b => b.discount_percent && b.discount_percent > 0);
    const avgDiscount = bundlesWithDiscount.length > 0
      ? (bundlesWithDiscount.reduce((sum, b) => sum + (b.discount_percent || 0), 0) / bundlesWithDiscount.length).toFixed(1)
      : 0;
    
    // Calculate average markup (only from bundles with markup)
    const bundlesWithMarkup = bundles.filter(b => b.markup_percent && b.markup_percent > 0);
    const avgMarkup = bundlesWithMarkup.length > 0
      ? (bundlesWithMarkup.reduce((sum, b) => sum + (b.markup_percent || 0), 0) / bundlesWithMarkup.length).toFixed(1)
      : 0;

    return {
      total: bundles.length,
      active: activeBundles.length,
      inactive: inactiveBundles.length,
      avg_discount: avgDiscount,
      avg_markup: avgMarkup,
      discounted_count: bundlesWithDiscount.length,
      markup_count: bundlesWithMarkup.length
    };
  };

  const currentStats = calculateStats();

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Bundles Management"
        description="Create and manage product bundles with discounted pricing"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="slate"
              icon={<Upload className="w-5 h-5" />}
              onClick={() => toast.info('Bulk import coming soon')}
            >
              Import
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Bundle
            </Button>
          </div>
        }
      />

      {/* Stats Cards - Redesigned with Muted Colors - Now Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Bundles */}
        <button
          onClick={() => {
            setStatusFilter('all');
            setStockFilter('all');
            setPricingFilter('all');
            setSearchTerm('');
          }}
          className={`bg-white border-2 rounded-lg p-3 transition-all text-left group ${
            statusFilter === 'all' && stockFilter === 'all' && pricingFilter === 'all' && !searchTerm
              ? 'border-slate-400 shadow-md'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded transition-colors ${
              statusFilter === 'all' && stockFilter === 'all' && pricingFilter === 'all' && !searchTerm
                ? 'bg-slate-200'
                : 'bg-slate-100 group-hover:bg-slate-200'
            }`}>
              <Package className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total</div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-0.5">{currentStats.total}</div>
          <div className="text-[12px] text-slate-500">All Bundles</div>
        </button>

        {/* Active Bundles */}
        <button
          onClick={() => {
            setStatusFilter('active');
            setStockFilter('all');
            setPricingFilter('all');
          }}
          className={`bg-white border-2 rounded-lg p-3 transition-all text-left group ${
            statusFilter === 'active'
              ? 'border-emerald-400 shadow-md'
              : 'border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-200'
                : 'bg-emerald-100 group-hover:bg-emerald-200'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Active</div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mb-0.5">{currentStats.active}</div>
          <div className="text-[12px] text-emerald-600">Live on Store</div>
        </button>

        {/* Inactive Bundles */}
        <button
          onClick={() => {
            setStatusFilter('inactive');
            setStockFilter('all');
            setPricingFilter('all');
          }}
          className={`bg-white border-2 rounded-lg p-3 transition-all text-left group ${
            statusFilter === 'inactive'
              ? 'border-gray-400 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-gray-200'
                : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
              <XCircle className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Inactive</div>
          </div>
          <div className="text-2xl font-bold text-gray-700 mb-0.5">{currentStats.inactive}</div>
          <div className="text-[12px] text-gray-500">Not Visible</div>
        </button>

        {/* Average Discount */}
        <button
          onClick={() => {
            setStatusFilter('all');
            setStockFilter('all');
            setPricingFilter('discount');
          }}
          className={`bg-white border-2 rounded-lg p-3 transition-all text-left group ${
            pricingFilter === 'discount'
              ? 'border-amber-400 shadow-md'
              : 'border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded transition-colors ${
              pricingFilter === 'discount'
                ? 'bg-amber-200'
                : 'bg-amber-100 group-hover:bg-amber-200'
            }`}>
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Avg Disc.</div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mb-0.5">{currentStats.avg_discount}%</div>
          <div className="text-[12px] text-amber-600">{currentStats.discounted_count} discounted</div>
        </button>

        {/* Average Markup */}
        <button
          onClick={() => {
            setStatusFilter('all');
            setStockFilter('all');
            setPricingFilter('markup');
          }}
          className={`bg-white border-2 rounded-lg p-3 transition-all text-left group ${
            pricingFilter === 'markup'
              ? 'border-purple-400 shadow-md'
              : 'border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded transition-colors ${
              pricingFilter === 'markup'
                ? 'bg-purple-200'
                : 'bg-purple-100 group-hover:bg-purple-200'
            }`}>
              <Percent className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Avg Markup</div>
          </div>
          <div className="text-2xl font-bold text-purple-700 mb-0.5">{currentStats.avg_markup}%</div>
          <div className="text-[12px] text-purple-600">{currentStats.markup_count} with markup</div>
        </button>

        {/* Filtered Results - Not Clickable */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
              <Search className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Results</div>
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-0.5">{filteredBundles.length}</div>
          <div className="text-[12px] text-blue-600">Showing Now</div>
        </div>
      </div>

      {/* Search & Filters - Redesigned */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bundles by title, description, or ID..."
              className="w-full pl-11 pr-10 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-tpppink transition-colors text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-tpppink transition-colors bg-white font-medium text-slate-700 hover:border-slate-300"
            >
              <option value="all">All Status</option>
              <option value="active">✓ Active Only</option>
              <option value="inactive">✕ Inactive Only</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-tpppink transition-colors bg-white font-medium text-slate-700 hover:border-slate-300"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;3)</option>
              <option value="low_stock">Low Stock (1-3)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Pricing Filter */}
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="px-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-tpppink transition-colors bg-white font-medium text-slate-700 hover:border-slate-300"
            >
              <option value="all">All Pricing Types</option>
              <option value="discount">Discounted Only</option>
              <option value="markup">Markup Only</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 font-semibold transition-all flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Clear ({activeFiltersCount})
              </button>
            )}

            {/* Export */}
            <button
              onClick={() => toast.info('Export coming soon')}
              className="ml-auto px-4 py-2 text-sm bg-slate-100 text-slate-700 border-2 border-slate-200 rounded-lg hover:bg-slate-200 font-semibold transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || activeFiltersCount > 0) && (
            <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
              <div className="text-sm text-slate-600">
                Showing <span className="font-bold text-slate-800">{filteredBundles.length}</span> of <span className="font-bold text-slate-800">{bundles.length}</span> bundles
                {searchTerm && (
                  <span className="ml-1">
                    matching <span className="font-semibold text-tpppink">"{searchTerm}"</span>
                  </span>
                )}
              </div>
              
              {/* Active Filter Pills */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  {statusFilter !== 'all' && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-200">
                      Status: {statusFilter}
                    </span>
                  )}
                  {stockFilter !== 'all' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded border border-amber-200">
                      Stock: {stockFilter.replace('_', ' ')}
                    </span>
                  )}
                  {pricingFilter !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                      Pricing: {pricingFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bundles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpppink mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading bundles...</p>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center">
          <div className="text-slate-300 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {searchTerm || activeFiltersCount > 0 ? 'No bundles found' : 'No bundles yet'}
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            {searchTerm || activeFiltersCount > 0 
              ? 'Try adjusting your filters or search terms' 
              : 'Create your first bundle to increase sales'}
          </p>
          {!searchTerm && activeFiltersCount === 0 && (
            <Button variant="slate" onClick={() => setShowCreateModal(true)}>
              Create Bundle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBundles.map((bundle) => (
            <AdminBundleCard
              key={bundle.id}
              bundle={bundle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Create Bundle Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          title="Create New Bundle"
          size="xl"
        >
          <div className="max-h-[75vh] overflow-y-auto scrollbar-custom">
            <BundleForm
              onSuccess={handleFormSuccess}
              onCancel={handleModalClose}
            />
          </div>
        </Modal>
      )}

      {/* Edit Bundle Modal */}
      {showEditModal && editingBundleId && (
        <Modal
          isOpen={showEditModal}
          onClose={handleModalClose}
          title="Edit Bundle"
          size="xl"
        >
          <div className="max-h-[75vh] overflow-y-auto scrollbar-custom">
            <BundleForm
              bundleId={editingBundleId}
              onSuccess={handleFormSuccess}
              onCancel={handleModalClose}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}