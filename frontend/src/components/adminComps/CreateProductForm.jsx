// frontend/src/components/adminComps/CreateProductForm.jsx
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
  Star,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { createProduct } from '../../services/adminProductService'; // ✅ ADDED
import { getCategories, createCategory } from '../../services/adminCategoryService'; // ✅ ADDED

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


const CreateProductForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    cost_price: '',
    stock: '',
    sku: '',
    category_id: ''
  });
  const [images, setImages] = useState([]); // Array of { file, preview, id, is_primary }
  const [imageError, setImageError] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

 const fetchCategories = async () => {
  setLoadingCategories(true);
    try {
      const response = await getCategories(); // ✅ CHANGED
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load categories');
      }
      
      const categoriesData = response.data.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
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
      
      case 'cost_price':
        if (!value) return 'Cost price is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Cost price must be 0 or greater';
        if (parseFloat(value) > 1000000) return 'Cost price seems unrealistic';
        // Check if cost price is greater than selling price
        if (formData.price && parseFloat(value) > parseFloat(formData.price)) {
          return 'Cost price cannot exceed selling price';
        }
        return '';

      case 'stock':
        if (!value) return 'Stock quantity is required';
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total images limit
    const totalImages = images.length + files.length;
    
    if (totalImages > 8) {
      toast.error(`Maximum 8 images allowed. You can add ${8 - images.length} more.`);
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        continue;
      }
      
      validFiles.push(file);
    }

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [
          ...prev,
          {
            file,
            preview: reader.result,
            id: `new-${Date.now()}-${Math.random()}`,
            is_primary: prev.length === 0 // First image is primary
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    setImageError('');
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      
      // If removed image was primary and there are other images, set first as primary
      const removedWasPrimary = prev.find(img => img.id === imageId)?.is_primary;
      if (removedWasPrimary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      
      return updated;
    });
  };

  const handleSetPrimaryImage = (imageId) => {
    setImages(prev =>
      prev.map(img => ({ ...img, is_primary: img.id === imageId }))
    );
  };

  // Get primary and secondary images
  const getPrimaryImage = () => {
    return images.find(img => img.is_primary) || null;
  };

  const getSecondaryImages = () => {
    return images.filter(img => !img.is_primary);
  };

  // Handle new category input
  const handleNewCategoryChange = (e) => {
    setNewCategory({
      ...newCategory,
      [e.target.name]: e.target.value
    });
  };

  const calculateMargins = (costPrice, sellingPrice) => {
    const cost = parseFloat(costPrice) || 0;
    const price = parseFloat(sellingPrice) || 0;
    
    if (cost === 0 || price === 0) return { margin: 0, markup: 0, profit: 0 };
    
    const profit = price - cost;
    const margin = ((profit / price) * 100).toFixed(1);
    const markup = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;
    
    return { margin, markup, profit: profit.toFixed(2) };
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await createCategory({ // ✅ CHANGED
        name: newCategory.name,
        description: newCategory.description
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create category');
      }

      toast.success('Category created successfully!');
      
      // Reset form
      setNewCategory({ name: '', description: '' });
      
      // Refresh categories list
      await fetchCategories();
      
      // Auto-select the newly created category
      const newCategoryData = response.data.data || response.data;
      setFormData({ ...formData, category_id: newCategoryData.id });
      
      // Close the add category section after a short delay
      setTimeout(() => {
        setShowAddCategory(false);
      }, 1500);

    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Failed to create category');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    // ✅ CHANGED: Validate multiple images
    if (images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    if (images.length > 8) {
      newErrors.images = 'Maximum 8 images allowed';
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      price: true,
      cost_price: true,
      stock: true,
      sku: true,
      description: true,
      images: true
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
    
    setLoading(true);
    

    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price,
        cost_price: formData.cost_price,
        stock: formData.stock,
        sku: formData.sku.trim(),
        has_variants: hasVariants,
        category_id: formData.category_id || '',
        images: images.map(img => img.file) // ✅ CHANGED: Send array of files
      };

      const response = await createProduct(productData); // ✅ CHANGED
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create product');
      }

      toast.success('Product created successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        cost_price: '',
        stock: '',
        sku: '',
        category_id: ''
      });
      setImages([]); // ✅ CHANGED
      setHasVariants(false);
      setErrors({});
      setTouched({});

      if (onSuccess) {
        const productData = response.data.data || response.data;
        setTimeout(() => onSuccess(productData), 1500);
      }

    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-tpppink/30">
        <div className="w-10 h-10 bg-tppslate rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-tppslate">Create New Product</h2>
          <p className="text-sm text-tppslate/60">Add a new product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section - MULTI-IMAGE GRID */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-tppslate/60" />
              <h3 className="text-sm font-bold text-tppslate">Product Images</h3>
              <span className="text-xs text-tppslate/60">({images.length}/8)</span>
            </div>
            {images.length < 8 && (
              <label className="px-3 py-1.5 bg-tpppink/50 text-tppslate rounded-lg hover:bg-tpppink/80 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border-2 border-tpppink/50">
                <Plus className="w-3.5 h-3.5" />
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {errors.images && (
            <div className="mb-3 p-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.images}
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-4 gap-2">
            {/* Primary Image - Takes 2x2 space */}
            <div className="col-span-2 row-span-2">
              {(() => {
                const primaryImg = getPrimaryImage();
                return primaryImg ? (
                  <div className="relative group h-full">
                    <img 
                      src={primaryImg.preview}
                      alt="Primary product image" 
                      className="w-full h-full object-cover rounded-lg border-2 border-tpppink shadow-sm"
                    />
                    {/* Primary Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-tpppink text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      PRIMARY
                    </div>
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(primaryImg.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-tpppink/30 rounded-lg flex flex-col items-center justify-center bg-slate-50 min-h-[180px]">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                    <p className="text-xs text-tppslate/60 font-medium">Primary Image</p>
                  </div>
                );
              })()}
            </div>

            {/* Secondary Images - 6 slots */}
            {[...Array(6)].map((_, idx) => {
              const secondaryImages = getSecondaryImages();
              const image = secondaryImages[idx];
              
              return (
                <div key={idx} className="aspect-square">
                  {image ? (
                    <div className="relative group h-full">
                      <img 
                        src={image.preview}
                        alt={`Product image ${idx + 2}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-tpppink/30 hover:border-tpppink transition-all"
                      />
                      {/* Set Primary Button */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(image.id)}
                        className="absolute top-1 left-1 p-1 bg-white/90 text-tppslate rounded hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        title="Set as primary"
                      >
                        <Star className="w-2.5 h-2.5" />
                      </button>
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        aria-label="Remove image"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-tpppink/20 rounded-lg flex items-center justify-center bg-slate-50">
                      <ImageIcon className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-tppslate/60 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            1-8 images required. First image is primary. PNG, JPG, WEBP up to 5MB each.
          </p>
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
                  aria-describedby={errors.title && touched.title ? `${name}-error` : undefined}
                />
              </InputWrapper>
            </div>
            
            {/* ✅ COST PRICE FIELD */}
            <InputWrapper 
              label="Cost Price (Your Purchase Price)" 
              name="cost_price" 
              required 
              icon={DollarSign}
              error={errors.cost_price}
              hint="What you paid for this product (excluding your markup)"
            >
              <input
                type="number"
                id="cost_price"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="600"
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.cost_price && touched.cost_price
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.cost_price && touched.cost_price ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* SELLING PRICE with Margin Display */}
            <InputWrapper 
              label="Selling Price (Customer Price)" 
              name="price" 
              required 
              icon={DollarSign}
              error={errors.price}
              hint="Price customers will pay"
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
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.price && touched.price ? 'true' : 'false'}
              />
              
              {/* ✅ REAL-TIME MARGIN DISPLAY */}
              {formData.cost_price && formData.price && 
              parseFloat(formData.cost_price) > 0 && 
              parseFloat(formData.price) > 0 && 
              parseFloat(formData.cost_price) <= parseFloat(formData.price) && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 animate-slide-in">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Margin</div>
                      <div className="text-xl font-bold text-green-600">
                        {calculateMargins(formData.cost_price, formData.price).margin}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Profit/Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Markup</div>
                      <div className="text-xl font-bold text-blue-600">
                        {calculateMargins(formData.cost_price, formData.price).markup}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Profit/Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Profit/Unit</div>
                      <div className="text-xl font-bold text-tppslate">
                        ₹{calculateMargins(formData.cost_price, formData.price).profit}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Per item</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 text-center">
                    <span className="text-xs text-slate-600">
                      Total profit for {formData.stock || 0} units: <span className="font-bold text-tppslate">₹{((parseFloat(formData.price) - parseFloat(formData.cost_price)) * (parseInt(formData.stock) || 0)).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* Warning if cost > price */}
              {formData.cost_price && formData.price && 
              parseFloat(formData.cost_price) > parseFloat(formData.price) && (
                <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg animate-shake">
                  <p className="text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Warning:</strong> Cost price (₹{formData.cost_price}) is higher than selling price (₹{formData.price}). You'll lose money!
                  </p>
                </div>
              )}
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

        {/* Has Variants Toggle */}
        <div className="bg-white rounded-lg p-5 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => setHasVariants(!hasVariants)}
              className="relative flex items-center focus:outline-none focus:ring-2 focus:ring-tppslate/20 rounded-full"
              role="switch"
              aria-checked={hasVariants}
              aria-label="Toggle product variants"
            >
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                hasVariants ? 'bg-tpppink' : 'bg-slate-200'
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
              {hasVariants && (
                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg animate-slide-in">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> After creating this product, use the "Variants" button to add different options.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t-2 border-tpppink/30">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-tppslate text-white rounded-lg font-semibold hover:bg-tppslate/90 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md border-2 border-tppslate disabled:border-slate-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5" />
                Create Product
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;