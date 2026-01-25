// frontend/src/components/user/addresses/AddressFormSidebar.jsx
// SLIDING ADDRESS FORM SIDEBAR - STANDALONE VERSION

import React, { useEffect, useState, useRef } from 'react';
import { X, MapPin, Loader, GripVertical } from 'lucide-react';
import { createAddress, updateAddress, validateAddress } from '../../../services/addressService';
import AddressNotifications from './AddressNotifications';

/**
 * AddressFormSidebar Component
 * Professional sliding sidebar for adding/editing addresses
 * 
 * Props:
 * - isOpen: boolean - Controls sidebar visibility
 * - editingAddress: object | null - Address to edit, null for new address
 * - onClose: function - Callback when sidebar closes
 * - onSuccess: function - Callback when address is saved successfully
 * 
 * Features:
 * - ✅ Smooth slide-in animation from right
 * - ✅ Resizable width by dragging left edge (desktop only)
 * - ✅ Form validation
 * - ✅ Success/Error notifications
 * - ✅ Responsive design
 * - ✅ Mobile: Compact modal (85% height) from right
 * - ✅ Desktop: Full-height sidebar from right
 */
const AddressFormSidebar = ({ isOpen, editingAddress, onClose, onSuccess }) => {
  // Resizable width state
  const [sidebarWidth, setSidebarWidth] = useState(520);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Animation state
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form state
  const isEditing = !!editingAddress;
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    zip_code: '',
    landmark: '',
    phone: '',
    is_default: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle body scroll when sidebar opens/closes
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

  // Handle render and animation state
  useEffect(() => {
    if (isOpen) {
      // Load address data if editing
      if (editingAddress) {
        setFormData({
          line1: editingAddress.line1 || '',
          line2: editingAddress.line2 || '',
          city: editingAddress.city || '',
          state: editingAddress.state || '',
          country: editingAddress.country || 'India',
          zip_code: editingAddress.zip_code || '',
          landmark: editingAddress.landmark || '',
          phone: editingAddress.phone || '',
          is_default: editingAddress.is_default || false
        });
      } else {
        // Reset form for new address
        setFormData({
          line1: '',
          line2: '',
          city: '',
          state: '',
          country: 'India',
          zip_code: '',
          landmark: '',
          phone: '',
          is_default: false
        });
      }

      // Clear previous states
      setErrors({});
      setSubmitError(null);
      setSubmitSuccess(false);

      // Start rendering
      setShouldRender(true);

      // Trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      // Start closing animation
      setIsAnimating(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingAddress]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;

      const newWidth = window.innerWidth - e.clientX;

      // Constrain width between 320px and 800px
      if (newWidth >= 320 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Start resizing
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const validation = validateAddress(formData);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach((error) => {
        const field = error.toLowerCase().split(' ')[0];
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate
    if (!validateForm()) {
      setSubmitError('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      let response;
      if (isEditing) {
        response = await updateAddress(editingAddress.id, formData);
      } else {
        response = await createAddress(formData);
      }

      if (response.success) {
        setSubmitSuccess(true);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close sidebar after short delay
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1000);
      } else {
        setSubmitError(response.error || 'Failed to save address');
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
      console.error('Address form error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Don't render if not should render
  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop with fade-in */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] will-change-opacity
          transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar - Mobile: 85vh height bottom-aligned, Desktop: Full height - BOTH slide from right */}
      <div
        ref={sidebarRef}
        className={`fixed right-0 bg-white shadow-2xl z-[70]
          flex flex-col will-change-transform
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          bottom-0 h-[85vh] rounded-t-2xl
          sm:top-0 sm:h-full sm:rounded-none`}
        style={{ width: window.innerWidth < 640 ? '100%' : `${sidebarWidth}px` }}
        role="dialog"
        aria-label="Address form"
        aria-modal="true"
      >
        {/* Resize Handle - Left Edge - DESKTOP ONLY */}
        {window.innerWidth >= 640 && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute left-0 top-0 h-full w-1 cursor-ew-resize group transition-colors ${
              isResizing ? 'bg-tpppink' : 'hover:bg-tpppink/30'
            }`}
            style={{ zIndex: 80 }}
          >
            {/* Grip Icon */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 
              bg-white rounded-full p-1 shadow-md border border-slate-200
              transition-all duration-200 ${
                isResizing
                  ? 'text-tpppink scale-110 border-tpppink'
                  : 'text-slate-400 group-hover:text-tpppink group-hover:scale-105 group-hover:border-tpppink'
              }`}
            >
              <GripVertical size={16} />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tpppink to-tpppeach rounded-lg flex items-center justify-center shadow-md">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-tppslate">
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </h2>
              <p className="text-xs text-tppslate/60">
                {isEditing ? 'Update your delivery address' : 'Add a new delivery address'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close form"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto bg-tppslate/10">
          <div className="p-6">
            {/* Notifications */}
            <AddressNotifications
              success={submitSuccess ? `Address ${isEditing ? 'updated' : 'added'} successfully!` : null}
              error={submitError}
              onDismissSuccess={() => setSubmitSuccess(false)}
              onDismissError={() => setSubmitError(null)}
            />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address Line 1 */}
              <div>
                <label htmlFor="line1" className="block text-sm font-medium text-tppslate mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="line1"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  placeholder="House/Flat No., Building Name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                    errors.line1 ? 'border-red-300' : 'border-tppslate/30'
                  }`}
                />
                {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label htmlFor="line2" className="block text-sm font-medium text-tppslate mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="line2"
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                  placeholder="Street Name, Area"
                  className="w-full px-4 py-2 border border-tppslate/30 rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors"
                />
              </div>

              {/* Landmark */}
              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-tppslate mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Near famous landmark"
                  className="w-full px-4 py-2 border border-tppslate/30 rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-tppslate mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                      errors.city ? 'border-red-300' : 'border-tppslate/30'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-tppslate mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                      errors.state ? 'border-red-300' : 'border-tppslate/30'
                    }`}
                  />
                  {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                </div>
              </div>

              {/* Zip Code and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-tppslate mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    placeholder="110001"
                    maxLength="6"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                      errors.zip_code || errors.postal ? 'border-red-300' : 'border-tppslate/30'
                    }`}
                  />
                  {(errors.zip_code || errors.postal) && (
                    <p className="mt-1 text-xs text-red-600">{errors.zip_code || errors.postal}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-tppslate mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="India"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                      errors.country ? 'border-red-300' : 'border-tppslate/30'
                    }`}
                  />
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-tppslate mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-300' : 'border-tppslate/30'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-2 p-4 bg-tppslate/5 rounded-lg">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-4 h-4 text-tpppink border-tppslate/30 rounded focus:ring-tpppink"
                />
                <label htmlFor="is_default" className="text-sm text-tppslate cursor-pointer">
                  Set as default address
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-slate-200 bg-white flex-shrink-0 p-4 space-y-2">
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-tpppink hover:bg-tpppink/90 text-white rounded-lg
              font-semibold transition-all shadow-md hover:shadow-lg
              flex items-center justify-center gap-2 disabled:bg-tppslate/30 
              disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>{isEditing ? 'Update Address' : 'Save Address'}</>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 
              text-slate-700 rounded-lg font-medium transition-all hover:bg-slate-50
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Resize cursor overlay when resizing */}
      {isResizing && <div className="fixed inset-0 z-[80] cursor-ew-resize" />}
    </>
  );
};

export default AddressFormSidebar;