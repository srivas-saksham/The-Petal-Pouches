// frontend/src/components/user/addresses/AddressFormSidebar.jsx

import React, { useEffect, useState, useRef } from 'react';
import { X, MapPin, Loader, GripVertical } from 'lucide-react';
import { createAddress, updateAddress, validateAddress } from '../../../services/addressService';
import AddressNotifications from './AddressNotifications';
import AddressLocationModal from './AddressLocationModal';
import geocodingService from '../../../services/geocodingService';

const AddressFormSidebar = ({ isOpen, editingAddress, onClose, onSuccess }) => {
  const [sidebarWidth, setSidebarWidth] = useState(520);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isEditing = !!editingAddress;
  const [formData, setFormData] = useState({
    line1: '', line2: '', city: '', state: '', country: 'India',
    zip_code: '', landmark: '', phone: '', is_default: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setFormData({
          line1: editingAddress.line1 || '', line2: editingAddress.line2 || '',
          city: editingAddress.city || '', state: editingAddress.state || '',
          country: editingAddress.country || 'India', zip_code: editingAddress.zip_code || '',
          landmark: editingAddress.landmark || '', phone: editingAddress.phone || '',
          is_default: editingAddress.is_default || false
        });
      } else {
        setFormData({ line1: '', line2: '', city: '', state: '', country: 'India', zip_code: '', landmark: '', phone: '', is_default: false });
      }
      setErrors({}); setSubmitError(null); setSubmitSuccess(false);
      setShouldRender(true);
      requestAnimationFrame(() => { requestAnimationFrame(() => { setIsAnimating(true); }); });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => { setShouldRender(false); }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editingAddress]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= 800) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => { setIsResizing(false); document.body.style.cursor = 'default'; document.body.style.userSelect = 'auto'; };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing]);

  const handleResizeStart = (e) => { e.preventDefault(); setIsResizing(true); document.body.style.cursor = 'ew-resize'; document.body.style.userSelect = 'none'; };

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
    setSubmitError(null); setSubmitSuccess(false);
    if (!validateForm()) { setSubmitError('Please fix the errors before submitting'); return; }
    try {
      setLoading(true);
      const response = isEditing ? await updateAddress(editingAddress.id, formData) : await createAddress(formData);
      if (response.success) {
        setSubmitSuccess(true);
        if (onSuccess) onSuccess(response.data);
        setTimeout(() => { if (onClose) onClose(); }, 1000);
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

  const handleLocationSelect = async (locationData) => {
    try {
      const components = locationData.components || {};
      const fullAddress = locationData.address || '';
      const addressParts = fullAddress.split(',').map(part => part.trim());
      const line1 = addressParts.slice(0, 2).join(', ') || '';
      let detectedState = '';
      if (components.state) detectedState = components.state;
      else if (components.state_district) detectedState = components.state_district;
      else if (components.city === 'Delhi' || addressParts.includes('Delhi')) detectedState = 'Delhi';
      else if (components['ISO3166-2-lvl4']) {
        const isoToState = { 'IN-DL': 'Delhi', 'IN-MH': 'Maharashtra', 'IN-KA': 'Karnataka', 'IN-TN': 'Tamil Nadu', 'IN-UP': 'Uttar Pradesh', 'IN-RJ': 'Rajasthan', 'IN-WB': 'West Bengal', 'IN-GJ': 'Gujarat', 'IN-TG': 'Telangana', 'IN-AP': 'Andhra Pradesh', 'IN-KL': 'Kerala', 'IN-MP': 'Madhya Pradesh', 'IN-HR': 'Haryana', 'IN-PB': 'Punjab', 'IN-BR': 'Bihar', 'IN-OR': 'Odisha', 'IN-JH': 'Jharkhand', 'IN-AS': 'Assam', 'IN-CT': 'Chhattisgarh', 'IN-UT': 'Uttarakhand', 'IN-HP': 'Himachal Pradesh', 'IN-JK': 'Jammu and Kashmir', 'IN-GA': 'Goa', 'IN-MN': 'Manipur', 'IN-TR': 'Tripura', 'IN-MZ': 'Mizoram', 'IN-NL': 'Nagaland', 'IN-SK': 'Sikkim', 'IN-AR': 'Arunachal Pradesh', 'IN-ML': 'Meghalaya', 'IN-PY': 'Puducherry', 'IN-CH': 'Chandigarh', 'IN-AN': 'Andaman and Nicobar Islands', 'IN-DN': 'Dadra and Nagar Haveli', 'IN-DD': 'Daman and Diu', 'IN-LD': 'Lakshadweep', 'IN-LA': 'Ladakh' };
        detectedState = isoToState[components['ISO3166-2-lvl4']] || '';
      }
      setFormData(prev => ({
        ...prev,
        line1: line1 || components.neighbourhood || components.road || prev.line1,
        line2: components.city_district || components.suburb || prev.line2,
        city: components.city || components.town || components.village || components.municipality || prev.city,
        state: detectedState || prev.state,
        zip_code: components.postcode || components.postal_code || components.zip_code || prev.zip_code,
        country: components.country || 'India'
      }));
      setErrors({});
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error processing location:', error);
      setSubmitError('Failed to auto-fill address from location');
    }
  };

  const handleClose = () => { if (onClose) onClose(); };

  if (!shouldRender) return null;

  const inputBase = "w-full px-4 py-2 border rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder-tppslate/40 dark:placeholder-tppdarkwhite/30 focus:ring-2 focus:ring-tpppink dark:focus:ring-tppdarkwhite/30 focus:border-transparent transition-colors";
  const inputNormal = `${inputBase} border-tppslate/30 dark:border-tppdarkwhite/10`;
  const inputError = `${inputBase} border-red-300 dark:border-red-500/50`;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] will-change-opacity transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={sidebarRef}
        className={`fixed right-0 bg-white dark:bg-tppdarkgray shadow-2xl z-[70] flex flex-col will-change-transform
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
          transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          bottom-0 max-h-[80vh] rounded-t-2xl
          sm:top-0 sm:h-full sm:max-h-none sm:rounded-none`}
        style={{ width: window.innerWidth < 640 ? '100%' : `${sidebarWidth}px` }}
        role="dialog"
        aria-label="Address form"
        aria-modal="true"
      >
        {/* Resize Handle */}
        {window.innerWidth >= 640 && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute left-0 top-0 h-full w-1 cursor-ew-resize group transition-colors ${isResizing ? 'bg-tpppink dark:bg-tppdarkwhite' : 'hover:bg-tpppink/30 dark:hover:bg-tppdarkwhite/20'}`}
            style={{ zIndex: 80 }}
          >
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-tppdarkgray rounded-full p-1 shadow-md border border-slate-200 dark:border-tppdarkwhite/10 transition-all duration-200 ${isResizing ? 'text-tpppink dark:text-tppdarkwhite scale-110 border-tpppink dark:border-tppdarkwhite' : 'text-slate-400 dark:text-tppdarkwhite/40 group-hover:text-tpppink dark:group-hover:text-tppdarkwhite group-hover:scale-105 group-hover:border-tpppink dark:group-hover:border-tppdarkwhite'}`}>
              <GripVertical size={16} />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tpppink to-tpppeach dark:from-tppdarkwhite dark:to-tppdarkwhite/70 rounded-lg flex items-center justify-center shadow-md">
              <MapPin size={20} className="text-white dark:text-tppdark" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite">
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </h2>
              <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/50">
                {isEditing ? 'Update your delivery address' : 'Add a new delivery address'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-colors" aria-label="Close form">
            <X size={20} className="text-slate-600 dark:text-tppdarkwhite" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AddressNotifications
              success={submitSuccess ? `Address ${isEditing ? 'updated' : 'added'} successfully!` : null}
              error={submitError}
              onDismissSuccess={() => setSubmitSuccess(false)}
              onDismissError={() => setSubmitError(null)}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* GPS Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md border border-blue-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Current Location
                </button>
                <p className="text-xs text-center text-tppslate/60 dark:text-tppdarkwhite/40 mt-2">Auto-fill address using your device's GPS</p>
              </div>

              <div>
                <label htmlFor="line1" className="block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1">Address Line 1 <span className="text-red-500">*</span></label>
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
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0 p-4 space-y-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-tppslate/30 dark:disabled:bg-tppdarkwhite/20 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" />{isEditing ? 'Updating...' : 'Saving...'}</> : <>{isEditing ? 'Update Address' : 'Save Address'}</>}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full py-3 border-2 border-slate-200 dark:border-tppdarkwhite/10 hover:border-slate-300 dark:hover:border-tppdarkwhite/20 text-slate-700 dark:text-tppdarkwhite rounded-lg font-medium transition-all hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>

      {isResizing && <div className="fixed inset-0 z-[80] cursor-ew-resize" />}

      <AddressLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
        reverseGeocodeFunc={geocodingService.reverseGeocode}
      />
    </>
  );
};

export default AddressFormSidebar;