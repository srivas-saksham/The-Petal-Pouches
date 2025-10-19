import React, { useState } from 'react';
import axios from 'axios';

const CreateProduct = () => {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('image', image);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('sku', formData.sku);
      data.append('category_id', formData.category_id);

      // Send to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/products`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage('Product created successfully!');
      console.log('Created product:', response.data);

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        sku: '',
        category_id: ''
      });
      setImage(null);
      setImagePreview(null);

    } catch (error) {
      console.error('Error creating product:', error);
      setMessage(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Image *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 w-48 h-48 object-cover rounded"
            />
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Pink Heart Necklace"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full border rounded px-3 py-2"
            placeholder="Beautiful heart-shaped necklace..."
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="999"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="50"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium mb-2">
            SKU *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="NECKLACE-001"
          />
        </div>

        {/* Category (You'll need to create categories first) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category ID
          </label>
          <input
            type="text"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Optional: UUID of category"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded hover:bg-pink-600 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateProduct;