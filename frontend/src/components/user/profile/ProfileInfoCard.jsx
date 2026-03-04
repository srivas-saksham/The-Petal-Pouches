// frontend/src/components/user/profile/ProfileInfoCard.jsx

import { useState } from 'react';
import { User, Mail, Phone, Edit2, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useUserAuth } from '../../../context/UserAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ProfileInfoCard({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const { getAuthHeader } = useUserAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const authHeaders = getAuthHeader();
      console.log('🔍 [ProfileInfoCard] Sending request with headers:', {
        hasAuth: !!authHeaders.Authorization,
        authPreview: authHeaders.Authorization ? authHeaders.Authorization.substring(0, 30) + '...' : 'none'
      });
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone?.trim() || null
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error(data.message || 'Failed to update profile');
      }
      onUpdate({ ...user, name: formData.name.trim(), phone: formData.phone?.trim() });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('❌ [ProfileInfoCard] Update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', phone: user?.phone || '' });
    setErrors({});
    setIsEditing(false);
  };

  const inputBase = "w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border transition-all";
  const inputEditing = `${inputBase} border-tppslate/20 dark:border-tppdarkwhite/10 focus:border-tpppink dark:focus:border-tppdarkwhite focus:ring-2 focus:ring-tpppink/20 dark:focus:ring-tppdarkwhite/10 bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite`;
  const inputDisabled = `${inputBase} border-tppslate/10 dark:border-tppdarkwhite/10 bg-tppslate/5 dark:bg-tppdarkwhite/5 text-tppslate/70 dark:text-tppdarkwhite/50`;
  const inputErrorClass = `${inputBase} border-red-500 dark:border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite`;

  return (
    <div className="bg-white dark:bg-tppdarkgray border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-tppslate/10 dark:border-tppdarkwhite/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-tppslate dark:text-tppdarkwhite">Personal Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-tppslate dark:text-tppdarkwhite bg-tppslate/5 dark:bg-tppdarkwhite/5 hover:bg-tppslate/10 dark:hover:bg-tppdarkwhite/10 border border-tppslate/10 dark:border-tppdarkwhite/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.name ? inputErrorClass : isEditing ? inputEditing : inputDisabled}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-tppslate/10 dark:border-tppdarkwhite/10 bg-tppslate/5 dark:bg-tppdarkwhite/5 text-tppslate/70 dark:text-tppdarkwhite/50 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-tppslate/50 dark:text-tppdarkwhite/30">Email cannot be changed</p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-tppslate/70 dark:text-tppdarkwhite/50 mb-1.5">
            Phone Number <span className="text-tppslate/40 dark:text-tppdarkwhite/30 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tppslate/40 dark:text-tppdarkwhite/30" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter 10-digit number"
              className={errors.phone ? inputErrorClass : isEditing ? inputEditing : inputDisabled}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-tppslate dark:text-tppdarkwhite bg-white dark:bg-tppdark border border-tppslate/20 dark:border-tppdarkwhite/10 rounded-lg hover:bg-tppslate/5 dark:hover:bg-tppdarkwhite/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white dark:text-tppdark bg-tpppink dark:bg-tppdarkwhite rounded-lg hover:bg-tpppink/90 dark:hover:bg-tppdarkwhite/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                <><Check className="w-4 h-4" />Save Changes</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}