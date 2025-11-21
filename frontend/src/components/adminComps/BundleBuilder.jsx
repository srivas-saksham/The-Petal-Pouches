// frontend/src/components/adminComps/BundleBuilder.jsx

import { useState, useEffect } from 'react';
import BundleForm from './BundleForm';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BundleBuilder() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // View management
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingBundleId, setEditingBundleId] = useState(null);

  // Fetch bundles
  const fetchBundles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/bundles?page=1&limit=50`);
      const data = await response.json();
      
      if (response.ok) {
        setBundles(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch bundles');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

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
      const response = await fetch(`${API_URL}/api/bundles/admin/${bundleId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Bundle deleted successfully');
        fetchBundles();
      } else {
        setError(data.message || 'Failed to delete bundle');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active
  const handleToggle = async (bundleId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bundles/admin/${bundleId}/toggle`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        fetchBundles();
      } else {
        setError(data.message || 'Failed to toggle status');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (bundleId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bundles/admin/${bundleId}/duplicate`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Bundle duplicated successfully');
        fetchBundles();
      } else {
        setError(data.message || 'Failed to duplicate bundle');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bundle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-gray-50">
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

                  {/* Price */}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">₹{bundle.price}</div>
                      <div className="text-gray-500 line-through text-xs">
                        ₹{bundle.original_price}
                      </div>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                      {bundle.discount_percent}% OFF
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}