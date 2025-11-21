// frontend/src/components/adminComps/BundleItemCard.jsx

import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BundleItemCard({ item, onVariantChange, onQuantityChange, onRemove }) {
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch variants if product has them
  useEffect(() => {
    if (item.product.has_variants) {
      fetchVariants();
    }
  }, [item.product.id]);

  const fetchVariants = async () => {
    setLoadingVariants(true);
    try {
      const response = await fetch(`${API_URL}/api/products/${item.product.id}/variants`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Fetched variants:', data.data);
        setVariants(data.data || []);
        
        // Auto-select first variant if none selected
        if (!item.variant_id && data.data && data.data.length > 0) {
          const firstVariant = data.data[0];
          onVariantChange(firstVariant.id, firstVariant);
        }
      }
    } catch (err) {
      console.error('Failed to fetch variants:', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleVariantSelect = (e) => {
    const variantId = e.target.value;
    const variant = variants.find(v => v.id === variantId);
    onVariantChange(variantId, variant);
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    onQuantityChange(Math.max(1, qty));
  };

  const handleIncrement = () => {
    onQuantityChange(item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  // Calculate price
  const itemPrice = item.variant ? item.variant.price : item.product.price;
  const totalPrice = itemPrice * item.quantity;

  // Format variant attributes for display
  const formatVariantAttributes = (attributes) => {
    if (!attributes) return '';
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
            {(item.variant?.img_url || item.product.img_url) ? (
              <img
                src={item.variant?.img_url || item.product.img_url}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Title & Remove Button */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate" title={item.product.title}>
                {item.product.title}
              </h4>
              <p className="text-sm text-gray-600">
                SKU: {item.product.sku}
              </p>
            </div>
            <button
              onClick={onRemove}
              className="ml-2 text-red-600 hover:text-red-800 text-xl font-bold"
              title="Remove from bundle"
            >
              ×
            </button>
          </div>

          {/* Variant Selection */}
          {item.product.has_variants && (
            <div className="mb-3">
              {loadingVariants ? (
                <div className="text-sm text-gray-500">Loading variants...</div>
              ) : variants.length === 0 ? (
                <div className="text-sm text-red-600">No variants available</div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Variant *
                  </label>
                  <select
                    value={item.variant_id || ''}
                    onChange={handleVariantSelect}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  >
                    <option value="">Choose variant...</option>
                    {variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {formatVariantAttributes(variant.attributes)} - ₹{variant.price}
                        {variant.stock <= 0 && ' (Out of Stock)'}
                        {variant.stock > 0 && variant.stock <= 5 && ` (Only ${variant.stock} left)`}
                      </option>
                    ))}
                  </select>
                  {item.variant && (
                    <div className="mt-1 text-xs text-gray-600">
                      Stock: {item.variant.stock} | SKU: {item.variant.sku}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No Variants Info */}
          {!item.product.has_variants && (
            <div className="mb-3">
              <div className="text-xs text-gray-600">
                Stock: {item.product.stock}
              </div>
            </div>
          )}

          {/* Quantity & Price */}
          <div className="flex items-center justify-between">
            {/* Quantity Control */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Qty:</label>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  className="w-12 text-center border-0 text-sm focus:ring-0"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-right">
              <div className="text-xs text-gray-600">
                ₹{itemPrice} × {item.quantity}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                ₹{totalPrice}
              </div>
            </div>
          </div>

          {/* Stock Warning */}
          {item.variant && item.variant.stock < item.quantity && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠ Quantity exceeds available stock ({item.variant.stock})
            </div>
          )}
          {!item.product.has_variants && item.product.stock < item.quantity && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠ Quantity exceeds available stock ({item.product.stock})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}