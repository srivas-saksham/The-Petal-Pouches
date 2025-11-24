// frontend/src/components/adminComps/CategoriesForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Search, X, Edit, Trash2, Eye, Check } from 'lucide-react';

const CategoriesForm = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  
  // Add products functionality
  const [showAddProductsSection, setShowAddProductsSection] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories`
      );
      
      const categoriesData = response.data.data || response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products?limit=1000`
      );
      const products = response.data.data || [];
      setAllProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    }
    setProductsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleToggleAddProducts = async () => {
    const newState = !showAddProductsSection;
    setShowAddProductsSection(newState);
    
    if (newState && allProducts.length === 0) {
      await fetchAllProducts();
    }
  };

  const handleToggleProductSelection = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
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

      const categoryId = response.data.data?.id || editingId;

      // If products are selected, update them
      if (selectedProductIds.length > 0 && categoryId) {
        const updatePromises = selectedProductIds.map(productId =>
          axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}`,
            { category_id: categoryId },
            { headers: { 'Content-Type': 'application/json' } }
          )
        );

        await Promise.all(updatePromises);
      }

      setMessage({ 
        type: 'success', 
        text: editingId 
          ? 'Category updated successfully!' 
          : `Category created successfully!${selectedProductIds.length > 0 ? ` ${selectedProductIds.length} products added.` : ''}`
      });
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setSelectedProductIds([]);
      setShowAddProductsSection(false);
      
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
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    setShowAddProductsSection(false);
    setSelectedProductIds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
    setShowAddProductsSection(false);
    setSelectedProductIds([]);
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

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()));
    
    // When editing, show only products not in this category
    if (editingId) {
      return matchesSearch && product.category_id !== editingId;
    }
    
    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        marginBottom: '24px', 
        fontSize: '28px', 
        fontWeight: '700',
        color: '#4A5759'
      }}>
        Category Management
      </h2>

      {/* Alert Messages */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#B0C4B1' : '#fee',
          color: message.type === 'success' ? '#4A5759' : '#c33',
          border: `2px solid ${message.type === 'success' ? '#B0C4B1' : '#fcc'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      <div style={{ 
        marginBottom: '32px', 
        padding: '24px', 
        backgroundColor: '#fff', 
        borderRadius: '12px',
        border: '2px solid #DEDBD2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#4A5759',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {editingId ? <Edit size={20} /> : <Plus size={20} />}
          {editingId ? 'Edit Category' : 'Create New Category'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#4A5759',
              fontSize: '14px'
            }}>
              Category Name <span style={{ color: '#d95669' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Jewelry, Soft Toys, Accessories"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #DEDBD2',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#4A5759',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d95669'}
              onBlur={(e) => e.target.style.borderColor = '#DEDBD2'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#4A5759',
              fontSize: '14px'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of this category..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #DEDBD2',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#4A5759',
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d95669'}
              onBlur={(e) => e.target.style.borderColor = '#DEDBD2'}
            />
          </div>

          {/* Add Products Toggle Button */}
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleToggleAddProducts}
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: showAddProductsSection ? '#d95669' : '#fff',
                color: showAddProductsSection ? '#fff' : '#4A5759',
                border: '2px solid #d95669',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={16} />
              {showAddProductsSection ? 'Hide Products Selection' : 'Add Products to Category'}
            </button>
          </div>

          {/* Add Products Section */}
          {showAddProductsSection && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#F7E1D7',
              borderRadius: '8px',
              border: '2px solid #DEDBD2'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#4A5759',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Package size={18} />
                Select Products
              </h4>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#4A5759',
                    opacity: 0.5
                  }} 
                />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: '2px solid #DEDBD2',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#4A5759',
                    backgroundColor: '#fff',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d95669'}
                  onBlur={(e) => e.target.style.borderColor = '#DEDBD2'}
                />
              </div>

              {/* Selected count */}
              {selectedProductIds.length > 0 && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#B0C4B1',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4A5759'
                }}>
                  {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* Products list */}
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {productsLoading ? (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#4A5759' 
                  }}>
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#4A5759' 
                  }}>
                    {productSearchTerm ? 'No products match your search' : 'No products available'}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleToggleProductSelection(product.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#fff',
                        border: `2px solid ${selectedProductIds.includes(product.id) ? '#B0C4B1' : '#DEDBD2'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedProductIds.includes(product.id)) {
                          e.currentTarget.style.borderColor = '#d95669';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedProductIds.includes(product.id)) {
                          e.currentTarget.style.borderColor = '#DEDBD2';
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${selectedProductIds.includes(product.id) ? '#B0C4B1' : '#DEDBD2'}`,
                        backgroundColor: selectedProductIds.includes(product.id) ? '#B0C4B1' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }}>
                        {selectedProductIds.includes(product.id) && (
                          <Check size={14} color="#fff" strokeWidth={3} />
                        )}
                      </div>

                      {/* Product Image */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundColor: '#F7E1D7',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid #DEDBD2'
                      }}>
                        {product.img_url ? (
                          <img 
                            src={product.img_url} 
                            alt={product.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Package size={20} color="#4A5759" style={{ opacity: 0.3 }} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '14px',
                          color: '#4A5759',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.title}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#4A5759',
                          opacity: 0.6,
                          marginTop: '2px'
                        }}>
                          SKU: {product.sku || 'N/A'}
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '14px',
                        color: '#4A5759',
                        flexShrink: 0
                      }}>
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#DEDBD2' : '#d95669',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fff',
                  color: '#4A5759',
                  border: '2px solid #DEDBD2',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
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
                backgroundColor: '#fff',
                color: '#4A5759',
                border: '2px solid #4A5759',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                marginLeft: 'auto',
                transition: 'all 0.2s'
              }}
            >
              Refresh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesForm;