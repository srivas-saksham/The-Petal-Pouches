// frontend/src/components/user/addresses/AddressNotifications.jsx

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * AddressNotifications Component
 * Displays success and error notifications
 * 
 * @param {string} success - Success message
 * @param {string} error - Error message
 * @param {Function} onDismissSuccess - Dismiss success callback
 * @param {Function} onDismissError - Dismiss error callback
 */
const AddressNotifications = ({ 
  success, 
  error, 
  onDismissSuccess, 
  onDismissError 
}) => {
  return (
    <>
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">{success}</p>
          <button
            onClick={onDismissSuccess}
            className="ml-auto text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
          <button
            onClick={onDismissError}
            className="ml-auto text-red-600 hover:text-red-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default AddressNotifications;