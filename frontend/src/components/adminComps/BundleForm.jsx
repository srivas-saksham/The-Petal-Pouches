// frontend/src/components/adminComps/BundleForm.jsx

import { useState, useEffect } from 'react';
import BundleProductSelector from './BundleProductSelector';
import BundleItemCard from './BundleItemCard';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BundleForm({ bundleId, onSuccess, onCancel }) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bundlePrice, setBundlePrice] = useState('');
  const [stockLimit, setStockLimit] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Bundle items
  const [items, setItems] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);

  const isEditMode = !!bundleId;

  // Fetch bundle data for edit mode
  useEffect(() => {
    if (bundleId) {
      fetchBundleData();
    }
  }, [bundleId]);

  const fetchBundleData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bundles/${bundleId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const bundle = data.data;
        setTitle(bundle.title);
        setDescription(bundle.description || '');
        setBundlePrice(bundle.price.toString());
        setStockLimit(bundle.stock_limit ? bundle.stock_limit.toString() : '');
        setImagePreview(bundle.img_url || '');

        // Map bundle items
        const mappedItems = bundle.bundle_items.map(item => ({
          product_id: item.product_id,
          variant_id: item.product_variant_id,
          quantity: item.quantity,
          product: item.Products,
          variant: item.Product_variants
        }));
        setItems(mappedItems);
      }
    } catch (err) {
      setError('Failed to load bundle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Add product to bundle
  const handleProductSelect = (product) => {
    // Check if product already exists
    const exists = items.some(item => item.product_id === product.id);
    if (exists) {
      setError('Product already added to bundle');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setItems([...items, {
      product_id: product.id,
      variant_id: null,
      quantity: 1,
      product: product,
      variant: null
    }]);
    setShowProductSelector(false);
  };

  // Update item variant
  const handleVariantChange = (index, variantId, variant) => {
    const updated = [...items];
    updated[index].variant_id = variantId;
    updated[index].variant = variant;
    setItems(updated);
  };

  // Update item quantity
  const handleQuantityChange = (index, quantity) => {
    const updated = [...items];
    updated[index].quantity = quantity;
    setItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate original price
  const calculateOriginalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Calculate discount
  const calculateDiscount = () => {
    const original = calculateOriginalPrice();
    const bundle = parseInt(bundlePrice) || 0;
    if (original === 0 || bundle >= original) return 0;
    return Math.round(((original - bundle) / original) * 100);
  };

  const originalPrice = calculateOriginalPrice();
  const discount = calculateDiscount();
  const savings = originalPrice - (parseInt(bundlePrice) || 0);

  // Validate form
  const validate = () => {
    if (!title.trim()) return 'Bundle title is required';
    if (items.length < 2) return 'Bundle must have at least 2 products';
    if (!bundlePrice || parseInt(bundlePrice) <= 0) return 'Bundle price is required';
    if (parseInt(bundlePrice) >= originalPrice) {
      return `Bundle price (₹${bundlePrice}) must be less than original price (₹${originalPrice})`;
    }
    
    // Check all items have variants selected (if product has variants)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.product.has_variants && !item.variant_id) {
        return `Please select a variant for "${item.product.title}"`;
      }
    }
    
    return null;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', bundlePrice);
      if (stockLimit) formData.append('stock_limit', stockLimit);
      if (image) formData.append('image', image);

      // Format items
      const itemsData = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }));
      formData.append('items', JSON.stringify(itemsData));

      const url = isEditMode
        ? `${API_URL}/api/bundles/admin/${bundleId}`
        : `${API_URL}/api/bundles/admin`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.message || `Bundle ${isEditMode ? 'updated' : 'created'} successfully`);
      } else {
        setError(data.message || 'Failed to save bundle');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update bundle details and products' : 'Build a bundle with multiple products'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundle Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="e.g., Birthday Surprise Bundle"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Brief description of the bundle"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundle Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          {/* Stock Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Limit (optional)
            </label>
            <input
              type="number"
              value={stockLimit}
              onChange={(e) => setStockLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Leave empty for unlimited"
              min="0"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Bundle Products ({items.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              + Add Product
            </button>
          </div>

          {/* Product Selector Modal */}
          {showProductSelector && (
            <BundleProductSelector
              onSelect={handleProductSelect}
              onClose={() => setShowProductSelector(false)}
              excludeProductIds={items.map(item => item.product_id)}
            />
          )}

          {/* Selected Products */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded">
              No products added yet. Add at least 2 products.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <BundleItemCard
                  key={index}
                  item={item}
                  onVariantChange={(variantId, variant) =>
                    handleVariantChange(index, variantId, variant)
                  }
                  onQuantityChange={(quantity) => handleQuantityChange(index, quantity)}
                  onRemove={() => handleRemoveItem(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>

          {/* Original Price (calculated) */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Original Price (auto-calculated)</div>
            <div className="text-2xl font-bold text-gray-900">₹{originalPrice}</div>
          </div>

          {/* Bundle Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundle Price * (must be less than ₹{originalPrice})
            </label>
            <input
              type="number"
              value={bundlePrice}
              onChange={(e) => setBundlePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Discounted price"
              min="1"
              required
            />
          </div>

          {/* Discount Display */}
          {bundlePrice && parseInt(bundlePrice) > 0 && parseInt(bundlePrice) < originalPrice && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Customer Saves</div>
                  <div className="text-xl font-bold text-green-700">₹{savings}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Discount</div>
                  <div className="text-xl font-bold text-green-700">{discount}% OFF</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-pink-600 text-white font-medium rounded hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Bundle' : 'Create Bundle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}