import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';

const VariantManager = ({ productId, onClose }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    metal: '',
    size: '',
    color: '',
    price: '',
    stock: '',
    weight: '',
    is_default: false
  });

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/api/variants/products/${productId}/variants`);

      if (response.success) {
        setVariants(response.data);
      } else {
        setError(response.message || 'Failed to fetch variants');
      }
    } catch (err) {
      setError('Error fetching variants: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      metal: '',
      size: '',
      color: '',
      price: '',
      stock: '',
      weight: '',
      is_default: false
    });
    setImageFile(null);
    setImagePreview('');
    setEditingVariant(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Build attributes object
      const attributes = {};
      if (formData.metal) attributes.metal = formData.metal;
      if (formData.size) attributes.size = formData.size;
      if (formData.color) attributes.color = formData.color;

      if (Object.keys(attributes).length === 0) {
        setError('Please provide at least one attribute (metal, size, or color)');
        return;
      }

      const payload = {
        sku: formData.sku,
        attributes: attributes,
        stock: parseInt(formData.stock),
        is_default: formData.is_default
      };

      if (formData.price) payload.price = parseInt(formData.price);
      if (formData.weight) payload.weight = parseFloat(formData.weight);

      let result;

      if (editingVariant) {
        // Update existing variant
        result = await adminApi.put(`/api/variants/admin/${editingVariant.id}`, payload);
      } else {
        // Create new variant
        result = await adminApi.post(`/api/variants/admin/products/${productId}/variants`, payload);
      }

      if (result.success) {
        // If image was selected, upload it
        if (imageFile && result.data.id) {
          await uploadVariantImage(result.data.id);
        }

        setSuccess(editingVariant ? 'Variant updated successfully' : 'Variant created successfully');
        fetchVariants();
        resetForm();
      } else {
        setError(result.message || 'Failed to save variant');
      }
    } catch (err) {
      setError('Error saving variant: ' + (err.message || 'Unknown error'));
    }
  };

  const uploadVariantImage = async (variantId) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const result = await adminApi.post(`/api/variants/admin/${variantId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!result.success) {
      throw new Error(result.message || 'Failed to upload image');
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setShowForm(true);
    setFormData({
      sku: variant.sku,
      metal: variant.attributes?.metal || '',
      size: variant.attributes?.size || '',
      color: variant.attributes?.color || '',
      price: variant.price || '',
      stock: variant.stock,
      weight: variant.weight || '',
      is_default: variant.is_default
    });
    setImagePreview(variant.img_url || '');
  };

  const handleDelete = async (variantId) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const result = await adminApi.delete(`/api/variants/admin/${variantId}`);

      if (result.success) {
        setSuccess('Variant deleted successfully');
        fetchVariants();
      } else {
        setError(result.message || 'Failed to delete variant');
      }
    } catch (err) {
      setError('Error deleting variant: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-lg">Loading variants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Product Variants</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Add Variant Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              + Add New Variant
            </button>
          )}

          {/* Variant Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                {editingVariant ? 'Edit Variant' : 'Create New Variant'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., RING-GOLD-7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Metal</label>
                  <input
                    type="text"
                    name="metal"
                    value={formData.metal}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Gold, Silver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 7, 8, Medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Pink, Blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Leave empty to use product price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Set as Default Variant</label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Variant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded px-3 py-2"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  {editingVariant ? 'Update Variant' : 'Create Variant'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Variants List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Existing Variants ({variants.length})
            </h3>

            {variants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No variants created yet</p>
            ) : (
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Variant Image */}
                      {variant.img_url && (
                        <img
                          src={variant.img_url}
                          alt={variant.sku}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}

                      {/* Variant Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{variant.sku}</h4>
                            {variant.is_default && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(variant)}
                                style={{
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(variant.id)}
                                style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                                }}
                            >
                                Delete
                            </button>
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {variant.attributes && Object.entries(variant.attributes).map(([key, value]) => (
                            <span
                              key={key}
                              className="bg-gray-100 px-3 py-1 rounded text-sm"
                            >
                              <strong>{key}:</strong> {value}
                            </span>
                          ))}
                        </div>

                        {/* Price and Stock */}
                        <div className="mt-3 flex gap-6 text-sm">
                        {variant.price && (
                            <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold ml-1">₹{variant.price}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-semibold ml-1">{variant.stock}</span>
                        </div>
                        {variant.weight && (
                            <div>
                            <span className="text-gray-600">Weight:</span>
                            <span className="ml-1">{variant.weight} kg</span>
                            </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantManager;