// frontend/src/components/adminComps/UpdateProductForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateProductForm = ({ productId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category_id: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [originalHasVariants, setOriginalHasVariants] = useState(false);
  const [variantCount, setVariantCount] = useState(0);
  const [showVariantWarning, setShowVariantWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Category management
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`
      );
      const product = response.data.data;
      
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category_id: product.category_id || ''
      });
      setCurrentImage(product.img_url);
      setHasVariants(product.has_variants || false);
      setOriginalHasVariants(product.has_variants || false);
      
      // Check variant count if has_variants is true
      if (product.has_variants && product.variants) {
        setVariantCount(product.variants.length);
      }
      
      setLoadingProduct(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', text: 'Failed to load product' });
      setLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories`
      );
      const categoriesData = response.data.data || response.data.categories || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle has_variants checkbox change
  const handleHasVariantsChange = (e) => {
    const newValue = e.target.checked;
    setHasVariants(newValue);
    
    // Show warning if unchecking and product originally had variants
    if (originalHasVariants && !newValue && variantCount > 0) {
      setShowVariantWarning(true);
    } else {
      setShowVariantWarning(false);
    }
  };

  // Handle new category input
  const handleNewCategoryChange = (e) => {
    setNewCategory({
      ...newCategory,
      [e.target.name]: e.target.value
    });
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryMessage({ type: 'error', text: 'Category name is required' });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/categories/admin`,
        {
          name: newCategory.name,
          description: newCategory.description
        }
      );

      setCategoryMessage({ type: 'success', text: 'Category created successfully!' });
      
      setNewCategory({ name: '', description: '' });
      await fetchCategories();
      
      const newCategoryData = response.data.data;
      setFormData({ ...formData, category_id: newCategoryData.id });
      
      setTimeout(() => {
        setShowAddCategory(false);
        setCategoryMessage({ type: '', text: '' });
      }, 1500);

    } catch (error) {
      console.error('Error creating category:', error);
      setCategoryMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create category'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final confirmation if deleting variants
    if (showVariantWarning) {
      const confirmed = window.confirm(
        `⚠️ WARNING: You are about to delete ${variantCount} variant(s) for this product!\n\n` +
        `This action cannot be undone. All variant images and data will be permanently deleted.\n\n` +
        `Are you absolutely sure you want to proceed?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      
      if (formData.title) data.append('title', formData.title);
      if (formData.description) data.append('description', formData.description);
      if (formData.price) data.append('price', formData.price);
      if (formData.stock !== '') data.append('stock', formData.stock);
      if (formData.sku) data.append('sku', formData.sku);
      if (formData.category_id) {
        data.append('category_id', formData.category_id);
      } else {
        data.append('category_id', '');
      }
      data.append('has_variants', hasVariants);
      if (image) data.append('image', image);

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const successMessage = response.data.variantsDeleted
        ? `${response.data.message} (${variantCount} variants deleted)`
        : response.data.message;

      setMessage({ type: 'success', text: successMessage });
      
      if (onSuccess) {
        setTimeout(() => onSuccess(response.data.data), 1500);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update product'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return <div style={{ padding: '20px' }}>Loading product...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Update Product</h2>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Current Image */}
        {currentImage && !imagePreview && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Current Image:
            </label>
            <img 
              src={currentImage} 
              alt="Current product" 
              style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
        )}

        {/* New Image Upload */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            New Image (optional):
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ marginTop: '10px', width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Product Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Price */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Price (₹):
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Stock */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="stock" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Stock Quantity:
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* SKU */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="sku" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            SKU:
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category_id" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Category
          </label>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={loadingCategories}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: loadingCategories ? '#f0f0f0' : 'white'
              }}
            >
              <option value="">-- No Category --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowAddCategory(!showAddCategory)}
              style={{
                padding: '8px 16px',
                backgroundColor: showAddCategory ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              {showAddCategory ? 'Cancel' : '+ New Category'}
            </button>
          </div>

          {/* Add New Category Section */}
          {showAddCategory && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '2px dashed #dee2e6',
              borderRadius: '8px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem' }}>
                Quick Add Category
              </h4>

              {categoryMessage.text && (
                <div style={{
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: categoryMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: categoryMessage.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${categoryMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  {categoryMessage.text}
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  placeholder="e.g., Necklaces"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleNewCategoryChange}
                  rows="2"
                  placeholder="Brief description..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleCreateCategory}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                Create Category
              </button>
            </div>
          )}
        </div>

        {/* Has Variants Toggle with WARNING */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={handleHasVariantsChange}
              style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                This product has variants
              </span>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                (e.g., different colors, sizes, metals, etc.)
              </div>
            </div>
          </label>

          {/* Variant Warning - Shows when unchecking has_variants */}
          {showVariantWarning && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '1rem', fontWeight: '700' }}>
                    DANGER: Variant Deletion Warning
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '0.9rem', fontWeight: '600' }}>
                    Unchecking this box will permanently delete all {variantCount} variant(s) associated with this product!
                  </p>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px', color: '#856404', fontSize: '0.85rem' }}>
                    <li>All variant data will be lost</li>
                    <li>All variant images will be deleted from Cloudinary</li>
                    <li>This action CANNOT be undone</li>
                  </ul>
                  <p style={{ margin: '10px 0 0 0', color: '#d32f2f', fontSize: '0.9rem', fontWeight: '700' }}>
                    💡 Alternative: Keep the checkbox checked and manage variants individually.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasVariants && !showVariantWarning && (
            <div style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#e7f3ff',
              border: '1px solid #b3d9ff',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#004085' }}>
                ℹ️ <strong>Note:</strong> Click the "Variants" button in the product list to manage variants for this product.
                {variantCount > 0 && (
                  <span style={{ display: 'block', marginTop: '5px', fontWeight: '600' }}>
                    Current variants: {variantCount}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: loading ? '#ccc' : (showVariantWarning ? '#dc3545' : '#007bff'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Updating...' : (showVariantWarning ? '⚠️ Update & Delete Variants' : 'Update Product')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* CSS Animation for Warning Pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateProductForm;