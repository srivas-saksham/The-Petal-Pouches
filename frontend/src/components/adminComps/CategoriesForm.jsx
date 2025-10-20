// frontend/src/components/adminComps/CategoriesForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const CategoriesForm = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories`
      );
      
      console.log('📦 Categories loaded:', response.data);
      
      // Handle different response structures
      const categoriesData = response.data.data || response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
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
        ? `${import.meta.env.VITE_API_BASE_URL}/api/categories/admin/${editingId}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/categories/admin`;
      
      const method = editingId ? 'put' : 'post';

      const response = await axios[method](url, {
        name: formData.name,
        description: formData.description
      });

      setMessage({ 
        type: 'success', 
        text: editingId ? 'Category updated successfully!' : 'Category created successfully!' 
      });
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      
      setTimeout(() => {
        fetchCategories();
        setMessage({ type: '', text: '' });
      }, 1500);

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
    console.log('✏️ Editing category:', category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories/admin/${id}`
      );

      setMessage({ type: 'success', text: 'Category deleted successfully!' });
      
      setTimeout(() => {
        fetchCategories();
        setMessage({ type: '', text: '' });
      }, 1500);

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

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }}>
        Category Management
      </h2>

      {/* Alert Messages */}
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '6px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '1.25rem', fontWeight: '600' }}>
          {editingId ? '✏️ Edit Category' : '➕ Create New Category'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Necklaces, Rings, Soft Toys"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of this category..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {loading ? '⏳ Processing...' : editingId ? '💾 Update Category' : '➕ Create Category'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={fetchCategories}
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                marginLeft: 'auto'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            📦 All Categories ({categories.length})
          </h3>
        </div>

        {loading && categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            ⏳ Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ marginBottom: '10px', fontSize: '1.1rem' }}>📭 No categories yet.</p>
            <p style={{ color: '#666' }}>Create your first category using the form above!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '15px'
          }}>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fff',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#212529'
                    }}>
                      {category.name}
                    </h4>
                    {category.description && (
                      <p style={{ 
                        color: '#6c757d', 
                        marginBottom: '10px',
                        fontSize: '0.95rem'
                      }}>
                        {category.description}
                      </p>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px',
                      fontSize: '0.85rem',
                      color: '#868e96'
                    }}>
                      <span>ID: {category.id.substring(0, 8)}...</span>
                      <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                    <button
                      onClick={() => handleEdit(category)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
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

      {/* Debug Info (can be removed in production) */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#495057'
      }}>
        <strong>Debug Info:</strong><br/>
        Categories Count: {categories.length}<br/>
        Loading: {loading.toString()}<br/>
        API URL: {import.meta.env.VITE_API_BASE_URL}/api/categories
      </div>
    </div>
  );
};

export default CategoriesForm;