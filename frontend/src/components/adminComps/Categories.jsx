// frontend/src/pages/admin/Categories.jsx
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = editingId 
        ? `${API_URL}/categories/admin/${editingId}`
        : `${API_URL}/categories/admin`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'Category updated!' : 'Category created!');
        setName('');
        setDescription('');
        setEditingId(null);
        fetchCategories();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setName(category.name);
    setDescription(category.description || '');
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setEditingId(null);
    setError('');
  };

  const handleDelete = async (id, categoryName) => {
    if (!window.confirm(`Delete category "${categoryName}"? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/categories/admin/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Category deleted!');
        fetchCategories();
      } else {
        setError(data.message || 'Delete failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600">
            Manage product categories for The Petal Pouches
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            ✅ {success}
          </div>
        )}

        {/* Create/Edit Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? '✏️ Edit Category' : '➕ Create New Category'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="e.g., Necklaces, Rings, Soft Toys"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Brief description of this category..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? '⏳ Processing...' : editingId ? '💾 Update' : '➕ Create'}
              </button>
              
              {editingId && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📦 All Categories ({categories.length})
          </h2>

          {loading && categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ⏳ Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              📭 No categories yet. Create your first one above!
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs mt-2">
                        Created: {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {categories.length > 0 ? (
            <span className="text-green-600">✅ Connected to backend</span>
          ) : (
            <span>Connecting to: {API_URL}</span>
          )}
        </div>
      </div>
    </div>
  );
}