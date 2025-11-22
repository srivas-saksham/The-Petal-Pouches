// frontend/src/pages/admin/CategoriesPage.jsx

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import Modal from '../../components/admin/ui/Modal';
import SearchBar from '../../components/admin/ui/SearchBar';
import { formatDate } from '../../utils/adminHelpers';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      const categoriesData = response.data.data || response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Category name is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = editingId 
        ? `${API_URL}/api/categories/admin/${editingId}`
        : `${API_URL}/api/categories/admin`;
      
      const method = editingId ? 'put' : 'post';

      await axios[method](url, {
        name: formData.name,
        description: formData.description
      });

      setMessage({ 
        type: 'success', 
        text: editingId ? 'Category updated successfully!' : 'Category created successfully!' 
      });
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowModal(false);
      
      fetchCategories();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('Error submitting category:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save category'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleDelete = async (id, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await axios.delete(`${API_URL}/api/categories/admin/${id}`);
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
      fetchCategories();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete category'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Categories"
        description="Organize your products with categories"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => {
              setFormData({ name: '', description: '' });
              setEditingId(null);
              setShowModal(true);
            }}
          >
            Add Category
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
          placeholder="Search categories..."
        />
      </div>

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink mx-auto"></div>
          <p className="text-text-muted mt-4">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Create your first category to organize products'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Create Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="card p-6 hover:shadow-hover transition-shadow animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Created {formatDate(category.created_at, 'short')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-admin-pink hover:bg-admin-peach rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-text-muted">
                  ID: {category.id.substring(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingId ? 'Edit Category' : 'Create Category'}
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              loading={loading}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Jewelry, Soft Toys"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of this category..."
              className="form-input"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}