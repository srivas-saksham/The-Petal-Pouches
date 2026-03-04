// frontend/src/components/bundle-detail/BundleAddressModal.jsx

import React, { useEffect, useState } from 'react';
import { X, MapPin, Loader } from 'lucide-react';
import { createAddress, validateAddress } from '../../services/addressService';
import AddressNotifications from '../user/addresses/AddressNotifications';

const BundleAddressModal = ({ isOpen, onClose, onSuccess }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({ line1: '', line2: '', city: '', state: '', country: 'India', zip_code: '', landmark: '', phone: '', is_default: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ line1: '', line2: '', city: '', state: '', country: 'India', zip_code: '', landmark: '', phone: '', is_default: false });
      setErrors({}); setSubmitError(null); setSubmitSuccess(false);
      setShouldRender(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      const response = await createAddress(formData);
      if (response.success) {
        setSubmitSuccess(true);
        if (onSuccess) onSuccess(response.data);
        setTimeout(() => { if (onClose) onClose(); }, 1000);
      } else { setSubmitError(response.error || 'Failed to save address'); }
    } catch (error) { setSubmitError('An error occurred. Please try again.'); console.error('Address form error:', error); }
    finally { setLoading(false); }
  };

  if (!shouldRender) return null;

  const inputBase = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tpppink dark:focus:ring-tppdarkwhite focus:border-transparent transition-colors bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder:text-slate-400 dark:placeholder:text-tppdarkwhite/30";
  const ib = "border-tppslate/30 dark:border-tppdarkwhite/10";
  const ibe = "border-red-300 dark:border-red-500/50";
  const lbl = "block text-sm font-medium text-tppslate dark:text-tppdarkwhite mb-1";

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] will-change-opacity transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`fixed right-0 bottom-0 bg-white dark:bg-tppdarkgray shadow-2xl z-[110] flex flex-col will-change-transform rounded-t-2xl w-full sm:w-[520px] h-[80dvh] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog" aria-label="Add new address" aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tpppink to-tpppeach dark:from-tppdarkwhite dark:to-tppdarkwhite/70 rounded-lg flex items-center justify-center shadow-md">
              <MapPin size={20} className="text-white dark:text-tppdark" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-tppslate dark:text-tppdarkwhite">Add New Address</h2>
              <p className="text-xs text-tppslate/60 dark:text-tppdarkwhite/40">Add a new delivery address</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-tppdarkwhite/10 rounded-lg transition-colors" aria-label="Close form">
            <X size={20} className="text-slate-600 dark:text-tppdarkwhite/60" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-tppslate/10 dark:bg-tppdark/40">
          <div className="p-6">
            <AddressNotifications
              success={submitSuccess ? 'Address added successfully!' : null}
              error={submitError}
              onDismissSuccess={() => setSubmitSuccess(false)}
              onDismissError={() => setSubmitError(null)}
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="line1" className={lbl}>Address Line 1 <span className="text-red-500">*</span></label>
                <input type="text" id="line1" name="line1" value={formData.line1} onChange={handleChange} placeholder="House/Flat No., Building Name" className={`${inputBase} ${errors.line1 ? ibe : ib}`} />
                {errors.line1 && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.line1}</p>}
              </div>
              <div>
                <label htmlFor="line2" className={lbl}>Address Line 2</label>
                <input type="text" id="line2" name="line2" value={formData.line2} onChange={handleChange} placeholder="Street Name, Area" className={`${inputBase} ${ib}`} />
              </div>
              <div>
                <label htmlFor="landmark" className={lbl}>Landmark</label>
                <input type="text" id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near famous landmark" className={`${inputBase} ${ib}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={lbl}>City <span className="text-red-500">*</span></label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={`${inputBase} ${errors.city ? ibe : ib}`} />
                  {errors.city && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className={lbl}>State <span className="text-red-500">*</span></label>
                  <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={`${inputBase} ${errors.state ? ibe : ib}`} />
                  {errors.state && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.state}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip_code" className={lbl}>Postal Code <span className="text-red-500">*</span></label>
                  <input type="text" id="zip_code" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="110001" maxLength="6" className={`${inputBase} ${errors.zip_code || errors.postal ? ibe : ib}`} />
                  {(errors.zip_code || errors.postal) && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.zip_code || errors.postal}</p>}
                </div>
                <div>
                  <label htmlFor="country" className={lbl}>Country <span className="text-red-500">*</span></label>
                  <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="India" className={`${inputBase} ${errors.country ? ibe : ib}`} />
                  {errors.country && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.country}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="phone" className={lbl}>Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength="10" className={`${inputBase} ${errors.phone ? ibe : ib}`} />
                {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
              </div>
              <div className="flex items-center gap-2 p-4 bg-tppslate/5 dark:bg-tppdarkwhite/5 rounded-lg">
                <input type="checkbox" id="is_default" name="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 text-tpppink dark:text-tppdarkwhite border-tppslate/30 dark:border-tppdarkwhite/20 rounded focus:ring-tpppink dark:focus:ring-tppdarkwhite" />
                <label htmlFor="is_default" className="text-sm text-tppslate dark:text-tppdarkwhite cursor-pointer">Set as default address</label>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-tppdarkwhite/10 bg-white dark:bg-tppdarkgray flex-shrink-0 p-4 space-y-2">
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 bg-tpppink dark:bg-tppdarkwhite hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 text-white dark:text-tppdark rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-tppslate/30 disabled:cursor-not-allowed">
            {loading ? <><Loader className="w-4 h-4 animate-spin" />Saving...</> : 'Save Address'}
          </button>
          <button onClick={onClose} disabled={loading} className="w-full py-3 border-2 border-slate-200 dark:border-tppdarkwhite/10 hover:border-slate-300 dark:hover:border-tppdarkwhite/20 text-slate-700 dark:text-tppdarkwhite/70 rounded-lg font-medium transition-all hover:bg-slate-50 dark:hover:bg-tppdarkwhite/5 disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default BundleAddressModal;