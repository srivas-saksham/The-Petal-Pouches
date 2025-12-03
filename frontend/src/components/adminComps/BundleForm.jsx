import { useState, useEffect } from 'react';
import { 
  Package, 
  Upload, 
  X, 
  AlertCircle, 
  Plus,
  Info,
  Loader2,
  Tag,
  DollarSign,
  FileText,
  ShoppingBag,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import BundleProductSelector from './BundleProductSelector';
import BundleItemCard from './BundleItemCard';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// InputWrapper component
const InputWrapper = ({ label, name, required, icon: Icon, children, hint, error }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="flex items-center gap-2 text-sm font-semibold text-tppslate">
      {Icon && <Icon className="w-4 h-4 text-tppslate/60" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-tppslate/60 flex items-center gap-1">
        <Info className="w-3 h-3" />
        {hint}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-600 flex items-center gap-1 animate-shake">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

export default function BundleForm({ bundleId, onSuccess, onCancel }) {
  const toast = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bundlePrice, setBundlePrice] = useState('');
  const [stockLimit, setStockLimit] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  
  // Tags state
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState([]);
  
  // Bundle items
  const [items, setItems] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingBundle, setLoadingBundle] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showProductSelector, setShowProductSelector] = useState(false);

  const isEditMode = !!bundleId;

  // Fetch bundle data for edit mode
  useEffect(() => {
    if (bundleId) {
      fetchBundleData();
    }
  }, [bundleId]);

  const fetchBundleData = async () => {
    setLoadingBundle(true);
    try {
      const response = await fetch(`${API_URL}/api/bundles/${bundleId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const bundle = data.data;
        setTitle(bundle.title);
        setDescription(bundle.description || '');
        setBundlePrice(bundle.price.toString());
        setStockLimit(bundle.stock_limit ? bundle.stock_limit.toString() : '');
        setCurrentImage(bundle.img_url || '');

        // Load tags
        if (bundle.tags && Array.isArray(bundle.tags)) {
          setTags(bundle.tags);
        }

        if (bundle.Bundle_items && Array.isArray(bundle.Bundle_items)) {
          const mappedItems = bundle.Bundle_items.map(item => ({
            product_id: item.product_id,
            variant_id: item.product_variant_id,
            quantity: item.quantity,
            product: item.Products,
            variant: item.Product_variants
          }));
          setItems(mappedItems);
        } else {
          console.warn('No Bundle_items found or invalid format');
          setItems([]);
        }
      } else {
        toast.error(data.message || 'Failed to load bundle');
      }
    } catch (err) {
      toast.error('Failed to load bundle: ' + err.message);
    } finally {
      setLoadingBundle(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Bundle title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 200) return 'Title must be less than 200 characters';
        return '';
      
      case 'bundlePrice':
        if (!value) return 'Bundle price is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Price must be greater than 0';
        if (parseFloat(value) > 1000000) return 'Price seems unrealistic';
        return '';
      
      case 'stockLimit':
        if (value && (isNaN(value) || parseInt(value) < 0)) return 'Stock limit must be 0 or greater';
        return '';
      
      case 'description':
        if (value.trim().length > 2000) return 'Description must be less than 2000 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    
    switch (fieldName) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'bundlePrice':
        setBundlePrice(value);
        break;
      case 'stockLimit':
        setStockLimit(value);
        break;
    }
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Tags handling
  const handleTagsKeyDown = (e) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      
      const newTag = tagsInput.trim().toLowerCase();
      
      if (newTag.length < 2) {
        setErrors(prev => ({ ...prev, tags: 'Tag must be at least 2 characters' }));
        return;
      }
      
      if (tags.includes(newTag)) {
        setErrors(prev => ({ ...prev, tags: 'Tag already added' }));
        return;
      }
      
      setTags(prev => [...prev, newTag]);
      setTagsInput('');
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  // Add product to bundle
  const handleProductSelect = (product) => {
    const exists = items.some(item => item.product_id === product.id);
    if (exists) {
      toast.error('Product already added to bundle');
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

  // Calculate discount OR markup percent
  const calculateDiscount = () => {
    const original = calculateOriginalPrice();
    const bundle = parseInt(bundlePrice) || 0;

    if (original === 0) return 0;

    if (bundle < original) {
      return Math.round(((original - bundle) / original) * 100);
    }

    const markupPercent = Math.round(((bundle - original) / original) * 100);
    return -markupPercent;
  };

  const originalPrice = calculateOriginalPrice();
  const discount = calculateDiscount();
  const savings = originalPrice - (parseInt(bundlePrice) || 0);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    const titleError = validateField('title', title);
    if (titleError) newErrors.title = titleError;
    
    const priceError = validateField('bundlePrice', bundlePrice);
    if (priceError) newErrors.bundlePrice = priceError;
    
    const stockError = validateField('stockLimit', stockLimit);
    if (stockError) newErrors.stockLimit = stockError;
    
    const descError = validateField('description', description);
    if (descError) newErrors.description = descError;
    
    if (items.length < 2) {
      newErrors.items = 'Bundle must have at least 2 products';
    }
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.product.has_variants && !item.variant_id) {
        newErrors.items = `Please select a variant for "${item.product.title}"`;
        break;
      }
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      bundlePrice: true,
      stockLimit: true,
      description: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', bundlePrice);
      if (stockLimit) formData.append('stock_limit', stockLimit);
      if (image) formData.append('image', image);

      // Add tags as JSON array string (for JSONB column)
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

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
        toast.success(data.message || `Bundle ${isEditMode ? 'updated' : 'created'} successfully`);
        if (onSuccess) {
          setTimeout(() => onSuccess(data.message || `Bundle ${isEditMode ? 'updated' : 'created'} successfully`), 1500);
        }
      } else {
        toast.error(data.message || 'Failed to save bundle');
      }
    } catch (err) {
      toast.error('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBundle) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-tppslate animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-tpppink/30">
        <div className="w-10 h-10 bg-tppslate rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-tppslate">
            {isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
          </h2>
          <p className="text-sm text-tppslate/60">
            {isEditMode ? 'Update bundle details and products' : 'Build a bundle with multiple products'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <InputWrapper 
            label="Bundle Image" 
            name="image" 
            icon={Upload}
            error={errors.image}
            hint="Upload bundle image (max 5MB)"
          >
            <div className="flex items-start gap-4 mt-3">
              {/* Current/Preview Image */}
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative group">
                    <img 
                      src={imagePreview} 
                      alt="Bundle preview" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-tpppink/30"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full backdrop-blur-sm">
                      New
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="relative">
                    <img 
                      src={currentImage} 
                      alt="Current bundle" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-tpppink/30"
                    />
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full backdrop-blur-sm">
                      Current
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-tpppink/30 rounded-lg flex items-center justify-center bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label 
                htmlFor="image" 
                className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-tpppink/30 rounded-lg cursor-pointer bg-tpppeach/10 hover:bg-tpppeach/20 hover:border-tpppink transition-all duration-200 group"
              >
                <Upload className="w-8 h-8 text-tppslate/40 mb-2 group-hover:text-tppslate transition-colors" />
                <p className="text-sm text-tppslate/60">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-tppslate/40 mt-1">PNG, JPG, WEBP up to 5MB</p>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </InputWrapper>
        </div>

        {/* Basic Info Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Basic Information
          </h3>
          
          <div className="space-y-5">
            {/* Title */}
            <InputWrapper 
              label="Bundle Title" 
              name="title" 
              required 
              icon={Tag}
              error={errors.title}
              hint="Enter a clear, descriptive bundle name"
            >
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => handleInputChange(e, 'title')}
                onBlur={(e) => handleBlur('title', e.target.value)}
                placeholder="e.g., Birthday Surprise Bundle"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.title && touched.title
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
            </InputWrapper>

            {/* Description */}
            <InputWrapper 
              label="Description" 
              name="description" 
              icon={FileText}
              error={errors.description}
              hint="Brief description of the bundle (optional)"
            >
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => handleInputChange(e, 'description')}
                onBlur={(e) => handleBlur('description', e.target.value)}
                rows={3}
                placeholder="Brief description of the bundle"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.description && touched.description
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
              <p className="text-xs text-tppslate/40 mt-1">
                {description.length}/2000 characters
              </p>
            </InputWrapper>

            {/* Stock Limit */}
            <InputWrapper 
              label="Stock Limit (optional)" 
              name="stockLimit" 
              icon={Package}
              error={errors.stockLimit}
              hint="Leave empty for unlimited stock"
            >
              <input
                type="number"
                id="stockLimit"
                name="stockLimit"
                value={stockLimit}
                onChange={(e) => handleInputChange(e, 'stockLimit')}
                onBlur={(e) => handleBlur('stockLimit', e.target.value)}
                placeholder="Leave empty for unlimited"
                min="0"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.stockLimit && touched.stockLimit
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
            </InputWrapper>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags
          </h3>
          
          <div className="space-y-4">
            <InputWrapper 
              label="Add Tags" 
              name="tags" 
              icon={Tag}
              error={errors.tags}
              hint="Type a tag and press Enter (e.g., birthday, gift, romantic)"
            >
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagsKeyDown}
                placeholder="Type a tag and press Enter"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.tags
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
            </InputWrapper>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-tpppeach/10 rounded-lg border-2 border-tpppink/20">
                {tags.map((tag, index) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      index === 0
                        ? 'bg-tpppink text-white border-2 border-tpppink shadow-sm'
                        : 'bg-white text-tppslate border-2 border-tpppink/30 hover:border-tpppink'
                    }`}
                  >
                    {tag}
                    {index === 0 && (
                      <span className="text-xs bg-white text-tpppink px-1.5 py-0.5 rounded font-bold">
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {tags.length === 0 && (
              <div className="text-center py-4 text-tppslate/60 border-2 border-dashed border-tpppink/30 rounded-lg bg-slate-50">
                <Tag className="w-8 h-8 mx-auto mb-2 text-tppslate/30" />
                <p className="text-sm">No tags added yet. The first tag will be the primary tag.</p>
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-tppslate flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bundle Products ({items.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="px-3 py-1.5 bg-tpppink/50 text-tppslate rounded-lg hover:bg-tpppink/80 text-sm font-semibold transition-all duration-200 flex items-center gap-2 border-2 border-tpppink/50"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {errors.items && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.items}
            </div>
          )}

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
            <div className="text-center py-8 text-tppslate/60 border-2 border-dashed border-tpppink/30 rounded-lg bg-slate-50">
              <Package className="w-12 h-12 mx-auto mb-2 text-tppslate/30" />
              <p className="text-sm">No products added yet. Add at least 2 products.</p>
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
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </h3>

          {/* Original Price (calculated) */}
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
            <div className="text-xs text-tppslate/60 mb-1 font-semibold">Original Price (auto-calculated)</div>
            <div className="text-2xl font-bold text-tppslate">₹{originalPrice.toFixed(2)}</div>
          </div>

          {/* Bundle Price */}
          <InputWrapper 
            label="Bundle Price" 
            name="bundlePrice" 
            required 
            icon={DollarSign}
            error={errors.bundlePrice}
            hint="Set your bundle selling price"
          >
            <input
              type="number"
              id="bundlePrice"
              name="bundlePrice"
              value={bundlePrice}
              onChange={(e) => handleInputChange(e, 'bundlePrice')}
              onBlur={(e) => handleBlur('bundlePrice', e.target.value)}
              placeholder="Enter bundle price"
              min="1"
              step="0.01"
              className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                errors.bundlePrice && touched.bundlePrice
                  ? 'border-red-300 bg-red-50'
                  : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
              }`}
            />
          </InputWrapper>

          {/* Discount/Premium Display */}
          {bundlePrice && parseInt(bundlePrice) > 0 && originalPrice > 0 && (
            <div className={`mt-4 p-4 border-2 rounded-lg transition-all duration-200 ${
              parseInt(bundlePrice) < originalPrice 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-tppslate/60 font-semibold mb-1 flex items-center gap-1">
                    {parseInt(bundlePrice) < originalPrice ? (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        Customer Saves
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Premium Bundle
                      </>
                    )}
                  </div>
                  <div className={`text-xl font-bold ${
                    parseInt(bundlePrice) < originalPrice ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {parseInt(bundlePrice) < originalPrice 
                      ? `₹${savings.toFixed(2)}` 
                      : `+₹${Math.abs(savings).toFixed(2)}`
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-tppslate/60 font-semibold mb-1">
                    {parseInt(bundlePrice) < originalPrice ? 'Discount' : 'Premium'}
                  </div>
                  <div className={`text-xl font-bold ${
                    parseInt(bundlePrice) < originalPrice ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {discount > 0 ? `${discount}% OFF` : `${Math.abs(discount)}% Margin`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t-2 border-tpppink/30">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md border-2 ${
              loading
                ? 'bg-slate-300 border-slate-300 text-slate-500'
                : 'bg-tppslate border-tppslate text-white hover:bg-tppslate/90'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditMode ? 'Update Bundle' : 'Create Bundle'}</>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-slate-100 text-tppslate rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200 border-2 border-tpppink/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}