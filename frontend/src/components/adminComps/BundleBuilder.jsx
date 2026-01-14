// frontend/src/components/adminComps/BundleBuilder.jsx

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BundleForm from './BundleForm';
import adminApi from '../../services/adminApi';

export default function BundleBuilder() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // View management
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingBundleId, setEditingBundleId] = useState(null);
  
  // Expandable rows
  const [expandedBundles, setExpandedBundles] = useState(new Set());

  // Fetch bundles
  const fetchBundles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('/api/bundles', { 
        params: { page: 1, limit: 50 } 
      });
      
      // adminApi returns response.data directly
      if (response.data) {
        setBundles(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch bundles');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  // Toggle bundle expansion
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

  // Handle create
  const handleCreateClick = () => {
    setView('create');
    setEditingBundleId(null);
    setError('');
    setSuccess('');
  };

  // Handle edit
  const handleEdit = (bundleId) => {
    setView('edit');
    setEditingBundleId(bundleId);
    setError('');
    setSuccess('');
  };

  // Handle delete
  const handleDelete = async (bundleId, bundleName) => {
    if (!confirm(`Delete bundle "${bundleName}"? This cannot be undone.`)) return;

    setLoading(true);
    setError('');
    try {
      const response = await adminApi.delete(`/api/bundles/admin/${bundleId}`);

      // adminApi returns response directly
      if (response) {
        setSuccess('Bundle deleted successfully');
        fetchBundles();
      } else {
        setError(response?.message || 'Failed to delete bundle');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active
  const handleToggle = async (bundleId) => {
    setLoading(true);
    try {
      const response = await adminApi.patch(`/api/bundles/admin/${bundleId}/toggle`);

      // adminApi returns response directly
      if (response) {
        setSuccess(response.message || 'Status toggled successfully');
        fetchBundles();
      } else {
        setError(response?.message || 'Failed to toggle status');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (bundleId) => {
    setLoading(true);
    try {
      const response = await adminApi.post(`/api/bundles/admin/${bundleId}/duplicate`);

      // adminApi returns response directly
      if (response) {
        setSuccess('Bundle duplicated successfully');
        fetchBundles();
      } else {
        setError(response?.message || 'Failed to duplicate bundle');
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle form success
  const handleFormSuccess = (message) => {
    setSuccess(message);
    setView('list');
    fetchBundles();
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle cancel
  const handleCancel = () => {
    setView('list');
    setEditingBundleId(null);
  };

  // Render form view
  if (view === 'create' || view === 'edit') {
    return (
      <BundleForm
        bundleId={editingBundleId}
        onSuccess={handleFormSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Render list view
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Bundle Management</h1>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            + Create Bundle
          </button>
        </div>
        <p className="text-gray-600">Create and manage product bundles with discounted pricing</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && bundles.length === 0 && (
        <div className="text-center py-8 text-gray-500">Loading bundles...</div>
      )}

      {/* Empty state */}
      {!loading && bundles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-600 mb-4">No bundles yet. Create your first bundle!</p>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Create Bundle
          </button>
        </div>
      )}

      {/* Bundles Table */}
      {bundles.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12"></th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bundle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Original Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bundle Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Markup</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bundles.map((bundle) => {
                  const isExpanded = expandedBundles.has(bundle.id);
                  
                  return (
                    <>
                      {/* Main Row */}
                      <tr key={bundle.id} className="hover:bg-gray-50">
                        {/* Expand Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleBundleExpansion(bundle.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </td>

                        {/* Bundle Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {bundle.img_url && (
                              <img
                                src={bundle.img_url}
                                alt={bundle.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{bundle.title}</div>
                              {bundle.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {bundle.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Items Count */}
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {bundle.Bundle_items?.length || 0} items
                        </td>

                        {/* Original Price */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-700">
                            ₹{bundle.original_price}
                          </div>
                        </td>

                        {/* Bundle Price */}
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{bundle.price}
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-3">
                          {bundle.discount_percent ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                              {bundle.discount_percent}% OFF
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Markup */}
                        <td className="px-4 py-3">
                          {bundle.markup_percent ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                              {bundle.markup_percent}% Margin
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              bundle.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {bundle.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(bundle.id)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggle(bundle.id)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              {bundle.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDuplicate(bundle.id)}
                              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => handleDelete(bundle.id, bundle.title)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr key={`${bundle.id}-details`}>
                          <td colSpan="9" className="px-4 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 mb-3">Bundle Products:</h4>
                              
                              {bundle.Bundle_items && bundle.Bundle_items.length > 0 ? (
                                <div className="grid gap-3">
                                  {bundle.Bundle_items.map((item, index) => {
                                    const product = item.Products;
                                    const variant = item.Product_variants;
                                    const itemPrice = variant ? variant.price : product?.price;
                                    const itemTotal = itemPrice * item.quantity;

                                    return (
                                      <div key={index} className="bg-white p-4 rounded border border-gray-200">
                                        <div className="flex items-center justify-between">
                                          {/* Product Info */}
                                          <div className="flex items-center gap-3 flex-1">
                                            {(variant?.img_url || product?.img_url) && (
                                              <img
                                                src={variant?.img_url || product?.img_url}
                                                alt={product?.title}
                                                className="w-16 h-16 object-cover rounded"
                                              />
                                            )}
                                            <div>
                                              <div className="font-medium text-gray-900">
                                                {product?.title || 'Unknown Product'}
                                              </div>
                                              {variant && (
                                                <div className="text-sm text-gray-600">
                                                  Variant: {typeof variant.attributes === 'string' 
                                                    ? variant.attributes 
                                                    : JSON.stringify(variant.attributes)}
                                                </div>
                                              )}
                                              <div className="text-sm text-gray-500">
                                                SKU: {variant?.sku || product?.sku || 'N/A'}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Quantity & Price */}
                                          <div className="text-right">
                                            <div className="text-sm text-gray-600">
                                              Quantity: <span className="font-semibold">{item.quantity}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              Unit Price: <span className="font-semibold">₹{itemPrice}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                              Total: ₹{itemTotal}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">No products in this bundle</div>
                              )}

                              {/* Bundle Summary */}
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-600">
                                    <div>Total Original Price: <span className="font-semibold">₹{bundle.original_price}</span></div>
                                    <div>Bundle Selling Price: <span className="font-semibold text-pink-600">₹{bundle.price}</span></div>
                                  </div>
                                  <div className="text-right">
                                    {bundle.discount_percent ? (
                                      <div className="text-sm">
                                        <span className="text-gray-600">Customer Saves: </span>
                                        <span className="font-semibold text-yellow-600">
                                          ₹{bundle.original_price - bundle.price} ({bundle.discount_percent}% OFF)
                                        </span>
                                      </div>
                                    ) : bundle.markup_percent ? (
                                      <div className="text-sm">
                                        <span className="text-gray-600">Premium Markup: </span>
                                        <span className="font-semibold text-green-600">
                                          +₹{bundle.price - bundle.original_price} ({bundle.markup_percent}% Margin)
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-600">No discount or markup</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}