// frontend/src/components/admin/coupons/CouponFormModal.jsx
/**
 * Coupon Form Modal - Enhanced Version
 * Create or edit coupon with full validation
 * Features: Click outside to close, ESC to close
 */

import { useState, useEffect } from 'react';
import { X, Loader, Tag, Percent, DollarSign, Calendar, Users, Lock } from 'lucide-react';
import { createCoupon, updateCoupon } from '../../../services/adminCouponService';

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
    is_active: true,
    usage_limit: '',
    usage_per_user: '1'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ==================== LOAD COUPON DATA ====================
  useEffect(() => {
    if (isEditMode && coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discount_type: coupon.discount_type || 'Percent',
        discount_value: coupon.discount_value?.toString() || '',
        min_order_value: coupon.min_order_value?.toString() || '',
        max_discount: coupon.max_discount?.toString() || '',
        start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
        end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
        is_active: coupon.is_active ?? true,
        usage_limit: coupon.usage_limit?.toString() || '',
        usage_per_user: coupon.usage_per_user?.toString() || '1'
      });
    }
  }, [isEditMode, coupon]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
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
    } else if (!/^[A-Z0-9-]+$/.test(formData.code.trim())) {
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
        is_active: formData.is_active,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: parseInt(formData.usage_per_user)
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

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-tppslate/5 rounded-lg border-2 border-tppslate/10">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-tpppink focus:ring-tpppink rounded"
              disabled={submitting}
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-tppslate cursor-pointer">
              Active (coupon can be used immediately)
            </label>
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