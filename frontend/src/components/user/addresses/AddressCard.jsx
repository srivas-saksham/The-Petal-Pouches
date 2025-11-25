// frontend/src/components/user/addresses/AddressCard.jsx

import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Star, Phone, Navigation } from 'lucide-react';

/**
 * Format address for display
 */
const formatAddress = (address) => {
  if (!address) return '';

  const parts = [];
  
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.landmark) parts.push(`Near ${address.landmark}`);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zip_code) parts.push(address.zip_code);
  if (address.country) parts.push(address.country);

  return parts.filter(Boolean).join(', ');
};

/**
 * AddressCard Component
 * Display individual address with actions
 * 
 * @param {Object} address - Address object
 * @param {Function} onEdit - Edit callback
 * @param {Function} onDelete - Delete callback
 * @param {Function} onSetDefault - Set as default callback
 * @param {boolean} selectable - Show select mode for checkout
 * @param {boolean} selected - Is this address selected
 * @param {Function} onSelect - Select callback
 */
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  /**
   * Handle delete with loading state
   */
  const handleDelete = async () => {
    if (isDeleting) return;

    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(address.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle set default with loading state
   */
  const handleSetDefault = async () => {
    if (isSettingDefault || address.is_default) return;

    try {
      setIsSettingDefault(true);
      if (onSetDefault) {
        await onSetDefault(address.id);
      }
    } catch (error) {
      console.error('Set default error:', error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  /**
   * Handle card click for selectable mode
   */
  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  if (!address) return null;

  return (
    <div 
      className={`
        relative bg-white border-2 rounded-lg p-5 transition-all duration-200
        ${selectable ? 'cursor-pointer' : ''}
        ${selected ? 'border-pink-500 shadow-md' : 'border-slate-200 hover:border-pink-200'}
        ${address.is_default && !selectable ? 'ring-2 ring-pink-100' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Default Badge */}
      {address.is_default && (
        <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-current" />
          Default
        </div>
      )}

      {/* Selected Badge for checkout */}
      {selected && selectable && (
        <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Selected
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-pink-500" />
          </div>
        </div>

        {/* Address Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-sm text-slate-900 leading-relaxed">
              {formatAddress(address)}
            </p>
          </div>

          {/* Phone Number */}
          {address.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{address.phone}</span>
            </div>
          )}

          {/* Coordinates (if available) */}
          {(address.latitude && address.longitude) && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Navigation className="w-3.5 h-3.5" />
              <span>
                {parseFloat(address.latitude).toFixed(4)}, {parseFloat(address.longitude).toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions (only show when not in selectable mode) */}
      {!selectable && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          {/* Set as Default Button */}
          {!address.is_default && (
            <button
              onClick={handleSetDefault}
              disabled={isSettingDefault}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star className="w-4 h-4" />
              {isSettingDefault ? 'Setting...' : 'Set as Default'}
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(address);
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors duration-200"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {/* Select indicator for checkout mode */}
      {selectable && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Click to select this address
            </span>
            {selected && (
              <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCard;