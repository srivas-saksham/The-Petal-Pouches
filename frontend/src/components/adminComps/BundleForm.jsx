// frontend/src/components/adminComps/BundleForm.jsx
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
  TrendingUp,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import BundleProductSelector from './BundleProductSelector';
import BundleItemCard from './BundleItemCard';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../services/adminApi';

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
  
  // Multiple images state (up to 5 images)
  const [images, setImages] = useState([]); // Array of { file, preview, id, is_primary }
  const [existingImages, setExistingImages] = useState([]); // From server
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track deletions
  
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
  const [primaryImageChanged, setPrimaryImageChanged] = useState(false);

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

        // Load existing images
        if (bundle.images && Array.isArray(bundle.images)) {
          setExistingImages(bundle.images);
        }

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

  // ✅ NEW: Validate bundle items for stock and variants
  const validateBundleItems = () => {
    const itemErrors = [];
    
    if (items.length < 2) {
      return 'Bundle must have at least 2 products';
    }
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if variant is required but not selected
      if (item.product.has_variants && !item.variant_id) {
        return `Please select a variant for "${item.product.title}"`;
      }
      
      // ✅ NEW: Check stock availability
      const availableStock = item.variant 
        ? item.variant.stock 
        : item.product.stock;
      
      if (availableStock === 0) {
        return `"${item.product.title}" is out of stock. Please remove it or select a different variant.`;
      }
      
      if (item.quantity > availableStock) {
        return `"${item.product.title}": Quantity (${item.quantity}) exceeds available stock (${availableStock})`;
      }
      
      // ✅ NEW: Check if quantity is valid
      if (!item.quantity || item.quantity < 1) {
        return `"${item.product.title}": Quantity must be at least 1`;
      }
      
      // ✅ NEW: Warn if product price is 0
      const itemPrice = item.variant ? item.variant.price : item.product.price;
      if (itemPrice === 0) {
        console.warn(`Warning: "${item.product.title}" has price 0`);
      }
    }
    
    return '';
  };

  // ✅ NEW: Validate images
  const validateImages = () => {
    const totalImagesCount = existingImages.length + images.length;
    
    if (totalImagesCount === 0) {
      return 'At least one image is required';
    }
    
    // Uncomment below to enforce 4 image minimum
    /*
    if (totalImagesCount < 4) {
      return `Please add ${4 - totalImagesCount} more image(s). Minimum 4 images required.`;
    }
    */
    
    if (totalImagesCount > 8) {
      return 'Maximum 8 images allowed';
    }
    
    // Check if there's a primary image
    const hasPrimary = existingImages.some(img => img.is_primary) || 
                      images.some(img => img.is_primary);
    
    if (totalImagesCount > 0 && !hasPrimary) {
      return 'Please set a primary image';
    }
    
    return '';
  };

  // ✅ NEW: Validate tags
  const validateTags = () => {
    if (tags.length === 0) {
      return ''; // Tags are optional, so empty is OK
    }
    
    // Check for duplicate tags (case-insensitive)
    const tagSet = new Set(tags.map(t => t.toLowerCase()));
    if (tagSet.size !== tags.length) {
      return 'Duplicate tags detected';
    }
    
    // Check tag length
    for (const tag of tags) {
      if (tag.length < 2) {
        return 'All tags must be at least 2 characters';
      }
      if (tag.length > 50) {
        return 'Tags must be less than 50 characters';
      }
    }
    
    return '';
  };

  // ✅ NEW: Validate pricing logic
  const validatePricing = () => {
    if (!bundlePrice || parseFloat(bundlePrice) <= 0) {
      return 'Bundle price must be greater than 0';
    }
    
    const original = calculateOriginalPrice();
    const bundle = parseFloat(bundlePrice);
    
    // Check if bundle price is too low (more than 90% discount)
    if (original > 0 && bundle < original * 0.1) {
      return 'Bundle price seems too low (more than 90% discount). Please verify.';
    }
    
    // Check if bundle price is too high (more than 900% markup)
    if (original > 0 && bundle > original * 9) {
      return 'Bundle price seems too high (more than 900% markup). Please verify.';
    }
    
    return '';
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

  // ========================================
  // NEW: Multiple Images Handling
  // ========================================

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

  const handleRemoveExistingImage = (imageId) => {
    const imageToRemove = existingImages.find(img => img.id === imageId);
    
    // Check minimum images requirement
    const totalAfterRemoval = existingImages.length + images.length - 1;
    if (totalAfterRemoval < 4) {
      toast.error('Bundle must have at least 4 images');
      return;
    }

    setExistingImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      
      // If removed image was primary, set first remaining as primary
      if (imageToRemove?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      
      return updated;
    });
    
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleSetPrimaryImage = (imageId, isExisting) => {
    // Track that primary image was changed
    if (isExisting) {
      setPrimaryImageChanged(true);
    }
    
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

  // Get primary image
  const getPrimaryImage = () => {
    const existingPrimary = existingImages.find(img => img.is_primary);
    if (existingPrimary) return { ...existingPrimary, isExisting: true };
    
    const newPrimary = images.find(img => img.is_primary);
    if (newPrimary) return { ...newPrimary, isExisting: false };
    
    return null;
  };

  // Get secondary images
  const getSecondaryImages = () => {
    const existingSecondary = existingImages.filter(img => !img.is_primary);
    const newSecondary = images.filter(img => !img.is_primary);
    return [...existingSecondary.map(img => ({ ...img, isExisting: true })), ...newSecondary.map(img => ({ ...img, isExisting: false }))];
  };

  const primaryImage = getPrimaryImage();
  const secondaryImages = getSecondaryImages();
  const totalImages = existingImages.length + images.length;
  const canAddMore = totalImages < 8 && totalImages >= 0;

  // Add product to bundle with stock validation
  const handleProductSelect = (product) => {
    // ✅ Check if product already exists
    const exists = items.some(item => item.product_id === product.id);
    if (exists) {
      toast.error('Product already added to bundle');
      return;
    }
    
    // ✅ Check if product has stock (if it doesn't have variants)
    if (!product.has_variants && product.stock === 0) {
      toast.error(`"${product.title}" is out of stock`);
      return;
    }
    
    // ✅ For products with variants, check if any variant has stock
    if (product.has_variants) {
      // Assuming Product_variants is available in the product object
      const hasStockInAnyVariant = product.Product_variants?.some(v => v.stock > 0);
      if (!hasStockInAnyVariant) {
        toast.error(`"${product.title}" has no variants in stock`);
        return;
      }
    }

    setItems([...items, {
      product_id: product.id,
      variant_id: null,
      quantity: 1,
      product: product,
      variant: null
    }]);
    setShowProductSelector(false);
    
    // Clear items error if it exists
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  // Update item variant with stock validation
  const handleVariantChange = (index, variantId, variant) => {
    // ✅ Check if new variant has stock
    if (variant && variant.stock === 0) {
      toast.error(`Selected variant is out of stock`);
      return;
    }
    
    const item = items[index];
    
    // ✅ Check if current quantity exceeds new variant's stock
    if (variant && item.quantity > variant.stock) {
      toast.warning(`Quantity adjusted to available stock (${variant.stock})`);
      const updated = [...items];
      updated[index].variant_id = variantId;
      updated[index].variant = variant;
      updated[index].quantity = variant.stock;
      setItems(updated);
    } else {
      const updated = [...items];
      updated[index].variant_id = variantId;
      updated[index].variant = variant;
      setItems(updated);
    }
    
    // Clear items error if it exists
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  // Update item quantity with validation
  const handleQuantityChange = (index, quantity) => {
    const item = items[index];
    const availableStock = item.variant 
      ? item.variant.stock 
      : item.product.stock;
    
    // ✅ Validate quantity in real-time
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} units available for "${item.product.title}"`);
      return;
    }
    
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    const updated = [...items];
    updated[index].quantity = quantity;
    setItems(updated);
    
    // Clear items error if it exists
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
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
    
    // Validate basic fields
    const titleError = validateField('title', title);
    if (titleError) newErrors.title = titleError;
    
    const priceError = validateField('bundlePrice', bundlePrice);
    if (priceError) newErrors.bundlePrice = priceError;
    
    const stockError = validateField('stockLimit', stockLimit);
    if (stockError) newErrors.stockLimit = stockError;
    
    const descError = validateField('description', description);
    if (descError) newErrors.description = descError;
    
    // ✅ ENHANCED: Validate images with comprehensive checks
    const imagesError = validateImages();
    if (imagesError) newErrors.images = imagesError;
    
    // ✅ ENHANCED: Validate bundle items with stock checks
    const itemsError = validateBundleItems();
    if (itemsError) newErrors.items = itemsError;
    
    // ✅ NEW: Validate tags
    const tagsError = validateTags();
    if (tagsError) newErrors.tags = tagsError;
    
    // ✅ NEW: Validate pricing logic
    const pricingError = validatePricing();
    if (pricingError) newErrors.pricing = pricingError;
    
    setErrors(newErrors);
    setTouched({
      title: true,
      bundlePrice: true,
      stockLimit: true,
      description: true
    });
    
    // If there are errors, scroll to first error
    if (Object.keys(newErrors).length > 0) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField) || 
                      document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
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
      // ========================================
      // STEP 1: Prepare Update Data
      // ========================================
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', bundlePrice);
      
      // Stock limit (send as empty string if null, or the value)
      if (stockLimit && stockLimit.trim() !== '') {
        formData.append('stock_limit', stockLimit);
      } else {
        formData.append('stock_limit', ''); // Send empty to clear it
      }
      
      // Tags as JSON array
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      } else {
        formData.append('tags', JSON.stringify([])); // Send empty array
      }

      // Items as JSON array
      const itemsData = items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity
      }));
      formData.append('items', JSON.stringify(itemsData));

      // ========================================
      // IMPORTANT: For CREATE mode, add images
      // For EDIT mode, DO NOT add images here
      // ========================================
      if (!isEditMode) {
        // CREATE: Include images in initial request
        images.forEach(img => {
          formData.append('images', img.file);
        });
      }

      // Log what we're sending (for debugging)
      console.log('📤 Sending FormData:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name}`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      // ========================================
      // STEP 2: Send Main Request
      // ⭐ FIX: Use adminApi instead of fetch()
      // ========================================
      const endpoint = isEditMode
        ? `/api/bundles/admin/${bundleId}`
        : '/api/bundles/admin';
      
      const method = isEditMode ? 'PUT' : 'POST';

      console.log(`📍 ${method} ${endpoint}`);

      // ⭐ CHANGED: Use adminApi (Axios) instead of fetch()
      const response = isEditMode
        ? await adminApi.put(endpoint, formData)
        : await adminApi.post(endpoint, formData);

      const data = response.data;
      
      console.log('📥 Response:', data);

      // ⭐ CHANGED: Check data.success instead of response.ok
      if (!data.success) {
        console.error('❌ Request failed:', data);
        toast.error(data.message || 'Failed to save bundle');
        setLoading(false);
        return;
      }

      // toast.success(data.message || `Bundle ${isEditMode ? 'updated' : 'created'} successfully`);

      // ========================================
      // STEP 3: Handle Images (EDIT MODE ONLY)
      // ⭐ FIX: Use adminApi for all image operations
      // ========================================
      if (isEditMode) {
        let successfulOperations = 0;
        let failedOperations = 0;

        // 3A: Update primary image if changed
        if (primaryImageChanged) {
          const newPrimaryImage = existingImages.find(img => img.is_primary);
          
          if (newPrimaryImage) {
            console.log(`🌟 Setting primary image: ${newPrimaryImage.id}`);
            toast.info('Updating primary image...');
            
            try {
              // ⭐ CHANGED: Use adminApi.patch()
              const primaryResponse = await adminApi.patch(
                `/api/bundles/admin/${bundleId}/images/${newPrimaryImage.id}/primary`
              );
              
              const primaryData = primaryResponse.data;
              
              // ⭐ CHANGED: Check primaryData.success
              if (primaryData.success) {
                console.log('✅ Primary image updated');
                toast.success('Primary image updated');
              } else {
                console.error('❌ Failed to update primary:', primaryData.message);
                toast.error('Failed to update primary image: ' + (primaryData.message || 'Unknown error'));
              }
            } catch (err) {
              console.error('❌ Error updating primary:', err);
              toast.error('Error updating primary image: ' + err.message);
            }
          }
        }

        // 3B: Delete marked images
        if (imagesToDelete.length > 0) {
          console.log(`🗑️ Deleting ${imagesToDelete.length} images...`);
          toast.info(`Deleting ${imagesToDelete.length} image(s)...`);
          
          for (const imageId of imagesToDelete) {
            try {
              console.log(`  Deleting image: ${imageId}`);
              
              // ⭐ CHANGED: Use adminApi.delete()
              const deleteResponse = await adminApi.delete(
                `/api/bundles/admin/${bundleId}/images/${imageId}`
              );
              
              const deleteData = deleteResponse.data;
              
              // ⭐ CHANGED: Check deleteData.success
              if (deleteData.success) {
                console.log(`  ✅ Deleted: ${imageId}`);
                successfulOperations++;
              } else {
                console.error(`  ❌ Failed to delete ${imageId}:`, deleteData.message);
                failedOperations++;
              }
            } catch (err) {
              console.error(`  ❌ Error deleting ${imageId}:`, err);
              failedOperations++;
            }
          }
          
          if (successfulOperations > 0) {
            toast.success(`Deleted ${successfulOperations} image(s)`);
          }
          if (failedOperations > 0) {
            toast.warning(`Failed to delete ${failedOperations} image(s)`);
          }
        }

        // 3C: Upload new images AFTER deletions
        if (images.length > 0) {
          console.log(`📤 Uploading ${images.length} new images...`);
          toast.info(`Uploading ${images.length} new image(s)...`);
          
          const imageFormData = new FormData();
          images.forEach(img => {
            imageFormData.append('images', img.file);
          });

          try {
            // ⭐ CHANGED: Use adminApi.post()
            const uploadResponse = await adminApi.post(
              `/api/bundles/admin/${bundleId}/images`,
              imageFormData
            );

            const uploadData = uploadResponse.data;
            console.log('📥 Upload response:', uploadData);

            // ⭐ CHANGED: Check uploadData.success
            if (uploadData.success) {
              console.log('✅ Images uploaded successfully');
              toast.success(`Uploaded ${images.length} new image(s)`);
            } else {
              console.error('❌ Upload failed:', uploadData);
              toast.error('Failed to upload images: ' + (uploadData.message || 'Unknown error'));
              
              // Show specific errors if available
              if (uploadData.errors && Array.isArray(uploadData.errors)) {
                uploadData.errors.forEach(err => {
                  console.error('  Error:', err);
                });
              }
            }
          } catch (err) {
            console.error('❌ Upload exception:', err);
            toast.error('Error uploading images: ' + err.message);
          }
        }
      }

      // ========================================
      // STEP 4: Success - Navigate/Refresh
      // ========================================
      console.log('✅ All operations completed');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data.message || `Bundle ${isEditMode ? 'updated' : 'created'} successfully`);
        }, 1500);
      }

    } catch (err) {
      console.error('❌ Exception in handleSubmit:', err);
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
    <div className="p-6 space-y-6 bg-tppslate/10"
    // style={{
    //     backgroundImage: 'url(/assets/doodle_bg.png)',
    //     backgroundRepeat: 'repeat',
    //     backgroundSize: 'auto',
    //   }} 
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-tppslate/30">
        <div className="w-10 h-10 bg-tppslate rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-tppslate">
            {isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
          </h2>
          <p className="text-sm text-tppslate/90">
            {isEditMode ? 'Update bundle details and products' : 'Build a bundle with multiple products'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: Basic Info & Images - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* LEFT COLUMN - Basic Info Section */}
        <div className="bg-white rounded-lg p-4 lg:p-6 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <h3 className="text-sm lg:text-base font-bold text-tppslate mb-3 lg:mb-4 flex items-center gap-2">
            <Tag className="w-4 lg:w-5 h-4 lg:h-5" />
            Basic Information
          </h3>
          
          <div className="space-y-3 lg:space-y-5">
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
                className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 border-2 rounded-lg text-xs lg:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
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
                className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 border-2 rounded-lg text-xs lg:text-sm transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.description && touched.description
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
              <p className="text-[10px] lg:text-xs text-tppslate/40 mt-1">
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
                className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 border-2 rounded-lg text-xs lg:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.stockLimit && touched.stockLimit
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
            </InputWrapper>
          </div>
        </div>

        {/* RIGHT COLUMN - Image Upload Section */}
        <div className="bg-white rounded-lg p-3 lg:p-4 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <ImageIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-tppslate/60" />
              <h3 className="text-xs lg:text-sm font-bold text-tppslate">Bundle Images</h3>
              <span className="text-[10px] lg:text-xs text-tppslate/60">({totalImages}/8)</span>
            </div>
            {canAddMore && (
              <label className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-tpppink/50 text-tppslate rounded-lg hover:bg-tpppink/80 text-[10px] lg:text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 lg:gap-1.5 border-2 border-tpppink/50">
                <Plus className="w-3 lg:w-3 h-3 lg:h-3" />
                Add
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
            <div className="mb-2 lg:mb-3 p-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-[10px] lg:text-xs flex items-center gap-1.5 lg:gap-2">
              <AlertCircle className="w-3 lg:w-3.5 h-3 lg:h-3.5 flex-shrink-0" />
              {errors.images}
            </div>
          )}

          {/* Mobile: 4-column grid | Desktop: 5-column grid */}
          <div className="grid grid-cols-4 lg:grid-cols-5 gap-1.5 lg:gap-2">
            {/* Primary Image */}
            <div className="col-span-2 row-span-2">
              {primaryImage ? (
                <div className="relative group h-full">
                  <img 
                    src={primaryImage.isExisting ? primaryImage.img_url : primaryImage.preview}
                    alt="Primary bundle image" 
                    className="w-full h-full object-cover rounded-lg border-2 border-tpppink shadow-sm"
                  />
                  {/* Primary Badge */}
                  <div className="absolute top-1 lg:top-1.5 left-1 lg:left-1.5 px-1 lg:px-1.5 py-0.5 bg-tpppink text-white text-[8px] lg:text-[10px] font-bold rounded-full flex items-center gap-0.5 shadow-md">
                    <Star className="w-2 lg:w-2.5 h-2 lg:h-2.5 fill-current" />
                    <span className="hidden sm:inline">PRIMARY</span>
                    <span className="sm:hidden">1ST</span>
                  </div>
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => primaryImage.isExisting 
                      ? handleRemoveExistingImage(primaryImage.id)
                      : handleRemoveNewImage(primaryImage.id)
                    }
                    className="absolute top-1 lg:top-1.5 right-1 lg:right-1.5 p-0.5 lg:p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                    aria-label="Remove image"
                  >
                    <X className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                  </button>
                  {/* Status Badge */}
                  <div className="absolute bottom-1 lg:bottom-1.5 right-1 lg:right-1.5 px-1 lg:px-1.5 py-0.5 bg-black/60 text-white text-[7px] lg:text-[9px] rounded-full backdrop-blur-sm">
                    {primaryImage.isExisting ? 'Cur' : 'New'}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-tpppink/30 rounded-lg flex flex-col items-center justify-center bg-slate-50 min-h-[100px] lg:min-h-[140px]">
                  <ImageIcon className="w-6 lg:w-8 h-6 lg:h-8 text-slate-300 mb-0.5 lg:mb-1" />
                  <p className="text-[10px] lg:text-xs text-tppslate/60 font-medium">Primary</p>
                </div>
              )}
            </div>

            {/* Secondary Images - Mobile: 6 slots | Desktop: 7 slots */}
            {[...Array(7)].map((_, idx) => {
              const image = secondaryImages[idx];
              // Hide 7th image on mobile
              if (idx === 6) {
                return (
                  <div key={idx} className="aspect-square hidden lg:block">
                    {image ? (
                      <div className="relative group h-full">
                        <img 
                          src={image.isExisting ? image.img_url : image.preview}
                          alt={`Bundle image ${idx + 2}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-tpppink/30 hover:border-tpppink transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(image.id, image.isExisting)}
                          className="absolute top-0.5 left-0.5 p-0.5 bg-white/90 text-tppslate rounded hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          title="Set as primary"
                        >
                          <Star className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => image.isExisting 
                            ? handleRemoveExistingImage(image.id)
                            : handleRemoveNewImage(image.id)
                          }
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          aria-label="Remove image"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/60 text-white text-[8px] rounded-full backdrop-blur-sm">
                          {image.isExisting ? 'Cur' : 'New'}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-tpppink/20 rounded-lg flex items-center justify-center bg-slate-50">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <div key={idx} className="aspect-square">
                  {image ? (
                    <div className="relative group h-full">
                      <img 
                        src={image.isExisting ? image.img_url : image.preview}
                        alt={`Bundle image ${idx + 2}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-tpppink/30 hover:border-tpppink transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(image.id, image.isExisting)}
                        className="absolute top-0.5 left-0.5 p-0.5 bg-white/90 text-tppslate rounded hover:bg-tpppink hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        title="Set as primary"
                      >
                        <Star className="w-2 lg:w-2.5 h-2 lg:h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => image.isExisting 
                          ? handleRemoveExistingImage(image.id)
                          : handleRemoveNewImage(image.id)
                        }
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        aria-label="Remove image"
                      >
                        <X className="w-2 lg:w-2.5 h-2 lg:h-2.5" />
                      </button>
                      <div className="absolute bottom-0.5 right-0.5 px-0.5 lg:px-1 py-0.5 bg-black/60 text-white text-[7px] lg:text-[8px] rounded-full backdrop-blur-sm">
                        {image.isExisting ? 'Cur' : 'New'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-tpppink/20 rounded-lg flex items-center justify-center bg-slate-50">
                      <ImageIcon className="w-3 lg:w-4 h-3 lg:h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[9px] lg:text-[11px] text-tppslate/60 mt-1.5 lg:mt-2 flex items-center gap-1">
            <Info className="w-2.5 lg:w-3 h-2.5 lg:h-3 flex-shrink-0" />
            <span className="hidden sm:inline">4-8 images required. First image is primary. PNG, JPG, WEBP up to 5MB each.</span>
            <span className="sm:hidden">4-8 images • Max 5MB each</span>
          </p>
        </div>
      </div>

      {/* SECTION 2: Products & Tags - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* LEFT COLUMN - Products Section */}
        <div className="bg-white rounded-lg p-4 lg:p-6 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 lg:mb-4">
            <h3 className="text-sm lg:text-base font-bold text-tppslate flex items-center gap-2">
              <Package className="w-4 lg:w-5 h-4 lg:h-5" />
              Bundle Products ({items.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="px-2.5 lg:px-3 py-1.5 bg-tpppink/50 text-tppslate rounded-lg hover:bg-tpppink/80 text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 lg:gap-2 border-2 border-tpppink/50 w-full sm:w-auto"
            >
              <Plus className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
              Add Product
            </button>
          </div>

          {errors.items && (
            <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-xs lg:text-sm flex items-center gap-1.5 lg:gap-2">
              <AlertCircle className="w-3.5 lg:w-4 h-3.5 lg:h-4 flex-shrink-0" />
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
            <div className="text-center py-6 lg:py-8 text-tppslate/60 border-2 border-dashed border-tpppink/30 rounded-lg bg-slate-50">
              <Package className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-2 text-tppslate/30" />
              <p className="text-xs lg:text-sm">No products added yet. Add at least 2 products.</p>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {items.map((item, index) => {
                const availableStock = item.variant 
                  ? item.variant.stock 
                  : item.product.stock;
                
                const hasStockIssue = availableStock === 0 || item.quantity > availableStock;
                
                return (
                  <div key={index}>
                    <BundleItemCard
                      item={item}
                      onVariantChange={(variantId, variant) =>
                        handleVariantChange(index, variantId, variant)
                      }
                      onQuantityChange={(quantity) => handleQuantityChange(index, quantity)}
                      onRemove={() => handleRemoveItem(index)}
                    />
                    
                    {/* ✅ ADD THIS: Stock Warning for each item */}
                    {hasStockIssue && (
                      <div className="mt-1 px-3 py-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {availableStock === 0 
                          ? 'Out of stock - Please remove or change variant'
                          : `Quantity (${item.quantity}) exceeds available stock (${availableStock})`
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Tags Section */}
        <div className="bg-white rounded-lg p-4 lg:p-6 border-2 border-tpppink/30 hover:border-tpppink transition-all duration-200">
          <h3 className="text-sm lg:text-base font-bold text-tppslate mb-3 lg:mb-4 flex items-center gap-2">
            <Tag className="w-4 lg:w-5 h-4 lg:h-5" />
            Tags
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
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
                className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 border-2 rounded-lg text-xs lg:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tppslate/20 ${
                  errors.tags
                    ? 'border-red-300 bg-red-50'
                    : 'border-tpppink/30 hover:border-tpppink focus:border-tpppink bg-white hover:bg-tpppeach/10'
                }`}
              />
            </InputWrapper>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 lg:gap-2 p-3 lg:p-4 bg-tpppeach/10 rounded-lg border-2 border-tpppink/20">
                {tags.map((tag, index) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                      index === 0
                        ? 'bg-tpppink text-white border-2 border-tpppink shadow-sm'
                        : 'bg-white text-tppslate border-2 border-tpppink/30 hover:border-tpppink'
                    }`}
                  >
                    {tag}
                    {index === 0 && (
                      <span className="text-[9px] lg:text-xs bg-white text-tpppink px-1 lg:px-1.5 py-0.5 rounded font-bold">
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {tags.length === 0 && (
              <div className="text-center py-3 lg:py-4 text-tppslate/60 border-2 border-dashed border-tpppink/30 rounded-lg bg-slate-50">
                <Tag className="w-6 lg:w-8 h-6 lg:h-8 mx-auto mb-2 text-tppslate/30" />
                <p className="text-xs lg:text-sm">No tags added yet. The first tag will be the primary tag.</p>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-lg p-6 border-2 border-tpppink/30 hover:border-tpppink   transition-all duration-200">
          <h3 className="text-base font-bold text-tppslate mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </h3>

          {/* ✅ ADD THIS: Pricing Error Display */}
          {errors.pricing && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.pricing}
            </div>
          )}

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