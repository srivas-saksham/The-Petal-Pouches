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
  Edit,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { updateProduct, getProductById } from '../../services/adminProductService'; // ✅ ADDED
import { getCategories, createCategory } from '../../services/adminCategoryService'; // ✅ ADDED
import adminApi from '../../services/adminApi';

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
    landing_cost: '',  // ✅ NEW
    base_cost: '',     // ✅ NEW
    weight: '',        // ✅ NEW
    cost_price: '',
    stock: '',
    sku: '',
    category_id: '',
    is_sellable: true 
  });
  const [images, setImages] = useState([]); // New images: { file, preview, id, is_primary }
  const [existingImages, setExistingImages] = useState([]); // From server: { id, img_url, is_primary, display_order }
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track deletions
  const [primaryImageChanged, setPrimaryImageChanged] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [originalHasVariants, setOriginalHasVariants] = useState(false);
  const [variantCount, setVariantCount] = useState(0);
  const [showVariantWarning, setShowVariantWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const toast = useToast();
  const [tags, setTags] = useState([]); // 🆕 NEW: Tags array
  const [tagsInput, setTagsInput] = useState(''); // 🆕 NEW: Current input
  
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
      const response = await getProductById(productId); // ✅ CHANGED
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load product');
      }
      
      const product = response.data.data || response.data;
      
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        landing_cost: product.landing_cost || '',  // ✅ NEW
        base_cost: product.base_cost || '',        // ✅ NEW
        weight: product.weight || '',              // ✅ NEW
        cost_price: product.cost_price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        is_sellable: product.is_sellable !== undefined ? product.is_sellable : true
      });
      
      // ✅ NEW: Load existing images
      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images);
      } else if (product.img_url) {
        // Fallback for products without Product_images table data
        setExistingImages([{
          id: 'legacy',
          img_url: product.img_url,
          is_primary: true,
          display_order: 0
        }]);
      }
      
      setHasVariants(product.has_variants || false);
      setOriginalHasVariants(product.has_variants || false);
      
      // Check variant count if has_variants is true
      if (product.has_variants && product.variants) {
        setVariantCount(product.variants.length);
      }
      
      // 🆕 NEW: Load existing tags
      if (product.tags && Array.isArray(product.tags)) {
        setTags(product.tags.map(t => t.toLowerCase().trim()));
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
      const response = await getCategories(); // ✅ CHANGED
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load categories');
      }
      
      const categoriesData = response.data.data || response.data || [];
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
      
      case 'cost_price':
        if (!value) return 'Cost price is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Cost price must be 0 or greater';
        if (parseFloat(value) > 1000000) return 'Cost price seems unrealistic';
        // Check if cost price is greater than selling price
        if (formData.price && parseFloat(value) > parseFloat(formData.price)) {
          return 'Cost price cannot exceed selling price';
        }
        return '';

      case 'landing_cost':  // ✅ NEW
        if (!value) return 'Landing cost is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Landing cost must be 0 or greater';
        if (parseFloat(value) > 1000000) return 'Landing cost seems unrealistic';
        return '';
      
      case 'base_cost':  // ✅ NEW
        if (!value) return 'Base cost is required';
        if (isNaN(value) || parseFloat(value) < 0) return 'Base cost must be 0 or greater';
        if (parseFloat(value) > 1000000) return 'Base cost seems unrealistic';
        // Check if base_cost is greater than selling price
        if (formData.price && parseFloat(value) > parseFloat(formData.price)) {
          return 'Base cost cannot exceed selling price';
        }
        // Check if base_cost is less than landing_cost
        if (formData.landing_cost && parseFloat(value) < parseFloat(formData.landing_cost)) {
          return 'Base cost cannot be less than landing cost';
        }
        return '';
      
      case 'weight':  // ✅ NEW
        if (!value) return 'Weight is required';
        if (isNaN(value) || parseInt(value) < 0) return 'Weight must be 0 or greater';
        if (parseInt(value) > 50000) return 'Weight seems unrealistic (max 50kg)';
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

  // ✅ NEW: Handle multiple image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Calculate total images (existing + new)
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 8) {
      toast.error(`Maximum 8 images allowed. You can add ${8 - existingImages.length - images.length} more.`);
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
            is_primary: prev.length === 0 && existingImages.length === 0
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    setErrors(prev => ({ ...prev, images: '' }));
  };

  // ✅ NEW: Remove newly added image
  const handleRemoveNewImage = (imageId) => {
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

  // ✅ NEW: Remove existing image
  const handleRemoveExistingImage = (imageId) => {
    const imageToRemove = existingImages.find(img => img.id === imageId);
    
    // Check minimum images requirement
    const totalAfterRemoval = existingImages.length + images.length - 1;
    if (totalAfterRemoval < 1) {
      toast.error('Product must have at least 1 image');
      return;
    }

    setExistingImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      
      // If removed image was primary, set first remaining as primary
      if (imageToRemove?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
        setPrimaryImageChanged(true);
      }
      
      return updated;
    });
    
    setImagesToDelete(prev => [...prev, imageId]);
  };

  // ✅ NEW: Set image as primary
  const handleSetPrimaryImage = (imageId, isExisting) => {
    // Track that primary image was changed
    setPrimaryImageChanged(true);
    
    if (isExisting) {
      setExistingImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.id === imageId }))
      );
      // Unset primary for new images
      setImages(prev =>
        prev.map(img => ({ ...img, is_primary: false }))
      );
    } else {
      setImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.id === imageId }))
      );
      // Unset primary for existing images
      setExistingImages(prev =>
        prev.map(img => ({ ...img, is_primary: false }))
      );
    }
  };

  // ✅ NEW: Get primary image
  const getPrimaryImage = () => {
    const existingPrimary = existingImages.find(img => img.is_primary);
    if (existingPrimary) return { ...existingPrimary, isExisting: true };
    
    const newPrimary = images.find(img => img.is_primary);
    if (newPrimary) return { ...newPrimary, isExisting: false };
    
    return null;
  };

  // ✅ NEW: Get secondary images
  const getSecondaryImages = () => {
    const existingSecondary = existingImages.filter(img => !img.is_primary);
    const newSecondary = images.filter(img => !img.is_primary);
    return [
      ...existingSecondary.map(img => ({ ...img, isExisting: true })), 
      ...newSecondary.map(img => ({ ...img, isExisting: false }))
    ];
  };

  const totalImages = existingImages.length + images.length;
  const canAddMore = totalImages < 8;

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
  
  // 🆕 NEW: Handle tags input (Enter key)
  const handleTagsKeyDown = (e) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      const newTag = tagsInput.trim().toLowerCase();
      
      // Validation
      if (newTag.length < 2) {
        toast.error('Tag must be at least 2 characters');
        return;
      }
      
      if (tags.includes(newTag)) {
        toast.error('Tag already added');
        return;
      }
      
      if (tags.length >= 10) {
        toast.error('Maximum 10 tags allowed');
        return;
      }
      
      setTags(prev => [...prev, newTag]);
      setTagsInput('');
    }
  };

  // 🆕 NEW: Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // ✅ MODIFIED: Now uses baseCost for margin calculations
  const calculateMargins = (baseCost, sellingPrice) => {
    const cost = parseFloat(baseCost) || 0;
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
      
      setNewCategory({ name: '', description: '' });
      await fetchCategories();
      
      const newCategoryData = response.data.data;
      setFormData({ ...formData, category_id: newCategoryData.id });
      
      setTimeout(() => {
        setShowAddCategory(false);
      }, 1500);

    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Failed to create category');
    }
  };

  // ✅ UPDATED: Validate form with multiple images
  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    // ✅ NEW: Validate images
    const finalImageCount = existingImages.length + images.length - imagesToDelete.length;
    if (finalImageCount === 0) {
      newErrors.images = 'Product must have at least one image';
    }
    
    if (finalImageCount > 8) {
      newErrors.images = 'Maximum 8 images allowed';
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      price: true,
      cost_price: true,
      stock: true,
      sku: true,
      description: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  // ✅ UPDATED: Handle submit with multiple images
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
      // ✅ CHANGED: Handle multiple images and deletions
      const updateData = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        price: formData.price,
        landing_cost: formData.landing_cost,  // ✅ NEW
        base_cost: formData.base_cost,        // ✅ NEW
        weight: formData.weight,              // ✅ NEW
        cost_price: formData.cost_price,
        stock: formData.stock,
        sku: formData.sku?.trim(),
        category_id: formData.category_id || '',
        has_variants: hasVariants,
        images: images.map(img => img.file), // New images
        delete_image_ids: imagesToDelete, // Images to delete
        tags: tags,
        is_sellable: formData.is_sellable
      };

      // ✅ NEW: Handle primary image change for existing images
      if (primaryImageChanged) {
        const newPrimaryImage = existingImages.find(img => img.is_primary);
        if (newPrimaryImage && newPrimaryImage.id !== 'legacy') {
          console.log('Primary image changed to:', newPrimaryImage.id);
        }
      }

      const response = await updateProduct(productId, updateData); // ✅ CHANGED
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update product');
      }

      // ✅ NEW: If primary image was changed on existing images, call setPrimary endpoint
      if (primaryImageChanged) {
        const newPrimaryImage = existingImages.find(img => img.is_primary);
        if (newPrimaryImage && newPrimaryImage.id !== 'legacy') {
          try {
            const primaryResponse = await adminApi.patch(
              `/api/products/admin/${productId}/images/${newPrimaryImage.id}/primary`
            );
            
            if (primaryResponse.ok) {
              console.log('✅ Primary image updated');
            }
          } catch (err) {
            console.error('Failed to update primary image:', err);
          }
        }
      }

      const successMessage = response.data.variantsDeleted
        ? `${response.data.message} (${variantCount} variants deleted)`
        : response.data.message;

      toast.success(successMessage);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(response.data.data), 1500);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
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
        {/* Image Upload Section - MULTI-IMAGE GRID */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-tppslate/60" />
              <h3 className="text-sm font-bold text-tppslate">Product Images</h3>
              <span className="text-xs text-tppslate/60">({totalImages}/8)</span>
            </div>
            {canAddMore && (
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
                      src={primaryImg.isExisting ? primaryImg.img_url : primaryImg.preview}
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
                      onClick={() => primaryImg.isExisting 
                        ? handleRemoveExistingImage(primaryImg.id)
                        : handleRemoveNewImage(primaryImg.id)
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Status Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[9px] rounded-full backdrop-blur-sm">
                      {primaryImg.isExisting ? 'Current' : 'New'}
                    </div>
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
                        src={image.isExisting ? image.img_url : image.preview}
                        alt={`Product image ${idx + 2}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-tpppink/30 hover:border-tpppink transition-all"
                      />
                      {/* Set Primary Button */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(image.id, image.isExisting)}
                        className="absolute top-1 left-1 p-1 bg-white/90 text-tppslate rounded hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        title="Set as primary"
                      >
                        <Star className="w-2.5 h-2.5" />
                      </button>
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => image.isExisting 
                          ? handleRemoveExistingImage(image.id)
                          : handleRemoveNewImage(image.id)
                        }
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        aria-label="Remove image"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      {/* Status Badge */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[8px] rounded-full backdrop-blur-sm">
                        {image.isExisting ? 'Current' : 'New'}
                      </div>
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
            1-8 images. First image is primary. PNG, JPG, WEBP up to 5MB each.
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
                />
              </InputWrapper>
            </div>
            
            {/* ✅ NEW: Landing Cost */}
            <InputWrapper 
              label="Landing Cost (Product Only)" 
              name="landing_cost" 
              required 
              icon={DollarSign}
              error={errors.landing_cost}
              hint="Cost of product only (no packaging/delivery)"
            >
              <input
                type="number"
                id="landing_cost"
                name="landing_cost"
                value={formData.landing_cost}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="500"
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.landing_cost && touched.landing_cost
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.landing_cost && touched.landing_cost ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* ✅ NEW: Base Cost */}
            <InputWrapper 
              label="Base Cost (w/ Packaging + Delivery)" 
              name="base_cost" 
              required 
              icon={DollarSign}
              error={errors.base_cost}
              hint="Total cost including packaging and delivery"
            >
              <input
                type="number"
                id="base_cost"
                name="base_cost"
                value={formData.base_cost}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="600"
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.base_cost && touched.base_cost
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.base_cost && touched.base_cost ? 'true' : 'false'}
              />
            </InputWrapper>

            {/* Selling Price with Margin Display */}
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
              
              {/* ✅ REAL-TIME MARGIN DISPLAY - Now uses base_cost */}
              {formData.base_cost && formData.price && 
              parseFloat(formData.base_cost) > 0 && 
              parseFloat(formData.price) > 0 && 
              parseFloat(formData.base_cost) <= parseFloat(formData.price) && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 animate-slide-in">
                  {/* ✅ NEW: Show cost breakdown */}
                  <div className="mb-3 pb-3 border-b border-green-200">
                    <div className="text-xs text-slate-600 mb-2 font-semibold">Cost Breakdown:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-slate-600">Landing Cost:</div>
                        <div className="font-bold text-slate-800">₹{formData.landing_cost || 0}</div>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <div className="text-slate-600">Pkg + Delivery:</div>
                        <div className="font-bold text-blue-600">₹{(parseFloat(formData.base_cost || 0) - parseFloat(formData.landing_cost || 0)).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Margin</div>
                      <div className="text-xl font-bold text-green-600">
                        {calculateMargins(formData.base_cost, formData.price).margin}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Profit/Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Markup</div>
                      <div className="text-xl font-bold text-blue-600">
                        {calculateMargins(formData.base_cost, formData.price).markup}%
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Profit/Base Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Profit/Unit</div>
                      <div className="text-xl font-bold text-tppslate">
                        ₹{calculateMargins(formData.base_cost, formData.price).profit}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Per item</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 text-center">
                    <span className="text-xs text-slate-600">
                      Total profit for {formData.stock || 0} units: <span className="font-bold text-tppslate">₹{((parseFloat(formData.price) - parseFloat(formData.base_cost)) * (parseInt(formData.stock) || 0)).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* Warning if base_cost > price */}
              {formData.base_cost && formData.price && 
              parseFloat(formData.base_cost) > parseFloat(formData.price) && (
                <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg animate-shake">
                  <p className="text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Warning:</strong> Base cost (₹{formData.base_cost}) is higher than selling price (₹{formData.price}). You'll lose money!
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

            {/* ✅ NEW: Weight */}
            <InputWrapper 
              label="Weight (in grams)" 
              name="weight" 
              required 
              icon={Package}
              error={errors.weight}
              hint="Product weight for shipping calculation"
            >
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="250"
                min="0"
                className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.weight && touched.weight
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5/40 focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
                aria-invalid={errors.weight && touched.weight ? 'true' : 'false'}
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

        {/* 🆕 NEW: Tags Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Product Tags
          </h3>
          
          <div className="space-y-3">
            {/* Tags Input */}
            <InputWrapper 
              label="Add Tags" 
              name="tags" 
              icon={Tag}
              hint="Press Enter to add tags (e.g., 'gift', 'birthday', 'romantic')"
            >
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagsKeyDown}
                placeholder="Type tag and press Enter..."
                className="w-full px-4 py-2.5 border-2 border-tpppink/30 rounded-lg text-sm hover:border-tpppink hover:bg-tpppeach/10 focus:border-tpppink focus:outline-none focus:ring-2 focus:ring-tppslate/20 transition-all duration-200 bg-white"
              />
            </InputWrapper>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={tag}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-tpppeach/40 text-tpppink rounded-full text-xs font-semibold border-2 border-tpppink/20 hover:border-tpppink transition-all"
                  >
                    {index === 0 && (
                      <Star size={12} className="text-tpppink" fill="currentColor" />
                    )}
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-tpppink/60 hover:text-tpppink transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Primary Tag Indicator */}
            {tags.length > 0 && (
              <p className="text-xs text-tppslate/60 flex items-center gap-1">
                <Star size={12} className="text-tpppink" fill="currentColor" />
                <span className="font-semibold text-tpppink">{tags[0]}</span> 
                is the primary tag
              </p>
            )}

            {/* Tags Helper Text */}
            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Tags help customers discover your product. Add relevant keywords like occasion, category, or style. First tag is the primary tag.
                </span>
              </p>
            </div>
          </div>
        </div>
        
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

        {/* 🔒 NEW: Sellable Toggle */}
        <div className="bg-white rounded-lg p-5 border-2 border-tpppink/30 hover:border-tpppink hover:bg-tpppink/5 transition-all duration-200">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_sellable: !prev.is_sellable }))}
              className="relative flex items-center focus:outline-none focus:ring-2 focus:ring-tppslate/20 rounded-full"
              role="switch"
              aria-checked={formData.is_sellable}
              aria-label="Toggle product sellability"
            >
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                formData.is_sellable ? 'bg-green-500' : 'bg-purple-500'
              }`}></div>
              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${
                formData.is_sellable ? 'translate-x-5' : ''
              }`}></div>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-tppslate/60" />
                <span className="font-semibold text-sm text-tppslate">
                  {formData.is_sellable ? 'Sell this product individually' : 'Bundle-only product'}
                </span>
              </div>
              <p className="text-xs text-tppslate/60 mt-1">
                {formData.is_sellable 
                  ? 'This product can be purchased alone and used in bundles'
                  : 'This product will ONLY appear inside bundles, not in the shop'
                }
              </p>
              {!formData.is_sellable && (
                <div className="mt-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg animate-slide-in">
                  <p className="text-xs text-purple-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Bundle-Only Mode:</strong> This product won't appear in shop listings or search results. It can only be added to bundles.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
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