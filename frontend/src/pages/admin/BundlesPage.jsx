// frontend/src/pages/admin/BundlesPage.jsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Power, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import SearchBar from '../../components/admin/ui/SearchBar';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import ActionMenu from '../../components/admin/ui/ActionMenu';
import { formatCurrency, formatDate } from '../../utils/adminHelpers';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBundles, setExpandedBundles] = useState(new Set());
  
  // View state
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingBundleId, setEditingBundleId] = useState(null);

  useEffect(() => {
    fetchBundles();
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
    try {
      const response = await axios.get(`${API_URL}/api/bundles?page=1&limit=50`);
      setBundles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      setMessage({ type: 'error', text: 'Failed to load bundles' });
    } finally {
      setLoading(false);
    }
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
    setView('edit');
  };

  const handleDelete = async (bundleId, bundleName) => {
    if (!confirm(`Delete bundle "${bundleName}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/bundles/admin/${bundleId}`);
      setMessage({ type: 'success', text: 'Bundle deleted successfully' });
      fetchBundles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete bundle' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (bundleId) => {
    setLoading(true);
    try {
      const response = await axios.patch(`${API_URL}/api/bundles/admin/${bundleId}/toggle`);
      setMessage({ type: 'success', text: response.data.message });
      fetchBundles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Toggle error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to toggle status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (bundleId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/bundles/admin/${bundleId}/duplicate`);
      setMessage({ type: 'success', text: 'Bundle duplicated successfully' });
      fetchBundles();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Duplicate error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to duplicate bundle' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = (successMessage) => {
    setMessage({ type: 'success', text: successMessage });
    setView('list');
    setEditingBundleId(null);
    fetchBundles();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCancel = () => {
    setView('list');
    setEditingBundleId(null);
  };

  // If in create/edit view, show form (using existing BundleForm component)
  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={view === 'create' ? 'Create Bundle' : 'Edit Bundle'}
          description={view === 'create' ? 'Create a new product bundle' : 'Update bundle details'}
        />
        <div className="card p-6">
          <p className="text-text-secondary mb-4">
            {/* TODO: Integrate BundleForm component here */}
            Bundle form will be integrated here - using existing BundleForm logic
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view
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
            onClick={() => setView('create')}
          >
            Create Bundle
          </Button>
        }
      />

      {/* Messages */}
      {message.text && (
        <div className={`
          p-4 rounded-lg border animate-slide-in
          ${message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          {message.text}
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
      {loading && bundles.length === 0 ? (
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
            <Button variant="primary" onClick={() => setView('create')}>
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
    </div>
  );
}