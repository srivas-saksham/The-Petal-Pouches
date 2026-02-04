// frontend/src/components/admin/coupons/CouponFormModal.jsx
/**
 * Coupon Form Modal - Enhanced Version
 * Create or edit coupon with full validation
 * Features: Click outside to close, ESC to close
 */

import { useState, useEffect } from 'react';
import { X, Loader, Tag, Percent, DollarSign, Calendar, Users, Lock, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { createCoupon, updateCoupon } from '../../../services/adminCouponService';

// ⭐ NEW IMPORTS - Add after existing imports
import CouponTypeSelector from './CouponTypeSelector';
import ProductSelector from './ProductSelector';
import CategorySelector from './CategorySelector';
import BOGOConfigFields from './BOGOConfigFields';

export default function CouponFormModal({ isOpen, coupon = null, onClose, onSuccess }) {
  const isEditMode = !!coupon;

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'Percent',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    status: 'inactive',
    usage_limit: '',
    usage_per_user: '1'
  });

  // Add helper function at component level
  const getStatusFromDates = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    if (end < today) return 'expired';
    if (start > today) return 'scheduled';
    return null; // User can choose
  };

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ⭐ NEW STATE FIELDS for enhanced coupon types
  const [couponType, setCouponType] = useState('cart_wide');
  const [eligibleProductIds, setEligibleProductIds] = useState([]);
  const [eligibleCategoryIds, setEligibleCategoryIds] = useState([]);
  const [bogoBuyQuantity, setBogoBuyQuantity] = useState(3);
  const [bogoGetQuantity, setBogoGetQuantity] = useState(2);
  const [bogoDiscountPercent, setBogoDiscountPercent] = useState(100);
  const [maxDiscountItems, setMaxDiscountItems] = useState(null);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);

  // ==================== LOAD COUPON DATA ====================
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discount_type: coupon.discount_type || 'Percent',
        discount_value: coupon.discount_value || '',
        min_order_value: coupon.min_order_value || '',
        max_discount: coupon.max_discount || '',
        start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
        end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
        status: coupon.status || 'inactive',
        usage_limit: coupon.usage_limit || '',
        usage_per_user: coupon.usage_per_user || '1'
      });
      
      // ⭐ NEW: Load enhanced coupon fields
      setCouponType(coupon.coupon_type || 'cart_wide');
      setBogoBuyQuantity(coupon.bogo_buy_quantity || 3);
      setBogoGetQuantity(coupon.bogo_get_quantity || 2);
      setBogoDiscountPercent(coupon.bogo_discount_percent || 100);
      setMaxDiscountItems(coupon.max_discount_items || null);
      setFirstOrderOnly(coupon.first_order_only || false);
      setExcludeSaleItems(coupon.exclude_sale_items || false);

      // ⭐ FIXED: Fetch eligible products/categories for all relevant types
      if (coupon.id && (
        coupon.coupon_type === 'product_specific' || 
        coupon.coupon_type === 'bogo' || 
        coupon.coupon_type === 'category_based'
      )) {
        fetchEligibleItems(coupon);
      } else {
        // Reset if not using these types
        setEligibleProductIds([]);
        setEligibleCategoryIds([]);
      }
    } else {
      // Reset all states for create mode
      setEligibleProductIds([]);
      setEligibleCategoryIds([]);
    }
  }, [coupon]);

  // ⭐ FIXED: Fetch eligible items using the service
  const fetchEligibleItems = async (couponData) => {
    try {
      console.log('🔍 [CouponFormModal] Fetching eligible items for:', couponData.id);
      
      const result = await import('../../../services/adminCouponService').then(module => 
        module.getEligibleItems(couponData.id)
      );

      if (result.success && result.data) {
        // Set the eligible IDs from the fetched data
        setEligibleProductIds(result.data.eligible_products || []);
        setEligibleCategoryIds(result.data.eligible_categories || []);
        console.log('✅ [CouponFormModal] Loaded eligible items:', {
          products: result.data.eligible_products?.length || 0,
          categories: result.data.eligible_categories?.length || 0
        });
      } else {
        console.warn('⚠️ [CouponFormModal] Failed to fetch eligible items:', result.error);
      }
    } catch (error) {
      console.error('❌ [CouponFormModal] Error fetching eligible items:', error);
    }
  };

  // ==================== PREVENT BODY SCROLL ====================
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ==================== ESC KEY TO CLOSE ====================
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, submitting]);

  // ==================== HANDLERS ====================

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setFormData(prev => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(newStartDate);
      startDate.setHours(0, 0, 0, 0);

      // If start date is in future, force 'scheduled'
      const newStatus = startDate > today ? 'scheduled' : prev.status;

      return {
        ...prev,
        start_date: newStartDate,
        status: newStatus
      };
    });

    if (errors.start_date) {
      setErrors(prev => ({ ...prev, start_date: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate status based on dates
      if ((name === 'start_date' || name === 'end_date') && updated.start_date && updated.end_date) {
        const autoStatus = getStatusFromDates(updated.start_date, updated.end_date);
        if (autoStatus) {
          updated.status = autoStatus;
        }
      }
      
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // ✅ Click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const validate = () => {
    const newErrors = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.trim().length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!/^[A-Z0-9-]+$/i.test(formData.code.trim())) {
      newErrors.code = 'Code can only contain uppercase letters, numbers, and hyphens';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Discount value validation
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = 'Discount value must be greater than 0';
    }

    if (formData.discount_type === 'Percent') {
      if (parseFloat(formData.discount_value) > 100) {
        newErrors.discount_value = 'Percentage cannot exceed 100%';
      }
    }

    // Date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // Min order value validation
    if (formData.min_order_value && parseFloat(formData.min_order_value) < 0) {
      newErrors.min_order_value = 'Minimum order value cannot be negative';
    }

    // Max discount validation (for percentage type)
    if (formData.discount_type === 'Percent' && formData.max_discount) {
      if (parseFloat(formData.max_discount) <= 0) {
        newErrors.max_discount = 'Max discount must be greater than 0';
      }
    }

    // Usage per user validation
    if (!formData.usage_per_user || parseInt(formData.usage_per_user) < 1) {
      newErrors.usage_per_user = 'Must be at least 1';
    }

    // ⭐ NEW: Validate coupon type specific requirements
    if (couponType === 'product_specific' || couponType === 'bogo') {
      if (eligibleProductIds.length === 0) {
        newErrors.eligibleProducts = 'At least one product must be selected';
      }
    }

    if (couponType === 'category_based') {
      if (eligibleCategoryIds.length === 0) {
        newErrors.eligibleCategories = 'At least one category must be selected';
      }
    }

    if (couponType === 'bogo') {
      if (!bogoBuyQuantity || bogoBuyQuantity < 1) {
        newErrors.bogoBuyQuantity = 'Buy quantity must be at least 1';
      }
      if (!bogoGetQuantity || bogoGetQuantity < 1) {
        newErrors.bogoGetQuantity = 'Get quantity must be at least 1';
      }
      if (bogoDiscountPercent < 0 || bogoDiscountPercent > 100) {
        newErrors.bogoDiscountPercent = 'Discount percent must be between 0 and 100';
      }
    }

    if (maxDiscountItems && maxDiscountItems < 1) {
      newErrors.maxDiscountItems = 'Max discount items must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data
      const data = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: parseInt(formData.usage_per_user),
        
        // ⭐ NEW: Include enhanced fields
        coupon_type: couponType,
        eligible_product_ids: (couponType === 'product_specific' || couponType === 'bogo') 
          ? eligibleProductIds 
          : [],
        eligible_category_ids: couponType === 'category_based' 
          ? eligibleCategoryIds 
          : [],
        bogo_buy_quantity: couponType === 'bogo' ? parseInt(bogoBuyQuantity) : null,
        bogo_get_quantity: couponType === 'bogo' ? parseInt(bogoGetQuantity) : null,
        bogo_discount_percent: couponType === 'bogo' ? parseInt(bogoDiscountPercent) : 100,
        max_discount_items: maxDiscountItems ? parseInt(maxDiscountItems) : null,
        first_order_only: firstOrderOnly,
        exclude_sale_items: excludeSaleItems
      };

      let result;
      if (isEditMode) {
        result = await updateCoupon(coupon.id, data);
      } else {
        result = await createCoupon(data);
      }

      if (result.success) {
        onSuccess(result.message);
      } else {
        setErrors({ submit: result.error || 'Failed to save coupon' });
      }
    } catch (error) {
      console.error('Form submit error:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ==================== RENDER ====================

  const renderStatusSection = () => {
    const autoStatus = formData.start_date && formData.end_date 
      ? getStatusFromDates(formData.start_date, formData.end_date) 
      : null;

    if (autoStatus === 'expired') {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-tppslate mb-2">
            Status
          </label>
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                This coupon is expired
              </p>
              <p className="text-xs text-red-600">
                End date is in the past. Please update the end date to activate this coupon.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (autoStatus === 'scheduled') {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-tppslate mb-2">
            Status
          </label>
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                This coupon will be scheduled
              </p>
              <p className="text-xs text-yellow-600">
                Start date is in the future. This coupon will automatically activate on{' '}
                <span className="font-semibold">
                  {new Date(formData.start_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Normal active/inactive radio buttons
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-tppslate mb-2">
          Status
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            formData.status === 'active' 
              ? 'border-green-500 bg-green-50' 
              : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 text-green-600"
            />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            formData.status === 'inactive' 
              ? 'border-gray-500 bg-gray-50' 
              : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 text-gray-600"
            />
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold">Inactive</span>
            </div>
          </label>
        </div>

        <p className="text-xs text-slate-500">
          Active coupons can be used immediately by customers
        </p>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-tpppink to-tpppink/90 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-tpppink" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <p className="text-white/80 text-sm">
                {isEditMode ? 'Update coupon details' : 'Set up a new discount coupon'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-semibold text-tppslate mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., WELCOME10"
              className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-tpppink ${
                errors.code ? 'border-red-300' : 'border-tppslate/20'
              }`}
              disabled={submitting}
            />
            {errors.code && (
              <p className="text-red-600 text-xs mt-1">{errors.code}</p>
            )}
            <p className="text-xs text-tppslate/60 mt-1">
              Uppercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-tppslate mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Get 10% off on your first order"
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink resize-none ${
                errors.description ? 'border-red-300' : 'border-tppslate/20'
              }`}
              disabled={submitting}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-tppslate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink"
                disabled={submitting}
              >
                <option value="Percent">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Discount Value *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {formData.discount_type === 'Percent' ? (
                    <Percent className="w-5 h-5 text-tppslate/40" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-tppslate/40" />
                  )}
                </div>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  placeholder={formData.discount_type === 'Percent' ? '10' : '100'}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                    errors.discount_value ? 'border-red-300' : 'border-tppslate/20'
                  }`}
                  disabled={submitting}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.discount_value && (
                <p className="text-red-600 text-xs mt-1">{errors.discount_value}</p>
              )}
            </div>
          </div>

          {/* Min Order Value & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Minimum Order Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tppslate/60">₹</span>
                <input
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value}
                  onChange={handleChange}
                  placeholder="500"
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                    errors.min_order_value ? 'border-red-300' : 'border-tppslate/20'
                  }`}
                  disabled={submitting}
                  min="0"
                />
              </div>
              {errors.min_order_value && (
                <p className="text-red-600 text-xs mt-1">{errors.min_order_value}</p>
              )}
              <p className="text-xs text-tppslate/60 mt-1">Leave empty for no minimum</p>
            </div>

            {formData.discount_type === 'Percent' && (
              <div>
                <label className="block text-sm font-semibold text-tppslate mb-2">
                  Maximum Discount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tppslate/60">₹</span>
                  <input
                    type="number"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleChange}
                    placeholder="200"
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                      errors.max_discount ? 'border-red-300' : 'border-tppslate/20'
                    }`}
                    disabled={submitting}
                    min="0"
                  />
                </div>
                {errors.max_discount && (
                  <p className="text-red-600 text-xs mt-1">{errors.max_discount}</p>
                )}
                <p className="text-xs text-tppslate/60 mt-1">Cap for percentage discounts</p>
              </div>
            )}
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                    errors.start_date ? 'border-red-300' : 'border-tppslate/20'
                  }`}
                  disabled={submitting}
                />
              </div>
              {errors.start_date && (
                <p className="text-red-600 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                    errors.end_date ? 'border-red-300' : 'border-tppslate/20'
                  }`}
                  disabled={submitting}
                  min={formData.start_date}
                />
              </div>
              {errors.end_date && (
                <p className="text-red-600 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Total Usage Limit
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full pl-12 pr-4 py-3 border-2 border-tppslate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink"
                  disabled={submitting}
                  min="1"
                />
              </div>
              <p className="text-xs text-tppslate/60 mt-1">Leave empty for unlimited</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Usage Per User *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tppslate/40" />
                <input
                  type="number"
                  name="usage_per_user"
                  value={formData.usage_per_user}
                  onChange={handleChange}
                  placeholder="1"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink ${
                    errors.usage_per_user ? 'border-red-300' : 'border-tppslate/20'
                  }`}
                  disabled={submitting}
                  min="1"
                />
              </div>
              {errors.usage_per_user && (
                <p className="text-red-600 text-xs mt-1">{errors.usage_per_user}</p>
              )}
            </div>
          </div>

          {/* Status Section - Conditional */}
          {renderStatusSection()}
          
          {/* ========================================
              ⭐ NEW: COUPON TYPE SELECTOR
              ======================================== */}
          <div className="pt-6 border-t-2 border-slate-200">
            <CouponTypeSelector
              value={couponType}
              onChange={(newType) => {
                setCouponType(newType);
                // Reset type-specific fields when changing type
                if (newType !== 'product_specific' && newType !== 'bogo') {
                  setEligibleProductIds([]);
                }
                if (newType !== 'category_based') {
                  setEligibleCategoryIds([]);
                }
                if (newType !== 'bogo') {
                  setBogoBuyQuantity(3);
                  setBogoGetQuantity(2);
                  setBogoDiscountPercent(100);
                }
              }}
              disabled={submitting}
            />
          </div>

          {/* ========================================
              ⭐ NEW: PRODUCT SELECTOR (for product_specific & bogo)
              ======================================== */}
          {(couponType === 'product_specific' || couponType === 'bogo') && (
            <div>
              <ProductSelector
                selectedProductIds={eligibleProductIds}
                onChange={setEligibleProductIds}
                disabled={submitting}
              />
              {errors.eligibleProducts && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  {errors.eligibleProducts}
                </p>
              )}
            </div>
          )}

          {/* ========================================
              ⭐ NEW: CATEGORY SELECTOR (for category_based)
              ======================================== */}
          {couponType === 'category_based' && (
            <div>
              <CategorySelector
                selectedCategoryIds={eligibleCategoryIds}
                onChange={setEligibleCategoryIds}
                disabled={submitting}
              />
              {errors.eligibleCategories && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  {errors.eligibleCategories}
                </p>
              )}
            </div>
          )}

          {/* ========================================
              ⭐ NEW: BOGO CONFIGURATION (for bogo type)
              ======================================== */}
          {couponType === 'bogo' && (
            <div>
              <BOGOConfigFields
                buyQuantity={bogoBuyQuantity}
                getQuantity={bogoGetQuantity}
                discountPercent={bogoDiscountPercent}
                onBuyQuantityChange={setBogoBuyQuantity}
                onGetQuantityChange={setBogoGetQuantity}
                onDiscountPercentChange={setBogoDiscountPercent}
                disabled={submitting}
              />
              {(errors.bogoBuyQuantity || errors.bogoGetQuantity || errors.bogoDiscountPercent) && (
                <div className="mt-2 space-y-1">
                  {errors.bogoBuyQuantity && (
                    <p className="text-xs text-red-600 font-semibold">{errors.bogoBuyQuantity}</p>
                  )}
                  {errors.bogoGetQuantity && (
                    <p className="text-xs text-red-600 font-semibold">{errors.bogoGetQuantity}</p>
                  )}
                  {errors.bogoDiscountPercent && (
                    <p className="text-xs text-red-600 font-semibold">{errors.bogoDiscountPercent}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================
              ⭐ NEW: ADVANCED OPTIONS
              ======================================== */}
          <div className="pt-6 border-t-2 border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Advanced Options
            </h3>

            {/* Max Discount Items */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-tppslate mb-2">
                Max Discount Items (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={maxDiscountItems || ''}
                onChange={(e) => setMaxDiscountItems(e.target.value ? parseInt(e.target.value) : null)}
                disabled={submitting}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 text-sm"
                placeholder="Leave empty for no limit"
              />
              <p className="text-xs text-slate-600 mt-1">
                Limit discount to maximum number of items (most expensive items first)
              </p>
              {errors.maxDiscountItems && (
                <p className="mt-1 text-xs text-red-600 font-semibold">
                  {errors.maxDiscountItems}
                </p>
              )}
            </div>

            {/* First Order Only Checkbox */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstOrderOnly}
                  onChange={(e) => setFirstOrderOnly(e.target.checked)}
                  disabled={submitting}
                  className="w-4 h-4 mt-0.5 text-tpppink focus:ring-tpppink border-slate-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-800">
                    First Order Only
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    This coupon can only be used by customers placing their first order
                  </p>
                </div>
              </label>
            </div>

            {/* Exclude Sale Items Checkbox */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeSaleItems}
                  onChange={(e) => setExcludeSaleItems(e.target.checked)}
                  disabled={submitting}
                  className="w-4 h-4 mt-0.5 text-tpppink focus:ring-tpppink border-slate-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-800">
                    Exclude Sale Items
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Items already on sale will not be eligible for this coupon
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t-2 border-tppslate/10 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-tppslate/20 rounded-lg hover:bg-tppslate/5 font-semibold text-tppslate transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditMode ? 'Update Coupon' : 'Create Coupon'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}