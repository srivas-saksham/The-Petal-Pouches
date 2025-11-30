// frontend/src/pages/admin/BundlesPage.jsx - FIXED

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Power, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import SearchBar from '../../components/admin/ui/SearchBar';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import ActionMenu from '../../components/admin/ui/ActionMenu';
import Modal from '../../components/admin/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/adminHelpers';
import { useToast } from '../../hooks/useToast';

// Import existing working components
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBundles, setExpandedBundles] = useState(new Set());
  
  // View state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState(null);

  useEffect(() => {
    fetchBundles();
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bundles.filter(bundle =>
        bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBundles(filtered);
    } else {
      setFilteredBundles(bundles);
    }
  }, [searchTerm, bundles]);

  const fetchBundles = async () => {
    setLoading(true);
    const result = await getBundles({ page: 1, limit: 100 });
    
    if (result.success) {
      // ✅ FIXED: Handle both response formats
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

  const toggleBundleExpansion = (bundleId) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  const handleEdit = (bundleId) => {
    setEditingBundleId(bundleId);
    setShowEditModal(true);
  };

  const handleDelete = async (bundleId, bundleName) => {
    if (!confirm(`Delete bundle "${bundleName}"? This cannot be undone.`)) return;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Bundles"
        description="Create and manage product bundles with discounted pricing"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Bundle
          </Button>
        }
      />

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Total Bundles</span>
              <span className="text-3xl font-bold text-admin-pink">{stats.total}</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Active</span>
              <span className="text-3xl font-bold text-admin-mint">{stats.active}</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Inactive</span>
              <span className="text-3xl font-bold text-admin-grey">{stats.inactive}</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Avg Discount</span>
              <span className="text-3xl font-bold text-text-primary">{stats.avg_discount}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search bundles..."
        />
      </div>

      {/* Bundles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink mx-auto"></div>
          <p className="text-text-muted mt-4">Loading bundles...</p>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {searchTerm ? 'No bundles found' : 'No bundles yet'}
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Create your first bundle to increase sales'}
          </p>
          {!searchTerm && (
            <Button variant="slate" onClick={() => setShowCreateModal(true)}>
              Create Bundle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBundles.map((bundle) => {
            const isExpanded = expandedBundles.has(bundle.id);
            const savings = bundle.original_price - bundle.price;

            return (
              <div key={bundle.id} className="card overflow-hidden animate-fade-in">
                {/* Main Bundle Row */}
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Expand Toggle */}
                    <button
                      onClick={() => toggleBundleExpansion(bundle.id)}
                      className="flex-shrink-0 p-2 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {/* Bundle Image */}
                    {bundle.img_url && (
                      <img
                        src={bundle.img_url}
                        alt={bundle.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    {/* Bundle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text-primary truncate">
                            {bundle.title}
                          </h3>
                          {bundle.description && (
                            <p className="text-sm text-text-secondary truncate mt-1">
                              {bundle.description}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={bundle.is_active ? 'active' : 'inactive'} className="ml-4" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-text-muted">Items</div>
                          <div className="font-semibold text-text-primary">
                            {bundle.Bundle_items?.length || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted">Original Price</div>
                          <div className="font-semibold text-text-primary">
                            {formatCurrency(bundle.original_price)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted">Bundle Price</div>
                          <div className="font-semibold text-admin-pink text-lg">
                            {formatCurrency(bundle.price)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted">
                            {bundle.discount_percent ? 'Discount' : 'Markup'}
                          </div>
                          <div className={`font-semibold ${bundle.discount_percent ? 'text-yellow-600' : 'text-green-600'}`}>
                            {bundle.discount_percent ? `${bundle.discount_percent}% OFF` : `${bundle.markup_percent}% Margin`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <ActionMenu
                        actions={[
                          {
                            label: 'Edit',
                            icon: <Edit className="w-4 h-4" />,
                            onClick: () => handleEdit(bundle.id),
                          },
                          {
                            label: bundle.is_active ? 'Deactivate' : 'Activate',
                            icon: <Power className="w-4 h-4" />,
                            onClick: () => handleToggle(bundle.id),
                          },
                          {
                            label: 'Duplicate',
                            icon: <Copy className="w-4 h-4" />,
                            onClick: () => handleDuplicate(bundle.id),
                          },
                          { divider: true },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(bundle.id, bundle.title),
                            danger: true,
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border bg-surface p-6 animate-slide-in">
                    <h4 className="font-semibold text-text-primary mb-4">Bundle Products</h4>
                    
                    {bundle.Bundle_items && bundle.Bundle_items.length > 0 ? (
                      <div className="space-y-3">
                        {bundle.Bundle_items.map((item, index) => {
                          const product = item.Products;
                          const variant = item.Product_variants;
                          const itemPrice = variant ? variant.price : product?.price;
                          const itemTotal = itemPrice * item.quantity;

                          return (
                            <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-border">
                              <div className="w-8 h-8 bg-admin-pink text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              
                              {(variant?.img_url || product?.img_url) && (
                                <img
                                  src={variant?.img_url || product?.img_url}
                                  alt={product?.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-text-primary">
                                  {product?.title || 'Unknown Product'}
                                </div>
                                {variant && (
                                  <div className="text-sm text-text-secondary">
                                    Variant: {typeof variant.attributes === 'string' 
                                      ? variant.attributes 
                                      : JSON.stringify(variant.attributes)}
                                  </div>
                                )}
                                <div className="text-sm text-text-muted">
                                  SKU: {variant?.sku || product?.sku || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm text-text-secondary">
                                  Qty: <span className="font-semibold">{item.quantity}</span>
                                </div>
                                <div className="text-sm text-text-secondary">
                                  Unit: <span className="font-semibold">{formatCurrency(itemPrice)}</span>
                                </div>
                                <div className="text-sm font-semibold text-text-primary mt-1">
                                  Total: {formatCurrency(itemTotal)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-text-muted text-sm">No products in this bundle</div>
                    )}

                    {/* Bundle Summary */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-text-secondary">
                          <div>Total Original Price: <span className="font-semibold">{formatCurrency(bundle.original_price)}</span></div>
                          <div>Bundle Selling Price: <span className="font-semibold text-admin-pink">{formatCurrency(bundle.price)}</span></div>
                        </div>
                        <div className="text-right">
                          {bundle.discount_percent ? (
                            <div className="text-sm">
                              <span className="text-text-secondary">Customer Saves: </span>
                              <span className="font-semibold text-yellow-600">
                                {formatCurrency(savings)} ({bundle.discount_percent}% OFF)
                              </span>
                            </div>
                          ) : bundle.markup_percent ? (
                            <div className="text-sm">
                              <span className="text-text-secondary">Premium Markup: </span>
                              <span className="font-semibold text-green-600">
                                +{formatCurrency(Math.abs(savings))} ({bundle.markup_percent}% Margin)
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-text-secondary">No discount or markup</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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