// frontend/src/components/checkout/CheckoutForm.jsx

import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { createAddress, validateAddress } from '../../services/addressService';

/**
 * CheckoutForm Component - MODAL ONLY
 * Just provides the modal - no card UI
 * Parent controls when to show modal via showModal prop
 */
const CheckoutForm = ({ onAddressSelect, showModal, onCloseModal }) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    zip_code: '',
    phone: '',
    landmark: '',
    address_type: 'home',
    is_default: false
  });

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const validation = validateAddress(formData);
    
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => {
        const field = error.toLowerCase().split(' ')[0];
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSubmitError(null);

    // Validate
    if (!validateForm()) {
      setSubmitError('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    try {
      const result = await createAddress(formData);
      if (result.success) {
        // Pass new address to parent
        if (onAddressSelect) {
          onAddressSelect(result.data);
        }
        
        // Reset form
        setFormData({
          line1: '',
          line2: '',
          city: '',
          state: '',
          country: 'India',
          zip_code: '',
          phone: '',
          landmark: '',
          address_type: 'home',
          is_default: false
        });
        
        // Close modal
        if (onCloseModal) {
          onCloseModal();
        }
      } else {
        setSubmitError(result.error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!showModal) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => !saving && onCloseModal && onCloseModal()}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-tppslate to-tppslate/90 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={20} />
              Add New Address
            </h3>
            <button
              onClick={() => !saving && onCloseModal && onCloseModal()}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              disabled={saving}
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Modal Body - Scrollable */}
          <form onSubmit={handleAddAddress} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address Type *
                </label>
                <select
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                  disabled={saving}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label htmlFor="line1" className="block text-sm font-semibold text-slate-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="line1"
                  name="line1"
                  placeholder="House no., Building name, Street"
                  value={formData.line1}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent ${
                    errors.line1 ? 'border-red-300' : 'border-slate-200'
                  }`}
                  required
                  disabled={saving}
                />
                {errors.line1 && (
                  <p className="mt-1 text-xs text-red-600">{errors.line1}</p>
                )}
              </div>

              {/* Apartment/Suite */}
              <div>
                <label htmlFor="line2" className="block text-sm font-semibold text-slate-700 mb-2">
                  Apartment, Suite, etc.
                </label>
                <input
                  type="text"
                  id="line2"
                  name="line2"
                  placeholder="Apartment, suite, unit, floor (optional)"
                  value={formData.line2}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                  disabled={saving}
                />
              </div>

              {/* Landmark */}
              <div>
                <label htmlFor="landmark" className="block text-sm font-semibold text-slate-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  placeholder="Nearby landmark (optional)"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent"
                  disabled={saving}
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent ${
                      errors.city ? 'border-red-300' : 'border-slate-200'
                    }`}
                    required
                    disabled={saving}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent ${
                      errors.state ? 'border-red-300' : 'border-slate-200'
                    }`}
                    required
                    disabled={saving}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label htmlFor="zip_code" className="block text-sm font-semibold text-slate-700 mb-2">
                  PIN Code *
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  placeholder="6-digit PIN code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent ${
                    errors.zip_code || errors.postal ? 'border-red-300' : 'border-slate-200'
                  }`}
                  required
                  maxLength={6}
                  disabled={saving}
                />
                {(errors.zip_code || errors.postal) && (
                  <p className="mt-1 text-xs text-red-600">{errors.zip_code || errors.postal}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="10-digit phone number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpppink focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-slate-200'
                  }`}
                  disabled={saving}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-4 h-4 text-tpppink border-slate-300 rounded focus:ring-tpppink"
                />
                <label htmlFor="is_default" className="text-sm text-slate-700 cursor-pointer">
                  Set as default address
                </label>
              </div>
            </div>
          </form>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => !saving && onCloseModal && onCloseModal()}
              className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleAddAddress}
              className="flex-1 px-4 py-2.5 bg-tpppink text-white rounded-lg font-semibold hover:bg-tpppink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Save Address
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;