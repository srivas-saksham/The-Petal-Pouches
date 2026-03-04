// frontend/src/components/user/addresses/AddressForm.jsx

import React, { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { createAddress, updateAddress, validateAddress } from '../../../services/addressService';
import AddressNotifications from './AddressNotifications';

const AddressForm = ({ address = null, onSubmit, onCancel }) => {
  const isEditing = !!address;

  const [formData, setFormData] = useState({
    line1: '', line2: '', city: '', state: '', country: 'India',
    zip_code: '', landmark: '', phone: '', is_default: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        line1: address.line1 || '', line2: address.line2 || '', city: address.city || '',
        state: address.state || '', country: address.country || 'India',
        zip_code: address.zip_code || '', landmark: address.landmark || '',
        phone: address.phone || '', is_default: address.is_default || false
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const validation = validateAddress(formData);
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => { newErrors[error.toLowerCase().split(' ')[0]] = error; });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    if (!validateForm()) { setSubmitError('Please fix the errors before submitting'); return; }
    try {
      setLoading(true);
      const response = isEditing ? await updateAddress(address.id, formData) : await createAddress(formData);
      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => { if (onSubmit) onSubmit(response.data); }, 500);
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

  const inputBase = "w-full px-4 py-2 border rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 focus:ring-2 focus:ring-tpppink dark:focus:ring-tppdarkwhite/30 focus:border-transparent transition-colors";
  const inputNormal = `${inputBase} border-tppslate/30 dark:border-tppdarkwhite/10`;
  const inputError = `${inputBase} border-red-300 dark:border-red-500/50`;

  return (
    <div className="bg-white dark:bg-tppdarkgray rounded-lg border border-tppslate/10 dark:border-tppdarkwhite/10 shadow-sm p-6">
      <h2 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-tpppink dark:text-tppdarkwhite" />
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h2>

      <AddressNotifications
        success={submitSuccess ? `Address ${isEditing ? 'updated' : 'added'} successfully!` : null}
        error={submitError}
        onDismissSuccess={() => setSubmitSuccess(false)}
        onDismissError={() => setSubmitError(null)}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="line1" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input type="text" id="line1" name="line1" value={formData.line1} onChange={handleChange} placeholder="House/Flat No., Building Name" className={errors.line1 ? inputError : inputNormal} />
          {errors.line1 && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.line1}</p>}
        </div>

        <div>
          <label htmlFor="line2" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Address Line 2</label>
          <input type="text" id="line2" name="line2" value={formData.line2} onChange={handleChange} placeholder="Street Name, Area" className={inputNormal} />
        </div>

        <div>
          <label htmlFor="landmark" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Landmark</label>
          <input type="text" id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near famous landmark" className={inputNormal} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">City <span className="text-red-500">*</span></label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={errors.city ? inputError : inputNormal} />
            {errors.city && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">State <span className="text-red-500">*</span></label>
            <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={errors.state ? inputError : inputNormal} />
            {errors.state && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Postal Code <span className="text-red-500">*</span></label>
            <input type="text" id="zip_code" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="110001" maxLength="6" className={errors.zip_code || errors.postal ? inputError : inputNormal} />
            {(errors.zip_code || errors.postal) && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.zip_code || errors.postal}</p>}
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Country <span className="text-red-500">*</span></label>
            <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="India" className={errors.country ? inputError : inputNormal} />
            {errors.country && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.country}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Phone Number <span className="text-red-500">*</span></label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength="10" className={errors.phone ? inputError : inputNormal} />
          {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
        </div>

        <div className="flex items-center gap-2 p-4 bg-tppslate/5 dark:bg-tppdarkwhite/5 rounded-lg">
          <input type="checkbox" id="is_default" name="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 text-tpppink dark:text-tppdarkwhite border-tppslate/30 dark:border-tppdarkwhite/20 rounded focus:ring-tpppink dark:focus:ring-tppdarkwhite/30" />
          <label htmlFor="is_default" className="text-sm text-tppslate dark:text-tppdarkwhite cursor-pointer">Set as default address</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 disabled:bg-tppslate/30 dark:disabled:bg-tppdarkwhite/20 disabled:cursor-not-allowed transition-colors duration-200 font-bold">
            {loading ? <><Loader className="w-4 h-4 animate-spin" />{isEditing ? 'Updating...' : 'Saving...'}</> : <>{isEditing ? 'Update Address' : 'Save Address'}</>}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="px-6 py-3 border border-tppslate/30 dark:border-tppdarkwhite/10 text-tppslate dark:text-tppdarkwhite rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-bold">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;