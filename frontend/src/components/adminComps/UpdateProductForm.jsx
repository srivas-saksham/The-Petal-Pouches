// frontend/src/components/adminComps/UpdateProductForm.jsx
import { useState, useEffect } from 'react';
import { 
  Package, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  ChevronDown,
  Info,
  Loader2,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Layers,
  Edit
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';

// InputWrapper component - OUTSIDE the main component
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
  const toast = useToast();
  
  // Field-level validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Category management
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

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
      toast.error('Failed to load product');
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

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Product title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 200) return 'Title must be less than 200 characters';
        return '';
      
      case 'price':
        if (!value) return 'Price is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Price must be greater than 0';
        if (parseFloat(value) > 1000000) return 'Price seems unrealistic';
        return '';
      
      case 'stock':
        if (!value && value !== 0) return 'Stock quantity is required';
        if (isNaN(value) || parseInt(value) < 0) return 'Stock must be 0 or greater';
        if (parseInt(value) > 100000) return 'Stock quantity seems unrealistic';
        return '';
      
      case 'sku':
        if (!value.trim()) return 'SKU is required';
        if (!/^[A-Za-z0-9-_]+$/.test(value.trim())) return 'SKU can only contain letters, numbers, hyphens, and underscores';
        if (value.trim().length < 2) return 'SKU must be at least 2 characters';
        if (value.trim().length > 50) return 'SKU must be less than 50 characters';
        return '';
      
      case 'description':
        if (value.trim().length > 2000) return 'Description must be less than 2000 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  // Handle has_variants toggle change
  const handleHasVariantsChange = () => {
    const newValue = !hasVariants;
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
      toast.error('Category name is required');
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

      toast.success('Category created successfully!');
      
      setNewCategory({ name: '', description: '' });
      await fetchCategories();
      
      const newCategoryData = response.data.data;
      setFormData({ ...formData, category_id: newCategoryData.id });
      
      setTimeout(() => {
        setShowAddCategory(false);
        
      }, 1500);

    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      title: true,
      price: true,
      stock: true,
      sku: true,
      description: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    
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
    

    try {
      const data = new FormData();
      
      if (formData.title) data.append('title', formData.title.trim());
      if (formData.description) data.append('description', formData.description.trim());
      if (formData.price) data.append('price', formData.price);
      if (formData.stock !== '') data.append('stock', formData.stock);
      if (formData.sku) data.append('sku', formData.sku.trim());
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

      toast.success(successMessage);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(response.data.data), 1500);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
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
          <Edit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-tppslate">Update Product</h2>
          <p className="text-sm text-tppslate/60">Edit product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section - Compact */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <InputWrapper 
            label="Product Image" 
            name="image" 
            icon={Upload}
            error={errors.image}
            hint="Upload new image to replace current one (max 5MB)"
          >
            <div className="flex items-start gap-4 mt-3">
              {/* Current/Preview Image */}
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative group">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
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
                      alt="Current product" 
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
                className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-tpppink/30 rounded-lg cursor-pointer bg-tpppeach/10 hover:bg-tpppeach/20 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200 group"
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

        {/* Product Details Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Product Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <InputWrapper 
                label="Product Title" 
                name="title" 
                required 
                icon={Tag}
                error={errors.title}
                hint="Enter a clear, descriptive product name"
              >
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Pink Heart Necklace"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                    errors.title && touched.title
                      ? 'border-red-300 bg-red-50'
                      : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
                  }`}
                  aria-invalid={errors.title && touched.title ? 'true' : 'false'}
                />
              </InputWrapper>
            </div>

            {/* Price */}
            <InputWrapper 
              label="Price (₹)" 
              name="price" 
              required 
              icon={DollarSign}
              error={errors.price}
              hint="Enter amount in INR"
            >
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="999"
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.price && touched.price
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.price && touched.price ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* Stock */}
            <InputWrapper 
              label="Stock Quantity" 
              name="stock" 
              required 
              icon={Package}
              error={errors.stock}
              hint="Available inventory count"
            >
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="50"
                min="0"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.stock && touched.stock
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.stock && touched.stock ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* SKU */}
            <InputWrapper 
              label="SKU (Stock Keeping Unit)" 
              name="sku" 
              required 
              icon={Hash}
              error={errors.sku}
              hint="Unique product identifier"
            >
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="NECKLACE-001"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.sku && touched.sku
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.sku && touched.sku ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* Category */}
            <InputWrapper 
              label="Category" 
              name="category_id" 
              icon={Layers}
              hint="Optional: Organize products by category"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    disabled={loadingCategories}
                    className="w-full px-4 py-2.5 pr-10 border-2 border-tpppink/30 rounded-lg text-sm appearance-none hover:border-tpppink hover:bg-tpppink/5/40 hover:bg-tpppeach/10 focus:border-tpppink focus:outline-none focus:ring-2 focus:ring-tppslate/20 transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed bg-white"
                  >
                    <option value="">-- No Category --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap border-2 ${
                    showAddCategory
                      ? 'bg-slate-100 text-tppslate hover:bg-slate-200 border-tpppink/30'
                      : 'bg-tpppink/50 text-tppslate hover:bg-tpppink/80 border-tpppink/50'
                  }`}
                >
                  {showAddCategory ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      New
                    </>
                  )}
                </button>
              </div>
            </InputWrapper>
          </div>
        </div>

        {/* Add Category Section */}
        {showAddCategory && (
          <div className="bg-white rounded-lg p-5 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200 animate-slide-in">
            <div className="flex items-center gap-2 text-tppslate mb-4">
              <Plus className="w-5 h-5" />
              <h3 className="font-semibold">Create New Category</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  placeholder="e.g., Necklaces, Bracelets"
                  className="w-full px-4 py-2.5 border-2 border-tpppink/30 rounded-lg text-sm hover:border-tpppink hover:bg-tpppink/5/40 hover:bg-tpppeach/10 focus:border-tpppink focus:outline-none focus:ring-2 focus:ring-tppslate/20 transition-all duration-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-tppslate mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleNewCategoryChange}
                  rows="2"
                  placeholder="Brief category description..."
                  className="w-full px-4 py-2.5 border-2 border-tpppink/30 rounded-lg text-sm hover:border-tpppink hover:bg-tpppink/5/40 hover:bg-tpppeach/10 focus:border-tpppink focus:outline-none focus:ring-2 focus:ring-tppslate/20 transition-all duration-200 resize-none bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateCategory}
                className="w-full px-4 py-2.5 bg-tppslate text-white rounded-lg text-sm font-semibold hover:bg-tppslate/90 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-tppslate"
              >
                <Plus className="w-4 h-4" />
                Create Category
              </button>
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <InputWrapper 
            label="Description" 
            name="description" 
            icon={FileText}
            error={errors.description}
            hint="Detailed product information (optional)"
          >
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows="4"
              placeholder="Beautiful heart-shaped necklace perfect for gifting..."
              className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                errors.description && touched.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
              }`}
              aria-invalid={errors.description && touched.description ? 'true' : 'false'}
            />
            <p className="text-xs text-tppslate/40 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </InputWrapper>
        </div>

        {/* Has Variants Toggle with WARNING */}
        <div className="bg-white rounded-lg p-5 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={handleHasVariantsChange}
              className="relative flex items-center focus:outline-none focus:ring-2 focus:ring-tppslate/20 rounded-full"
              role="switch"
              aria-checked={hasVariants}
              aria-label="Toggle product variants"
            >
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                hasVariants ? 'bg-tpppink' : 'bg-slate-300'
              }`}></div>
              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${
                hasVariants ? 'translate-x-5' : ''
              }`}></div>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-tppslate/60" />
                <span className="font-semibold text-sm text-tppslate">
                  This product has variants
                </span>
              </div>
              <p className="text-xs text-tppslate/60 mt-1">
                Enable if this product comes in different options (colors, sizes, materials, etc.)
              </p>
              
              {/* Variant Warning - Shows when unchecking has_variants */}
              {showVariantWarning && (
                <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg animate-slide-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-yellow-800 mb-2">
                        ⚠️ DANGER: Variant Deletion Warning
                      </h4>
                      <p className="text-xs text-yellow-800 font-semibold mb-2">
                        Unchecking this box will permanently delete all {variantCount} variant(s) associated with this product!
                      </p>
                      <ul className="text-xs text-yellow-700 space-y-1 mb-2 ml-4 list-disc">
                        <li>All variant data will be lost</li>
                        <li>All variant images will be deleted from Cloudinary</li>
                        <li>This action CANNOT be undone</li>
                      </ul>
                      <p className="text-xs text-red-700 font-bold flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Alternative: Keep the checkbox checked and manage variants individually.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hasVariants && !showVariantWarning && (
                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg animate-slide-in">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> Use the "Variants" button in the product list to manage variants for this product.
                      {variantCount > 0 && (
                        <span className="block mt-1 font-semibold">
                          Current variants: {variantCount}
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t-2 border-tpppink/30">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md border-2 ${
              loading
                ? 'bg-slate-300 border-slate-300 text-slate-500'
                : showVariantWarning
                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                : 'bg-tppslate border-tppslate text-white hover:bg-tppslate/90'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : showVariantWarning ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Update & Delete Variants
              </>
            ) : (
              'Update Product'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 bg-slate-100 text-tppslate rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200 border-2 border-tpppink/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateProductForm;